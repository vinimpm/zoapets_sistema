import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class RegistrarAdministracaoDto {
  @IsDateString()
  @IsNotEmpty({ message: 'Data e hora realizada é obrigatória' })
  dataHoraRealizada: string;

  @IsString()
  @IsNotEmpty({ message: 'Responsável ID é obrigatório' })
  responsavelId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
