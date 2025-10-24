import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities/user.entity';
import { Role } from '../../common/entities/role.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email, ativo: true },
      relations: ['roles'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senhaHash);
    if (!isPasswordValid) {
      return null;
    }

    // Update last access
    await this.usersRepository.update(user.id, {
      ultimoAcesso: new Date(),
    });

    const { senhaHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles.map((r: any) => r.nome),
      tenantSlug: user.tenantSlug, // SECURITY: Include tenant in JWT
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign({ sub: user.id, tenantSlug: user.tenantSlug }, { expiresIn: '7d' });

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(user.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nome,
        roles: user.roles,
        tenantSlug: user.tenantSlug,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash password
    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    // Get default role (Veterinário)
    let defaultRole = await this.rolesRepository.findOne({
      where: { nome: 'Veterinário' },
    });

    if (!defaultRole) {
      // Create default role if not exists
      defaultRole = this.rolesRepository.create({
        nome: 'Veterinário',
        descricao: 'Veterinário com acesso básico',
      });
      await this.rolesRepository.save(defaultRole);
    }

    // Create user
    const user = this.usersRepository.create({
      ...registerDto,
      senhaHash,
      roles: [defaultRole],
    });

    await this.usersRepository.save(user);

    const { senhaHash: _, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }
}
