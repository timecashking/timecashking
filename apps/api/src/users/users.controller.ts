import { Controller, Get, Put, Body, UseGuards, Request, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil obtido com sucesso' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  async updateProfile(@Request() req, @Body() updateUserDto: any) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@Query() filters: any) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário por ID (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário por ID (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário por ID (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
