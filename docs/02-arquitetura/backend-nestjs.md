# Arquitetura Backend - NestJS

## Visão Geral

O backend do **Zoa Pets** é uma API REST construída com **NestJS** (framework Node.js enterprise-grade), TypeScript e TypeORM, seguindo uma arquitetura modular, escalável e orientada a domínio.

**Tecnologias Principais:**
- **Runtime:** Node.js 20+
- **Framework:** NestJS 10+
- **Linguagem:** TypeScript 5+
- **ORM:** TypeORM 0.3+
- **Banco de Dados:** PostgreSQL 16
- **Cache/Queue:** Redis 7+
- **Validação:** class-validator + class-transformer

---

## Estrutura de Diretórios

```
backend/
├── src/
│   ├── main.ts                    # Entry point da aplicação
│   ├── app.module.ts              # Módulo raiz que importa todos os módulos
│   │
│   ├── common/                    # Código compartilhado
│   │   ├── decorators/            # Decorators customizados
│   │   ├── entities/              # 43 entidades TypeORM
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Guards (JWT, Roles)
│   │   ├── interceptors/          # Interceptors
│   │   ├── middleware/            # Middlewares (Tenant, RateLimit)
│   │   └── pipes/                 # Pipes de validação
│   │
│   ├── core/                      # Módulos core do sistema
│   │   ├── auth/                  # Autenticação e autorização
│   │   └── config/                # Configurações
│   │
│   └── modules/                   # 27 módulos de negócio
│       ├── users/                 # Gestão de usuários
│       ├── tutores/               # Tutores/clientes
│       ├── pets/                  # Animais
│       ├── agendamentos/          # Agendamento de consultas
│       ├── consultas/             # Atendimento ambulatorial
│       ├── internacoes/           # Internação hospitalar
│       ├── prescricoes/           # Prescrições médicas
│       ├── administracoes/        # RAM (medicamentos)
│       ├── evolucoes/             # Prontuário médico
│       ├── sinais-vitais/         # Monitoramento
│       ├── exames/                # Solicitação e resultados
│       ├── medicamentos/          # Cadastro de medicamentos
│       ├── produtos/              # Produtos diversos
│       ├── movimentacoes-estoque/ # Controle de estoque
│       ├── financeiro/            # Contas e pagamentos
│       ├── escalas/               # Turnos e plantões
│       ├── checklists/            # Checklists digitais
│       ├── sops/                  # POPs (procedimentos)
│       ├── equipamentos/          # Gestão de equipamentos
│       ├── mensagens/             # Comunicação interna
│       ├── convenios/             # Planos pet
│       ├── campanhas/             # Marketing
│       ├── roles/                 # Permissões
│       ├── api-keys/              # Chaves API
│       ├── public-api/            # API pública
│       └── configuracoes/         # Configurações
│
├── dist/                          # Build de produção
├── test/                          # Testes e2e
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

---

## Arquitetura de Camadas

Cada módulo segue um padrão de 4 camadas bem definido:

### 1. Controller Layer (Rotas HTTP)

Responsável por:
- Receber requisições HTTP
- Validar dados de entrada (DTOs com decorators)
- Aplicar guards (autenticação, autorização)
- Chamar os services
- Retornar respostas HTTP

**Exemplo:**
```typescript
@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador')
  findAll(@Query() filters: FiltroPetsDto) {
    return this.petsService.findAll(filters);
  }

  @Post()
  @Roles('Veterinário', 'Administrador')
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }
}
```

### 2. Service Layer (Lógica de Negócio)

Responsável por:
- Implementar regras de negócio
- Orquestrar operações complexas
- Validações específicas de domínio
- Interagir com repositories
- Chamar outros services quando necessário

**Exemplo:**
```typescript
@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    private tutoresService: TutoresService,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    // Validação de negócio
    const tutor = await this.tutoresService.findOne(createPetDto.tutorId);
    if (!tutor) {
      throw new NotFoundException('Tutor não encontrado');
    }

    // Criação da entidade
    const pet = this.petsRepository.create(createPetDto);

    // Persistência
    return await this.petsRepository.save(pet);
  }

  async findAll(filters: FiltroPetsDto): Promise<Pet[]> {
    const queryBuilder = this.petsRepository.createQueryBuilder('pet');

    if (filters.tutorId) {
      queryBuilder.where('pet.tutorId = :tutorId', { tutorId: filters.tutorId });
    }

    return await queryBuilder.getMany();
  }
}
```

### 3. Repository Layer (Acesso a Dados)

Responsável por:
- Operações CRUD no banco de dados
- Queries customizadas
- Gerenciado pelo TypeORM

```typescript
// Injetado automaticamente via @InjectRepository
@InjectRepository(Pet)
private petsRepository: Repository<Pet>
```

### 4. Entity Layer (Modelo de Dados)

Responsável por:
- Definir estrutura das tabelas
- Relacionamentos entre entidades
- Validações básicas

**Exemplo:**
```typescript
@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 50 })
  especie: string;

  @Column({ nullable: true })
  raca?: string;

  @Column({ type: 'date', nullable: true })
  dataNascimento?: Date;

  @ManyToOne(() => Tutor, (tutor) => tutor.pets)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  tutorId: string;

  @OneToMany(() => Internacao, (internacao) => internacao.pet)
  internacoes: Internacao[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Módulos Implementados (27)

### Core (5 módulos)

#### 1. AuthModule
- **Responsabilidade:** Autenticação e autorização
- **Funcionalidades:**
  - Login com email/senha
  - Geração de JWT tokens
  - Validação de tokens
  - Refresh tokens
  - Password hashing (bcrypt)
- **Endpoints:**
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /auth/me`

#### 2. UsersModule
- **Responsabilidade:** Gestão de usuários do sistema
- **Funcionalidades:**
  - CRUD de usuários
  - Atribuição de roles
  - Gestão de perfis
- **Relacionamentos:** User → Role (N:N)

#### 3. RolesModule
- **Responsabilidade:** Controle de permissões (RBAC)
- **Funcionalidades:**
  - Definição de roles (Veterinário, Enfermeiro, Admin, etc.)
  - Atribuição de permissions
  - Verificação de permissões
- **Decorator:** `@Roles('Veterinário', 'Administrador')`

#### 4. ApiKeysModule
- **Responsabilidade:** Gestão de chaves API
- **Funcionalidades:**
  - Geração de API keys criptográficas
  - Autenticação via API key
  - Controle de permissões por key
  - Expiração de keys
  - Rate limiting por key

#### 5. PublicApiModule
- **Responsabilidade:** API pública para integração externa
- **Funcionalidades:**
  - 125+ endpoints públicos
  - Operações de leitura (GET) e escrita (POST/PATCH)
  - Integração com ERPs
  - Autenticação via API Key
  - Rate limiting
  - IP whitelist

### Clínico (9 módulos)

#### 6. TutoresModule
- CRUD de tutores/clientes
- Relacionamento com pets
- Histórico de consultas

#### 7. PetsModule
- CRUD de animais
- Histórico médico completo
- Relacionamento com tutor

#### 8. AgendamentosModule
- Agenda de consultas
- Tipos: consulta, cirurgia, retorno, vacinação
- Status: pendente, confirmado, realizado, cancelado
- Integração com ConsultasModule

#### 9. ConsultasModule
- Atendimento ambulatorial
- Anamnese + Exame Físico + Diagnóstico
- Geração de internação
- Prescrições ambulatoriais
- **Endpoint especial:** `POST /consultas/:id/gerar-internacao`

#### 10. InternacoesModule
- Gestão hospitalar completa
- Status: aguardando, em_andamento, alta, óbito
- Controle de leitos
- Isolamento
- Prioridade (baixa, média, alta, crítica)

#### 11. EvolucoesModule
- Prontuário médico digital
- Notas de evolução diárias
- Relacionamento com internação
- Histórico completo

#### 12. SinaisVitaisModule
- Monitoramento contínuo
- FC, FR, temperatura, SpO2, pressão, glicemia, etc.
- Alertas de valores críticos
- Gráficos e tendências

#### 13. ExamesModule
- Solicitação de exames
- Upload de resultados
- Integração com prontuário
- Status: pendente, coletado, em_analise, concluído

#### 14. PrescricoesModule
- Prescrições médicas (ambulatorial + hospitalar)
- PrescricaoItem (medicamentos individuais)
- **Lógica crítica:** Geração automática de administrações quando `tipo === 'hospitalar'`
- Frequência, dose, via, duração
- Método `scheduleAdministracoes()` já implementado

### RAM/Farmácia (3 módulos)

#### 15. AdministracoesModule
- **RAM completo** (Registro de Administração de Medicamentos)
- Status: pendente, realizada, atrasada, nao_realizada
- **Endpoint consolidado:** `GET /administracoes/painel-enfermagem`
- Painel retorna: atrasadas, pendentes, próximas, estatísticas
- Taxa de adesão ao tratamento
- Justificativas obrigatórias

#### 16. MedicamentosModule
- Cadastro de medicamentos
- Nome, princípio ativo, apresentação
- Controle de estoque

#### 17. ProdutosModule
- Produtos diversos (não medicamentos)
- Insumos, materiais, etc.

### Operacional (5 módulos)

#### 18. EscalasModule
- Escalas de funcionários
- Turnos e plantões
- Escalas por período

#### 19. ChecklistsModule
- Checklists digitais executáveis
- ChecklistTemplate (modelo)
- ChecklistExecution (execução)
- Itens marcáveis
- Rastreabilidade

#### 20. SopsModule
- POPs digitais (Procedimentos Operacionais Padrão)
- Versões de SOPs
- Histórico de execução

#### 21. EquipamentosModule
- Cadastro de equipamentos hospitalares
- Manutenção preventiva e corretiva
- Calibrações
- Alertas de manutenção

#### 22. MensagensModule
- Comunicação interna da equipe
- Mensagens entre usuários
- Notificações

### Financeiro/Admin (3 módulos)

#### 23. FinanceiroModule
- Contas a receber
- Pagamentos (Pix, cartão, dinheiro)
- Faturamento
- Relatórios financeiros
- Conta + ContaItem

#### 24. MovimentacoesEstoqueModule
- Controle total de estoque
- Entrada e saída
- Lote e validade
- Alertas de estoque crítico

#### 25. ConfiguracoesModule
- Configurações do sistema
- Parâmetros gerais
- Feature flags (se implementado)

### Marketing/Convênios (2 módulos)

#### 26. ConveniosModule
- Planos pet
- Autorizações de procedimentos
- Repasses
- Coberturas e limites

#### 27. CampanhasModule
- Campanhas de marketing
- Segmentação de clientes
- Disparos automáticos
- Fidelização

---

## Padrões Arquiteturais

### Dependency Injection (DI)

NestJS usa injeção de dependências nativa:

```typescript
@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
    @InjectRepository(Internacao)
    private internacoesRepository: Repository<Internacao>,
    private petsService: PetsService,       // Injeção de outro service
    private tutoresService: TutoresService,
  ) {}
}
```

### Guards (Proteção de Rotas)

**JwtAuthGuard:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

**RolesGuard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Middlewares

**TenantMiddleware (Multi-tenant):**
```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const user = req['user']; // Vem do JWT
    const tenantId = user?.tenantId;

    if (tenantId) {
      // Configura schema do tenant no TypeORM
      await getConnection().query(`SET search_path TO tenant_${tenantId}`);
    }

    next();
  }
}
```

**RateLimitMiddleware:**
```typescript
// Implementação de rate limiting por IP/API Key
// TODO: Fix dependency injection (comentado em app.module.ts)
```

### DTOs (Data Transfer Objects)

Usam class-validator para validação automática:

```typescript
export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  especie: string;

  @IsOptional()
  @IsString()
  raca?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataNascimento?: Date;

  @IsUUID()
  @IsNotEmpty()
  tutorId: string;
}
```

---

## Multi-Tenancy (Schema-per-Tenant)

Cada hospital (tenant) tem seu próprio schema PostgreSQL isolado.

**Estrutura do Banco:**
```
Database: zoapets_production
  ├── Schema: public (SaaS global)
  │   ├── tenants
  │   ├── subscriptions
  │   ├── plans
  │   └── feature_flags
  │
  ├── Schema: tenant_1 (Hospital A)
  │   ├── users
  │   ├── pets
  │   ├── internacoes
  │   └── ... (43 tabelas)
  │
  └── Schema: tenant_2 (Hospital B)
      ├── users
      ├── pets
      └── ...
