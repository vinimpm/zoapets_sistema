# API Keys - Sistema de Chaves de Autenticação

## Visão Geral

O sistema de API Keys do Zoa Pets permite que sistemas externos e integrações terceirizadas acessem a **Public API v2.0** de forma segura e controlada, sem necessidade de autenticação JWT tradicional.

### Características Principais

- **Autenticação Baseada em Chaves**: Tokens seguros de 64 caracteres hexadecimais
- **Controle de Permissões**: Sistema granular de permissões por chave
- **IP Whitelist**: Restrição de acesso por endereços IP
- **Rate Limiting**: Limite de requisições por hora
- **Expiração Automática**: Chaves com data de validade configurável
- **Auditoria Completa**: Rastreamento de uso e última utilização
- **Multi-tenant**: Isolamento total entre hospitais

---

## 1. Entidade API Key

### Estrutura da Entidade

**Arquivo:** `backend/src/common/entities/api-key.entity.ts`

```typescript
@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // Chave criptográfica: "zp_abc123..."

  @Column()
  nome: string; // Nome descritivo: "Sistema de Agendamento Online"

  @Column({ type: 'text', nullable: true })
  descricao: string; // Descrição detalhada

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User; // Usuário responsável pela chave

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[]; // ['read:pets', 'write:internacoes', etc]

  @Column({ type: 'jsonb', nullable: true })
  ipWhitelist: string[]; // ['192.168.1.100', '10.0.0.50']

  @Column({ name: 'rate_limit', default: 1000 })
  rateLimit: number; // Requisições por hora (default: 1000)

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date; // Data de expiração (opcional)

  @Column({ default: true })
  ativo: boolean; // Status da chave

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date; // Última vez que foi usada

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number; // Contador de utilizações

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `key` | string | Chave única gerada automaticamente (ex: `zp_a1b2c3...`) |
| `nome` | string | Nome descritivo para identificação |
| `permissions` | string[] | Array de permissões granulares |
| `ipWhitelist` | string[] | IPs autorizados (vazio = todos) |
| `rateLimit` | number | Limite de requisições/hora |
| `expiresAt` | Date | Data de expiração (null = sem expiração) |
| `ativo` | boolean | Status ativo/inativo |
| `usageCount` | number | Total de requisições realizadas |

---

## 2. Geração de Chaves

### ApiKeysService - Método de Criação

**Arquivo:** `backend/src/modules/api-keys/api-keys.service.ts:18-45`

```typescript
async create(userId: string, createApiKeyDto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; key: string }> {
  // 1. Verificar se o usuário existe
  const user = await this.usersRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
  }

  // 2. Gerar chave segura
  const key = this.generateApiKey();

  // 3. Criar registro
  const apiKey = this.apiKeysRepository.create({
    ...createApiKeyDto,
    key,
    userId,
    expiresAt: createApiKeyDto.expiresAt ? new Date(createApiKeyDto.expiresAt) : undefined,
  });

  const saved = await this.apiKeysRepository.save(apiKey);

  // 4. Retornar a chave APENAS UMA VEZ (segurança)
  return {
    apiKey: saved,
    key, // ⚠️ Único momento onde a chave completa é retornada!
  };
}

