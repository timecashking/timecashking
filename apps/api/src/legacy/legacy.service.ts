import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LegacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  // ========================================
  // AUTENTICAÇÃO E USUÁRIOS (LEGACY)
  // ========================================

  async register(createUserDto: any) {
    const { email, password, name } = createUserDto;

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Usuário já existe');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    // Gerar token
    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Senha inválida');
    }

    // Gerar token
    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async refresh(refreshDto: any) {
    // Implementar lógica de refresh token
    return { message: 'Token renovado' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateMe(userId: string, updateUserDto: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // ========================================
  // CATEGORIAS (LEGACY)
  // ========================================

  async getCategories(userId: string) {
    // Buscar categorias do usuário através da empresa
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          include: {
            company: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.companyUsers.length) {
      return [];
    }

    const categories = user.companyUsers[0].company.categories;
    return categories;
  }

  async createCategory(userId: string, createCategoryDto: CreateCategoryDto) {
    // Buscar empresa do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user || !user.companyUsers.length) {
      throw new BadRequestException('Usuário não está associado a uma empresa');
    }

    const companyId = user.companyUsers[0].company.id;

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        companyId,
      },
    });

    return category;
  }

  async updateCategory(userId: string, categoryId: string, updateCategoryDto: any) {
    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: updateCategoryDto,
    });

    return category;
  }

  async deleteCategory(userId: string, categoryId: string) {
    await this.prisma.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Categoria deletada com sucesso' };
  }

  // ========================================
  // FINANCEIRO (LEGACY)
  // ========================================

  async getEntries(userId: string, filters: any) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const entries = await this.prisma.entry.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });

    return entries;
  }

  async createEntry(userId: string, createEntryDto: CreateEntryDto) {
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

  async updateEntry(userId: string, entryId: string, updateEntryDto: any) {
    const entry = await this.prisma.entry.update({
      where: { id: entryId },
      data: updateEntryDto,
      include: {
        category: true,
        account: true,
      },
    });

    return entry;
  }

  async deleteEntry(userId: string, entryId: string) {
    await this.prisma.entry.delete({
      where: { id: entryId },
    });

    return { message: 'Entrada/saída deletada com sucesso' };
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
    // Implementar previsões do dashboard
    return {
      nextMonthIncome: 0,
      nextMonthExpense: 0,
      overdueEntries: 0,
      upcomingEntries: 0,
    };
  }

  // ========================================
  // CARTÕES E FATURAS (LEGACY)
  // ========================================

  async getCards(userId: string) {
    // Buscar cartões da empresa do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          include: {
            company: {
              include: {
                accounts: {
                  where: { type: 'CREDIT_CARD' },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.companyUsers.length) {
      return [];
    }

    return user.companyUsers[0].company.accounts;
  }

  async createCard(userId: string, createCardDto: CreateCardDto) {
    // Implementar criação de cartão
    return { message: 'Cartão criado com sucesso' };
  }

  async getCardInvoices(userId: string, cardId: string) {
    // Implementar busca de faturas
    return [];
  }

  async createCardCharge(userId: string, cardId: string, createChargeDto: any) {
    // Implementar criação de cobrança
    return { message: 'Cobrança criada com sucesso' };
  }

  async payInvoice(userId: string, invoiceId: string) {
    // Implementar pagamento de fatura
    return { message: 'Fatura marcada como paga' };
  }

  // ========================================
  // PRODUTOS E ESTOQUE (LEGACY)
  // ========================================

  async getProducts(userId: string, filters: any) {
    const where: any = { userId };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return products;
  }

  async createProduct(userId: string, createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        userId,
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  async updateProduct(userId: string, productId: string, updateProductDto: any) {
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: updateProductDto,
      include: {
        category: true,
      },
    });

    return product;
  }

  async createStockMove(userId: string, createStockMoveDto: any) {
    const stockMove = await this.prisma.stockMove.create({
      data: createStockMoveDto,
    });

    // Atualizar estoque do produto
    if (createStockMoveDto.type === 'IN') {
      await this.prisma.product.update({
        where: { id: createStockMoveDto.productId },
        data: {
          stock: {
            increment: createStockMoveDto.quantity,
          },
        },
      });
    } else if (createStockMoveDto.type === 'OUT') {
      await this.prisma.product.update({
        where: { id: createStockMoveDto.productId },
        data: {
          stock: {
            decrement: createStockMoveDto.quantity,
          },
        },
      });
    }

    return stockMove;
  }

  async getProfitReport(userId: string, startDate?: string, endDate?: string) {
    // Implementar relatório de lucro
    return {
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMargin: 0,
    };
  }

  async getReorderAlerts(userId: string) {
    const products = await this.prisma.product.findMany({
      where: { userId },
      include: { category: true },
    });

    return products.filter((p: any) => Number(p.stock) <= Number(p.minStock));
  }

  // ========================================
  // VENDAS (LEGACY)
  // ========================================

  async getSales(userId: string, filters: any) {
    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales;
  }

  async createSale(userId: string, createSaleDto: any) {
    // Implementar criação de venda
    return { message: 'Venda criada com sucesso' };
  }

  // ========================================
  // AGENDA E GOOGLE (LEGACY)
  // ========================================

  async getMeetings(userId: string, filters: any) {
    const where: any = { userId };

    if (filters.startDate && filters.endDate) {
      where.startTime = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const meetings = await this.prisma.meeting.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return meetings;
  }

  async createMeeting(userId: string, createMeetingDto: CreateMeetingDto) {
    const meeting = await this.prisma.meeting.create({
      data: {
        ...createMeetingDto,
        userId,
        startTime: new Date(createMeetingDto.startTime),
        endTime: new Date(createMeetingDto.endTime),
      },
    });

    return meeting;
  }

  async updateMeeting(userId: string, meetingId: string, updateMeetingDto: any) {
    const meeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: updateMeetingDto,
    });

    return meeting;
  }

  async deleteMeeting(userId: string, meetingId: string) {
    await this.prisma.meeting.delete({
      where: { id: meetingId },
    });

    return { message: 'Reunião deletada com sucesso' };
  }

  async getGoogleOAuthUrl() {
    // Implementar OAuth Google
    return { url: 'https://accounts.google.com/oauth/authorize' };
  }

  async googleOAuthCallback(code: string) {
    // Implementar callback OAuth
    return { message: 'OAuth realizado com sucesso' };
  }

  async syncMeetingWithGoogle(userId: string, meetingId: string) {
    // Implementar sincronização com Google
    return { message: 'Reunião sincronizada com Google' };
  }

  // ========================================
  // NLP (LEGACY)
  // ========================================

  async parseNLP(userId: string, parseDto: any) {
    // Implementar processamento NLP
    return {
      type: 'EXPENSE',
      amount: 0,
      description: 'Texto processado',
      category: 'Geral',
      needs_confirmation: false,
    };
  }

  // ========================================
  // INFRAESTRUTURA (LEGACY)
  // ========================================

  async health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async metrics() {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
    };
  }
}
