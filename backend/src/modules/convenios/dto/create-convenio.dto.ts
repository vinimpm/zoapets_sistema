import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, Min, Max } from 'class-validator';

export class CreateConvenioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentualRepasse: number;

  @IsNumber()
  @Min(0)
  prazoPagamento: number;
}
