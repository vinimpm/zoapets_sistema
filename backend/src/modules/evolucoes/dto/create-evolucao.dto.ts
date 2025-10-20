import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEvolucaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Internação ID é obrigatório' })
  internacaoId: string;

  @IsString()
  @IsNotEmpty({ message: 'Veterinário ID é obrigatório' })
  veterinarioId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data e hora são obrigatórias' })
  dataHora: string;

  @IsString()
  @IsNotEmpty({ message: 'Relato é obrigatório' })
  relato: string;

  @IsOptional()
  @IsString()
  estadoGeral?: string; // excelente, bom, regular, ruim, critico

  @IsOptional()
  @IsString()
  alimentacao?: string; // normal, reduzida, nao_se_alimentou

  @IsOptional()
  @IsString()
  hidratacao?: string; // normal, desidratado_leve, desidratado_moderado, desidratado_grave

  @IsOptional()
  @IsString()
  consciencia?: string; // alerta, letargico, estuporoso, comatoso

  @IsOptional()
  @IsString()
  deambulacao?: string; // normal, claudicante, decubito

  @IsOptional()
  @IsString()
  observacoes?: string;
}
