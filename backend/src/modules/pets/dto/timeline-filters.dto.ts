import { IsOptional, IsArray, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TimelineEventType } from '../interfaces/timeline-event.interface';

export class TimelineFiltersDto {
  @IsOptional()
  @IsArray()
  @IsEnum(TimelineEventType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  types?: TimelineEventType[];

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;
}
