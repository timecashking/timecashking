import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: any, userId: string) {
    const { items, ...saleData } = createSaleDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Venda deve ter pelo menos um item');
    }

    // Calcular totais e verificar estoque
    let totalAmount = 0;
    let totalCost = 0;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Produto ${item.productId} não encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
      }

      totalAmount += Number(item.unitPrice) * item.quantity;
      totalCost += Number(product.cost) * item.quantity;
    }

    const totalProfit = totalAmount - totalCost;

    // Criar venda e itens
    const sale = await this.prisma.sale.create({
      data: {
        ...saleData,
        userId,
        totalAmount,
        totalCost,
        totalProfit,
        saleDate: new Date(),
      },
    });

    // Criar itens da venda
    const saleItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        
        const totalPrice = Number(item.unitPrice) * item.quantity;
        const cost = Number(product?.cost || 0) * item.quantity;
        const profit = totalPrice - cost;
        
        return this.prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            cost,
            profit,
          },
        });
      }),
    );

    // Atualizar estoque dos produtos
    for (const item of items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return {
      ...sale,
      items: saleItems,
    };
  }

  async findAll(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    return sale;
  }

  async update(id: string, updateSaleDto: any, userId: string) {
    // Verificar se a venda pertence ao usuário
    await this.findOne(id, userId);

    const sale = await this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return sale;
  }

  async remove(id: string, userId: string) {
    // Verificar se a venda pertence ao usuário
    const sale = await this.findOne(id, userId);

    // Restaurar estoque dos produtos
    for (const item of sale.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Remover itens da venda
    await this.prisma.saleItem.deleteMany({
      where: { saleId: id },
    });

    // Remover venda
    await this.prisma.sale.delete({
      where: { id },
    });

    return { message: 'Venda removida com sucesso' };
  }

  async getProfitReport(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
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
    });

    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalCost = sales.reduce((sum, sale) => sum + Number(sale.totalCost), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.totalProfit), 0);

    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalCost,
      totalProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      salesCount: sales.length,
    };
  }
}
