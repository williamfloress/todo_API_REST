/**
 * Servicio de BD. Usa un pool de PostgreSQL (config desde .env). Expone query(), getClient() y transaction() para SQL nativo.
 * Al arrancar comprueba la conexión; al cerrar la app cierra el pool.
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
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });
  }

  /** Al arrancar el módulo: prueba la conexión con SELECT NOW(). Si falla, la app no arranca. */
  async onModuleInit() {
    try {
      await this.pool.query('SELECT NOW()');
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw error;
    }
  }

  /** Al cerrar el módulo: cierra el pool de conexiones. */
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  /** Ejecuta una query SQL con parámetros ($1, $2...). Evita SQL injection y loguea tiempo de ejecución. */
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

  /** Devuelve un cliente del pool. Hay que llamar client.release() al terminar para devolverlo al pool. */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /** Ejecuta el callback dentro de una transacción (BEGIN/COMMIT). Si hay error hace ROLLBACK y libera el cliente. */
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
