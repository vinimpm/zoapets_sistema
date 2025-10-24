import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  categoria: string; // medicamento, material_cirurgico, alimento, higiene, servico, etc

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsOptional()
  dataValidade?: Date;

  @IsString()
  @IsNotEmpty()
  unidade: string; // unidade, caixa, frasco, kg, ml, serviço

  @IsNumber()
  @Min(0)
  @IsOptional()
  estoqueMinimo?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estoqueAtual?: number;

  @IsNumber()
  @Min(0)
  precoCusto: number;

  @IsNumber()
  @Min(0)
  precoVenda: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