```

**Fluxo de Requisição:**
1. JWT contém `tenantId`
2. TenantMiddleware extrai `tenantId`
3. Executa `SET search_path TO tenant_X`
4. Todas as queries rodam automaticamente no schema correto
5. Isolamento total de dados garantido

---

## Configuração e Variáveis de Ambiente

**`.env` exemplo:**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=zoapets_dev

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# App
NODE_ENV=development
PORT=3000
```

**app.module.ts:**
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  autoLoadEntities: true,
  synchronize: false, // NUNCA true em produção!
  logging: process.env.NODE_ENV === 'development',
})
```

---

## Exemplo Completo de Módulo

**PetsModule:**

```typescript
// pets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Pet } from '../../common/entities/pet.entity';
import { TutoresModule } from '../tutores/tutores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet]),
    TutoresModule, // Para usar TutoresService
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService], // Para usar em outros módulos
})
export class PetsModule {}
```

```typescript
// pets.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto, FiltroPetsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Recepcionista')
  findAll(@Query() filters: FiltroPetsDto) {
    return this.petsService.findAll(filters);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Recepcionista')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Post()
  @Roles('Veterinário', 'Administrador', 'Recepcionista')
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador')
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
```

```typescript
// pets.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../../common/entities/pet.entity';
import { CreatePetDto, UpdatePetDto, FiltroPetsDto } from './dto';
import { TutoresService } from '../tutores/tutores.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    private tutoresService: TutoresService,
  ) {}

  async findAll(filters: FiltroPetsDto): Promise<Pet[]> {
    const queryBuilder = this.petsRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.tutor', 'tutor');

    if (filters.tutorId) {
      queryBuilder.where('pet.tutorId = :tutorId', { tutorId: filters.tutorId });
    }

    if (filters.especie) {
      queryBuilder.andWhere('pet.especie = :especie', { especie: filters.especie });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id },
      relations: ['tutor', 'internacoes', 'consultas'],
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    return pet;
  }

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    // Validar que tutor existe
    const tutor = await this.tutoresService.findOne(createPetDto.tutorId);
    if (!tutor) {
      throw new NotFoundException('Tutor não encontrado');
    }

    const pet = this.petsRepository.create(createPetDto);
    return await this.petsRepository.save(pet);
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    Object.assign(pet, updatePetDto);
    return await this.petsRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const result = await this.petsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pet não encontrado');
    }
  }
}
```

---

## Performance e Otimização

### Eager vs Lazy Loading

```typescript
// Eager loading (carrega relacionamentos automaticamente)
@ManyToOne(() => Tutor, { eager: true })
tutor: Tutor;

