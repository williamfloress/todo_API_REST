/**
 * DTO para crear tarea: nombre, descripción, status (4 estados), story_points, due_date, assigned_to (obligatorio), category_ids (N:M).
 */
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, IsDateString, Min, IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implementar login', description: 'Nombre de la tarea' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Implementar funcionalidad de login con JWT' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsNotEmpty()
  @IsEnum(TaskStatus, { message: 'El status debe ser PENDING, IN_PROGRESS, IN_REVIEW o DONE' })
  status: TaskStatus;

  @ApiPropertyOptional({ example: 5, description: 'Puntos de historia' })
  @IsOptional()
  @IsInt()
  @Min(1)
  story_points?: number;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de vencimiento' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del usuario asignado (obligatorio)' })
  @IsNotEmpty({ message: 'El usuario asignado es requerido' })
  @IsUUID('4', { message: 'El assigned_to debe ser un UUID válido' })
  assigned_to: string;

  @ApiProperty({ example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'], description: 'UUIDs de categorías (N:M, MER v2)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Al menos una categoría es requerida' })
  @IsUUID('4', { each: true, message: 'Cada category_id debe ser un UUID válido' })
  category_ids: string[];
}