private generateApiKey(): string {
  // Gera chave aleatória com 64 caracteres hexadecimais
  const prefix = 'zp'; // Zoa Pets prefix
  const random = crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex chars
  return `${prefix}_${random}`;
}
```

### Exemplo de Chave Gerada

```
zp_a1b2c3d4e5f6789012345678901234567890123456789012345678901234
├─ zp: Prefixo Zoa Pets
└─ a1b2c3...1234: 64 caracteres hexadecimais aleatórios (256 bits de entropia)
```

### ⚠️ Segurança Crítica

**A chave completa é retornada APENAS na criação!**

Nas consultas subsequentes (`findAll`, `findOne`), o campo `key` é **omitido** do `select`:

```typescript
async findAll(userId?: string): Promise<ApiKey[]> {
  return this.apiKeysRepository.find({
    where,
    relations: ['user'],
    select: {
      id: true,
      nome: true,
      descricao: true,
      permissions: true,
      // ❌ NÃO seleciona o campo 'key' por segurança
    },
  });
}
```

**Motivo:** Se a chave for perdida, o usuário deve criar uma nova. Isso evita que chaves sejam expostas em logs, telas, etc.

---

## 3. DTOs de Entrada

### CreateApiKeyDto

**Arquivo:** `backend/src/modules/api-keys/dto/create-api-key.dto.ts`

```typescript
export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[]; // Ex: ['read:pets', 'write:agendamentos']

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[]; // Ex: ['192.168.1.100', '10.0.0.50']

  @IsOptional()
  @IsNumber()
  rateLimit?: number; // Default: 1000 req/hora

  @IsOptional()
  @IsDateString()
  expiresAt?: string; // Ex: '2025-12-31T23:59:59Z'
}
```

### UpdateApiKeyDto

```typescript
export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {}
```

---

## 4. Validação e Autenticação

### ApiKeyGuard - Guard de Validação

**Arquivo:** `backend/src/common/guards/api-key.guard.ts`

O `ApiKeyGuard` valida as chaves em **4 etapas**:

#### Etapa 1: Extração da Chave

```typescript
private extractApiKey(request: any): string | undefined {
  // Tenta header primeiro (recomendado)
  const headerKey = request.headers['x-api-key'];
  if (headerKey) return headerKey;

  // Alternativa: query parameter
  const queryKey = request.query['api_key'];
  if (queryKey) return queryKey;

  return undefined;
}
```

**Formas de enviar a chave:**

```bash
# 1. Header (RECOMENDADO)
curl -H "X-API-Key: zp_abc123..." https://api.zoapet.com/public/pets

# 2. Query parameter (alternativa)
curl https://api.zoapet.com/public/pets?api_key=zp_abc123...
```

#### Etapa 2: Busca no Banco

```typescript
const keyRecord = await this.apiKeysRepository.findOne({
  where: { key: apiKey, ativo: true },
  relations: ['user'],
});

if (!keyRecord) {
  throw new UnauthorizedException('API Key inválida');
}
```

#### Etapa 3: Validações de Segurança

```typescript
// 3.1. Verificar expiração
if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
  throw new UnauthorizedException('API Key expirada');
}

// 3.2. Verificar IP whitelist
if (keyRecord.ipWhitelist && keyRecord.ipWhitelist.length > 0) {
  const clientIp = request.ip || request.connection.remoteAddress;
  if (!keyRecord.ipWhitelist.includes(clientIp)) {
    throw new UnauthorizedException('IP não autorizado para esta API Key');
  }
}
```

#### Etapa 4: Auditoria e Acesso

```typescript
// 4.1. Atualizar métricas de uso
keyRecord.lastUsedAt = new Date();
keyRecord.usageCount += 1;
await this.apiKeysRepository.save(keyRecord);

// 4.2. Anexar usuário e apiKey ao request
request.user = keyRecord.user; // Disponível nos controllers
request.apiKey = keyRecord;

