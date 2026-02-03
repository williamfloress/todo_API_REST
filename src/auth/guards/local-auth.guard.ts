/**
 * LocalAuthGuard: protege la ruta de login usando la estrategia 'local' de Passport.
 * Valida email y password en el body antes de ejecutar el controlador.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
