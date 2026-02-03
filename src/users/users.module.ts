/**
 * Módulo de usuarios. Declara UsersService y UsersController (rutas bajo /users).
 */

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
