import { CoursePaymentType, CourseType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  min,
  minLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  duration!: string;

  @IsEnum(CourseType)
  type!: CourseType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fee!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  instructorName?: string;

  @IsOptional()
  @IsEnum(CoursePaymentType)
  paymentType?: CoursePaymentType;
}
