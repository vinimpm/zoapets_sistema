import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistTemplateDto } from './create-checklist-template.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateChecklistTemplateDto extends PartialType(CreateChecklistTemplateDto) {
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
