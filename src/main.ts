import { NestFactory } from '@nestjs/core';
import { AppModule } from './main.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeName } from 'swagger-themes';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AdvancedFilterPlugin } from './utils/swagger-plugin.util';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ credentials: true });
  app.setGlobalPrefix('api', { exclude: ['health', 'metrics'] });

  const theme = new SwaggerTheme();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(':v/docs', app, document, {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      plugins: [AdvancedFilterPlugin],
    },
    customCss: theme.getBuffer('flattop' as SwaggerThemeName),
    customSiteTitle: 'Boilerplate Documentation',
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Server running on port: ${port}`);
}
bootstrap();
