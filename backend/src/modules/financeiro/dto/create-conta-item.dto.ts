import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateContaItemDto {
  @IsString()
  @IsNotEmpty()
  tipo: string; // produto, medicamento, procedimento, exame, servico, etc

  @IsString()
  @IsOptional()
  itemReferenciaId?: string; // ID do produto, medicamento, etc

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @Min(1)
  quantidade: number;

  @IsNumber()
  @Min(0)
  valorUnitario: number;
}
