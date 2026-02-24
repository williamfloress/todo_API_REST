// Comentarios: controller y service; consultas directas con DatabaseModule.

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
