// CRUD de usuarios con SQL; email único, password con bcrypt. Nunca devolvemos password; findByEmail sí lo trae para login.
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  /** Crea un usuario: valida email único, hashea password e inserta en BD. Retorna usuario sin password. */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const rounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS') ?? '10', 10);
    const salt = await bcrypt.genSalt(rounds);
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

  // Todos, ordenados por created_at DESC; sin password.
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const query = `
      SELECT user_id, full_name, email, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await this.databaseService.query<User>(query);
    return result.rows;
  }

  // Por ID; 404 si no está. Sin password.
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

  // Por email; incluye password (para Auth). Null si no existe.
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT user_id, full_name, email, password, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await this.databaseService.query<User>(query, [email]);
    return result.rows[0] || null;
  }

  // Actualización parcial; email único, password hasheado si viene. Devolvemos sin password.
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
      const rounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS') ?? '10', 10);
      const salt = await bcrypt.genSalt(rounds);
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

  // Borramos; 404 si no existe.
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const query = `DELETE FROM users WHERE user_id = $1`;
    await this.databaseService.query(query, [id]);
  }
}
