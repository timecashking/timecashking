import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  cardId: string;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsDateString()
  closeDate: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  status?: string;
}
