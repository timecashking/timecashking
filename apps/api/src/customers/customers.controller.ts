import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // TEMPORARIAMENTE COMENTADO PARA DEPLOY

@ApiTags('customers')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // TEMPORARIAMENTE COMENTADO PARA DEPLOY
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.create(createCustomerDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  findAll(@Query() filters: CustomerFiltersDto, @Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.findAll(filters, companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas dos clientes' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  getStats(@Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.getCustomerStats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  @ApiResponse({ status: 200, description: 'Cliente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.customersService.remove(id, companyId);
  }
}
