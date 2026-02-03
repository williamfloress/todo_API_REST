/**
 * Punto de entrada de la app. Crea la instancia NestJS y arranca el servidor en el puerto (env PORT o 3000).
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
