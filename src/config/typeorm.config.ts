import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export default registerAs('typeorm', () => {
  const config: DataSourceOptions = {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    entities: [join(process.cwd(), 'modules', '**', '*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV === 'development',
  };

  return config;
});
