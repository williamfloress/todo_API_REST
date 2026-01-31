/**
 * database.module.ts
 * 
 * Módulo de gestión de base de datos.
 * Proporciona el servicio DatabaseService a toda la aplicación de manera global.
 * 
 * Responsabilidades:
 * - Registrar el DatabaseService como proveedor
 * - Exportar el DatabaseService para que esté disponible en otros módulos
 * - Configurarse como módulo global usando el decorador @Global()
 * 
 * Al ser un módulo @Global(), el DatabaseService estará disponible
 * en cualquier módulo de la aplicación sin necesidad de importar
 * explícitamente el DatabaseModule en cada uno.
 * 
 * Este patrón es útil para servicios fundamentales que se usan
 * en múltiples partes de la aplicación, como el acceso a la base de datos.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

// @Global() hace que este módulo esté disponible en toda la aplicación
// sin necesidad de importarlo explícitamente en cada módulo
@Global()
@Module({
  // Importa ConfigModule para acceder a las variables de entorno
  imports: [ConfigModule],
  
  // Registra el DatabaseService como proveedor de este módulo
  providers: [DatabaseService],
  
  // Exporta el DatabaseService para que otros módulos puedan usarlo
  exports: [DatabaseService],
})
export class DatabaseModule {}
