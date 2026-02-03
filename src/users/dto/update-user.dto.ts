/**
 * DTO para actualizar usuario. Todos los campos opcionales; mismas reglas que CreateUserDto si se envían.
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, MinLength, IsEmail} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(3)
    full_name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(6)
    password?: string;
}
