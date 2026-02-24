// CRUD de tareas, listado con filtros/paginación y asociar categoría. JWT en todo; created_by del token al crear.
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Crear tarea; categorías y assigned_to validados en el service.
  @Post()
  @ApiOperation({ summary: 'Crear tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario o categoría no encontrado' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user.userId;
    return this.tasksService.create(createTaskDto, userId);
  }

  // Listar con filtros (status, category_id, assigned_to) y paginación (limit, offset).
  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de tareas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: GetTasksDto) {
    return this.tasksService.findAll(filters);
  }

  // Una tarea con comentarios y categorías.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  @ApiResponse({ status: 200, description: 'Tarea con comentarios y categorías' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // Actualizar (parcial); category_ids reemplaza la lista entera.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // Borrar tarea (CASCADE en comentarios y task_category).
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { message: 'Tarea eliminada exitosamente' };
  }

  // Añadir una categoría a la tarea (evita duplicados).
  @Post(':taskId/categories/:categoryId')
  @ApiOperation({ summary: 'Asociar categoría a tarea' })
  @ApiResponse({ status: 201, description: 'Categoría asociada a la tarea' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea o categoría no encontrada' })
  addCategory(@Param('taskId') taskId: string, @Param('categoryId') categoryId: string) {
    return this.tasksService.addCategory(taskId, categoryId);
  }
}