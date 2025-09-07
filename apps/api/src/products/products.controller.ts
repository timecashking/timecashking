import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  async create(@Body() createProductDto: any, @Request() req) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.productsService.findAll(req.user.userId, filters);
  }

  @Get('reorder-alerts')
  @ApiOperation({ summary: 'Obter alertas de reabastecimento' })
  @ApiResponse({ status: 200, description: 'Alertas de reabastecimento' })
  async getReorderAlerts(@Request() req) {
    return this.productsService.getReorderAlerts(req.user.userId);
  }

  @Get('reports/profit')
  @ApiOperation({ summary: 'Obter relatório de lucro' })
  @ApiResponse({ status: 200, description: 'Relatório de lucro' })
  async getProfitReport(@Query() query: any, @Request() req) {
    const { startDate, endDate } = query;
    return this.productsService.getProfitReport(req.user.userId, startDate, endDate);
  }

  @Post('stock/moves')
  @ApiOperation({ summary: 'Criar movimentação de estoque' })
  @ApiResponse({ status: 201, description: 'Movimentação criada com sucesso' })
  async createStockMove(@Body() createStockMoveDto: any, @Request() req) {
    return this.productsService.createStockMove(createStockMoveDto, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.productsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  async update(@Param('id') id: string, @Body() updateProductDto: any, @Request() req) {
    return this.productsService.update(id, updateProductDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(id, req.user.userId);
  }
}
