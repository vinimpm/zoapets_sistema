import { PartialType } from '@nestjs/mapped-types';
import { CreateConvenioDto } from './create-convenio.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConvenioDto extends PartialType(CreateConvenioDto) {
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
