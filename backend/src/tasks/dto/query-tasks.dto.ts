import { IsIn, IsOptional, IsString, Length } from 'class-validator';

const STATUS_VALUES = ['planned', 'in_progress', 'done'] as const;

export class QueryTasksDto {
  @IsOptional()
  @IsString()
  @Length(10, 10)
  date?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  from?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  to?: string;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_VALUES as readonly string[])
  status?: string;
}
