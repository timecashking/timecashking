import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PREPAID = 'PREPAID',
}

export class CreateCardDto {
  @ApiProperty({ description: 'Nome do cartão' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tipo do cartão', enum: CardType })
  @IsEnum(CardType)
  type: CardType;

  @ApiProperty({ description: 'Limite do cartão', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Dia de fechamento' })
  @IsNumber()
  closeDay: number;

  @ApiProperty({ description: 'Dia de vencimento' })
  @IsNumber()
  dueDay: number;
}