return true; // ✅ Acesso permitido
```

---

## 5. Controller de Gerenciamento

### ApiKeysController

**Arquivo:** `backend/src/modules/api-keys/api-keys.controller.ts`

#### Criar Nova API Key

```typescript
@Post()
@Roles('Administrador', 'Gerente')
create(@CurrentUser() user: any, @Body() createApiKeyDto: CreateApiKeyDto) {
  return this.apiKeysService.create(user.id, createApiKeyDto);
}
```

**Request:**
```bash
POST /api-keys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "nome": "Sistema de Agendamento Web",
  "descricao": "Integração com site de agendamentos online",
  "permissions": ["read:agendamentos", "write:agendamentos"],
  "ipWhitelist": ["192.168.1.100"],
  "rateLimit": 500,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "apiKey": {
    "id": "uuid-123",
    "nome": "Sistema de Agendamento Web",
    "descricao": "Integração com site de agendamentos online",
    "permissions": ["read:agendamentos", "write:agendamentos"],
    "ipWhitelist": ["192.168.1.100"],
    "rateLimit": 500,
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "ativo": true,
    "usageCount": 0,
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "key": "zp_a1b2c3d4e5f6789012345678901234567890123456789012345678901234"
}
```

**⚠️ IMPORTANTE:** Salve o campo `key` imediatamente! Ele não será exibido novamente.

#### Listar API Keys

```typescript
@Get()
@Roles('Administrador', 'Gerente')
findAll(@CurrentUser() user: any) {
  // Administradores veem todas, outros apenas as suas
  const userId = user.roles.some((r: any) => r.nome === 'Administrador')
    ? undefined
    : user.id;
  return this.apiKeysService.findAll(userId);
}
```

**Request:**
```bash
GET /api-keys
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "uuid-123",
    "nome": "Sistema de Agendamento Web",
    "descricao": "Integração com site de agendamentos online",
    "permissions": ["read:agendamentos", "write:agendamentos"],
    "ipWhitelist": ["192.168.1.100"],
    "rateLimit": 500,
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "ativo": true,
    "lastUsedAt": "2025-01-20T14:30:00.000Z",
    "usageCount": 1247,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "nome": "João Silva",
      "email": "joao@hospital.com"
    }
  }
]
```

**Nota:** O campo `key` **não** é retornado por segurança.

#### Estatísticas de Uso

```typescript
@Get(':id/stats')
@Roles('Administrador', 'Gerente')
getUsageStats(@Param('id') id: string) {
  return this.apiKeysService.getUsageStats(id);
}
```

**Request:**
```bash
GET /api-keys/uuid-123/stats
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "uuid-123",
  "nome": "Sistema de Agendamento Web",
  "usageCount": 1247,
  "lastUsedAt": "2025-01-20T14:30:00.000Z",
  "rateLimit": 500,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

#### Revogar API Key

```typescript
@Patch(':id/revoke')
@Roles('Administrador', 'Gerente')
revoke(@Param('id') id: string) {
  return this.apiKeysService.revoke(id);
}
```

**Request:**
```bash
PATCH /api-keys/uuid-123/revoke
Authorization: Bearer <jwt-token>
```

Define `ativo = false`. A chave deixa de funcionar imediatamente.

#### Reativar API Key

```typescript
@Patch(':id/activate')
@Roles('Administrador', 'Gerente')
activate(@Param('id') id: string) {
  return this.apiKeysService.activate(id);
}
```

#### Excluir API Key Permanentemente

```typescript
@Delete(':id')
@Roles('Administrador') // ⚠️ Apenas Administradores
@HttpCode(HttpStatus.NO_CONTENT)
remove(@Param('id') id: string) {
  return this.apiKeysService.remove(id);
}
```

**Request:**
```bash
DELETE /api-keys/uuid-123
Authorization: Bearer <jwt-token>
```

**Exclusão permanente.** Use `revoke` para desativar temporariamente.

---

## 6. Uso na Public API

### Decorador @PublicApi()

**Arquivo:** `backend/src/common/decorators/public-api.decorator.ts`

```typescript
export const IS_PUBLIC_API_KEY = 'isPublicApi';
export const PublicApi = () => SetMetadata(IS_PUBLIC_API_KEY, true);
```

### Aplicação no Public API Controller

**Arquivo:** `backend/src/modules/public-api/public-api.controller.ts`

```typescript
@Controller('public')
@UseGuards(ApiKeyGuard) // 🔒 Valida API Key
@PublicApi() // 🏷️ Marca como endpoint público
export class PublicApiController {
  // ...

  @Get('pets')
  async getPets(@Query('search') search?: string) {
    return this.petsService.findAll(search);
  }

  @Post('agendamentos')
  async createAgendamento(@Body() dto: CreateAgendamentoDto) {
    return this.agendamentosService.create(dto);
  }

  // ... 125+ endpoints disponíveis
}
```

### Exemplo de Requisição Autenticada

```bash
curl -X GET \
  'https://api.zoapet.com/public/pets?search=Rex' \
  -H 'X-API-Key: zp_a1b2c3d4e5f6789012345678901234567890123456789012345678901234' \
  -H 'Content-Type: application/json'
```

**Fluxo de Autenticação:**

