import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Entries')
@Controller('entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova entrada/saída' })
  @ApiResponse({ status: 201, description: 'Entrada/saída criada com sucesso' })
  async create(@Body() createEntryDto: any, @Request() req) {
    return this.entriesService.create(createEntryDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as entradas/saídas' })
  @ApiResponse({ status: 200, description: 'Lista de entradas/saídas' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.entriesService.findAll(req.user.userId, filters);
  }

  @Get('summary/monthly')
  @ApiOperation({ summary: 'Obter resumo mensal' })
  @ApiResponse({ status: 200, description: 'Resumo mensal obtido com sucesso' })
  async getMonthlySummary(@Query() query: any, @Request() req) {
    const { month, year } = query;
    return this.entriesService.getMonthlySummary(req.user.userId, month, year);
  }

  @Get('dashboard/forecast')
  @ApiOperation({ summary: 'Obter previsões do dashboard' })
  @ApiResponse({ status: 200, description: 'Previsões obtidas com sucesso' })
  async getDashboardForecast(@Request() req) {
    return this.entriesService.getDashboardForecast(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter entrada/saída por ID' })
  @ApiResponse({ status: 200, description: 'Entrada/saída encontrada' })
  @ApiResponse({ status: 404, description: 'Entrada/saída não encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.entriesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar entrada/saída' })
  @ApiResponse({ status: 200, description: 'Entrada/saída atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateEntryDto: any, @Request() req) {
    return this.entriesService.update(id, updateEntryDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover entrada/saída' })
  @ApiResponse({ status: 200, description: 'Entrada/saída removida com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.entriesService.remove(id, req.user.userId);
  }
}
