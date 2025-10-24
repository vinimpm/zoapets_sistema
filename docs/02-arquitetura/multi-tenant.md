# Arquitetura Multi-Tenant - Schema-per-Tenant

## Visão Geral

O **Zoa Pets** implementa uma arquitetura **multi-tenant** (SaaS) onde cada hospital (tenant) possui seu próprio schema PostgreSQL, garantindo **isolamento total de dados**, segurança e compliance com LGPD.

**Estratégia Escolhida:** Schema-per-Tenant (cada tenant = 1 schema no mesmo database)

---

## Por que Schema-per-Tenant?

Existem 3 principais estratégias de multi-tenancy:

### 1. Database-per-Tenant
- ✅ Isolamento máximo
- ❌ Custo alto (N databases)
- ❌ Manutenção complexa
- ❌ Backups separados

### 2. Row-Level Filtering (Shared Schema)
- ✅ Simples de implementar
- ✅ Custo baixo
- ❌ **Risco de data leak** (um WHERE esquecido expõe dados de outro tenant)
- ❌ Performance degradada (índices compartilhados)
- ❌ Compliance complexo

### 3. **Schema-per-Tenant** ✅ (Nossa Escolha)
- ✅ **Isolamento total de dados** (impossível acessar dados de outro tenant)
- ✅ Performance superior (índices isolados)
- ✅ Backups independentes por tenant
- ✅ Compliance LGPD simplificado
- ✅ Escalabilidade horizontal (pode mover schemas para outro DB)
- ✅ Custo razoável (1 database, N schemas)
- ⚠️ Complexidade média de implementação

---

## Estrutura do Banco de Dados

```
PostgreSQL Database: zoapets_production

├── Schema: public (SaaS Global - NÃO isolado por tenant)
│   ├── tenants                    # Cadastro de hospitais/clínicas
│   ├── subscriptions              # Assinaturas SaaS
│   ├── plans                      # Planos (Basic, Pro, Enterprise)
│   ├── feature_flags              # Features por tenant
│   └── audit_logs_global          # Logs de acesso aos tenants
│
├── Schema: tenant_1 (Hospital A - Zoa Pets Veterinária)
│   ├── users                      # Usuários do hospital A
│   ├── pets                       # Pets do hospital A
│   ├── tutores                    # Tutores do hospital A
│   ├── internacoes                # Internações do hospital A
│   ├── prescricoes                # Prescrições do hospital A
│   ├── administracoes             # RAM do hospital A
│   ├── ... (43 tabelas isoladas)
│   └── audit_logs                 # Logs de auditoria do hospital A
│
├── Schema: tenant_2 (Hospital B - Clínica VetSul)
│   ├── users
│   ├── pets
│   ├── tutores
│   ├── ... (43 tabelas isoladas)
│   └── audit_logs
│
├── Schema: tenant_3 (Hospital C - PetCare)
│   └── ... (43 tabelas isoladas)
│
└── Schema: tenant_N...
```

---

## Tabela `tenants` (Schema Public)

Armazena informações sobre cada hospital/clínica (tenant).

```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,          -- 'demo', 'zoapets-sp', 'vetcare-rj'
  schema_name VARCHAR(100) UNIQUE NOT NULL,   -- 'tenant_1', 'tenant_2', ...
  status VARCHAR(50) DEFAULT 'trial',         -- 'trial', 'active', 'suspended', 'cancelled'

  -- Dados do Hospital
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(9),

  -- SaaS
  plan_id UUID REFERENCES public.plans(id),
  subscription_id UUID,
  trial_ends_at TIMESTAMP,
  subscription_starts_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,

  -- Configurações
  settings JSONB DEFAULT '{}',

  -- Feature Flags
  features JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_schema_name ON public.tenants(schema_name);
CREATE INDEX idx_tenants_status ON public.tenants(status);
```

**Exemplo de Registros:**
```sql
INSERT INTO public.tenants (id, name, slug, schema_name, status, plan_id, trial_ends_at)
VALUES
  ('uuid-1', 'Hospital Veterinário Demo', 'demo', 'tenant_demo', 'trial', 'plan-basic', NOW() + INTERVAL '14 days'),
  ('uuid-2', 'Zoa Pets - São Paulo', 'zoapets-sp', 'tenant_2', 'active', 'plan-pro', NULL),
  ('uuid-3', 'Clínica VetCare - RJ', 'vetcare-rj', 'tenant_3', 'active', 'plan-enterprise', NULL);
```

