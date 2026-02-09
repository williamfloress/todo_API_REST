/**
 * DTO para actualizar tarea: todos los campos de CreateTaskDto opcionales (partial).
 */
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}