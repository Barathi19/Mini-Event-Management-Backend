import {
  IsString,
  IsNumber,
  IsOptional,
  validateSync,
  ValidationError,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  MONGO_URI!: string;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const message = errors
      .map(
        (err) =>
          `${err.property} has wrong value. Constraints: ${JSON.stringify(
            err.constraints,
          )}`,
      )
      .join(', ');
    throw new Error(`Config validation error: ${message}`);
  }

  return validatedConfig;
}
