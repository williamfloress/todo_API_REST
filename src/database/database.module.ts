/**
 * Módulo de base de datos (PostgreSQL).
 * Es @Global(): cualquier módulo puede inyectar DatabaseService sin importar DatabaseModule en imports.
 * Necesita ConfigModule para leer DB_* desde .env.
 */
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
