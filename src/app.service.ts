/**
 * app.service.ts
 * 
 * Servicio principal de la aplicación.
 * Contiene la lógica de negocio básica de la aplicación.
 * 
 * Este servicio es generado por defecto por NestJS y puede ser
 * utilizado para funcionalidades generales que no pertenecen a
 * un módulo específico.
 * 
 * Actualmente solo contiene un método de prueba para verificar
 * que la aplicación está funcionando correctamente.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Método de prueba que retorna un mensaje de bienvenida
   * 
   * @returns Mensaje de bienvenida simple
   */
  getHello(): string {
    return 'Hello World!';
  }
}