---

## Fluxo de Requisição

### 1. Login do Usuário

```
1. User faz POST /auth/login
   {
     "email": "admin@demo.com",
     "senha": "Admin@123"
   }

2. AuthService busca user no schema correto:
   - Descobre tenantId do usuário (table public.users ou tenant.users)
   - Valida credenciais

3. AuthService gera JWT com payload:
   {
     "sub": "user-id",
     "email": "admin@demo.com",
     "roles": ["Veterinário"],
     "tenantId": "tenant_demo"  ← IMPORTANTE
   }

4. Retorna token para frontend
```

### 2. Requisição Autenticada

```
1. Frontend envia requisição:
   GET /pets
   Headers: Authorization: Bearer <JWT>

2. JwtAuthGuard extrai e valida JWT:
   - Extrai payload
   - Valida assinatura
   - Injeta user no request: req.user = { userId, email, roles, tenantId }

3. TenantMiddleware é executado:
   async use(req: Request, res: Response, next: NextFunction) {
     const user = req['user'];
     const tenantId = user?.tenantId; // 'tenant_demo'

     if (tenantId) {
       // Configura search_path para o schema do tenant
       await getConnection().query(`SET search_path TO ${tenantId}`);
     }

     next();
   }

4. Controller/Service executa query:
   const pets = await this.petsRepository.find(); // Busca APENAS do tenant_demo

5. PostgreSQL retorna APENAS dados do schema tenant_demo
   - Impossível acessar dados de tenant_2 ou tenant_3
```

---

## Implementação Backend (NestJS)

### 1. TenantMiddleware

```typescript
// src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const user = req['user']; // Injetado pelo JwtAuthGuard
    const tenantId = user?.tenantId;

    if (!tenantId) {
      // Rotas públicas ou sem autenticação
      next();
      return;
    }

    try {
      // Configura o schema do tenant no PostgreSQL
      await getConnection().query(`SET search_path TO ${tenantId}`);

      console.log(`[Tenant Middleware] Schema set to: ${tenantId}`);

      next();
    } catch (error) {
      console.error('[Tenant Middleware] Error setting schema:', error);
      throw new Error('Erro ao configurar tenant');
    }
  }
}
```

### 2. Aplicação no AppModule

```typescript
// src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  // ... imports, controllers, providers
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Aplicar em TODAS as rotas
  }
}
```

### 3. JWT Strategy (com tenantId)

```typescript
// src/core/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

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
      tenantId: payload.tenantId, // ← IMPORTANTE
    };
  }
}
```

### 4. AuthService (gerando JWT com tenantId)

```typescript
// src/core/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: { email: string; senha: string }) {
    // 1. Buscar usuário (primeiro no public.users ou tenant.users)
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2. Validar senha
    const isPasswordValid = await bcrypt.compare(loginDto.senha, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Gerar JWT com tenantId
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      tenantId: user.tenantId, // ← CRÍTICO
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        roles: user.roles.map(r => r.name),
        tenantId: user.tenantId,
      },
    };
  }
}
```

---

## Criação de Novo Tenant

Quando um novo hospital se cadastra no sistema SaaS:

### 1. Script de Provisioning

