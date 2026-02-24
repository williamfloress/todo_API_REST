// Estrategia local: comprobamos email y password contra la BD.
// Si todo va bien devolvemos el usuario para montar el JWT. Como el Guard corre antes que los Pipes,
// validamos el body aquí y devolvemos 400 si faltan datos o son inválidos, y 401 solo si las credenciales no cuadran.

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  // Passport nos pasa email y password del body. Primero chequeamos formato → 400; luego credenciales → 401 si no coinciden.
  async validate(email: string, password: string): Promise<any> {
    const dto = plainToInstance(LoginDto, { email, password });
    const errors = await validate(dto);
    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      throw new BadRequestException(messages.length ? messages : 'Datos inválidos');
    }
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }
}
