import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class GerarInternacaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Motivo da internação é obrigatório' })
  motivo: string;

  @IsString()
  @IsNotEmpty({ message: 'Tipo de internação é obrigatório' })
  tipo: string; // clinica, cirurgica, urgencia

  @IsString()
  @IsNotEmpty({ message: 'Prioridade é obrigatória' })
  prioridade: string; // baixa, media, alta, critica

  @IsOptional()
  @IsString()
  leito?: string;

  @IsOptional()
  @IsBoolean()
  isolamento?: boolean;

  @IsOptional()
  @IsString()
  diagnosticoInicial?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  medicoResponsavelId?: string; // Se não informado, usa o veterinário da consulta
}
