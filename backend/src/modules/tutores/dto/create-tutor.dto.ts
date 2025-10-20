import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateTutorDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  nomeCompleto: string;

  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefone principal é obrigatório' })
  telefonePrincipal: string;

  @IsOptional()
  @IsString()
  telefoneSecundario?: string;

  @IsOptional()
  @IsObject()
  enderecoCompleto?: any;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
