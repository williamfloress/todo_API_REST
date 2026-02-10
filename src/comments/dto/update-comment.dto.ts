// DTO para actualizar comentario: solo permite modificar comment_content.

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Comentario actualizado' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @IsString()
  comment_content: string;
}
