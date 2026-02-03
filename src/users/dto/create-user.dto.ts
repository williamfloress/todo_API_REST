import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import {ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario'})
    @IsNotEmpty({ message: 'El nombre completo es requerido'})
    @MinLength(3, { message: 'El nombre completo debe tener almenos 3 caracteres'})
    full_name: string;

    @ApiProperty({ example: 'juan.perez@ejemplo.com', description: 'Email del usuario'})
    @IsEmail({}, { message: 'El email debe ser válido'})
    @IsNotEmpty({ message: 'El email es requerido'})
    email: string;

    @ApiProperty({ example: '1234567890', description : 'Contraseña del usuario', minLength: 6})
    @IsNotEmpty({message: 'La contraseña es requerida'})
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres'})
    password: string;
}



