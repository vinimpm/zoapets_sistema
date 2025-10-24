import { IsNotEmpty, IsString, IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class CreateMovimentacaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicamento ID é obrigatório' })
  medicamentoId: string;

  @IsString()
  @IsIn(['entrada', 'saida'], { message: 'Tipo deve ser entrada ou saida' })
  tipo: 'entrada' | 'saida';

  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser no mínimo 1' })
  quantidade: number;

  @IsString()
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  motivo: string;

  @IsString()
  @IsNotEmpty({ message: 'Responsável ID é obrigatório' })
  responsavelId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
