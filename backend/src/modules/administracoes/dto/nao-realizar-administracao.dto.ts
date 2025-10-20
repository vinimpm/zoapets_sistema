import { IsNotEmpty, IsString } from 'class-validator';

export class NaoRealizarAdministracaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  motivoNaoRealizado: string;

  @IsString()
  @IsNotEmpty({ message: 'Responsável ID é obrigatório' })
  responsavelId: string;
}
