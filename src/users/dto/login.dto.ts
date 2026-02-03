/**
 * DTO para login: email y password. Se usa en POST /auth/login para validar el body.
 */

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'juan@ejemplo.com'})
    @IsEmail({}, { message: 'El email debe ser válido'})
    email: string;

    @ApiProperty({ example: 'password123'})
    @IsNotEmpty({ message: 'La contraseña es requerida'})
    password: string;
}
