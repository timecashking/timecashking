import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class CreditCardInvoiceSystem {
  /**
   * Cria uma nova fatura de cartão de crédito
   */
  static async createInvoice(data) {
    try {
      const { companyId, accountId, billingMonth, billingYear, dueDate } = data;

      // Verifica se a conta é um cartão de crédito
      const account = await prisma.account.findFirst({
        where: { 
          id: accountId, 
          companyId,
          type: 'CREDIT_CARD'
        }
      });

      if (!account) {
        throw new Error('Conta não é um cartão de crédito válido');
      }

      // Verifica se já existe fatura para este mês/ano
      const existingInvoice = await prisma.creditCardInvoice.findFirst({
        where: {
          companyId,
          accountId,
          billingMonth,
          billingYear
        }
      });

      if (existingInvoice) {
        throw new Error('Fatura já existe para este mês/ano');
      }

      // Busca transações do período da fatura
      const startDate = new Date(billingYear, billingMonth - 1, 1);
      const endDate = new Date(billingYear, billingMonth, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          companyId,
          accountId,
          date: {
            gte: startDate,
            lte: endDate
          },
          type: 'EXPENSE'
        },
        include: {
          category: true
        }
      });

      // Calcula valores da fatura
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalTransactions = transactions.length;

      // Cria a fatura
      const invoice = await prisma.creditCardInvoice.create({
        data: {
          companyId,
          accountId,
          billingMonth,
          billingYear,
          dueDate: new Date(dueDate),
          totalAmount,
          totalTransactions,
          status: 'OPEN',
          billingDay: account.billingDay || 15
        }
      });

      // Associa as transações à fatura
      if (transactions.length > 0) {
        await prisma.transaction.updateMany({
          where: {
            id: { in: transactions.map(t => t.id) }
          },
          data: {
            creditCardInvoiceId: invoice.id
          }
        });
      }

      return {
        success: true,
        invoice,
        message: 'Fatura criada com sucesso',
        transactions: transactions.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fecha uma fatura (muda status para CLOSED)
   */
  static async closeInvoice(invoiceId, companyId) {
    try {
      const invoice = await prisma.creditCardInvoice.findFirst({
        where: { 
          id: invoiceId, 
          companyId 
        }
      });

      if (!invoice) {
        throw new Error('Fatura não encontrada');
      }

      if (invoice.status !== 'OPEN') {
        throw new Error('Fatura não está aberta para fechamento');
      }

      // Atualiza status para CLOSED
      const updatedInvoice = await prisma.creditCardInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'CLOSED',
          closedAt: new Date()
        }
      });

      return {
        success: true,
        invoice: updatedInvoice,
        message: 'Fatura fechada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marca fatura como paga
   */
  static async markAsPaid(invoiceId, companyId, paymentData) {
    try {
      const { paymentDate, paymentMethod, paymentAmount, notes } = paymentData;

      const invoice = await prisma.creditCardInvoice.findFirst({
        where: { 
          id: invoiceId, 
          companyId 
        }
      });

      if (!invoice) {
        throw new Error('Fatura não encontrada');
      }

      if (invoice.status === 'PAID') {
        throw new Error('Fatura já está paga');
      }

      // Cria registro de pagamento
      const payment = await prisma.creditCardPayment.create({
        data: {
          invoiceId,
          companyId,
          paymentDate: new Date(paymentDate),
          paymentMethod,
          paymentAmount: paymentAmount || invoice.totalAmount,
          notes
        }
      });

      // Atualiza status da fatura para PAID
      const updatedInvoice = await prisma.creditCardInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentId: payment.id
        }
      });

      // Atualiza saldo da conta (reduz o valor da fatura)
      await prisma.account.update({
        where: { id: invoice.accountId },
        data: {
          balance: {
            decrement: invoice.totalAmount
          }
        }
      });

      return {
        success: true,
        invoice: updatedInvoice,
        payment,
        message: 'Fatura marcada como paga com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lista faturas de uma empresa
   */
  static async listInvoices(companyId, filters = {}) {
    try {
      const { status, accountId, year, month, page = 1, limit = 20 } = filters;

      const where = { companyId };

      if (status) where.status = status;
      if (accountId) where.accountId = accountId;
      if (year) where.billingYear = year;
      if (month) where.billingMonth = month;

      const skip = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        prisma.creditCardInvoice.findMany({
          where,
          include: {
            account: true,
            payment: true,
            transactions: {
              include: {
                category: true
              }
            }
          },
          orderBy: [
            { billingYear: 'desc' },
            { billingMonth: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.creditCardInvoice.count({ where })
      ]);

      return {
        success: true,
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém detalhes de uma fatura específica
   */
  static async getInvoiceDetails(invoiceId, companyId) {
    try {
      const invoice = await prisma.creditCardInvoice.findFirst({
        where: { 
          id: invoiceId, 
          companyId 
        },
        include: {
          account: true,
          payment: true,
          transactions: {
            include: {
              category: true
            },
            orderBy: {
              date: 'desc'
            }
          }
        }
      });

      if (!invoice) {
        throw new Error('Fatura não encontrada');
      }

      // Agrupa transações por categoria
      const transactionsByCategory = invoice.transactions.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Sem categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: transaction.category,
            transactions: [],
            total: 0
          };
        }
        acc[categoryName].transactions.push(transaction);
        acc[categoryName].total += Number(transaction.amount);
        return acc;
      }, {});

      return {
        success: true,
        invoice,
        transactionsByCategory,
        summary: {
          totalTransactions: invoice.transactions.length,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          dueDate: invoice.dueDate,
          daysUntilDue: Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera faturas automaticamente para todos os cartões de uma empresa
   */
  static async generateMonthlyInvoices(companyId, month, year) {
    try {
      // Busca todos os cartões de crédito da empresa
      const creditCards = await prisma.account.findMany({
        where: {
          companyId,
          type: 'CREDIT_CARD',
          active: true
        }
      });

      const results = [];

      for (const card of creditCards) {
        try {
          // Calcula data de vencimento baseada no billing day
          const dueDate = new Date(year, month, card.billingDay || 15);
          
          const result = await this.createInvoice({
            companyId,
            accountId: card.id,
            billingMonth: month,
            billingYear: year,
            dueDate
          });

          results.push({
            cardName: card.name,
            success: result.success,
            message: result.message,
            error: result.error
          });
        } catch (error) {
          results.push({
            cardName: card.name,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results,
        message: `Processamento de faturas concluído para ${month}/${year}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém resumo de faturas para dashboard
   */
  static async getInvoiceSummary(companyId) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Faturas do mês atual
      const currentMonthInvoices = await prisma.creditCardInvoice.findMany({
        where: {
          companyId,
          billingMonth: currentMonth,
          billingYear: currentYear
        }
      });

      // Faturas vencidas
      const overdueInvoices = await prisma.creditCardInvoice.findMany({
        where: {
          companyId,
          status: { in: ['OPEN', 'CLOSED'] },
          dueDate: { lt: currentDate }
        }
      });

      // Faturas a vencer nos próximos 7 dias
      const upcomingInvoices = await prisma.creditCardInvoice.findMany({
        where: {
          companyId,
          status: { in: ['OPEN', 'CLOSED'] },
          dueDate: {
            gte: currentDate,
            lte: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const summary = {
        currentMonth: {
          total: currentMonthInvoices.length,
          open: currentMonthInvoices.filter(i => i.status === 'OPEN').length,
          closed: currentMonthInvoices.filter(i => i.status === 'CLOSED').length,
          paid: currentMonthInvoices.filter(i => i.status === 'PAID').length,
          totalAmount: currentMonthInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
        },
        overdue: {
          count: overdueInvoices.length,
          totalAmount: overdueInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
        },
        upcoming: {
          count: upcomingInvoices.length,
          totalAmount: upcomingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
        }
      };

      return {
        success: true,
        summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém histórico de faturas por cartão
   */
  static async getCardInvoiceHistory(companyId, accountId, months = 12) {
    try {
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

      const invoices = await prisma.creditCardInvoice.findMany({
        where: {
          companyId,
          accountId,
          createdAt: { gte: startDate }
        },
        include: {
          payment: true,
          transactions: {
            select: {
              id: true,
              amount: true,
              description: true,
              date: true
            }
          }
        },
        orderBy: [
          { billingYear: 'desc' },
          { billingMonth: 'desc' }
        ]
      });

      // Agrupa por ano para facilitar visualização
      const groupedByYear = invoices.reduce((acc, invoice) => {
        const year = invoice.billingYear;
        if (!acc[year]) acc[year] = [];
        acc[year].push(invoice);
        return acc;
      }, {});

      return {
        success: true,
        invoices: groupedByYear,
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancela uma fatura (apenas se estiver OPEN)
   */
  static async cancelInvoice(invoiceId, companyId, reason) {
    try {
      const invoice = await prisma.creditCardInvoice.findFirst({
        where: { 
          id: invoiceId, 
          companyId 
        }
      });

      if (!invoice) {
        throw new Error('Fatura não encontrada');
      }

      if (invoice.status !== 'OPEN') {
        throw new Error('Apenas faturas abertas podem ser canceladas');
      }

      // Remove associação das transações
      await prisma.transaction.updateMany({
        where: { creditCardInvoiceId: invoiceId },
        data: { creditCardInvoiceId: null }
      });

      // Cancela a fatura
      const updatedInvoice = await prisma.creditCardInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason
        }
      });

      return {
        success: true,
        invoice: updatedInvoice,
        message: 'Fatura cancelada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
