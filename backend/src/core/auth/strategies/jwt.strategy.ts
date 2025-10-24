import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../common/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: Request, payload: any) {
    // SECURITY: Validate tenant from JWT matches tenant from request header
    const requestTenantSlug = req.headers['x-tenant-slug'] as string;
    const jwtTenantSlug = payload.tenantSlug;

    if (!jwtTenantSlug) {
      throw new UnauthorizedException(
        'Token inválido: tenant não especificado. Faça login novamente.'
      );
    }

    if (requestTenantSlug && requestTenantSlug !== jwtTenantSlug) {
      throw new UnauthorizedException(
        `Acesso negado: você não tem permissão para acessar o tenant '${requestTenantSlug}'. ` +
        `Seu token pertence ao tenant '${jwtTenantSlug}'.`
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, ativo: true, tenantSlug: jwtTenantSlug },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    // Additional security check: verify user's tenant matches JWT tenant
    if (user.tenantSlug !== jwtTenantSlug) {
      throw new UnauthorizedException(
        'Inconsistência de tenant detectada. Faça login novamente.'
      );
    }

    return {
      id: user.id,
      email: user.email,
      nomeCompleto: user.nomeCompleto,
      roles: user.roles,
      tenantSlug: user.tenantSlug,
    };
  }
}