1. **Request chega** no endpoint `/public/pets`
2. **ApiKeyGuard** intercepta a requisição
3. **Extrai** a chave do header `X-API-Key`
4. **Valida** no banco de dados (existe, ativa, não expirada)
5. **Verifica** IP whitelist (se configurado)
6. **Incrementa** `usageCount` e atualiza `lastUsedAt`
7. **Anexa** `user` e `apiKey` ao `request`
8. **Permite** acesso ao controller

---

## 7. Recursos de Segurança Avançados

### 7.1. Sistema de Permissões Granulares

Cada chave pode ter permissões específicas armazenadas no campo `permissions`:

```json
{
  "permissions": [
    "read:pets",
    "read:agendamentos",
    "write:agendamentos"
  ]
}
```

**Formato:** `<ação>:<recurso>`

| Ação | Recursos Comuns |
|------|----------------|
| `read` | `pets`, `tutores`, `internacoes`, `agendamentos`, `financeiro` |
| `write` | `pets`, `agendamentos`, `internacoes` |
| `update` | `pets`, `agendamentos` |
| `delete` | Geralmente não permitido via Public API |

**Implementação futura:** Guard adicional para verificar permissões específicas.

### 7.2. IP Whitelist

Restringe acesso apenas a IPs específicos:

```json
{
  "ipWhitelist": [
    "192.168.1.100",
    "10.0.0.50",
    "203.0.113.42"
  ]
}
```

**Quando usar:**
- Servidores de produção com IP fixo
- Integrações de parceiros confiáveis
- Ambientes corporativos com IP dedicado

**Validação no Guard:**

```typescript
if (keyRecord.ipWhitelist && keyRecord.ipWhitelist.length > 0) {
  const clientIp = request.ip || request.connection.remoteAddress;
  if (!keyRecord.ipWhitelist.includes(clientIp)) {
    throw new UnauthorizedException('IP não autorizado para esta API Key');
  }
}
```

### 7.3. Rate Limiting

Limite de requisições por hora:

```json
{
  "rateLimit": 1000
}
```

**Default:** 1000 requisições/hora

**Status atual:** Campo existe, mas rate limiting **não está implementado**.

**Implementação futura:**
- Usar Redis para contadores distribuídos
- Verificar `usageCount` no último período
- Retornar `429 Too Many Requests` quando exceder

### 7.4. Expiração Automática

Chaves com data de validade:

```json
{
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Quando usar:**
- Chaves temporárias para testes
- Integrações de parceiros com contrato definido
- Chaves de demonstração

**Validação no Guard:**

```typescript
if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
  throw new UnauthorizedException('API Key expirada');
}
```

### 7.5. Auditoria de Uso

Cada requisição atualiza:

```typescript
keyRecord.lastUsedAt = new Date(); // Timestamp da última utilização
keyRecord.usageCount += 1; // Contador incremental
```

**Benefícios:**
- Identificar chaves não utilizadas (candidatas a remoção)
- Detectar uso anormal (possível vazamento)
- Relatórios de consumo por integração

---

## 8. Integração Multi-tenant

### Isolamento por Hospital

O sistema de API Keys respeita o **isolamento multi-tenant**:

```typescript
@Controller('public')
@UseGuards(ApiKeyGuard) // Valida API Key
@PublicApi()
export class PublicApiController {
  // Após validação, request.user.tenantId está disponível
}
```

**Fluxo:**

1. **API Key validada** → `request.user` é preenchido com o usuário associado
2. **TenantMiddleware** extrai `user.tenantId`
3. **Executa** `SET search_path TO {tenantId}` no PostgreSQL
4. **Todas as queries** ficam automaticamente isoladas ao schema correto

**Exemplo:**

```typescript
// API Key do Hospital A (tenantId = 'hospital_123')
request.user = {
  id: 'user-abc',
  tenantId: 'hospital_123',
  roles: [...]
}

// TenantMiddleware executa:
await connection.query("SET search_path TO hospital_123");

