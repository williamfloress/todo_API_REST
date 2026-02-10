import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Trabajo', description: 'Nombre de la categoría'})
    @IsNotEmpty({ message: 'El nombre es requerido'})
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Tareas relacionadas con el trabajo'})
    @IsOptional()
    @IsString()
    description?: string;


    @ApiProperty({ example: '#FF5733', description: 'Color en formato hexadecimal (#RRGGBB)' })
    @IsNotEmpty({ message: 'El color es requerido'})
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe estar en formato hexadecimal (#RRGGBB)'})
    color: string;
}