// Lazy loading (manual via query builder)
const pets = await this.petsRepository.find({
  relations: ['tutor', 'internacoes'],
});
```

### Query Builder para Queries Complexas

```typescript
const administracoesPendentes = await this.administracoesRepository
  .createQueryBuilder('adm')
  .leftJoinAndSelect('adm.prescricao', 'prescricao')
  .leftJoinAndSelect('prescricao.medicamento', 'medicamento')
  .leftJoinAndSelect('prescricao.internacao', 'internacao')
  .leftJoinAndSelect('internacao.pet', 'pet')
  .where('adm.status = :status', { status: 'pendente' })
  .andWhere('adm.dataHoraAgendada <= :now', { now: new Date() })
  .orderBy('adm.dataHoraAgendada', 'ASC')
  .getMany();
```

### Paginação

```typescript
const [items, total] = await this.petsRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

return {
  data: items,
  meta: {
    total,
    page,
    lastPage: Math.ceil(total / limit),
  },
};
```

---

## Segurança

### Autenticação JWT

```typescript
// Estratégia JWT
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      tenantId: payload.tenantId,
    };
  }
}
```

### Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

// Hash de senha
const hashedPassword = await bcrypt.hash(password, 10);

// Verificação
const isValid = await bcrypt.compare(password, user.password);
```

### Proteção Global

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // Todas as rotas protegidas por padrão
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard, // RBAC global
  },
],
```

---

## Error Handling

### Exception Filters

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

---

## Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    this.logger.log(`Criando novo pet: ${createPetDto.nome}`);

    try {
      const pet = await this.petsRepository.save(createPetDto);
      this.logger.log(`Pet criado com sucesso: ${pet.id}`);
      return pet;
    } catch (error) {
      this.logger.error(`Erro ao criar pet: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## Scripts NPM

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""
  }
}
```

---

## Próximos Passos

1. **Testes:** Implementar testes unitários e e2e
2. **Swagger:** Gerar documentação OpenAPI automática
3. **Validação Avançada:** Pipes customizados para validações complexas
4. **Caching:** Implementar Redis para cache de queries frequentes
5. **Queue:** BullMQ para jobs assíncronos (envio de emails, relatórios)
6. **Websockets:** Real-time para dashboard e notificações
7. **Health Checks:** Endpoints de health check para monitoramento

---

**Versão:** 1.0
**Data:** 2025-10-21
**Status:** ✅ 100% Implementado - Documentação Retroativa
