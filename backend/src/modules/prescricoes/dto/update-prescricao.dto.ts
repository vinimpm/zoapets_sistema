import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescricaoDto } from './create-prescricao.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePrescricaoDto extends PartialType(CreatePrescricaoDto) {
  @IsOptional()
  @IsString()
  status?: string; // ativa, suspensa, concluida, cancelada
}
