/**
 * JwtAuthGuard: protege rutas que requieren autenticación.
 * Verifica el token JWT en el header Authorization (Bearer) usando la estrategia 'jwt'.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
