import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AltaDto {
  @IsDate()
  @Type(() => Date)
  dataSaida: Date;

  @IsString()
  @IsOptional()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
