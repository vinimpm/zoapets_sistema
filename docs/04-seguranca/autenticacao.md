# Autenticação e Autorização - JWT + RBAC

## Visão Geral

O **Zoa Pets** implementa um sistema robusto de autenticação e autorização usando:
- **JWT (JSON Web Tokens)** para autenticação stateless
- **RBAC (Role-Based Access Control)** para controle de permissões
- **bcrypt** para hashing seguro de senhas
- **Guards** do NestJS para proteção de rotas

---

## Arquitetura de Segurança

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│ PostgreSQL │
│  (Next.js)  │  JWT    │   (NestJS)   │  Query  │  (Tenants) │
└─────────────┘         └──────────────┘         └────────────┘
      │                       │
      │  1. POST /auth/login  │
      │  { email, senha }     │
      │───────────────────────▶
      │                       │
      │  2. Validate User     │
      │     - Find by email   │
      │     - bcrypt.compare  │
      │                       │
      │  3. Generate JWT      │
      │     - userId          │
      │     - tenantId        │
      │     - roles           │
      │                       │
      │  4. Return Token      │
      │◀───────────────────────
      │  { accessToken }      │
      │                       │
      │  5. Store in LocalStorage
      │  localStorage.setItem('token', ...)
      │                       │
      │  6. API Requests      │
      │  Authorization: Bearer <token>
      │───────────────────────▶
      │                       │
      │  7. JwtAuthGuard      │
      │     - Validate JWT    │
      │     - Extract payload │
      │     - Inject user     │
      │                       │
      │  8. RolesGuard        │
      │     - Check roles     │
      │                       │
      │  9. TenantMiddleware  │
      │     - Set schema      │
      │                       │
      │  10. Execute Query    │
      │                       │
      │  11. Return Data      │
      │◀───────────────────────
```

---

## JWT (JSON Web Tokens)

### Estrutura do Token

Um JWT é composto por 3 partes separadas por pontos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJhZG1pbkBkZW1vLmNvbSIsInJvbGVzIjpbIkFkbWluaXN0cmFkb3IiXSwidGVuYW50SWQiOiJ0ZW5hbnRfZGVtbyIsImlhdCI6MTY5NzEyMzQ1NiwiZXhwIjoxNjk3MjA5ODU2fQ.signature

├── Header (algoritmo + tipo)
├── Payload (dados do usuário)
└── Signature (assinatura criptográfica)
```

### Payload do Token

```json
{
  "sub": "uuid-user-id",           // Subject (ID do usuário)
  "email": "admin@demo.com",
  "roles": ["Veterinário", "Administrador"],
  "tenantId": "demo",       // CRÍTICO para multi-tenancy
  "iat": 1697123456,               // Issued At (timestamp)
  "exp": 1697209856                // Expiration (timestamp)
}
```

---

## Implementação Backend (NestJS)

### 1. AuthModule

```typescript
// src/core/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../../modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d', // 1 dia
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2. AuthService

```typescript
// src/core/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: { email: string; senha: string }) {
    // 1. Buscar usuário por email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // 2. Verificar senha
    const isPasswordValid = await bcrypt.compare(
      loginDto.senha,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // 3. Verificar se usuário está ativo
    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // 4. Gerar payload do JWT
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      tenantId: user.tenantId, // CRÍTICO para multi-tenancy
    };

    // 5. Gerar access token
    const accessToken = this.jwtService.sign(payload);

    // 6. Gerar refresh token (opcional)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // 7. Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    // 8. Retornar tokens e dados do usuário
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        roles: user.roles.map((r) => r.name),
        tenantId: user.tenantId,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Validar refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Gerar novo access token
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
        tenantId: payload.tenantId,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
```

### 3. AuthController

```typescript
// src/core/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export class LoginDto {
  email: string;
  senha: string;
}

export class RefreshDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      userId: req.user.userId,
      email: req.user.email,
      roles: req.user.roles,
      tenantId: req.user.tenantId,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    // Em JWT stateless, logout é feito no frontend (remover token)
    // Aqui podemos adicionar token à blacklist (Redis) se necessário
    return { message: 'Logout realizado com sucesso' };
  }
}
```

### 4. JWT Strategy

```typescript
// src/core/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    // Payload já foi decodificado e validado pelo Passport
    // Aqui apenas transformamos no formato que queremos no req.user

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      tenantId: payload.tenantId,
    };
  }
}
```

### 5. JwtAuthGuard

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar se rota é pública (decorator @Public())
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true; // Permite acesso sem autenticação
    }

    // Chamar validação JWT padrão
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}
```

