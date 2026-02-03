/**
 * Módulo de usuarios. Declara UsersService y UsersController (rutas bajo /users).
 * Importa DatabaseModule para que UsersService pueda ejecutar SQL nativo.
 */

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
