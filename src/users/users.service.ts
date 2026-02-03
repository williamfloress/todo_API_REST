/**
 * UsersService: CRUD de usuarios con SQL nativo (PostgreSQL).
 * - Crea usuarios con email único y password hasheado (bcrypt).
 * - Lista, busca por ID, busca por email (para login).
 * - Actualiza y elimina usuarios.
 * Nunca expone el campo password en las respuestas.
 */

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  /** Crea un usuario: valida email único, hashea password e inserta en BD. Retorna usuario sin password. */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const query = `
      INSERT INTO users (full_name, email, password)
      VALUES ($1, $2, $3)
      RETURNING user_id, full_name, email, created_at, updated_at
    `;

    const result = await this.databaseService.query<User>(
      query,
      [createUserDto.full_name, createUserDto.email, hashedPassword]
    );

    return result.rows[0];
  }

  /** Lista todos los usuarios ordenados por fecha de creación (más recientes primero). Sin password. */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const query = `
      SELECT user_id, full_name, email, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await this.databaseService.query<User>(query);
    return result.rows;
  }

  /** Busca un usuario por ID. Lanza NotFoundException si no existe. Retorna sin password. */
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const query = `
      SELECT user_id, full_name, email, created_at, updated_at
      FROM users
      WHERE user_id = $1
    `;
    const result = await this.databaseService.query<User>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  /** Busca usuario por email (incluye password). Usado para login/validación. Retorna null si no existe. */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT user_id, full_name, email, password, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await this.databaseService.query<User>(query, [email]);
    return result.rows[0] || null;
  }

  /** Actualiza usuario por ID. Valida email único si se cambia; hashea password si se envía. Retorna sin password. */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    await this.findOne(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateUserDto.full_name) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(updateUserDto.full_name);
    }

    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.user_id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(updateUserDto.email);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING user_id, full_name, email, created_at, updated_at
    `;

    const result = await this.databaseService.query<User>(query, values);
    return result.rows[0];
  }

  /** Elimina un usuario por ID. Verifica que exista antes de borrar. */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const query = `DELETE FROM users WHERE user_id = $1`;
    await this.databaseService.query(query, [id]);
  }
}
