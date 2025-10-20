import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateSinaisVitaisDto {
  @IsString()
  @IsNotEmpty({ message: 'Internação ID é obrigatório' })
  internacaoId: string;

  @IsString()
  @IsNotEmpty({ message: 'Responsável ID é obrigatório' })
  responsavelId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data e hora são obrigatórias' })
  dataHora: string;

  @IsOptional()
  @IsNumber()
  temperaturaC?: number;

  @IsOptional()
  @IsNumber()
  frequenciaCardiaca?: number;

  @IsOptional()
  @IsNumber()
  frequenciaRespiratoria?: number;

  @IsOptional()
  @IsNumber()
  pressaoArterialSistolica?: number;

  @IsOptional()
  @IsNumber()
  pressaoArterialDiastolica?: number;

  @IsOptional()
  @IsNumber()
  spo2?: number;

  @IsOptional()
  @IsNumber()
  pesoKg?: number;

  @IsOptional()
  @IsNumber()
  glicemia?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
