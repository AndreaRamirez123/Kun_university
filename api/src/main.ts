import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // En Cloud Run las peticiones llegan por un proxy: así req.ip es la IP real.
  app.set('trust proxy', true);
  app.setGlobalPrefix('api');
  // FRONTEND_URL admite varios orígenes separados por comas (p. ej. web.app y firebaseapp.com).
  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('KUN University AI — API')
    .setDescription('API pública del sitio de KUN University AI (escuelas, programas, leads).')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`KUN University API running on http://localhost:${port}/api`);
}
await bootstrap();
