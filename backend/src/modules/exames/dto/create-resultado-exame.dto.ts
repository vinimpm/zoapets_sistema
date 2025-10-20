import { IsNotEmpty, IsString, IsOptional, IsDateString, IsObject, IsArray } from 'class-validator';

export class CreateResultadoExameDto {
  @IsString()
  @IsNotEmpty({ message: 'Exame ID é obrigatório' })
  exameId: string;

  @IsString()
  @IsNotEmpty({ message: 'Pet ID é obrigatório' })
  petId: string;

  @IsOptional()
  @IsString()
  internacaoId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Veterinário solicitante ID é obrigatório' })
  veterinarioSolicitanteId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data de solicitação é obrigatória' })
  dataSolicitacao: string;

  @IsOptional()
  @IsDateString()
  dataResultado?: string;

  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: string; // solicitado, coletado, em_analise, concluido, cancelado

  @IsOptional()
  @IsObject()
  valores?: any;

  @IsOptional()
  @IsString()
  interpretacao?: string;

  @IsOptional()
  @IsArray()
  arquivos?: string[];

  @IsOptional()
  @IsString()
  observacoes?: string;
}
