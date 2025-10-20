import { PartialType } from '@nestjs/mapped-types';
import { CreateResultadoExameDto } from './create-resultado-exame.dto';

export class UpdateResultadoExameDto extends PartialType(CreateResultadoExameDto) {}
