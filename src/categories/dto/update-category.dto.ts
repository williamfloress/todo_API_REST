// Actualización parcial: todos los campos opcionales (heredado de CreateCategoryDto).
import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

