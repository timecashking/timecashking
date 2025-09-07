import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova reunião' })
  @ApiResponse({ status: 201, description: 'Reunião criada com sucesso' })
  async create(@Body() createMeetingDto: any, @Request() req) {
    return this.meetingsService.create(createMeetingDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as reuniões' })
  @ApiResponse({ status: 200, description: 'Lista de reuniões' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.meetingsService.findAll(req.user.userId, filters);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obter próximas reuniões' })
  @ApiResponse({ status: 200, description: 'Próximas reuniões' })
  async getUpcomingMeetings(@Query('limit') limit: number, @Request() req) {
    return this.meetingsService.getUpcomingMeetings(req.user.userId, limit);
  }

  @Post(':id/sync/google')
  @ApiOperation({ summary: 'Sincronizar reunião com Google Calendar' })
  @ApiResponse({ status: 200, description: 'Reunião sincronizada com sucesso' })
  async syncWithGoogle(@Param('id') id: string, @Request() req) {
    return this.meetingsService.syncWithGoogle(id, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter reunião por ID' })
  @ApiResponse({ status: 200, description: 'Reunião encontrada' })
  @ApiResponse({ status: 404, description: 'Reunião não encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.meetingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar reunião' })
  @ApiResponse({ status: 200, description: 'Reunião atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateMeetingDto: any, @Request() req) {
    return this.meetingsService.update(id, updateMeetingDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover reunião' })
  @ApiResponse({ status: 200, description: 'Reunião removida com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.meetingsService.remove(id, req.user.userId);
  }
}