### 6. Decorator @Public()

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Uso:**
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @Public() // Rota pública, não precisa de JWT
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  // Rota protegida por padrão (JwtAuthGuard global)
  async getProfile(@Request() req) {
    return req.user;
  }
}
```

---

## Password Hashing (bcrypt)

### Criação de Senha

```typescript
import * as bcrypt from 'bcrypt';

async createUser(createUserDto: CreateUserDto) {
  // Gerar hash da senha
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(createUserDto.senha, saltRounds);

  // Criar usuário com senha hasheada
  const user = this.usersRepository.create({
    ...createUserDto,
    password: hashedPassword, // NUNCA salvar senha em texto puro
  });

  return await this.usersRepository.save(user);
}
```

### Validação de Senha

```typescript
async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
```

**Exemplo de Hash:**
```
Senha: Admin@123
Hash: $2b$10$K2xqNl5vZ9XyL3JqNl5vZ.K2xqNl5vZ9XyL3JqNl5vZ9XyL3JqNl5

- $2b$: Algoritmo bcrypt
- $10$: Salt rounds (custo computacional)
- Restante: Salt + Hash da senha
```

---

## Implementação Frontend (Next.js)

### 1. AuthService

```typescript
// src/services/auth.service.ts
import apiClient from '@/lib/api-client';

interface LoginDto {
  email: string;
  senha: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nome: string;
    email: string;
    roles: string[];
    tenantId: string;
  };
}

class AuthService {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  }

  async getProfile() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export const authService = new AuthService();
```

### 2. Página de Login

```typescript
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { accessToken, refreshToken, user } = await authService.login({
        email,
        senha,
      });

      // Salvar tokens no localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Bem-vindo, ${user.nome}!`);

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Zoa Pets - Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. API Client com Interceptor

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Adicionar JWT em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tratar erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou (401) e não estamos já tentando refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar refresh do token
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          // Salvar novo access token
          localStorage.setItem('token', data.accessToken);

          // Repetir requisição original com novo token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 4. Protected Routes (Middleware)

```typescript
// src/middleware.ts (Next.js 14)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Rotas públicas
  const publicPaths = ['/login', '/'];

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Verificar se tem token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Segurança Best Practices

### 1. Variáveis de Ambiente

```env
# Backend (.env)
JWT_SECRET=super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=different-secret-for-refresh-token
JWT_REFRESH_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:**
- JWT_SECRET deve ter no mínimo 32 caracteres
- Usar `openssl rand -base64 32` para gerar secret seguro
- NUNCA commitar secrets no git
- Diferentes secrets para access e refresh tokens

### 2. HTTPS Obrigatório em Produção

```typescript
// main.ts (NestJS)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

### 3. CORS Configurado

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true,
});
```

### 4. Rate Limiting

```typescript
// Middleware de rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
});

@Post('login')
@UseGuards(loginLimiter)
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 5. Password Policy

```typescript
// Validação de senha forte
import { IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  senha: string;
}
```

### 6. Token Expiration

```typescript
// Access Token: curta duração (1h - 1 dia)
expiresIn: '1d'

// Refresh Token: longa duração (7 - 30 dias)
expiresIn: '7d'
```

### 7. Blacklist de Tokens (Logout)

```typescript
// Redis para armazenar tokens invalidados
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async blacklistToken(token: string, expiresIn: number) {
    await this.redis.set(
      `blacklist:${token}`,
      '1',
      'EX',
      expiresIn
    );
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result !== null;
  }
}
```

---

## Próximos Passos

1. **2FA (Two-Factor Authentication):** SMS ou TOTP
2. **OAuth2:** Login com Google, Microsoft
3. **SSO:** Single Sign-On para empresas
4. **Token Rotation:** Refresh tokens rotativos
5. **Session Management:** Gerenciar sessões ativas
6. **Audit Logs:** Logar todas as tentativas de login

---

**Versão:** 1.0
**Data:** 2025-10-21
**Status:** ✅ 100% Implementado - JWT + bcrypt Operacionais
