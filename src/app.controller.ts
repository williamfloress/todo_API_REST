/**
 * app.controller.ts
 * 
 * Controlador principal de la aplicación.
 * Define los endpoints HTTP básicos y de prueba de la aplicación.
 * 
 * Responsabilidades:
 * - Endpoint raíz (/) para verificar que el servidor está corriendo
 * - Endpoint de prueba de base de datos (/test-db) para verificar la conexión
 * 
 * Estos endpoints son temporales y sirven para verificar que la aplicación
 * y la base de datos están configuradas correctamente (Checkpoint 1.5).
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@Controller() // Ruta base: /
export class AppController {
  /**
   * Constructor del controlador
   * Inyecta las dependencias necesarias mediante Dependency Injection de NestJS
   * 
   * @param appService - Servicio principal de la aplicación
   * @param databaseService - Servicio de gestión de base de datos
   */
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Endpoint raíz - GET /
   * 
   * Retorna un mensaje simple para verificar que el servidor está corriendo.
   * Útil para health checks básicos.
   * 
   * @returns Mensaje de bienvenida
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Endpoint de prueba de base de datos - GET /test-db
   * 
   * Verifica la conexión con PostgreSQL ejecutando una consulta simple
   * que obtiene la hora actual y la versión de la base de datos.
   * 
   * Este endpoint es útil para:
   * - Verificar que el pool de conexiones funciona correctamente
   * - Confirmar que las credenciales de la BD son correctas
   * - Validar que el servicio DatabaseService está funcionando
   * 
   * @returns Objeto con el estado de la conexión y datos de la BD
   *          En caso de éxito: { status, message, data: { current_time, db_version } }
   *          En caso de error: { status, message, error }
   */
  @Get('test-db')
  async testDatabase() {
    try {
      // Ejecuta una consulta SQL que retorna la hora actual y versión de PostgreSQL
      const result = await this.databaseService.query(
        'SELECT NOW() as current_time, version() as db_version',
      );
      
      // Retorna respuesta exitosa con los datos de la consulta
      return {
        status: 'success',
        message: 'Conexión a base de datos exitosa',
        data: result.rows[0], // Primera fila con los resultados
      };
    } catch (error) {
      // Captura y retorna cualquier error de conexión o consulta
      return {
        status: 'error',
        message: 'Error al conectar con la base de datos',
        error: error.message,
      };
    }
  }
}
