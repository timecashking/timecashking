import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, companyId: string) {
    try {
      const customer = await this.prisma.customer.create({
        data: {
          ...createCustomerDto,
          companyId,
        },
      });

      return customer;
    } catch (error) {
      throw new BadRequestException('Erro ao criar cliente');
    }
  }

  async findAll(filters: CustomerFiltersDto, companyId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      status,
      city,
      state,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        sales: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, companyId: string) {
    const customer = await this.findOne(id, companyId);

    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
      });

      return updatedCustomer;
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar cliente');
    }
  }

  async remove(id: string, companyId: string) {
    const customer = await this.findOne(id, companyId);

    try {
      await this.prisma.customer.delete({
        where: { id },
      });

      return { message: 'Cliente removido com sucesso' };
    } catch (error) {
      throw new BadRequestException('Erro ao remover cliente');
    }
  }

  async getCustomerStats(companyId: string) {
    const [total, active, inactive, blocked] = await Promise.all([
      this.prisma.customer.count({
        where: { companyId },
      }),
      this.prisma.customer.count({
        where: { companyId, status: 'ACTIVE' },
      }),
      this.prisma.customer.count({
        where: { companyId, status: 'INACTIVE' },
      }),
      this.prisma.customer.count({
        where: { companyId, status: 'BLOCKED' },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      blocked,
    };
  }
}
