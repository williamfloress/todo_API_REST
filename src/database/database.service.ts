/**
 * Servicio de base de datos: pool de conexiones PostgreSQL (lib pg).
 *
 * Configuración desde .env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE.
 * - query(sql, params): ejecuta una sentencia con parámetros ($1, $2…) — uso habitual, evita inyección.
 * - getClient(): reserva una conexión del pool; hay que llamar client.release() al terminar.
 * - transaction(callback): ejecuta el callback dentro de BEGIN/COMMIT; si hay error hace ROLLBACK y libera el cliente.
 *
 * Ciclo de vida: al arrancar (onModuleInit) se prueba la conexión; si falla, Nest no arranca. Al cerrar (onModuleDestroy) se cierra el pool.
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      max: 20, // máximo de conexiones simultáneas en el pool
      idleTimeoutMillis: 30000, // cierra conexiones inactivas tras 30s
      connectionTimeoutMillis: 2000, // tiempo máximo para conectar (2s)
    });
    // Errores en conexiones idle (p. ej. BD reiniciada) se loguean; el pool puede crear nuevas conexiones.
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });
  }

  /** Prueba la conexión con SELECT NOW(). Si falla, la aplicación no arranca (fail-fast). */
  async onModuleInit() {
    try {
      await this.pool.query('SELECT NOW()');
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw error;
    }
  }

  /** Cierra todas las conexiones del pool. Nest lo llama al cerrar la aplicación. */
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  /**
   * Ejecuta una consulta SQL con parámetros posicionales ($1, $2, …).
   * Los params se escapan automáticamente (evita SQL injection). Loguea duración en nivel debug.
   * @returns QueryResult con .rows (array de filas) y .rowCount.
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Executed query: ${text} (${duration}ms)`);
      return result;
    } catch (error) {
      this.logger.error(`Query error: ${text}`, error);
      throw error;
    }
  }

  /**
   * Obtiene una conexión del pool. Debes llamar client.release() cuando termines para devolverla al pool.
   * Úsalo cuando necesites varias queries en la misma conexión o transacciones manuales (BEGIN/COMMIT).
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Ejecuta el callback dentro de una transacción (BEGIN … COMMIT).
   * Si el callback lanza, se hace ROLLBACK y se libera el cliente. Siempre libera en finally.
   * @param callback Recibe el PoolClient; usa client.query() para tus sentencias.
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
