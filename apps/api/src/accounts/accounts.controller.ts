import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  async create(@Body() createAccountDto: any, @Request() req) {
    return this.accountsService.create(createAccountDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas' })
  @ApiResponse({ status: 200, description: 'Lista de contas' })
  async findAll(@Query() filters: any, @Request() req) {
    return this.accountsService.findAll(req.user.userId, filters);
  }

  @Get('balance/total')
  @ApiOperation({ summary: 'Obter saldo total de todas as contas' })
  @ApiResponse({ status: 200, description: 'Saldo total obtido com sucesso' })
  async getTotalBalance(@Request() req) {
    return this.accountsService.getTotalBalance(req.user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obter saldo de uma conta específica' })
  @ApiResponse({ status: 200, description: 'Saldo obtido com sucesso' })
  async getBalance(@Param('id') id: string, @Request() req) {
    return this.accountsService.getBalance(id, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta por ID' })
  @ApiResponse({ status: 200, description: 'Conta encontrada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  @ApiResponse({ status: 200, description: 'Conta atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateAccountDto: any, @Request() req) {
    return this.accountsService.update(id, updateAccountDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover conta' })
  @ApiResponse({ status: 200, description: 'Conta removida com sucesso' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.accountsService.remove(id, req.user.userId);
  }
}
