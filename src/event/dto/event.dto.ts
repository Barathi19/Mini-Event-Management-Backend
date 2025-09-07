import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { IsEndTimeAfterStartTime } from 'src/common/validator/isEndTimeAfterStartTime';
import { IsFutureDate } from 'src/common/validator/isFutureData';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  @IsEndTimeAfterStartTime('startTime')
  endTime: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  maxCapacity: number;
}

export class RegisterEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class GetEventsQueryDto {
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class GetEventAttendeesQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
