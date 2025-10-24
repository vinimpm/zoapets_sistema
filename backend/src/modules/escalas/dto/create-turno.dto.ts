import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateTurnoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string; // Format: 'HH:mm:ss'

  @IsString()
  @IsNotEmpty()
  horaFim: string; // Format: 'HH:mm:ss'

  @IsNumber()
  @Min(1)
  duracao: number; // Duração em horas

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
