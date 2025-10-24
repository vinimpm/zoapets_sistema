import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateEscalaDto {
  @IsString()
  @IsNotEmpty()
  funcionarioId: string;

  @IsString()
  @IsNotEmpty()
  turnoId: string;

  @IsDateString()
  data: string; // ISO date format

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
