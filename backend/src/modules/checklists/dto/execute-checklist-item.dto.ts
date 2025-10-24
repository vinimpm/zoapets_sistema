import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class ExecuteChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  executionId: string;

  @IsBoolean()
  concluido: boolean;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
