/**
 * Controlador de tareas: CRUD, listado con filtros/paginación y asociación de categorías.
 * Todas las rutas requieren JWT; created_by se toma del token en POST.
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear tarea' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user.userId;
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con filtros' })
  findAll(@Query() filters: GetTasksDto) {
    return this.tasksService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tarea' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tarea' })
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { message: 'Tarea eliminada exitosamente' };
  }

  @Post(':taskId/categories/:categoryId')
  @ApiOperation({ summary: 'Asociar categoría a tarea' })
  addCategory(@Param('taskId') taskId: string, @Param('categoryId') categoryId: string) {
    return this.tasksService.addCategory(taskId, categoryId);
  }
}