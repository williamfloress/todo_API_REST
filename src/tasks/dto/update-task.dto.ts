// Actualización parcial; todos los campos opcionales (heredado de CreateTaskDto).
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}