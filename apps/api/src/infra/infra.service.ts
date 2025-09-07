import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntryType, Status } from '../types';

@Injectable()
export class InfraService {
  constructor(private prisma: PrismaService) {}

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  async getMetrics() {
    const [
      totalUsers,
      totalProducts,
      totalEntries,
      totalSales,
      totalMeetings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.entry.count(),
      this.prisma.sale.count(),
      this.prisma.meeting.count(),
    ]);

    return {
      users: totalUsers,
      products: totalProducts,
      entries: totalEntries,
      sales: totalSales,
      meetings: totalMeetings,
    };
  }

  async getDashboardForecast() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [monthlyIncome, monthlyExpenses, upcomingMeetings] = await Promise.all([
      // Receitas do mês
      this.prisma.entry.aggregate({
        where: {
          type: EntryType.INCOME,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: Status.ACTIVE,
        },
        _sum: {
          amount: true,
        },
      }),

      // Despesas do mês
      this.prisma.entry.aggregate({
        where: {
          type: EntryType.EXPENSE,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: Status.ACTIVE,
        },
        _sum: {
          amount: true,
        },
      }),

      // Reuniões próximas (próximos 7 dias)
      this.prisma.meeting.findMany({
        where: {
          startTime: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          status: Status.ACTIVE,
        },
        orderBy: {
          startTime: 'asc',
        },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const income = monthlyIncome._sum.amount || 0;
    const expenses = monthlyExpenses._sum.amount || 0;
    const balance = income - expenses;

    return {
      monthly: {
        income,
        expenses,
        balance,
      },
      upcomingMeetings,
      forecast: {
        trend: balance > 0 ? 'positive' : 'negative',
        message: balance > 0 
          ? 'Projeção positiva para o mês' 
          : 'Atenção aos gastos do mês',
      },
    };
  }
}
