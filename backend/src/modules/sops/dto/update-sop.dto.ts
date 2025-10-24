import { PartialType } from '@nestjs/mapped-types';
import { CreateSopDto } from './create-sop.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSopDto extends PartialType(CreateSopDto) {
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