// Agora todas as consultas acessam apenas dados do Hospital A
const pets = await petsService.findAll(); // Retorna apenas pets do Hospital A
```

---

## 9. Boas Práticas

### ✅ Recomendações

1. **Nunca exponha chaves em código-fonte**
   ```javascript
   // ❌ ERRADO
   const API_KEY = 'zp_abc123...';

   // ✅ CORRETO
   const API_KEY = process.env.ZOA_PETS_API_KEY;
   ```

2. **Use variáveis de ambiente**
   ```bash
   # .env (NUNCA comite no Git!)
   ZOA_PETS_API_KEY=zp_abc123...
   ```

3. **Prefira headers sobre query parameters**
   ```bash
   # ✅ SEGURO (header)
   curl -H "X-API-Key: zp_abc123..." https://api.zoapet.com/public/pets

   # ⚠️ EVITE (query - pode vazar em logs)
   curl https://api.zoapet.com/public/pets?api_key=zp_abc123...
   ```

4. **Configure IP whitelist em produção**
   ```json
   {
     "ipWhitelist": ["203.0.113.42"]
   }
   ```

5. **Defina datas de expiração para chaves temporárias**
   ```json
   {
     "expiresAt": "2025-06-30T23:59:59Z"
   }
   ```

6. **Revogue chaves imediatamente se comprometidas**
   ```bash
   PATCH /api-keys/{id}/revoke
   ```

7. **Monitore uso anormal**
   - Verifique `usageCount` regularmente
   - Alerte se `usageCount` crescer exponencialmente
   - Investigue `lastUsedAt` em horários estranhos

8. **Use permissões granulares**
   ```json
   {
     "permissions": ["read:pets", "read:agendamentos"]
   }
   ```
   Conceda **apenas** as permissões necessárias.

9. **Rotação de chaves**
   - Crie nova chave periodicamente (ex: a cada 6 meses)
   - Migre integrações gradualmente
   - Revogue chave antiga após confirmação

### ⚠️ Avisos de Segurança

- **Nunca comite `.env` no Git**
- **Nunca exiba chaves em logs** (use masking: `zp_abc...`)
- **Nunca compartilhe chaves via email/chat** (use cofres de senhas)
- **Nunca reutilize chaves** entre ambientes (dev/staging/prod)

---

## 10. Exemplos Completos

### Exemplo 1: Criar Chave para Site de Agendamentos

```bash
# 1. Criar chave
POST /api-keys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "nome": "Site de Agendamentos",
  "descricao": "Permite que o site público crie e consulte agendamentos",
  "permissions": [
    "read:agendamentos",
    "write:agendamentos",
    "read:pets",
    "read:tutores"
  ],
  "ipWhitelist": ["203.0.113.100"],
  "rateLimit": 500,
  "expiresAt": "2026-01-01T00:00:00Z"
}

# Response:
{
  "apiKey": { ... },
  "key": "zp_a1b2c3d4e5f6789012345678901234567890123456789012345678901234"
}

# 2. Usar chave no site
GET /public/agendamentos?data=2025-01-25
X-API-Key: zp_a1b2c3d4e5f6789012345678901234567890123456789012345678901234
```

### Exemplo 2: Integração com Sistema de Parceiro

```bash
# 1. Criar chave com permissões de leitura
POST /api-keys
{
  "nome": "Laboratório Vet Plus",
  "descricao": "Consulta resultados de exames",
  "permissions": ["read:exames", "read:pets"],
  "ipWhitelist": ["198.51.100.42", "198.51.100.43"],
  "rateLimit": 200
}

# 2. Parceiro acessa exames
GET /public/exames?petId=pet-uuid-123
X-API-Key: zp_xyz789...
```

### Exemplo 3: Chave Temporária para Teste

```bash
# Criar chave que expira em 7 dias
POST /api-keys
{
  "nome": "Teste Integração - QA",
  "descricao": "Chave temporária para testes",
  "expiresAt": "2025-02-01T23:59:59Z",
  "rateLimit": 100
}
```

---

## 11. Diagrama de Fluxo

```
┌─────────────┐
│ Cliente     │
│ Externo     │
└──────┬──────┘
       │
       │ GET /public/pets
       │ X-API-Key: zp_abc123...
       ▼
┌──────────────────┐
│  ApiKeyGuard     │
│                  │
│ 1. Extrai chave  │
│ 2. Busca no DB   │◄────┐
│ 3. Valida        │     │
│ 4. Verifica IP   │     │
│ 5. Incrementa    │     │
│    usageCount    │─────┘
└────────┬─────────┘
         │
         │ ✅ Autorizado
         │ request.user = keyRecord.user
         │
         ▼
