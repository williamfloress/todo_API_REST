/**
 * AuthController: endpoints de autenticación.
 * POST /auth/login: valida credenciales con LocalAuthGuard y devuelve JWT + usuario.
 * POST /auth/logout: mensaje simbólico (JWT stateless; el cliente debe eliminar el token).
 */

import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login: LocalAuthGuard valida email/password; si son correctos devuelve access_token y datos del usuario. */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  /** Logout: respuesta informativa; con JWT stateless el cliente debe borrar el token. */
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  async logout() {
    return {
      message: 'Logout exitoso. Por favor elimina el token del cliente.',
    };
  }
}
