import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateEquipamentoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @IsDateString()
  @IsOptional()
  dataAquisicao?: string;

  @IsDateString()
  @IsOptional()
  proximaCalibracao?: string;

  @IsDateString()
  @IsOptional()
  proximaManutencao?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
