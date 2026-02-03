/**
 * Guard que usa la estrategia Passport "jwt" (Bearer token).
 * Protege rutas que requieren autenticación; si el token es válido, req.user tendrá userId y email.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