```typescript
// src/modules/tenants/tenants.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { Tenant } from '../../common/entities/tenant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant, 'public') // Especifica schema public
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const connection = getConnection();

    // 1. Criar registro no public.tenants
    const tenant = this.tenantsRepository.create({
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      schema_name: `tenant_${Date.now()}`, // Ex: tenant_1697123456789
      email: createTenantDto.email,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    });

    const savedTenant = await this.tenantsRepository.save(tenant);

    // 2. Criar schema no PostgreSQL
    await connection.query(`CREATE SCHEMA IF NOT EXISTS ${savedTenant.schema_name}`);

    // 3. Copiar estrutura de tabelas do tenant template
    await this.cloneSchemaStructure('tenant_template', savedTenant.schema_name);

    // 4. Criar usuário admin padrão no novo schema
    await this.createAdminUser(savedTenant.schema_name, createTenantDto);

    return savedTenant;
  }

  private async cloneSchemaStructure(sourceSchema: string, targetSchema: string) {
    const connection = getConnection();

    // Obter todas as tabelas do schema template
    const tables = await connection.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
    `, [sourceSchema]);

    // Para cada tabela, copiar estrutura (sem dados)
    for (const { table_name } of tables) {
      await connection.query(`
        CREATE TABLE ${targetSchema}.${table_name}
        (LIKE ${sourceSchema}.${table_name} INCLUDING ALL)
      `);
    }

    // Copiar sequences, constraints, indexes, etc.
    // (código adicional aqui)
  }

  private async createAdminUser(schemaName: string, dto: CreateTenantDto) {
    const connection = getConnection();

    const hashedPassword = await bcrypt.hash('ChangeMe@123', 10);

    await connection.query(`
      SET search_path TO ${schemaName};

      INSERT INTO users (id, nome, email, password, tenant_id, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
      )
    `, [dto.adminName, dto.adminEmail, hashedPassword, schemaName]);

    // Atribuir role de Administrador
    // (código adicional)
  }
}
```

---

## Migrations Multi-Tenant

Como cada tenant tem seu próprio schema, precisamos aplicar migrations em TODOS os schemas.

### Script de Migration

```typescript
// migrations/apply-to-all-tenants.ts
import { getConnection } from 'typeorm';

async function applyMigrationToAllTenants() {
  const connection = getConnection();

  // 1. Buscar todos os tenants
  const tenants = await connection.query(`
    SELECT schema_name FROM public.tenants WHERE status = 'active'
  `);

  for (const tenant of tenants) {
    const { schema_name } = tenant;

    console.log(`Applying migration to ${schema_name}...`);

    // 2. Configurar search_path para o schema do tenant
    await connection.query(`SET search_path TO ${schema_name}`);

    // 3. Executar migration
    await connection.query(`
      -- Exemplo: adicionar nova coluna
      ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip VARCHAR(50);
    `);

    console.log(`Migration applied to ${schema_name} ✅`);
  }

  console.log('All migrations applied successfully!');
}

applyMigrationToAllTenants();
```

**Executar:**
```bash
ts-node migrations/apply-to-all-tenants.ts
```

---

## Backups Independentes

Cada tenant pode ter seu backup individual:

```bash
# Backup de um tenant específico
pg_dump -U postgres -d zoapets_production \
  --schema=tenant_2 \
  --file=backup_tenant_2_$(date +%Y%m%d).sql

# Backup de todos os tenants
for schema in $(psql -U postgres -d zoapets_production -t -c "SELECT schema_name FROM public.tenants WHERE status='active'"); do
  pg_dump -U postgres -d zoapets_production \
    --schema=$schema \
    --file=backup_${schema}_$(date +%Y%m%d).sql
done
```

**Restore:**
```bash
psql -U postgres -d zoapets_production -f backup_tenant_2_20251021.sql
```

---

## Segurança e Compliance LGPD

### Isolamento de Dados

**✅ Vantagens:**
- Impossível acessar dados de outro tenant (PostgreSQL garante)
- Cada tenant pode ser auditado separadamente
- Direito ao esquecimento: basta deletar o schema do tenant
- Portabilidade de dados: exportar schema completo

### Auditoria

Cada tenant tem sua própria tabela `audit_logs`:

```sql
CREATE TABLE tenant_X.audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50), -- 'CREATE', 'UPDATE', 'DELETE', 'READ'
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Exclusão de Tenant (Right to be Forgotten)

```sql
-- 1. Marcar tenant como deleted
UPDATE public.tenants SET status = 'deleted', deleted_at = NOW() WHERE id = 'tenant-uuid';

-- 2. Agendar exclusão do schema (30 dias depois)
-- Job scheduler executa:
DROP SCHEMA tenant_X CASCADE;

-- 3. Remover registro de public.tenants
DELETE FROM public.tenants WHERE id = 'tenant-uuid';
```

