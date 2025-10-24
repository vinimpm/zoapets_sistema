import { IsString, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  ordem: number;

  @IsBoolean()
  obrigatorio: boolean;
}
