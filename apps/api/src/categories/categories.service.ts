import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: any, userId: string) {
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

  async findAll(userId: string, filters: any = {}) {
    // Buscar categorias da empresa do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          include: {
            company: {
              include: {
                categories: {
                  where: filters,
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

    return user.companyUsers[0].company.categories;
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        company: {
          companyUsers: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: any, userId: string) {
    // Verificar se a categoria pertence à empresa do usuário
    await this.findOne(id, userId);

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return category;
  }

  async remove(id: string, userId: string) {
    // Verificar se a categoria pertence à empresa do usuário
    await this.findOne(id, userId);

    // Verificar se há entradas ou produtos usando esta categoria
    const [entriesCount, productsCount] = await Promise.all([
      this.prisma.entry.count({
        where: { categoryId: id },
      }),
      this.prisma.product.count({
        where: { categoryId: id },
      }),
    ]);

    if (entriesCount > 0 || productsCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que está sendo usada',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Categoria removida com sucesso' };
  }

  async findByType(type: string, userId: string) {
    return this.findAll(userId, { type });
  }
}
