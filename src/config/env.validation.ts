import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPort,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsPort()
  @IsOptional()
  PORT: string = '3000';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_PRIVATE_KEY!: string;

  @IsString()
  @IsOptional()
  JWT_PUBLIC_KEY!: string;

  @IsNumber()
  @IsOptional()
  JWT_ACCESS_EXPIRATION: number = 3600;

  @IsNumber()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: number = 700;

  @IsString()
  // @IsNotEmpty()
  @IsOptional()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  // @IsNotEmpty()
  @IsOptional()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL: string =
    'http://localhost:3000/api/auth/google/callback';

  @IsString()
  @IsOptional()
  SMTP_HOST: string = 'localhost';

  @IsPort()
  @IsOptional()
  SMTP_PORT: string = '587';

  @IsString()
  @IsOptional()
  SMTP_USER: string = '';

  @IsString()
  @IsOptional()
  SMTP_PASS: string = '';

  @IsString()
  @IsOptional()
  SMTP_FROM: string = 'noreply@example.com';

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:5173';
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
