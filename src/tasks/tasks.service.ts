/**
 * Lógica de negocio de tareas: crear, listar (filtros/paginación), obtener una (con comentarios y categorías),
 * actualizar, eliminar y asociar categorías. Usa SQL nativo vía DatabaseService.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { Task, TaskWithRelations } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Validar que cada category_id existe (MER v2: N:M)
    for (const cid of createTaskDto.category_ids) {
      const r = await this.databaseService.query(
        `SELECT category_id FROM categories WHERE category_id = $1`,
        [cid],
      );
      if (r.rows.length === 0) {
        throw new NotFoundException(`Categoría con ID ${cid} no encontrada`);
      }
    }

    // Validar que el usuario asignado existe (obligatorio)
    const ur = await this.databaseService.query(
      `SELECT user_id FROM users WHERE user_id = $1`,
      [createTaskDto.assigned_to],
    );
    if (ur.rows.length === 0) {
      throw new NotFoundException(`Usuario con ID ${createTaskDto.assigned_to} no encontrado`);
    }

    if (!Object.values(TaskStatus).includes(createTaskDto.status)) {
      throw new BadRequestException('Status inválido');
    }

    const insertTask = `
      INSERT INTO tasks (name, description, status, story_points, due_date, created_by, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const tr = await this.databaseService.query<Task>(insertTask, [
      createTaskDto.name,
      createTaskDto.description ?? null,
      createTaskDto.status,
      createTaskDto.story_points ?? null,
      createTaskDto.due_date ?? null,
      userId,
      createTaskDto.assigned_to,
    ]);
    const task = tr.rows[0];

    for (const cid of createTaskDto.category_ids) {
      await this.databaseService.query(
        `INSERT INTO task_category (task_id, category_id) VALUES ($1, $2)`,
        [task.task_id, cid],
      );
    }

    return task;
  }

  async findAll(filters: GetTasksDto): Promise<TaskWithRelations[]> {
    let query = `
      SELECT
        t.*,
        u1.full_name AS creator_name,
        u2.full_name AS assignee_name,
        (SELECT array_agg(c.category_id) FROM task_category tc
         JOIN categories c ON tc.category_id = c.category_id WHERE tc.task_id = t.task_id) AS category_ids,
        (SELECT array_agg(c.name) FROM task_category tc
         JOIN categories c ON tc.category_id = c.category_id WHERE tc.task_id = t.task_id) AS category_names
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters.status) {
      query += ` AND t.status = $${idx++}`;
      params.push(filters.status);
    }
    if (filters.category_id) {
      query += ` AND EXISTS (SELECT 1 FROM task_category tc WHERE tc.task_id = t.task_id AND tc.category_id = $${idx++})`;
      params.push(filters.category_id);
    }
    if (filters.assigned_to) {
      query += ` AND t.assigned_to = $${idx++}`;
      params.push(filters.assigned_to);
    }

    query += ` ORDER BY t.task_id DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(filters.limit ?? 10, filters.offset ?? 0);

    const result = await this.databaseService.query<TaskWithRelations>(query, params);
    return result.rows;
  }

  async findOne(id: string): Promise<TaskWithRelations> {
    // Obtener información básica de la tarea
    const taskQuery = `
      SELECT
        t.*,
        u1.full_name AS creator_name,
        u2.full_name AS assignee_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      WHERE t.task_id = $1
    `;
    const taskResult = await this.databaseService.query<TaskWithRelations>(taskQuery, [id]);
    
    if (taskResult.rows.length === 0) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    
    const task = taskResult.rows[0];

    // Obtener comentarios de la tarea
    const commentsQuery = `
      SELECT 
        c.comment_id,
        c.user_id,
        c.comment_date,
        c.comment_content,
        u.full_name AS creator_name
      FROM commentaries c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.task_id = $1
      ORDER BY c.comment_date DESC
    `;
    const commentsResult = await this.databaseService.query(commentsQuery, [id]);
    task.comments = commentsResult.rows;

    // Obtener categorías completas de la tarea
    const categoriesQuery = `
      SELECT 
        c.category_id,
        c.name,
        c.description,
        c.color
      FROM categories c
      INNER JOIN task_category tc ON c.category_id = tc.category_id
      WHERE tc.task_id = $1
      ORDER BY c.name ASC
    `;
    const categoriesResult = await this.databaseService.query(categoriesQuery, [id]);
    task.categories = categoriesResult.rows;

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);

    if (updateTaskDto.category_ids?.length) {
      for (const cid of updateTaskDto.category_ids) {
        const r = await this.databaseService.query(
          `SELECT category_id FROM categories WHERE category_id = $1`,
          [cid],
        );
        if (r.rows.length === 0) {
          throw new NotFoundException(`Categoría con ID ${cid} no encontrada`);
        }
      }
    }

    if (updateTaskDto.assigned_to !== undefined && updateTaskDto.assigned_to !== null) {
      const ur = await this.databaseService.query(
        `SELECT user_id FROM users WHERE user_id = $1`,
        [updateTaskDto.assigned_to],
      );
      if (ur.rows.length === 0) {
        throw new NotFoundException(`Usuario con ID ${updateTaskDto.assigned_to} no encontrado`);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updateTaskDto.name != null) { updates.push(`name = $${idx++}`); values.push(updateTaskDto.name); }
    if (updateTaskDto.description !== undefined) { updates.push(`description = $${idx++}`); values.push(updateTaskDto.description ?? null); }
    if (updateTaskDto.status) { updates.push(`status = $${idx++}`); values.push(updateTaskDto.status); }
    if (updateTaskDto.story_points !== undefined) { updates.push(`story_points = $${idx++}`); values.push(updateTaskDto.story_points ?? null); }
    if (updateTaskDto.due_date !== undefined) { updates.push(`due_date = $${idx++}`); values.push(updateTaskDto.due_date ?? null); }
    if (updateTaskDto.assigned_to !== undefined) { updates.push(`assigned_to = $${idx++}`); values.push(updateTaskDto.assigned_to); }

    if (updates.length > 0) {
      values.push(id);
      await this.databaseService.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $${idx}`,
        values,
      );
    }

    if (updateTaskDto.category_ids !== undefined) {
      await this.databaseService.query(`DELETE FROM task_category WHERE task_id = $1`, [id]);
      for (const cid of updateTaskDto.category_ids) {
        await this.databaseService.query(
          `INSERT INTO task_category (task_id, category_id) VALUES ($1, $2)`,
          [id, cid],
        );
      }
    }

    const find = await this.databaseService.query<Task>(`SELECT * FROM tasks WHERE task_id = $1`, [id]);
    return find.rows[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.databaseService.query(`DELETE FROM tasks WHERE task_id = $1`, [id]);
  }

  async addCategory(taskId: string, categoryId: string): Promise<{ message: string }> {
    // Verificar que la tarea existe
    await this.findOne(taskId);

    // Verificar que la categoría existe
    const catQuery = `SELECT category_id FROM categories WHERE category_id = $1`;
    const catResult = await this.databaseService.query(catQuery, [categoryId]);
    
    if (catResult.rows.length === 0) {
      throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
    }

    // Verificar si la relación ya existe
    const existsQuery = `
      SELECT * FROM task_category 
      WHERE task_id = $1 AND category_id = $2
    `;
    const existsResult = await this.databaseService.query(existsQuery, [taskId, categoryId]);
    
    if (existsResult.rows.length > 0) {
      throw new BadRequestException('La categoría ya está asociada a esta tarea');
    }

    // Insertar la relación
    const insertQuery = `
      INSERT INTO task_category (task_id, category_id)
      VALUES ($1, $2)
    `;
    await this.databaseService.query(insertQuery, [taskId, categoryId]);

    return { message: 'Categoría asociada exitosamente a la tarea' };
  }
}