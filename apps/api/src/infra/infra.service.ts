import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { EntryType, EntryStatus } from '../types';

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

  // TEMPORARIAMENTE DESABILITADO PARA DEPLOY
  async getDashboardForecast() {
    return {
      monthly: {
        income: 0,
        expenses: 0,
        balance: 0,
      },
      upcomingMeetings: [],
      forecast: {
        trend: 'positive',
        message: 'Sistema em manutenção',
      },
    };
  }
}