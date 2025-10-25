import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { DataSource } from 'typeorm';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private dataSource: DataSource,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'senha',
    });
  }

  async validate(email: string, senha: string): Promise<any> {
    // SECURITY: Discover tenant by email and set search_path before validation
    const tenantSlug = await this.authService.findTenantByEmail(email);

    // Set search_path to the discovered tenant schema
    await this.dataSource.query(`SET search_path TO "${tenantSlug}", public`);

    // Now validate user in the correct tenant schema
    const user = await this.authService.validateUser(email, senha);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }
}
