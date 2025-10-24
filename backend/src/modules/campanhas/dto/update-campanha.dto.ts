import { PartialType } from '@nestjs/mapped-types';
import { CreateCampanhaDto } from './create-campanha.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCampanhaDto extends PartialType(CreateCampanhaDto) {
  @IsNumber()
  @IsOptional()
  totalEnvios?: number;
}
