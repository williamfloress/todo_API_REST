/**
 * DTO para crear usuario: full_name (min 3), email válido, password (min 8, mayúsculas, minúsculas, números, símbolos). Validación + Swagger.
 */

import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  full_name: string;

  @ApiProperty({ example: 'juan.perez@ejemplo.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'MySecureP@ss123',
    description: 'Contraseña (mín. 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)',
  })
  password: string;
}



