import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAgendamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'Pet ID é obrigatório' })
  petId: string;

  @IsString()
  @IsNotEmpty({ message: 'Veterinário ID é obrigatório' })
  veterinarioId: string;

  @IsOptional()
  @IsString()
  procedimentoId?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data e hora de início são obrigatórias' })
  dataHoraInicio: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data e hora de fim são obrigatórias' })
  dataHoraFim: string;

  @IsString()
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo: string; // consulta, cirurgia, retorno, vacinacao

  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: string; // agendado, confirmado, em_atendimento, concluido, cancelado, falta

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
