import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];

  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
