import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export class CreateCustomerDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'CPF/CNPJ do cliente', required: false })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Cidade do cliente', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Estado do cliente', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'CEP do cliente', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'Observações sobre o cliente', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Status do cliente', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
