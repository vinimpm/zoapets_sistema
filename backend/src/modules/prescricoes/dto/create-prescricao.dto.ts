import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PrescricaoItemDto {
  @IsString()
  @IsNotEmpty()
  medicamentoId: string;

  @IsString()
  @IsNotEmpty()
  dose: string;

  @IsString()
  @IsNotEmpty()
  viaAdministracao: string;

  @IsString()
  @IsNotEmpty()
  frequencia: string;

  @IsNotEmpty()
  duracaoDias: number;

  @IsArray()
  horarios: string[];

  @IsOptional()
  @IsString()
  instrucoes?: string;
}

export class CreatePrescricaoDto {
  @IsString()
  @IsNotEmpty({ message: 'Pet ID é obrigatório' })
  petId: string;

  @IsOptional()
  @IsString()
  internacaoId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Veterinário ID é obrigatório' })
  veterinarioId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data de prescrição é obrigatória' })
  dataPrescricao: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Data de validade é obrigatória' })
  dataValidade: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescricaoItemDto)
  itens: PrescricaoItemDto[];
}
