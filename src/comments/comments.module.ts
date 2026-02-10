// Módulo de comentarios: expone CommentsController y CommentsService, usa DatabaseModule para consultas SQL nativas.

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [DatabaseModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
