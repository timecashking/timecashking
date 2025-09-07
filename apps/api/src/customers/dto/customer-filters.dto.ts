import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { CustomerStatus } from './create-customer.dto';

export class CustomerFiltersDto {
  @ApiProperty({ description: 'Página', required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Limite de itens por página', required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Termo de busca', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Campo para ordenação', required: false, default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiProperty({ description: 'Ordem de classificação', required: false, default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiProperty({ description: 'Status do cliente', enum: CustomerStatus, required: false })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiProperty({ description: 'Cidade', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Estado', required: false })
  @IsOptional()
  @IsString()
  state?: string;
}
