/**
 * Guard que usa la estrategia Passport "local" (email + password).
 * Se aplica a POST /auth/login: valida body y pone el usuario en req.user para generar el JWT.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
