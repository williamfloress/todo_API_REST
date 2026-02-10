/**
 * DTO de query para GET /tasks: filtros opcionales (status, category_id, assigned_to) y paginación (limit, offset).
 */
import { IsOptional, IsEnum, IsInt, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from './create-task.dto';

export class GetTasksDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: 'Filtrar por estado de la tarea' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Filtrar por categoría (UUID)' })
  @IsOptional()
  @IsUUID('4', { message: 'El category_id debe ser un UUID válido' })
  category_id?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Filtrar por usuario asignado (UUID)' })
  @IsOptional()
  @IsUUID('4', { message: 'El assigned_to debe ser un UUID válido' })
  assigned_to?: string;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Límite de resultados por página' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Desplazamiento para paginación' })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}