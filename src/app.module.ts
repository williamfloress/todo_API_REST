/**
 * app.module.ts
 * 
 * Módulo raíz de la aplicación NestJS.
 * Este archivo define la estructura principal de la aplicación y coordina
 * todos los módulos, controladores y servicios de la aplicación.
 * 
 * Responsabilidades:
 * - Configurar el módulo de configuración (variables de entorno)
 * - Importar y registrar todos los módulos de la aplicación
 * - Declarar controladores y proveedores principales
 * 
 * Estructura actual (Checkpoint 1.5):
 * - ConfigModule: Gestiona las variables de entorno desde el archivo .env
 * - DatabaseModule: Gestiona las conexiones a PostgreSQL
 * - AppController: Controlador principal con endpoints de prueba
 * - AppService: Servicio principal de la aplicación
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // ConfigModule: Carga y gestiona las variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,      // Las variables están disponibles en toda la aplicación
      envFilePath: '.env',  // Lee las variables del archivo .env en la raíz
    }),
    
    // DatabaseModule: Gestiona el pool de conexiones a PostgreSQL
    // Marcado como @Global() para estar disponible en toda la app
    DatabaseModule,
  ],
  
  // Controladores de este módulo
  controllers: [AppController],
  
  // Servicios/proveedores de este módulo
  providers: [AppService],
})
export class AppModule {}
