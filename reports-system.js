import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== SISTEMA DE RELATÓRIOS =====

export class ReportsSystem {
  // ===== RELATÓRIOS FINANCEIROS =====

  // Resumo financeiro mensal
  static async getMonthlyFinancialReport(companyId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [income, expenses, bills, transactions] = await Promise.all([
        // Receitas do mês
        prisma.transaction.aggregate({
          where: {
            companyId,
            type: 'INCOME',
            date: { gte: startDate, lte: endDate },
            isPaid: true
          },
          _sum: { amount: true },
          _count: true
        }),

        // Despesas do mês
        prisma.transaction.aggregate({
          where: {
            companyId,
            type: 'EXPENSE',
            date: { gte: startDate, lte: endDate },
            isPaid: true
          },
          _sum: { amount: true },
          _count: true
        }),

        // Contas a pagar/receber
        prisma.bill.findMany({
          where: {
            companyId,
            dueDate: { gte: startDate, lte: endDate }
          },
          include: {
            category: true,
            account: true
          }
        }),

        // Transações por categoria
        prisma.transaction.groupBy({
          by: ['categoryId', 'type'],
          where: {
            companyId,
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true },
          _count: true
        })
      ]);

      // Calcular saldo
      const totalIncome = income._sum.amount || 0;
      const totalExpenses = expenses._sum.amount || 0;
      const balance = totalIncome - totalExpenses;

      // Agrupar transações por categoria
      const categorySummary = {};
      for (const transaction of transactions) {
        const categoryId = transaction.categoryId || 'Sem categoria';
        if (!categorySummary[categoryId]) {
          categorySummary[categoryId] = { income: 0, expense: 0, count: 0 };
        }
        
        if (transaction.type === 'INCOME') {
          categorySummary[categoryId].income += transaction._sum.amount || 0;
        } else {
          categorySummary[categoryId].expense += transaction._sum.amount || 0;
        }
        categorySummary[categoryId].count += transaction._count;
      }

      return {
        success: true,
        report: {
          period: { year, month },
          summary: {
            totalIncome,
            totalExpenses,
            balance,
            transactionCount: (income._count || 0) + (expenses._count || 0)
          },
          bills: bills,
          categorySummary,
          profitMargin: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fluxo de caixa
  static async getCashFlowReport(companyId, startDate, endDate) {
    try {
      const [transactions, bills] = await Promise.all([
        // Transações do período
        prisma.transaction.findMany({
          where: {
            companyId,
            date: { gte: new Date(startDate), lte: new Date(endDate) }
          },
          include: {
            category: true,
            account: true
          },
          orderBy: { date: 'asc' }
        }),

        // Contas a pagar/receber do período
        prisma.bill.findMany({
          where: {
            companyId,
            dueDate: { gte: new Date(startDate), lte: new Date(endDate) }
          },
          include: {
            category: true,
            account: true
          }
        })
      ]);

      // Agrupar por data
      const dailyFlow = {};
      let runningBalance = 0;

      // Processar transações
      for (const transaction of transactions) {
        const date = transaction.date.toISOString().split('T')[0];
        if (!dailyFlow[date]) {
          dailyFlow[date] = { income: 0, expense: 0, balance: 0, transactions: [] };
        }

        if (transaction.type === 'INCOME') {
          dailyFlow[date].income += transaction.amount;
          runningBalance += transaction.amount;
        } else {
          dailyFlow[date].expense += transaction.amount;
          runningBalance -= transaction.amount;
        }

        dailyFlow[date].balance = runningBalance;
        dailyFlow[date].transactions.push(transaction);
      }

      // Processar contas
      for (const bill of bills) {
        const date = bill.dueDate.toISOString().split('T')[0];
        if (!dailyFlow[date]) {
          dailyFlow[date] = { income: 0, expense: 0, balance: runningBalance, transactions: [], bills: [] };
        }

        if (bill.type === 'RECEIVABLE') {
          dailyFlow[date].income += bill.amount;
        } else {
          dailyFlow[date].expense += bill.amount;
        }

        if (!dailyFlow[date].bills) dailyFlow[date].bills = [];
        dailyFlow[date].bills.push(bill);
      }

      return {
        success: true,
        cashFlow: {
          period: { startDate, endDate },
          dailyFlow,
          summary: {
            totalIncome: Object.values(dailyFlow).reduce((sum, day) => sum + day.income, 0),
            totalExpense: Object.values(dailyFlow).reduce((sum, day) => sum + day.expense, 0),
            finalBalance: runningBalance
          }
        }
      };

    } catch (error) {
      console.error('Erro ao gerar fluxo de caixa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // DRE simplificado
  static async getSimplifiedDRE(companyId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [income, expenses, previousMonthBalance] = await Promise.all([
        // Receitas operacionais
        prisma.transaction.aggregate({
          where: {
            companyId,
            type: 'INCOME',
            date: { gte: startDate, lte: endDate },
            isPaid: true
          },
          _sum: { amount: true }
        }),

        // Despesas operacionais
        prisma.transaction.aggregate({
          where: {
            companyId,
            type: 'EXPENSE',
            date: { gte: startDate, lte: endDate },
            isPaid: true
          },
          _sum: { amount: true }
        }),

        // Saldo do mês anterior
        prisma.transaction.aggregate({
          where: {
            companyId,
            date: { lt: startDate }
          },
          _sum: { amount: true }
        })
      ]);

      const totalIncome = income._sum.amount || 0;
      const totalExpenses = expenses._sum.amount || 0;
      const operatingIncome = totalIncome - totalExpenses;
      const previousBalance = previousMonthBalance._sum.amount || 0;
      const finalBalance = previousBalance + operatingIncome;

      return {
        success: true,
        dre: {
          period: { year, month },
          revenue: {
            operatingRevenue: totalIncome,
            totalRevenue: totalIncome
          },
          expenses: {
            operatingExpenses: totalExpenses,
            totalExpenses: totalExpenses
          },
          result: {
            operatingIncome,
            netIncome: operatingIncome,
            previousBalance,
            finalBalance
          },
          indicators: {
            profitMargin: totalIncome > 0 ? ((operatingIncome / totalIncome) * 100).toFixed(2) : 0,
            expenseRatio: totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(2) : 0
          }
        }
      };

    } catch (error) {
      console.error('Erro ao gerar DRE:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== RELATÓRIOS DE ESTOQUE =====

  // Relatório de estoque
  static async getInventoryReport(companyId) {
    try {
      const [products, movements, lowStockProducts] = await Promise.all([
        // Todos os produtos
        prisma.product.findMany({
          where: {
            companyId,
            isActive: true
          },
          orderBy: { name: 'asc' }
        }),

        // Movimentações do mês
        prisma.stockMovement.findMany({
          where: {
            companyId,
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          include: {
            product: {
              select: { name: true, sku: true }
            }
          },
          orderBy: { date: 'desc' }
        }),

        // Produtos com estoque baixo
        prisma.product.findMany({
          where: {
            companyId,
            isActive: true,
            stock: {
              lte: prisma.product.fields.minStock
            }
          }
        })
      ]);

      // Calcular valorização
      let totalValue = 0;
      let totalCost = 0;
      for (const product of products) {
        totalValue += product.stock * product.salePrice;
        totalCost += product.stock * product.cost;
      }

      // Agrupar movimentações por tipo
      const movementSummary = {
        entries: movements.filter(m => m.type === 'ENTRY'),
        exits: movements.filter(m => m.type === 'EXIT'),
        byReason: {}
      };

      for (const movement of movements) {
        if (!movementSummary.byReason[movement.reason]) {
          movementSummary.byReason[movement.reason] = [];
        }
        movementSummary.byReason[movement.reason].push(movement);
      }

      return {
        success: true,
        inventory: {
          summary: {
            totalProducts: products.length,
            totalStock: products.reduce((sum, p) => sum + p.stock, 0),
            totalValue: totalValue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            averageMargin: totalCost > 0 ? (((totalValue - totalCost) / totalCost) * 100).toFixed(2) : 0
          },
          products,
          lowStockProducts,
          movements: movementSummary,
          topProducts: products
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 10)
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Relatório de movimentações de estoque
  static async getStockMovementReport(companyId, startDate, endDate, filters = {}) {
    try {
      const where = {
        companyId,
        date: { gte: new Date(startDate), lte: new Date(endDate) }
      };

      if (filters.productId) where.productId = filters.productId;
      if (filters.type) where.type = filters.type;
      if (filters.reason) where.reason = filters.reason;

      const movements = await prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { name: true, sku: true }
          }
        },
        orderBy: { date: 'desc' }
      });

      // Agrupar por produto
      const productMovements = {};
      for (const movement of movements) {
        const productId = movement.productId;
        if (!productMovements[productId]) {
          productMovements[productId] = {
            product: movement.product,
            movements: [],
            totalEntry: 0,
            totalExit: 0,
            netChange: 0
          };
        }

        productMovements[productId].movements.push(movement);
        
        if (movement.type === 'ENTRY') {
          productMovements[productId].totalEntry += movement.quantity;
          productMovements[productId].netChange += movement.quantity;
        } else {
          productMovements[productId].totalExit += movement.quantity;
          productMovements[productId].netChange -= movement.quantity;
        }
      }

      // Calcular totais
      const totals = movements.reduce((acc, movement) => {
        if (movement.type === 'ENTRY') {
          acc.entries += movement.quantity;
          acc.entryValue += movement.totalCost;
        } else {
          acc.exits += movement.quantity;
          acc.exitValue += movement.totalCost;
        }
        return acc;
      }, { entries: 0, exits: 0, entryValue: 0, exitValue: 0 });

      return {
        success: true,
        movements: {
          period: { startDate, endDate },
          summary: totals,
          productMovements,
          allMovements: movements
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de movimentações:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== RELATÓRIOS DE VENDAS =====

  // Relatório de vendas
  static async getSalesReport(companyId, startDate, endDate, filters = {}) {
    try {
      const where = {
        companyId,
        status: 'CONFIRMED',
        orderDate: { gte: new Date(startDate), lte: new Date(endDate) }
      };

      if (filters.customerName) where.customerName = { contains: filters.customerName, mode: 'insensitive' };
      if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

      const [orders, totalOrders] = await Promise.all([
        prisma.salesOrder.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: { name: true, sku: true, cost: true }
                }
              }
            }
          },
          orderBy: { orderDate: 'desc' }
        }),
        prisma.salesOrder.count({ where })
      ]);

      // Calcular métricas
      let totalRevenue = 0;
      let totalCost = 0;
      let totalDiscount = 0;
      const productSales = {};
      const customerSales = {};

      for (const order of orders) {
        totalRevenue += order.total;
        totalDiscount += order.discount;

        // Agrupar por produto
        for (const item of order.items) {
          const productId = item.productId;
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0,
              cost: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.totalPrice;
          productSales[productId].cost += item.quantity * item.product.cost;
          totalCost += item.quantity * item.product.cost;
        }

        // Agrupar por cliente
        const customerKey = order.customerName.toLowerCase();
        if (!customerSales[customerKey]) {
          customerSales[customerKey] = {
            name: order.customerName,
            orders: 0,
            revenue: 0,
            averageTicket: 0
          };
        }
        customerSales[customerKey].orders += 1;
        customerSales[customerKey].revenue += order.total;
      }

      // Calcular ticket médio por cliente
      for (const customer of Object.values(customerSales)) {
        customer.averageTicket = customer.revenue / customer.orders;
      }

      // Top produtos
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Top clientes
      const topCustomers = Object.values(customerSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(2) : 0;

      return {
        success: true,
        sales: {
          period: { startDate, endDate },
          summary: {
            totalOrders,
            totalRevenue: totalRevenue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            profitMargin,
            averageTicket: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
          },
          topProducts,
          topCustomers,
          productSales,
          customerSales,
          orders
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de vendas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Relatório de pulseiras vendidas (específico para o negócio)
  static async getBraceletSalesReport(companyId, startDate, endDate) {
    try {
      const where = {
        companyId,
        status: 'CONFIRMED',
        orderDate: { gte: new Date(startDate), lte: new Date(endDate) }
      };

      const orders = await prisma.salesOrder.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true, cost: true }
              }
            }
          }
        }
      });

      // Filtrar apenas pulseiras
      const braceletOrders = orders.filter(order => 
        order.items.some(item => 
          item.product.name.toLowerCase().includes('pulseira') ||
          item.product.sku.toLowerCase().includes('pulseira')
        )
      );

      let totalBracelets = 0;
      let totalRevenue = 0;
      let totalCost = 0;
      const braceletTypes = {};

      for (const order of braceletOrders) {
        for (const item of order.items) {
          if (item.product.name.toLowerCase().includes('pulseira') ||
              item.product.sku.toLowerCase().includes('pulseira')) {
            
            totalBracelets += item.quantity;
            totalRevenue += item.totalPrice;
            totalCost += item.quantity * item.product.cost;

            // Agrupar por tipo de pulseira
            const braceletType = item.product.name;
            if (!braceletTypes[braceletType]) {
              braceletTypes[braceletType] = {
                name: braceletType,
                quantity: 0,
                revenue: 0,
                cost: 0
              };
            }
            braceletTypes[braceletType].quantity += item.quantity;
            braceletTypes[braceletType].revenue += item.totalPrice;
            braceletTypes[braceletType].cost += item.quantity * item.product.cost;
          }
        }
      }

      const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(2) : 0;

      return {
        success: true,
        braceletSales: {
          period: { startDate, endDate },
          summary: {
            totalBracelets,
            totalRevenue: totalRevenue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            profitMargin,
            averagePrice: totalBracelets > 0 ? (totalRevenue / totalBracelets).toFixed(2) : 0
          },
          braceletTypes: Object.values(braceletTypes),
          orders: braceletOrders
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de pulseiras:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== RELATÓRIOS DE COMPRAS =====

  // Relatório de compras
  static async getPurchaseReport(companyId, startDate, endDate, filters = {}) {
    try {
      const where = {
        companyId,
        orderDate: { gte: new Date(startDate), lte: new Date(endDate) }
      };

      if (filters.status) where.status = filters.status;
      if (filters.supplierName) where.supplierName = { contains: filters.supplierName, mode: 'insensitive' };

      const orders = await prisma.purchaseOrder.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          }
        },
        orderBy: { orderDate: 'desc' }
      });

      // Calcular métricas
      let totalOrders = 0;
      let totalValue = 0;
      let totalFreight = 0;
      const supplierPurchases = {};
      const productPurchases = {};

      for (const order of orders) {
        if (order.status === 'CONFIRMED' || order.status === 'DELIVERED') {
          totalOrders += 1;
          totalValue += order.total;
          totalFreight += order.freight;
        }

        // Agrupar por fornecedor
        const supplierKey = order.supplierName.toLowerCase();
        if (!supplierPurchases[supplierKey]) {
          supplierPurchases[supplierKey] = {
            name: order.supplierName,
            orders: 0,
            value: 0,
            freight: 0
          };
        }
        supplierPurchases[supplierKey].orders += 1;
        supplierPurchases[supplierKey].value += order.total;
        supplierPurchases[supplierKey].freight += order.freight;

        // Agrupar por produto
        for (const item of order.items) {
          const productId = item.productId;
          if (!productPurchases[productId]) {
            productPurchases[productId] = {
              product: item.product,
              quantity: 0,
              value: 0
            };
          }
          productPurchases[productId].quantity += item.quantity;
          productPurchases[productId].value += item.totalCost;
        }
      }

      // Top fornecedores
      const topSuppliers = Object.values(supplierPurchases)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Top produtos comprados
      const topProducts = Object.values(productPurchases)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return {
        success: true,
        purchases: {
          period: { startDate, endDate },
          summary: {
            totalOrders: orders.length,
            confirmedOrders: totalOrders,
            totalValue: totalValue.toFixed(2),
            totalFreight: totalFreight.toFixed(2),
            averageOrderValue: totalOrders > 0 ? (totalValue / totalOrders).toFixed(2) : 0
          },
          topSuppliers,
          topProducts,
          supplierPurchases,
          productPurchases,
          orders
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de compras:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== RELATÓRIOS CONSOLIDADOS =====

  // Dashboard executivo
  static async getExecutiveDashboard(companyId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const [
        monthlyFinancial,
        inventory,
        sales,
        purchases,
        lowStockProducts,
        pendingBills,
        upcomingEvents
      ] = await Promise.all([
        this.getMonthlyFinancialReport(companyId, now.getFullYear(), now.getMonth() + 1),
        this.getInventoryReport(companyId),
        this.getSalesReport(companyId, startOfMonth.toISOString(), endOfMonth.toISOString()),
        this.getPurchaseReport(companyId, startOfMonth.toISOString(), endOfMonth.toISOString()),
        prisma.product.findMany({
          where: {
            companyId,
            isActive: true,
            stock: {
              lte: prisma.product.fields.minStock
            }
          },
          take: 5
        }),
        prisma.bill.findMany({
          where: {
            companyId,
            status: 'PENDING',
            dueDate: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Próximos 7 dias
            }
          },
          take: 5
        }),
        prisma.event.findMany({
          where: {
            companyId,
            startDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Próximos 7 dias
            }
          },
          take: 5,
          orderBy: { startDate: 'asc' }
        })
      ]);

      return {
        success: true,
        dashboard: {
          period: { year: now.getFullYear(), month: now.getMonth() + 1 },
          financial: monthlyFinancial.report,
          inventory: inventory.summary,
          sales: sales.summary,
          purchases: purchases.summary,
          alerts: {
            lowStockProducts: lowStockProducts.length,
            pendingBills: pendingBills.length,
            upcomingEvents: upcomingEvents.length
          },
          topItems: {
            lowStock: lowStockProducts,
            pendingBills,
            upcomingEvents
          }
        }
      };

    } catch (error) {
      console.error('Erro ao gerar dashboard executivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar a classe
export default ReportsSystem;
