import { IsNotEmpty, IsString, IsOptional, IsDateString, IsBoolean, IsNumber } from 'class-validator';

export class CreateInternacaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Pet ID é obrigatório' })
  petId: string;

  @IsString()
  @IsNotEmpty({ message: 'Médico responsável ID é obrigatório' })
  medicoResponsavelId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data de entrada é obrigatória' })
  dataEntrada: string;

  @IsOptional()
  @IsDateString()
  dataAlta?: string;

  @IsString()
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  motivo: string;

  @IsOptional()
  @IsString()
  diagnosticoInicial?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo: string; // clinica, cirurgica, urgencia

  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: string; // aguardando, em_andamento, alta, obito

  @IsOptional()
  @IsString()
  leito?: string;

  @IsOptional()
  @IsBoolean()
  isolamento?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Prioridade é obrigatória' })
  prioridade: string; // baixa, media, alta, critica

  @IsOptional()
  @IsNumber()
  custoTotal?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
