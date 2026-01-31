/**
 * database.service.ts
 * 
 * Servicio de gestión de conexiones a PostgreSQL.
 * Implementa un pool de conexiones para gestionar eficientemente
 * múltiples consultas concurrentes a la base de datos.
 * 
 * Responsabilidades principales:
 * - Crear y configurar el pool de conexiones a PostgreSQL
 * - Proporcionar métodos para ejecutar consultas SQL
 * - Gestionar transacciones de base de datos
 * - Manejar el ciclo de vida del pool (inicialización y cierre)
 * - Registrar logs de conexiones y consultas
 * 
 * Características:
 * - Pool de conexiones: Reutiliza conexiones para mejor rendimiento
 * - Métodos helper: query(), transaction(), getClient()
 * - Logging: Registra consultas, tiempos de ejecución y errores
 * - Lifecycle hooks: Se inicializa al arrancar y se cierra al terminar
 * 
 * Uso:
 * Este servicio debe ser inyectado en otros servicios que necesiten
 * acceso a la base de datos (UsersService, TasksService, etc.)
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // Pool de conexiones a PostgreSQL - gestiona múltiples conexiones de forma eficiente
  private pool: Pool;
  
  // Logger de NestJS para registrar eventos y errores
  private readonly logger = new Logger(DatabaseService.name);

  /**
   * Constructor del servicio
   * Inicializa el pool de conexiones con la configuración desde las variables de entorno
   * 
   * @param configService - Servicio de configuración para acceder a las variables de entorno
   */
  constructor(private configService: ConfigService) {
    // Crea el pool de conexiones con la configuración desde el archivo .env
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST'),           // Dirección del servidor (localhost)
      port: this.configService.get<number>('DB_PORT'),           // Puerto de PostgreSQL (5432)
      user: this.configService.get<string>('DB_USERNAME'),       // Usuario de PostgreSQL
      password: this.configService.get<string>('DB_PASSWORD'),   // Contraseña del usuario
      database: this.configService.get<string>('DB_DATABASE'),   // Nombre de la base de datos
      max: 20,                      // Máximo de 20 conexiones simultáneas en el pool
      idleTimeoutMillis: 30000,     // Cierra conexiones inactivas después de 30 segundos
      connectionTimeoutMillis: 2000, // Timeout de 2 segundos para establecer conexión
    });

    // Registra un manejador de errores para el pool
    // Esto captura errores inesperados en conexiones inactivas
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Hook del ciclo de vida: Se ejecuta cuando el módulo se inicializa
   * 
   * Verifica que la conexión a PostgreSQL funcione correctamente
   * ejecutando una consulta simple. Si falla, la aplicación no arrancará.
   * 
   * @throws Error si no se puede establecer la conexión
   */
  async onModuleInit() {
    try {
      // Ejecuta una consulta simple para verificar la conexión
      await this.pool.query('SELECT NOW()');
      this.logger.log('Database connection established');
    } catch (error) {
      // Si falla la conexión, registra el error y lo propaga
      // Esto evitará que la aplicación arranque con una BD inaccesible
      this.logger.error('Database connection failed', error);
      throw error;
    }
  }

  /**
   * Hook del ciclo de vida: Se ejecuta cuando el módulo se destruye
   * 
   * Cierra todas las conexiones del pool de forma ordenada
   * antes de que la aplicación se detenga.
   */
  async onModuleDestroy() {
    // Cierra todas las conexiones activas e inactivas del pool
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  /**
   * Ejecuta una consulta SQL parametrizada
   * 
   * Este es el método principal para ejecutar consultas SQL.
   * Utiliza consultas parametrizadas para prevenir SQL Injection.
   * Registra el tiempo de ejecución de cada consulta para debugging.
   * 
   * @template T - Tipo de las filas que retornará la consulta
   * @param text - Consulta SQL con placeholders ($1, $2, etc.)
   * @param params - Array de valores para los placeholders (opcional)
   * @returns Promise con el resultado de la consulta
   * 
   * @example
   * // Consulta simple sin parámetros
   * await db.query('SELECT * FROM users');
   * 
   * @example
   * // Consulta con parámetros (previene SQL injection)
   * await db.query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
   * 
   * @throws Error si la consulta falla
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      // Ejecuta la consulta usando el pool
      const result = await this.pool.query<T>(text, params);
      
      // Calcula y registra el tiempo de ejecución
      const duration = Date.now() - start;
      this.logger.debug(`Executed query: ${text} (${duration}ms)`);
      
      return result;
    } catch (error) {
      // Registra el error con la consulta que falló
      this.logger.error(`Query error: ${text}`, error);
      throw error;
    }
  }

  /**
   * Obtiene un cliente individual del pool de conexiones
   * 
   * Útil cuando necesitas ejecutar múltiples consultas en la misma conexión
   * o cuando quieres gestionar transacciones manualmente.
   * 
   * IMPORTANTE: Debes llamar a client.release() cuando termines de usarlo
   * para devolverlo al pool.
   * 
   * @returns Promise con un cliente de PostgreSQL
   * 
   * @example
   * const client = await db.getClient();
   * try {
   *   await client.query('SELECT * FROM users');
   *   await client.query('SELECT * FROM tasks');
   * } finally {
   *   client.release(); // Siempre liberar el cliente
   * }
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Ejecuta múltiples operaciones dentro de una transacción
   * 
   * Una transacción garantiza que todas las operaciones se completen exitosamente
   * o ninguna se aplique (atomicidad). Si ocurre un error, se hace ROLLBACK
   * automáticamente.
   * 
   * @template T - Tipo del resultado que retornará el callback
   * @param callback - Función que recibe el cliente y ejecuta las operaciones
   * @returns Promise con el resultado del callback
   * 
   * @example
   * await db.transaction(async (client) => {
   *   // Si cualquiera falla, se hace ROLLBACK automático
   *   await client.query('INSERT INTO users ...');
   *   await client.query('INSERT INTO tasks ...');
   *   return { success: true };
   * });
   * 
   * @throws Error si alguna operación dentro del callback falla
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    // Obtiene un cliente dedicado del pool
    const client = await this.getClient();
    
    try {
      // Inicia la transacción
      await client.query('BEGIN');
      
      // Ejecuta las operaciones del callback
      const result = await callback(client);
      
      // Si todo salió bien, confirma la transacción
      await client.query('COMMIT');
      
      return result;
    } catch (error) {
      // Si algo falló, revierte todos los cambios
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Siempre libera el cliente de vuelta al pool
      client.release();
    }
  }
}
