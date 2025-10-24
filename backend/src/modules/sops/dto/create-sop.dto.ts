import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateSopDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  categoria: string; // higienizacao, coleta, descarte, cirurgia

  @IsString()
  @IsNotEmpty()
  procedimento: string;

  @IsString()
  @IsOptional()
  materiais?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  versao?: number;
}
