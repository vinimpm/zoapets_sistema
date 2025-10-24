import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContaItemDto } from './create-conta-item.dto';

export class CreateContaDto {
  @IsString()
  @IsNotEmpty()
  tutorId: string;

  @IsString()
  @IsOptional()
  petId?: string;

  @IsString()
  @IsOptional()
  internacaoId?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsDateString()
  @IsOptional()
  dataVencimento?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContaItemDto)
  itens: CreateContaItemDto[];
}
