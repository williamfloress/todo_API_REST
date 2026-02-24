// Body para crear comentario: texto obligatorio; task_id puede ir aquí o en la URL (params).

import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Excelente progreso en esta tarea', description: 'Contenido del comentario (MER v2: comment_content)' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @IsString()
  comment_content: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID de la tarea (opcional si viene en params)' })
  @IsOptional()
  @IsUUID('4', { message: 'El task_id debe ser un UUID válido' })
  task_id?: string;
}
