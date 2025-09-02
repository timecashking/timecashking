import { PrismaClient } from '@prisma/client';
import { API, authHeaders } from './web/src/api.js';

const prisma = new PrismaClient();

// ===== SISTEMA DE VENDAS =====

export class SalesSystem {
  // Criar pedido de venda
  static async createSalesOrder(data) {
    const {
      companyId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      discount = 0,
      paymentMethod,
      notes,
      deliveryDate
    } = data;

    try {
      // Validar itens
      if (!items || items.length === 0) {
        throw new Error('Pedido deve ter pelo menos um item');
      }

      // Verificar estoque disponível
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`);
        }
      }

      // Calcular total
      let total = 0;
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        item.unitPrice = product.salePrice;
        item.totalPrice = product.salePrice * item.quantity;
        total += item.totalPrice;
      }

      // Aplicar desconto
      const finalTotal = total - discount;

      // Criar pedido
      const salesOrder = await prisma.salesOrder.create({
        data: {
          companyId,
          customerName,
          customerEmail,
          customerPhone,
          status: 'DRAFT',
          total: finalTotal,
          discount,
          paymentMethod,
          notes,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null
        }
      });

      // Criar itens do pedido
      const orderItems = await Promise.all(
        items.map(item =>
          prisma.salesOrderItem.create({
            data: {
              salesOrderId: salesOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            }
          })
        )
      );

      return {
        success: true,
        salesOrder: {
          ...salesOrder,
          items: orderItems
        }
      };

    } catch (error) {
      console.error('Erro ao criar pedido de venda:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirmar pedido de venda
  static async confirmSalesOrder(orderId, companyId) {
    try {
      const salesOrder = await prisma.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!salesOrder) {
        throw new Error('Pedido não encontrado');
      }

      if (salesOrder.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      if (salesOrder.status !== 'DRAFT') {
        throw new Error('Pedido já foi confirmado ou cancelado');
      }

      // Verificar estoque novamente
      for (const item of salesOrder.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${item.product.name}. Disponível: ${item.product.stock}`);
        }
      }

      // Baixar estoque
      for (const item of salesOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // Registrar movimentação de estoque
        await prisma.stockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            type: 'EXIT',
            reason: 'SALE',
            quantity: item.quantity,
            unitCost: item.product.cost,
            totalCost: item.product.cost * item.quantity,
            description: `Venda - Pedido #${salesOrder.id}`
          }
        });
      }

      // Atualizar status do pedido
      const updatedOrder = await prisma.salesOrder.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      });

      // Gerar receita automática
      await this.generateIncomeFromSale(salesOrder, companyId);

      return {
        success: true,
        salesOrder: updatedOrder,
        message: 'Pedido confirmado e estoque atualizado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar receita automática da venda
  static async generateIncomeFromSale(salesOrder, companyId) {
    try {
      // Buscar categoria de vendas
      let salesCategory = await prisma.category.findFirst({
        where: {
          companyId,
          name: 'Vendas'
        }
      });

      if (!salesCategory) {
        salesCategory = await prisma.category.create({
          data: {
            name: 'Vendas',
            type: 'INCOME',
            color: '#22c55e',
            icon: 'shopping-cart',
            companyId
          }
        });
      }

      // Buscar conta padrão
      const account = await prisma.account.findFirst({
        where: {
          companyId,
          isActive: true
        }
      });

      if (!account) {
        console.log('Nenhuma conta encontrada para gerar receita');
        return;
      }

      // Criar transação de receita
      const transaction = await prisma.transaction.create({
        data: {
          description: `Venda - Pedido #${salesOrder.id} - ${salesOrder.customerName}`,
          amount: salesOrder.total,
          type: 'INCOME',
          date: new Date(),
          categoryId: salesCategory.id,
          accountId: account.id,
          companyId,
          isPaid: true,
          notes: `Receita automática da venda ${salesOrder.id}`
        }
      });

      // Gerar dízimo automático (10%)
      await this.generateTithe(companyId, salesOrder.total);

      return transaction;

    } catch (error) {
      console.error('Erro ao gerar receita da venda:', error);
    }
  }

  // Listar pedidos de venda
  static async listSalesOrders(companyId, filters = {}) {
    const {
      status,
      startDate,
      endDate,
      customerName,
      page = 1,
      limit = 20
    } = filters;

    try {
      const where = { companyId };

      if (status) where.status = status;
      if (customerName) where.customerName = { contains: customerName, mode: 'insensitive' };
      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) where.orderDate.gte = new Date(startDate);
        if (endDate) where.orderDate.lte = new Date(endDate);
      }

      const [orders, total] = await Promise.all([
        prisma.salesOrder.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true
                  }
                }
              }
            }
          },
          orderBy: { orderDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.salesOrder.count({ where })
      ]);

      return {
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancelar pedido de venda
  static async cancelSalesOrder(orderId, companyId, reason) {
    try {
      const salesOrder = await prisma.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });

      if (!salesOrder) {
        throw new Error('Pedido não encontrado');
      }

      if (salesOrder.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      if (salesOrder.status === 'CANCELLED') {
        throw new Error('Pedido já foi cancelado');
      }

      // Se o pedido foi confirmado, devolver estoque
      if (salesOrder.status === 'CONFIRMED') {
        for (const item of salesOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });

          // Registrar movimentação de estoque (devolução)
          await prisma.stockMovement.create({
            data: {
              companyId,
              productId: item.productId,
              type: 'ENTRY',
              reason: 'RETURN',
              quantity: item.quantity,
              unitCost: 0, // Devolução não tem custo
              totalCost: 0,
              description: `Cancelamento - Pedido #${salesOrder.id} - ${reason}`
            }
          });
        }
      }

      // Atualizar status
      const updatedOrder = await prisma.salesOrder.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          notes: reason ? `${salesOrder.notes || ''}\n\nCancelado: ${reason}` : 'Pedido cancelado'
        }
      });

      return {
        success: true,
        salesOrder: updatedOrder,
        message: 'Pedido cancelado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ===== SISTEMA DE COMPRAS =====

export class PurchaseSystem {
  // Criar pedido de compra
  static async createPurchaseOrder(data) {
    const {
      companyId,
      supplierName,
      supplierEmail,
      supplierPhone,
      items,
      freight = 0,
      notes,
      deliveryDate
    } = data;

    try {
      // Validar itens
      if (!items || items.length === 0) {
        throw new Error('Pedido deve ter pelo menos um item');
      }

      // Calcular total
      let total = 0;
      for (const item of items) {
        item.totalCost = item.unitCost * item.quantity;
        total += item.totalCost;
      }

      // Adicionar frete
      const finalTotal = total + freight;

      // Criar pedido
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          companyId,
          supplierName,
          supplierEmail,
          supplierPhone,
          status: 'DRAFT',
          total: finalTotal,
          freight,
          notes,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null
        }
      });

      // Criar itens do pedido
      const orderItems = await Promise.all(
        items.map(item =>
          prisma.purchaseOrderItem.create({
            data: {
              purchaseOrderId: purchaseOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              totalCost: item.totalCost
            }
          })
        )
      );

      return {
        success: true,
        purchaseOrder: {
          ...purchaseOrder,
          items: orderItems
        }
      };

    } catch (error) {
      console.error('Erro ao criar pedido de compra:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirmar pedido de compra
  static async confirmPurchaseOrder(orderId, companyId) {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!purchaseOrder) {
        throw new Error('Pedido não encontrado');
      }

      if (purchaseOrder.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      if (purchaseOrder.status !== 'DRAFT') {
        throw new Error('Pedido já foi confirmado ou cancelado');
      }

      // Atualizar status do pedido
      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      });

      // Gerar despesa automática
      await this.generateExpenseFromPurchase(purchaseOrder, companyId);

      return {
        success: true,
        purchaseOrder: updatedOrder,
        message: 'Pedido confirmado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Receber produtos do pedido de compra
  static async receivePurchaseOrder(orderId, companyId, receivedItems) {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!purchaseOrder) {
        throw new Error('Pedido não encontrado');
      }

      if (purchaseOrder.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      if (purchaseOrder.status !== 'CONFIRMED') {
        throw new Error('Pedido deve estar confirmado para receber produtos');
      }

      // Processar cada item recebido
      for (const receivedItem of receivedItems) {
        const orderItem = purchaseOrder.items.find(item => item.productId === receivedItem.productId);
        
        if (!orderItem) {
          throw new Error(`Item ${receivedItem.productId} não encontrado no pedido`);
        }

        if (receivedItem.quantity > orderItem.quantity) {
          throw new Error(`Quantidade recebida maior que a pedida para ${orderItem.product.name}`);
        }

        // Atualizar estoque
        await prisma.product.update({
          where: { id: receivedItem.productId },
          data: {
            stock: {
              increment: receivedItem.quantity
            },
            cost: receivedItem.unitCost || orderItem.unitCost // Usar custo recebido ou do pedido
          }
        });

        // Registrar movimentação de estoque
        await prisma.stockMovement.create({
          data: {
            companyId,
            productId: receivedItem.productId,
            type: 'ENTRY',
            reason: 'PURCHASE',
            quantity: receivedItem.quantity,
            unitCost: receivedItem.unitCost || orderItem.unitCost,
            totalCost: (receivedItem.unitCost || orderItem.unitCost) * receivedItem.quantity,
            description: `Compra - Pedido #${purchaseOrder.id} - ${purchaseOrder.supplierName}`
          }
        });
      }

      // Marcar como entregue se todos os itens foram recebidos
      const allReceived = purchaseOrder.items.every(item => {
        const received = receivedItems.find(ri => ri.productId === item.productId);
        return received && received.quantity >= item.quantity;
      });

      if (allReceived) {
        await prisma.purchaseOrder.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' }
        });
      }

      return {
        success: true,
        message: 'Produtos recebidos e estoque atualizado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao receber produtos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar despesa automática da compra
  static async generateExpenseFromPurchase(purchaseOrder, companyId) {
    try {
      // Buscar categoria de compras
      let purchaseCategory = await prisma.category.findFirst({
        where: {
          companyId,
          name: 'Compras'
        }
      });

      if (!purchaseCategory) {
        purchaseCategory = await prisma.category.create({
          data: {
            name: 'Compras',
            type: 'EXPENSE',
            color: '#ef4444',
            icon: 'shopping-bag',
            companyId
          }
        });
      }

      // Buscar conta padrão
      const account = await prisma.account.findFirst({
        where: {
          companyId,
          isActive: true
        }
      });

      if (!account) {
        console.log('Nenhuma conta encontrada para gerar despesa');
        return;
      }

      // Criar transação de despesa
      const transaction = await prisma.transaction.create({
        data: {
          description: `Compra - Pedido #${purchaseOrder.id} - ${purchaseOrder.supplierName}`,
          amount: purchaseOrder.total,
          type: 'EXPENSE',
          date: new Date(),
          categoryId: purchaseCategory.id,
          accountId: account.id,
          companyId,
          isPaid: false, // Compra geralmente é a pagar
          notes: `Despesa automática da compra ${purchaseOrder.id}`
        }
      });

      // Criar bill para pagamento
      await prisma.bill.create({
        data: {
          description: `Compra - Pedido #${purchaseOrder.id} - ${purchaseOrder.supplierName}`,
          amount: purchaseOrder.total,
          type: 'PAYABLE',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          companyId,
          categoryId: purchaseCategory.id,
          accountId: account.id,
          transactionId: transaction.id
        }
      });

      return transaction;

    } catch (error) {
      console.error('Erro ao gerar despesa da compra:', error);
    }
  }

  // Listar pedidos de compra
  static async listPurchaseOrders(companyId, filters = {}) {
    const {
      status,
      startDate,
      endDate,
      supplierName,
      page = 1,
      limit = 20
    } = filters;

    try {
      const where = { companyId };

      if (status) where.status = status;
      if (supplierName) where.supplierName = { contains: supplierName, mode: 'insensitive' };
      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) where.orderDate.gte = new Date(startDate);
        if (endDate) where.orderDate.lte = new Date(endDate);
      }

      const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true
                  }
                }
              }
            }
          },
          orderBy: { orderDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.purchaseOrder.count({ where })
      ]);

      return {
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ===== SISTEMA DE DOAÇÕES E SANGRIA =====

export class DonationSystem {
  // Registrar doação/brinde (baixa estoque sem despesa)
  static async registerDonation(data) {
    const {
      companyId,
      productId,
      quantity,
      recipient,
      reason,
      notes
    } = data;

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Produto não encontrado');
      }

      if (product.stock < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
      }

      // Baixar estoque
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      });

      // Registrar movimentação de estoque
      const movement = await prisma.stockMovement.create({
        data: {
          companyId,
          productId,
          type: 'EXIT',
          reason: 'DONATION',
          quantity,
          unitCost: 0, // Doação não tem custo
          totalCost: 0,
          description: `Doação/Brinde - ${recipient} - ${reason}`
        }
      });

      return {
        success: true,
        movement,
        message: 'Doação registrada com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar sangria de caixa
  static async registerCashWithdrawal(data) {
    const {
      companyId,
      accountId,
      amount,
      reason,
      notes
    } = data;

    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        throw new Error('Conta não encontrada');
      }

      if (account.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      if (account.balance < amount) {
        throw new Error(`Saldo insuficiente. Disponível: R$ ${account.balance}`);
      }

      // Buscar categoria de sangria
      let withdrawalCategory = await prisma.category.findFirst({
        where: {
          companyId,
          name: 'Sangria'
        }
      });

      if (!withdrawalCategory) {
        withdrawalCategory = await prisma.category.create({
          data: {
            name: 'Sangria',
            type: 'EXPENSE',
            color: '#dc2626',
            icon: 'minus-circle',
            companyId
          }
        });
      }

      // Criar transação de sangria
      const transaction = await prisma.transaction.create({
        data: {
          description: `Sangria de Caixa - ${reason}`,
          amount,
          type: 'EXPENSE',
          date: new Date(),
          categoryId: withdrawalCategory.id,
          accountId,
          companyId,
          isPaid: true,
          notes: notes || `Sangria: ${reason}`
        }
      });

      // Atualizar saldo da conta
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount
          }
        }
      });

      return {
        success: true,
        transaction,
        message: 'Sangria registrada com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao registrar sangria:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ===== FUNÇÕES AUXILIARES =====

// Gerar dízimo automático (10% das receitas)
export async function generateTithe(companyId, incomeAmount) {
  try {
    const titheAmount = incomeAmount * 0.1; // 10%
    
    // Buscar categoria de dízimo
    let titheCategory = await prisma.category.findFirst({
      where: {
        companyId: companyId,
        name: 'Dízimo'
      }
    });
    
    if (!titheCategory) {
      titheCategory = await prisma.category.create({
        data: {
          name: 'Dízimo',
          type: 'EXPENSE',
          color: '#8b5cf6',
          icon: 'heart',
          companyId: companyId
        }
      });
    }
    
    // Buscar conta padrão
    const account = await prisma.account.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      }
    });
    
    if (!account) return;
    
    // Criar bill de dízimo
    await prisma.bill.create({
      data: {
        description: 'Dízimo (10% da receita)',
        amount: titheAmount,
        type: 'PAYABLE',
        dueDate: new Date(),
        status: 'PENDING',
        companyId: companyId,
        categoryId: titheCategory.id,
        accountId: account.id
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar dízimo:', error);
  }
}

// Exportar todas as classes e funções
export {
  SalesSystem,
  PurchaseSystem,
  DonationSystem
};
