// Guard de Passport "jwt": protege rutas con Bearer token; si es válido, req.user tendrá userId y email.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
