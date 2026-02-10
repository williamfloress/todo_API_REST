// Controlador de comentarios: endpoints CRUD bajo /comments, protegidos con JWT. Listar por tarea, crear en tarea, obtener uno, actualizar y eliminar (userId del token para permisos).

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Obtener comentarios de una tarea' })
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findAll(taskId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comentario por ID' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Post('tasks/:taskId')
  @ApiOperation({ summary: 'Crear comentario en una tarea' })
  create(@Param('taskId') taskId: string, @Body() createCommentDto: CreateCommentDto, @Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.commentsService.create(createCommentDto, userId, taskId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar comentario' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.commentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comentario' })
  async remove(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    await this.commentsService.remove(id, userId);
    return { message: 'Comentario eliminado exitosamente' };
  }
}
