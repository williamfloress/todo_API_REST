// Solo se puede cambiar el texto del comentario.

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Comentario actualizado', description: 'Nuevo contenido del comentario' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @IsString()
  comment_content: string;
}
