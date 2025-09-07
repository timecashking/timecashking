import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum EntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export class CreateEntryDto {
  @ApiProperty({ description: 'Descrição da entrada/saída' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Valor' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Tipo de entrada', enum: EntryType })
  @IsEnum(EntryType)
  type: EntryType;

  @ApiProperty({ description: 'Data da entrada/saída' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Data de vencimento', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Dias para lembrete', required: false })
  @IsOptional()
  @IsNumber()
  reminderDays?: number;

  @ApiProperty({ description: 'ID da categoria' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'ID da conta' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'É recorrente', required: false })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiProperty({ description: 'Padrão de recorrência', required: false })
  @IsOptional()
  @IsString()
  recurringPattern?: string;
}
