import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

interface IAppConfig {
  NODE_ENV: string;
  PORT: number;
  TZ: string;
  JWT_SECRET_KEY: string;
  JWT_EXPIRATION_TIME: string;
  JWT_REFRESH_SECRET_KEY: string;
  JWT_REFRESH_EXPIRATION_TIME: string;
  TEMP_PASSWORD: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
}

const schema = Joi.object<IAppConfig>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'local').required(),
  PORT: Joi.number().optional(),
  TZ: Joi.string().optional(),
  TEMP_PASSWORD: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),
  JWT_REFRESH_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
  DATABASE_HOST: Joi.string().optional(),
  DATABASE_PORT: Joi.number().optional(),
  DATABASE_USERNAME: Joi.string().optional(),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_NAME: Joi.string().optional(),
  DATABASE_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().optional(),
  THROTTLE_TTL: Joi.number().optional(),
  THROTTLE_LIMIT: Joi.number().optional(),
});

export default registerAs('app_configs', () => {
  const configs: IAppConfig = {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: parseInt(process.env.PORT || '3000'),
    TZ: process.env.TZ || 'UTC',
    TEMP_PASSWORD: process.env.TEMP_PASSWORD!,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME!,
    JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY!,
    JWT_REFRESH_EXPIRATION_TIME: process.env.JWT_REFRESH_EXPIRATION_TIME!,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432'),
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    REDIS_DB: parseInt(process.env.REDIS_DB || '0'),
    THROTTLE_TTL: parseInt(process.env.THROTTLE_TTL || '60'),
    THROTTLE_LIMIT: parseInt(process.env.THROTTLE_LIMIT || '100'),
  };

  const { value, error } = schema.validate(configs, { abortEarly: false });

  if (error) {
    throw new Error(
      `Validation failed - Is there an environment variable missing? \n ${error.message.split('.').join('\n')}`,
    );
  }

  return value;
});
