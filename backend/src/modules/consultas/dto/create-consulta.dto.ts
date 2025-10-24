import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateConsultaDto {
  @IsString()
  @IsNotEmpty({ message: 'Pet ID é obrigatório' })
  petId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tutor ID é obrigatório' })
  tutorId: string;

  @IsString()
  @IsNotEmpty({ message: 'Veterinário ID é obrigatório' })
  veterinarioId: string;

  @IsOptional()
  @IsString()
  agendamentoId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo: string; // ambulatorial, emergencia, retorno

  @IsDateString()
  @IsNotEmpty({ message: 'Data de atendimento é obrigatória' })
  dataAtendimento: string;

  // Anamnese
  @IsString()
  @IsNotEmpty({ message: 'Queixa principal é obrigatória' })
  queixaPrincipal: string;

  @IsOptional()
  @IsString()
  historico?: string;

  // Exame Físico
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @IsOptional()
  @IsNumber()
  frequenciaCardiaca?: number;

  @IsOptional()
  @IsNumber()
  frequenciaRespiratoria?: number;

  @IsOptional()
  @IsString()
  tpc?: string;

  @IsOptional()
  @IsString()
  mucosas?: string;

  @IsOptional()
  @IsString()
  hidratacao?: string;

  @IsOptional()
  @IsString()
  ausculta?: string;

  @IsOptional()
  @IsString()
  palpacao?: string;

  @IsOptional()
  @IsString()
  exameFisicoObs?: string;

  // Diagnóstico e Conduta
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  conduta?: string;

  @IsOptional()
  @IsString()
  orientacoes?: string;

  // Status
  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: string; // em_atendimento, concluida, gerou_internacao

  @IsOptional()
  @IsString()
  internacaoId?: string;

  @IsOptional()
  @IsNumber()
  custoTotal?: number;
}
