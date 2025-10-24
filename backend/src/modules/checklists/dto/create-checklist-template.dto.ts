import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistItemDto } from './create-checklist-item.dto';

export class CreateChecklistTemplateDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  tipoInternacao?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  itens: CreateChecklistItemDto[];
}
