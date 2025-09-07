import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEntryDto: any, userId: string) {
    const entry = await this.prisma.entry.create({
      data: {
        ...createEntryDto,
        userId,
        date: new Date(createEntryDto.date),
        dueDate: createEntryDto.dueDate ? new Date(createEntryDto.dueDate) : null,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return entry;
  }

  async findAll(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, type, categoryId, accountId, startDate, endDate, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const [entries, total] = await Promise.all([
      this.prisma.entry.findMany({
        where,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.entry.count({ where }),
    ]);

    return {
      data: entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const entry = await this.prisma.entry.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Entrada/saída não encontrada');
    }

    return entry;
  }

  async update(id: string, updateEntryDto: any, userId: string) {
    // Verificar se a entrada pertence ao usuário
    await this.findOne(id, userId);

    const entry = await this.prisma.entry.update({
      where: { id },
      data: {
        ...updateEntryDto,
        date: updateEntryDto.date ? new Date(updateEntryDto.date) : undefined,
        dueDate: updateEntryDto.dueDate ? new Date(updateEntryDto.dueDate) : undefined,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return entry;
  }

  async remove(id: string, userId: string) {
    // Verificar se a entrada pertence ao usuário
    await this.findOne(id, userId);

    await this.prisma.entry.delete({
      where: { id },
    });

    return { message: 'Entrada/saída removida com sucesso' };
  }

  async getMonthlySummary(userId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const income = entries
      .filter(e => e.type === 'INCOME')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const expense = entries
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      month: currentMonth,
      year: currentYear,
      income,
      expense,
      balance: income - expense,
      totalEntries: entries.length,
    };
  }

  async getDashboardForecast(userId: string) {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    // Próximas entradas/saídas
    const upcomingEntries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: currentDate,
        },
        status: 'PENDING',
      },
      take: 5,
      orderBy: { date: 'asc' },
    });

    // Entradas/saídas vencidas
    const overdueEntries = await this.prisma.entry.findMany({
      where: {
        userId,
        dueDate: {
          lt: currentDate,
        },
        status: 'PENDING',
      },
    });

    // Previsão do próximo mês
    const nextMonthEntries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: nextMonth,
          lt: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1),
        },
      },
    });

    const nextMonthIncome = nextMonthEntries
      .filter(e => e.type === 'INCOME')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const nextMonthExpense = nextMonthEntries
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      nextMonthIncome,
      nextMonthExpense,
      overdueEntries: overdueEntries.length,
      upcomingEntries: upcomingEntries.length,
    };
  }
}
