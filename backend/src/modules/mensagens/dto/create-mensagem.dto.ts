import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMensagemDto {
  @IsUUID()
  @IsNotEmpty()
  destinatarioId: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;
}
