import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsNumber, IsArray } from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty({ message: 'Tutor ID é obrigatório' })
  tutorId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Espécie é obrigatória' })
  especie: string;

  @IsOptional()
  @IsString()
  raca?: string;

  @IsString()
  @IsNotEmpty({ message: 'Sexo é obrigatório' })
  sexo: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  @IsNumber()
  pesoKg?: number;

  @IsOptional()
  @IsString()
  corPelagem?: string;

  @IsOptional()
  @IsBoolean()
  castrado?: boolean;

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @IsArray()
  alergias?: string[];

  @IsOptional()
  @IsArray()
  doencasPrevias?: string[];

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
