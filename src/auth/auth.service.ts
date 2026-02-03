/**
 * AuthService: valida credenciales (email + password) y genera JWT.
 * validateUser: busca usuario por email y compara password con bcrypt; devuelve usuario sin password o null.
 * login: recibe el usuario ya validado por LocalStrategy y devuelve access_token + datos de usuario.
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Compara email/password con la BD; bcrypt.compare verifica contra el hash sin desencriptar. Devuelve usuario sin password o null. */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user?.password && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  /** Genera JWT (payload: email, sub=user_id) y devuelve access_token + datos de usuario para la respuesta. */
  async login(user: any) {
    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        email: user.email,
        fullName: user.full_name,
      },
    };
  }

  /** Registro público: crea usuario vía UsersService y devuelve token inmediato para iniciar sesión. */
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
}
