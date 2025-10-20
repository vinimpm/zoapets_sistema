import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePagamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'Conta ID é obrigatório' })
  contaId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data de pagamento é obrigatória' })
  dataPagamento: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Valor é obrigatório' })
  valor: number;

  @IsString()
  @IsNotEmpty({ message: 'Forma de pagamento é obrigatória' })
  formaPagamento: string; // dinheiro, cartao_credito, cartao_debito, pix, boleto

  @IsOptional()
  @IsNumber()
  parcelas?: number;

  @IsOptional()
  @IsString()
  transacaoId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Responsável ID é obrigatório' })
  responsavelId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
