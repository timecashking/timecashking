import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountDto: any, userId: string) {
    const account = await this.prisma.account.create({
      data: {
        ...createAccountDto,
        userId,
      },
    });

    return account;
  }

  async findAll(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, type, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bankName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.account.count({ where }),
    ]);

    return {
      data: accounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async update(id: string, updateAccountDto: any, userId: string) {
    // Verificar se a conta pertence ao usuário
    await this.findOne(id, userId);

    const account = await this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });

    return account;
  }

  async remove(id: string, userId: string) {
    // Verificar se a conta pertence ao usuário
    await this.findOne(id, userId);

    // Verificar se há entradas usando esta conta
    const entriesCount = await this.prisma.entry.count({
      where: { accountId: id },
    });

    if (entriesCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma conta que possui movimentações associadas',
      );
    }

    await this.prisma.account.delete({
      where: { id },
    });

    return { message: 'Conta removida com sucesso' };
  }

  async getBalance(id: string, userId: string) {
    const account = await this.findOne(id, userId);

    // Calcular saldo baseado nas entradas
    const entries = await this.prisma.entry.findMany({
      where: { accountId: id },
    });

    let balance = 0;
    for (const entry of entries) {
      if (entry.type === 'INCOME') {
        balance += Number(entry.amount);
      } else if (entry.type === 'EXPENSE') {
        balance -= Number(entry.amount);
      }
      // TRANSFER não altera o saldo total
    }

    return {
      accountId: id,
      accountName: account.name,
      balance,
      entriesCount: entries.length,
    };
  }

  async getTotalBalance(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    let totalBalance = 0;
    for (const account of accounts) {
      totalBalance += Number(account.balance);
    }

    return {
      totalBalance,
      accountsCount: accounts.length,
    };
  }
}