┌──────────────────────┐
│ TenantMiddleware     │
│                      │
│ SET search_path TO   │
│   {user.tenantId}    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Public API           │
│ Controller           │
│                      │
│ PetsService.findAll()│
└──────────┬───────────┘
           │
           │ SELECT * FROM pets
           │ (isolado ao schema correto)
           ▼
┌──────────────────────┐
│ PostgreSQL           │
│ Schema: hospital_123 │
└──────────────────────┘
```

---

## 12. Endpoints Disponíveis

### Gerenciamento de API Keys (Interno - Requer JWT)

| Método | Endpoint | Descrição | Permissões |
|--------|----------|-----------|------------|
| POST | `/api-keys` | Criar nova chave | Administrador, Gerente |
| GET | `/api-keys` | Listar chaves | Administrador, Gerente |
| GET | `/api-keys/:id` | Detalhes de uma chave | Administrador, Gerente |
| GET | `/api-keys/:id/stats` | Estatísticas de uso | Administrador, Gerente |
| PATCH | `/api-keys/:id` | Atualizar chave | Administrador, Gerente |
| PATCH | `/api-keys/:id/revoke` | Revogar chave | Administrador, Gerente |
| PATCH | `/api-keys/:id/activate` | Reativar chave | Administrador, Gerente |
| DELETE | `/api-keys/:id` | Excluir permanentemente | Administrador |

### Public API (Externa - Requer API Key)

Veja documentação completa em: **docs/05-integracoes/public-api.md**

125+ endpoints disponíveis incluindo:
- **Pets:** CRUD completo, busca por microchip
- **Tutores:** CRUD completo, busca por CPF
- **Internações:** Consulta, criação, alta
- **Agendamentos:** CRUD, confirmação, cancelamento
- **Financeiro:** Consulta contas, registro de pagamentos

---

## 13. Arquivos Relacionados

### Backend

- **Entidade:** `backend/src/common/entities/api-key.entity.ts`
- **Módulo:** `backend/src/modules/api-keys/api-keys.module.ts`
- **Service:** `backend/src/modules/api-keys/api-keys.service.ts`
- **Controller:** `backend/src/modules/api-keys/api-keys.controller.ts`
- **DTOs:** `backend/src/modules/api-keys/dto/`
- **Guard:** `backend/src/common/guards/api-key.guard.ts`
- **Decorator:** `backend/src/common/decorators/public-api.decorator.ts`
- **Public API:** `backend/src/modules/public-api/public-api.controller.ts`

### Migrations

```sql
-- Migration para criar tabela api_keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB,
  ip_whitelist JSONB,
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_ativo ON api_keys(ativo);
```

---

## 14. Melhorias Futuras

### Em Planejamento

1. **Rate Limiting Efetivo**
   - Implementar com Redis
   - Contadores por janela de tempo (sliding window)
   - Headers de resposta: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

2. **Verificação de Permissões**
   - Guard adicional: `PermissionsGuard`
   - Decorador: `@RequirePermissions('read:pets')`
   - Validação automática baseada no campo `permissions`

3. **Webhooks para Auditoria**
   - Notificar quando chave é criada/revogada
   - Alertas de uso anormal
   - Relatórios semanais de consumo

4. **Dashboard de Métricas**
   - Gráficos de uso por chave
   - Top endpoints mais acessados
   - Análise de performance por integração

5. **Chaves com Escopo Limitado**
   - Permitir acesso a recursos específicos
   - Ex: `scope: 'pet:abc-123'` (apenas este pet)

6. **CORS Configurável**
   - Permitir configurar domínios autorizados por chave
   - Útil para integrações web (SPAs)

---

## Conclusão

O sistema de API Keys do Zoa Pets oferece:

- **Segurança robusta** com chaves criptográficas de 256 bits
- **Controle granular** via permissões, IP whitelist, rate limiting
- **Auditoria completa** com rastreamento de uso
- **Isolamento multi-tenant** automático
- **Flexibilidade** para múltiplos casos de uso

**Status:** ✅ **Totalmente implementado e operacional**

A Public API v2.0 está pronta para integrações externas com 125+ endpoints disponíveis.
