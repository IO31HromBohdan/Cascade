import { IsArray, IsIn, IsOptional, IsString, Length } from 'class-validator';

const STATUS_VALUES = ['planned', 'in_progress', 'done'] as const;
const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

export class CreateTaskDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsString()
  @Length(10, 10)
  scheduledDate!: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @Length(10, 10)
  dueDate?: string;

  @IsString()
  @IsIn(PRIORITY_VALUES as readonly string[])
  priority!: string;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_VALUES as readonly string[])
  status?: string;

  @IsArray()
  @IsString({ each: true })
  tagIds!: string[];
}
