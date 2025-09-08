import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: any, userId: string) {
    // Verificar se SKU já existe
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new BadRequestException('SKU já existe');
    }

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

  async findAll(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, categoryId, status, search, minStock, maxStock } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minStock !== undefined) {
      where.stock = { ...where.stock, gte: minStock };
    }

    if (maxStock !== undefined) {
      where.stock = { ...where.stock, lte: maxStock };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, updateProductDto: any, userId: string) {
    // Verificar se o produto pertence ao usuário
    await this.findOne(id, userId);

    // Se estiver alterando o SKU, verificar se já existe
    if (updateProductDto.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          NOT: { id },
        },
      });

      if (existingProduct) {
        throw new BadRequestException('SKU já existe');
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });

    return product;
  }

  async remove(id: string, userId: string) {
    // Verificar se o produto pertence ao usuário
    await this.findOne(id, userId);

    // Verificar se há vendas usando este produto
    const salesCount = await this.prisma.saleItem.count({
      where: { productId: id },
    });

    if (salesCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir um produto que possui vendas associadas',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Produto removido com sucesso' };
  }

  async createStockMove(createStockMoveDto: any, userId: string) {
    const { productId, quantity, type, reason } = createStockMoveDto;

    // Verificar se o produto pertence ao usuário
    await this.findOne(productId, userId);

    const stockMove = await this.prisma.stockMove.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        // moveDate: new Date(), // TEMPORARIAMENTE COMENTADO PARA DEPLOY
      },
    });

    // Atualizar estoque do produto
    if (type === 'IN') {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    } else if (type === 'OUT') {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (product.stock < quantity) {
        throw new BadRequestException('Estoque insuficiente');
      }

      await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }

    return stockMove;
  }

  async getReorderAlerts(userId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: { stock: 'asc' },
    });

    // Prisma não suporta comparação de coluna vs coluna no where.
    // Filtramos em memória: produtos com stock <= minStock.
    return products.filter((p: any) => Number(p.stock) <= Number(p.minStock));
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
