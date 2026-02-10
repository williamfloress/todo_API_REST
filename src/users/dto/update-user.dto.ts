/**
 * DTO para actualizar usuario. Todos los campos opcionales; mismas reglas que CreateUserDto si se envían.
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, MinLength, IsEmail} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Juan Perez', description: 'Nombre completo (opcional)' })
  @IsOptional()
  @MinLength(3)
  full_name?: string;

  @ApiPropertyOptional({ example: 'juan@ejemplo.com', description: 'Email (opcional)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewP@ss123', description: 'Nueva contraseña (opcional)' })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
