import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateConfiguracaoDto {
  @IsOptional()
  @IsString()
  nomeClinica?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  horarioAtendimento?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  siteUrl?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsBoolean()
  notificacoesEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesSms?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesWhatsapp?: boolean;
}
