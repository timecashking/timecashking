import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ description: 'Título da reunião' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descrição da reunião', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Horário de início' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Horário de término' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Local da reunião', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
