import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateMedicamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Princípio ativo é obrigatório' })
  principioAtivo: string;

  @IsString()
  @IsNotEmpty({ message: 'Fabricante é obrigatório' })
  fabricante: string;

  @IsOptional()
  @IsString()
  concentracao?: string;

  @IsString()
  @IsNotEmpty({ message: 'Forma farmacêutica é obrigatória' })
  formaFarmaceutica: string;

  @IsString()
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo: string;

  @IsOptional()
  @IsBoolean()
  usoControlado?: boolean;

  @IsOptional()
  @IsString()
  registroAnvisa?: string;

  @IsOptional()
  @IsArray()
  indicacoes?: string[];

  @IsOptional()
  @IsArray()
  contraindicacoes?: string[];

  @IsOptional()
  @IsString()
  posologia?: string;

  @IsOptional()
  @IsNumber()
  estoqueMinimo?: number;

  @IsOptional()
  @IsNumber()
  estoqueAtual?: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Preço é obrigatório' })
  preco: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
