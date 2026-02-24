// Aquí validamos email/password y generamos el JWT. validateUser compara con bcrypt y devuelve el usuario (sin password) o null; login recibe el usuario ya validado y devuelve token + datos.

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

  // Buscamos por email y comparamos la contraseña con bcrypt; devolvemos el usuario sin el campo password o null.
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user?.password && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  // Montamos el JWT con email y sub (user_id) y devolvemos access_token más los datos del usuario.
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

  // Creamos el usuario y le devolvemos el token al momento para que quede logueado.
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
}
