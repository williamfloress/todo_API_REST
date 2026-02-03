/**
 * Servicio de la app raíz. Por ahora solo devuelve "Hello World!" para el GET /.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