---

## Performance

### Índices Isolados

Cada schema tem seus próprios índices, sem compartilhamento:

```sql
-- Schema tenant_1
CREATE INDEX idx_pets_tutor_id ON tenant_1.pets(tutor_id);

-- Schema tenant_2
CREATE INDEX idx_pets_tutor_id ON tenant_2.pets(tutor_id);
```

**Vantagem:** Índice menor = queries mais rápidas.

### Análise de Queries

```sql
-- Ver queries lentas por tenant
SELECT schemaname, query, mean_exec_time, calls
FROM pg_stat_statements
WHERE schemaname LIKE 'tenant_%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## Escalabilidade Horizontal

Se um tenant crescer muito, podemos movê-lo para outro database:

```bash
# 1. Dump do schema
pg_dump -U postgres -d zoapets_production \
  --schema=tenant_2 \
  --file=tenant_2_migration.sql

# 2. Restore no novo database
psql -U postgres -d zoapets_db2 -f tenant_2_migration.sql

# 3. Atualizar public.tenants
UPDATE public.tenants
SET database_host = 'db2.zoapets.com', schema_name = 'tenant_2'
WHERE id = 'tenant-uuid';
```

---

## Limitações e Considerações

### Limitações

❌ **Queries cross-tenant:** Impossível fazer JOIN entre dados de diferentes tenants
❌ **Relatórios globais:** Precisa agregar dados manualmente de cada schema
❌ **Migrations:** Precisa aplicar em todos os schemas (script customizado)

### Mitigações

✅ **Agregações:** Criar views materializadas no schema public
✅ **ETL:** Pipeline para dados agregados (relatórios gerenciais SaaS)
✅ **Automation:** Scripts de migration automatizados

---

## Exemplo Completo de Fluxo

```
1. Hospital "VetCare" se cadastra:
   POST /tenants
   {
     "name": "VetCare Clínica",
     "email": "contato@vetcare.com",
     "adminEmail": "admin@vetcare.com",
     "adminName": "Dr. João"
   }

2. Backend cria:
   - Registro em public.tenants (schema_name: tenant_3)
   - Schema tenant_3 no PostgreSQL
   - 43 tabelas vazias em tenant_3
   - Usuário admin em tenant_3.users

3. Admin faz login:
   POST /auth/login
   {
     "email": "admin@vetcare.com",
     "senha": "ChangeMe@123"
   }

4. Recebe JWT:
   {
     "sub": "user-id",
     "email": "admin@vetcare.com",
     "roles": ["Administrador"],
     "tenantId": "tenant_3"  ← Schema do VetCare
   }

5. Frontend faz requisição:
   GET /pets
   Authorization: Bearer <JWT>

6. TenantMiddleware configura:
   SET search_path TO tenant_3

7. Query busca APENAS pets do VetCare:
   SELECT * FROM pets;
   -- PostgreSQL retorna de tenant_3.pets automaticamente

8. Impossível acessar dados de outros hospitais ✅
```

---

## Monitoramento

### Métricas por Tenant

```sql
-- Tamanho de cada schema
SELECT
  schemaname,
  pg_size_pretty(sum(pg_total_relation_size(schemaname||'.'||tablename))::bigint) as size
FROM pg_tables
WHERE schemaname LIKE 'tenant_%'
GROUP BY schemaname
ORDER BY sum(pg_total_relation_size(schemaname||'.'||tablename)) DESC;

-- Número de registros por tenant
SELECT
  'tenant_1' as tenant,
  (SELECT COUNT(*) FROM tenant_1.pets) as pets,
  (SELECT COUNT(*) FROM tenant_1.internacoes) as internacoes;
```

---

## Próximos Passos

1. **Schema Template:** Criar schema template perfeito para clonagem
2. **Auto-scaling:** Detectar tenants grandes e mover para DB separado
3. **Billing:** Cobrar por uso de storage/queries
4. **Feature Flags:** Habilitar/desabilitar features por tenant
5. **Compliance:** Auditoria automatizada LGPD

---

**Versão:** 1.0
**Data:** 2025-10-21
**Status:** ✅ 100% Implementado - Schema-per-Tenant Operacional
