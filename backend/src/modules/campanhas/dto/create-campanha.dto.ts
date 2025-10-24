import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCampanhaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @IsDateString()
  @IsNotEmpty()
  dataFim: string;

  @IsString()
  @IsNotEmpty()
  canal: string; // email, sms, whatsapp

  @IsString()
  @IsNotEmpty()
  mensagem: string;

  @IsString()
  @IsOptional()
  status?: string;
}
