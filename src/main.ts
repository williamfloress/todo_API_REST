/**
 * main.ts
 * 
 * Archivo principal de la aplicación NestJS.
 * Este es el punto de entrada de la aplicación que inicializa el servidor
 * y configura el puerto en el que escuchará las peticiones HTTP.
 * 
 * Responsabilidades:
 * - Crear la instancia de la aplicación NestJS
 * - Inicializar el servidor HTTP
 * - Configurar el puerto de escucha
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Función bootstrap - Inicializa y arranca la aplicación
 * 
 * Esta función asíncrona es responsable de:
 * 1. Crear la instancia de la aplicación usando el módulo raíz (AppModule)
 * 2. Configurar el servidor para escuchar en el puerto especificado
 * 
 * El puerto se obtiene de las variables de entorno (PORT) o usa 3000 por defecto
 */
async function bootstrap() {
  // Crea la aplicación NestJS con el módulo raíz
  const app = await NestFactory.create(AppModule);
  
  // Inicia el servidor HTTP en el puerto especificado
  // Usa el puerto de las variables de entorno o 3000 por defecto
  await app.listen(process.env.PORT ?? 3000);
}

// Ejecuta la función de inicialización
bootstrap();
