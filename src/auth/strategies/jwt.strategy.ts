// Estrategia jwt: lee y verifica el Bearer en rutas protegidas. Del payload usamos sub y email; validate devuelve { userId, email } a req.user.

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

  // Del payload sacamos sub y email y lo pasamos a request.user.
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
