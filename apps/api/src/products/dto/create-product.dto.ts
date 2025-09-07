import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'SKU do produto' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição do produto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Custo do produto' })
  @IsNumber()
  cost: number;

  @ApiProperty({ description: 'Preço de venda' })
  @IsNumber()
  salePrice: number;

  @ApiProperty({ description: 'Quantidade em estoque' })
  @IsNumber()
  stock: number;

  @ApiProperty({ description: 'Estoque mínimo' })
  @IsNumber()
  minStock: number;

  @ApiProperty({ description: 'ID da categoria' })
  @IsString()
  categoryId: string;
}
