/**
 * Controlador raíz. GET / devuelve "Hello World". GET /test-db comprueba la conexión a PostgreSQL (hora y versión).
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Hello World' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-db')
  @ApiOperation({ summary: 'Probar conexión a PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Conexión exitosa o error' })
  async testDatabase() {
    try {
      const result = await this.databaseService.query(
        'SELECT NOW() as current_time, version() as db_version',
      );
      return {
        status: 'success',
        message: 'Conexión a base de datos exitosa',
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al conectar con la base de datos',
        error: error.message,
      };
    }
  }
}
