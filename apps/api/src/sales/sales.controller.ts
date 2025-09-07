import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova venda' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso' })
  async create(@Body() createSaleDto: any, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as vendas' })
  @ApiResponse({ status: 200, description: 'Lista de vendas' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.salesService.findAll(req.user.userId, filters);
  }

  @Get('reports/profit')
  @ApiOperation({ summary: 'Obter relatório de lucro' })
  @ApiResponse({ status: 200, description: 'Relatório de lucro' })
  async getProfitReport(@Query() query: any, @Request() req) {
    const { startDate, endDate } = query;
    return this.salesService.getProfitReport(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter venda por ID' })
  @ApiResponse({ status: 200, description: 'Venda encontrada' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.salesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar venda' })
  @ApiResponse({ status: 200, description: 'Venda atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateSaleDto: any, @Request() req) {
    return this.salesService.update(id, updateSaleDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover venda' })
  @ApiResponse({ status: 200, description: 'Venda removida com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.salesService.remove(id, req.user.userId);
  }
}
