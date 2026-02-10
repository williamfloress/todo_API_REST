/**
 * AuthController: endpoints de autenticación.
 * POST /auth/login: valida credenciales con LocalAuthGuard y devuelve JWT + usuario.
 * POST /auth/logout: mensaje simbólico (JWT stateless; el cliente debe eliminar el token).
 */

import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Registro público: crea usuario y devuelve token + datos para que quede logueado. */
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado y logueado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /** Login: LocalAuthGuard valida email/password; si son correctos devuelve access_token y datos del usuario. */
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // PARA QUE DEVUELVA 200 OK EN VEZ DE 201 CREATED
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  /** Logout: respuesta informativa; con JWT stateless el cliente debe borrar el token. */
  @HttpCode(HttpStatus.OK) // PARA QUE DEVUELVA 200 OK EN VEZ DE 201 CREATED
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  async logout() {
    return {
      message: 'Logout exitoso. Por favor elimina el token del cliente.',
    };
  }
}
