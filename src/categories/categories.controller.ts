import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** POST /categories — Crea una nueva categoría. */
  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /** GET /categories — Lista todas las categorías. */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  findAll() {
    return this.categoriesService.findAll();
  }

  /** GET /categories/not-in-task/:taskId — Categorías que no están en la tarea (ruta específica antes de :id). */
  @Get('not-in-task/:taskId')
  @ApiOperation({ summary: 'Listar categorías NO asociadas a una tarea' })
  findNotInTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.categoriesService.findNotInTask(taskId);
  }

  /** GET /categories/:id — Obtiene una categoría por ID (UUID). */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  /** PATCH /categories/:id — Actualiza una categoría. */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /** DELETE /categories/:id — Elimina una categoría (CASCADE en task_category). */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return { message: 'Categoría eliminada exitosamente' };
  }
}
