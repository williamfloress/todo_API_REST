/**
 * Módulo de usuarios. Declara UsersService y UsersController (rutas bajo /users).
 * Importa DatabaseModule para SQL nativo. Exporta UsersService para que AuthModule lo use en login.
 */

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
