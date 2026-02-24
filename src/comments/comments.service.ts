// CRUD contra la tabla commentaries; comprobamos que la tarea exista y que solo el autor edite/borre. Listados con JOIN a users y tasks para nombre y tarea.

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentWithRelations } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Insertamos; task_id puede venir en el body o por param. 404 si la tarea no existe.
  async create(createCommentDto: CreateCommentDto, userId: string, taskId?: string): Promise<Comment> {
    const tid = createCommentDto.task_id ?? taskId;
    if (tid == null) {
      throw new BadRequestException('task_id es requerido');
    }

    const tr = await this.databaseService.query(`SELECT task_id FROM tasks WHERE task_id = $1`, [tid]);
    if (tr.rows.length === 0) {
      throw new NotFoundException(`Tarea con ID ${tid} no encontrada`);
    }

    const query = `
      INSERT INTO commentaries (user_id, task_id, comment_content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.databaseService.query<Comment>(
      query,
      [userId, tid, createCommentDto.comment_content],
    );
    return result.rows[0];
  }

  // Lista con creator_name y task_name; si pasas taskId, filtramos por esa tarea. Orden: más recientes primero.
  async findAll(taskId?: string): Promise<CommentWithRelations[]> {
    let query = `
      SELECT 
        c.*,
        u.full_name AS creator_name,
        t.name AS task_name
      FROM commentaries c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN tasks t ON c.task_id = t.task_id
    `;
    const params: any[] = [];
    if (taskId) {
      query += ` WHERE c.task_id = $1`;
      params.push(taskId);
    }
    query += ` ORDER BY c.comment_date DESC`;
    const result = await this.databaseService.query<CommentWithRelations>(query, params);
    return result.rows;
  }

  // Uno por ID con relaciones; 404 si no está.
  async findOne(id: string): Promise<CommentWithRelations> {
    const query = `
      SELECT 
        c.*,
        u.full_name AS creator_name,
        t.name AS task_name
      FROM commentaries c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN tasks t ON c.task_id = t.task_id
      WHERE c.comment_id = $1
    `;
    const result = await this.databaseService.query<CommentWithRelations>(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }
    return result.rows[0];
  }

  // Solo actualizamos el texto; 403 si el userId no es el autor.
  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.findOne(id);
    if (comment.user_id !== userId) {
      throw new ForbiddenException('Solo el autor puede actualizar el comentario');
    }
    const query = `
      UPDATE commentaries
      SET comment_content = $1
      WHERE comment_id = $2
      RETURNING *
    `;
    const result = await this.databaseService.query<Comment>(
      query,
      [updateCommentDto.comment_content, id],
    );
    return result.rows[0];
  }

  // Borramos; 403 si no eres el autor.
  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);
    if (comment.user_id !== userId) {
      throw new ForbiddenException('Solo el autor puede eliminar el comentario');
    }
    await this.databaseService.query(`DELETE FROM commentaries WHERE comment_id = $1`, [id]);
  }
}
