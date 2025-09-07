import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  async create(@Body() createCategoryDto: any, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.categoriesService.findAll(req.user.userId, filters);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Listar categorias por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de categorias do tipo especificado' })
  async findByType(@Param('type') type: string, @Request() req) {
    return this.categoriesService.findByType(type, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: any, @Request() req) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}
