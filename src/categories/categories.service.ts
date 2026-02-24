// Lógica de categorías contra la BD; nombre único y CASCADE al borrar.
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Insertamos; si el nombre ya existe → 409.
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.findByName(createCategoryDto.name);
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const query = `
      INSERT INTO categories (name, description, color)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await this.databaseService.query<Category>(query, [
      createCategoryDto.name,
      createCategoryDto.description ?? null,
      createCategoryDto.color,
    ]);
    return result.rows[0];
  }

  // Todas, ordenadas por nombre.
  async findAll(): Promise<Category[]> {
    const query = `SELECT * FROM categories ORDER BY name ASC`;
    const result = await this.databaseService.query<Category>(query);
    return result.rows;
  }

  // Por ID; 404 si no está.
  async findOne(id: string): Promise<Category> {
    const query = `SELECT * FROM categories WHERE category_id = $1`;
    const result = await this.databaseService.query<Category>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return result.rows[0];
  }

  // Por nombre; null si no hay ninguna (para comprobar duplicados).
  async findByName(name: string): Promise<Category | null> {
    const query = `SELECT * FROM categories WHERE name = $1`;
    const result = await this.databaseService.query<Category>(query, [name]);
    return result.rows[0] || null;
  }

  // Actualización parcial; comprobamos que exista y que el nombre no lo tenga otra.
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);

    if (updateCategoryDto.name) {
      const existing = await this.findByName(updateCategoryDto.name);
      if (existing && existing.category_id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updateCategoryDto.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(updateCategoryDto.name);
    }

    if (updateCategoryDto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(updateCategoryDto.description ?? null);
    }

    if (updateCategoryDto.color) {
      updates.push(`color = $${paramIndex++}`);
      values.push(updateCategoryDto.color);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    values.push(id);

    const query = `
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE category_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.databaseService.query<Category>(query, values);
    return result.rows[0];
  }

  // Borramos; la FK con task_category hace CASCADE solo.
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const query = `DELETE FROM categories WHERE category_id = $1`;
    await this.databaseService.query(query, [id]);
  }

  // Categorías que no tiene esa tarea (útil para añadir más desde el front).
  async findNotInTask(taskId: string): Promise<Category[]> {
    const taskQuery = `SELECT task_id FROM tasks WHERE task_id = $1`;
    const taskResult = await this.databaseService.query(taskQuery, [taskId]);

    if (taskResult.rows.length === 0) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    const query = `
      SELECT c.*
      FROM categories c
      WHERE c.category_id NOT IN (
        SELECT tc.category_id
        FROM task_category tc
        WHERE tc.task_id = $1
      )
      ORDER BY c.name ASC
    `;

    const result = await this.databaseService.query<Category>(query, [taskId]);
    return result.rows;
  }
}

