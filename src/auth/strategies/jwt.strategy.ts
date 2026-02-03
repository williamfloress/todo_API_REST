/**
 * Estrategia Passport "jwt": extrae y verifica el Bearer token en rutas protegidas.
 * El payload del token debe incluir sub (user_id) y email; validate devuelve { userId, email } para el request.
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Recibe el payload del JWT (sub, email) y devuelve el objeto que se adjunta a request.user. */
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
