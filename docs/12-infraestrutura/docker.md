# Docker - Infraestrutura e Ambientes

## Visão Geral

O Zoa Pets utiliza **Docker Compose** para orquestrar toda a infraestrutura de desenvolvimento e produção. A stack inclui PostgreSQL multi-tenant, Redis para cache, MinIO para armazenamento de arquivos, e ferramentas de administração.

### Componentes da Stack

| Serviço | Imagem | Porta(s) | Função |
|---------|--------|----------|--------|
| **PostgreSQL** | `postgres:16-alpine` | 5432 | Banco de dados principal (multi-tenant) |
| **Redis** | `redis:7-alpine` | 6379 | Cache e message queue |
| **MinIO** | `minio/minio:latest` | 9000, 9001 | Object storage (S3-compatible) |
| **Adminer** | `adminer:latest` | 8080 | Interface web para PostgreSQL |
| **RedisInsight** | `redislabs/redisinsight:latest` | 8001 | Interface web para Redis |

---

## 1. Arquivo docker-compose.yml

**Localização:** `docker-compose.yml` (raiz do projeto)

```yaml
version: '3.8'

services:
  # PostgreSQL - Banco de dados principal
  postgres:
    image: postgres:16-alpine
    container_name: zoapets-postgres
    environment:
      POSTGRES_DB: zoapets_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - zoapets-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis - Cache e message queue
  redis:
    image: redis:7-alpine
    container_name: zoapets-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - zoapets-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # MinIO - Object storage (S3-compatible)
  minio:
    image: minio/minio:latest
    container_name: zoapets-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data
    networks:
      - zoapets-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Adminer - Database management UI (opcional)
  adminer:
    image: adminer:latest
    container_name: zoapets-adminer
    ports:
      - "8080:8080"
    networks:
      - zoapets-network
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      - postgres

  # RedisInsight - Redis management UI (opcional)
  redis-insight:
    image: redislabs/redisinsight:latest
    container_name: zoapets-redis-insight
    ports:
      - "8001:8001"
    networks:
      - zoapets-network
    volumes:
      - redis_insight_data:/db
    depends_on:
      - redis

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local
  redis_insight_data:
    driver: local

networks:
  zoapets-network:
    driver: bridge
```

---

## 2. PostgreSQL - Banco de Dados Multi-tenant

### 2.1. Configuração

**Imagem:** `postgres:16-alpine`
**Versão:** PostgreSQL 16 (Alpine Linux para menor tamanho)
**Porta:** 5432

**Variáveis de Ambiente:**
```yaml
POSTGRES_DB: zoapets_dev          # Nome do database
POSTGRES_USER: postgres            # Usuário admin
POSTGRES_PASSWORD: postgres123     # Senha (⚠️ alterar em prod)
POSTGRES_HOST_AUTH_METHOD: trust   # Autenticação local sem senha
```

### 2.2. Volumes

#### Volume de Dados
```yaml
postgres_data:/var/lib/postgresql/data
```

Persiste todos os dados do PostgreSQL. **Nunca será deletado** ao reiniciar containers.

#### Scripts de Inicialização
```yaml
./database/init:/docker-entrypoint-initdb.d
```

Scripts SQL executados **apenas na primeira inicialização** do container.

**Arquivo:** `database/init/01-init-database.sql`

Cria a estrutura multi-tenant:
- **Schema PUBLIC:** Dados globais do SaaS (tenants, plans, subscriptions, feature_flags)
- **Extensions:** uuid-ossp, pg_trgm
- **Tabelas SaaS:**
  - `tenants` - Hospitais cadastrados
  - `plans` - Planos (Básico, Pro, Enterprise)
  - `subscriptions` - Assinaturas ativas
  - `feature_flags` - Funcionalidades por plano
  - `global_users` - Super admins (equipe Zoa Pets)

**Exemplo de estrutura:**
```sql
-- Schema global
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY,
    nome VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    schema_name VARCHAR(63) UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Schema por hospital (criado dinamicamente)
CREATE SCHEMA hospital_abc;
SET search_path TO hospital_abc;

-- Tabelas do hospital
CREATE TABLE pets (...);
CREATE TABLE tutores (...);
CREATE TABLE internacoes (...);
-- ... 43 tabelas
```

### 2.3. Health Check

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Verifica se o PostgreSQL está pronto para aceitar conexões a cada 10 segundos.

### 2.4. Acesso via Adminer

**URL:** http://localhost:8080

**Credenciais:**
- **Sistema:** PostgreSQL
- **Servidor:** postgres (nome do container)
- **Usuário:** postgres
- **Senha:** postgres123
- **Base de dados:** zoapets_dev

### 2.5. Conexão pela Aplicação

**Variáveis no `.env`:**
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=zoapets_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123

# OU URL completa
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/zoapets_dev
```

**Connection string do TypeORM (backend):**
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false, // ⚠️ SEMPRE false em produção
  logging: ['error', 'warn'],
})
```

---

## 3. Redis - Cache e Message Queue

### 3.1. Configuração

**Imagem:** `redis:7-alpine`
**Versão:** Redis 7 (Alpine)
**Porta:** 6379

**Comando customizado:**
```yaml
command: redis-server --appendonly yes
```

`--appendonly yes`: Habilita **AOF (Append Only File)** para persistência de dados.

### 3.2. Volumes

```yaml
redis_data:/data
```

Persiste o arquivo AOF (`appendonly.aof`) para recuperação após reinicializações.

### 3.3. Health Check

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 3s
  retries: 5
```

Executa `PING` no Redis. Resposta esperada: `PONG`.

### 3.4. Acesso via RedisInsight

**URL:** http://localhost:8001

Interface gráfica para:
- Visualizar chaves e valores
- Executar comandos Redis
- Monitorar performance
- Analisar uso de memória

**Adicionar conexão:**
- **Host:** redis (nome do container)
- **Port:** 6379
- **Nome:** Zoa Pets Development

### 3.5. Uso na Aplicação

**Variáveis no `.env`:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
```

**Casos de uso no Zoa Pets:**

#### 3.5.1. Cache de Sessão (Planejado)
```typescript
// Armazenar sessão JWT
await redis.set(`session:${userId}`, JSON.stringify(sessionData), 'EX', 900); // 15min
```

#### 3.5.2. Rate Limiting (Planejado)
```typescript
// Contar requisições por API Key
const count = await redis.incr(`ratelimit:${apiKeyId}:${hour}`);
await redis.expire(`ratelimit:${apiKeyId}:${hour}`, 3600);
if (count > apiKey.rateLimit) {
  throw new TooManyRequestsException();
}
```

#### 3.5.3. Cache de Consultas (Planejado)
```typescript
// Cache de lista de pets
const cacheKey = `pets:tutor:${tutorId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const pets = await petsRepository.find({ tutorId });
await redis.set(cacheKey, JSON.stringify(pets), 'EX', 300); // 5min
return pets;
```

#### 3.5.4. Pub/Sub para Notificações (Planejado)
```typescript
// Publisher: Internação criada
await redis.publish('internacoes:created', JSON.stringify(internacao));

// Subscriber: Frontend recebe via WebSocket
redis.subscribe('internacoes:created', (message) => {
  websocket.broadcast('nova-internacao', JSON.parse(message));
});
```

---

## 4. MinIO - Object Storage

### 4.1. Configuração

**Imagem:** `minio/minio:latest`
**Versão:** Latest stable
**Portas:**
- **9000:** API S3-compatible
- **9001:** Console Web

**Comando:**
```yaml
command: server /data --console-address ":9001"
```

Inicia o servidor MinIO com console web na porta 9001.

**Variáveis de Ambiente:**
```yaml
MINIO_ROOT_USER: minioadmin
MINIO_ROOT_PASSWORD: minioadmin123
```

⚠️ **Alterar em produção!**

### 4.2. Volumes

```yaml
minio_data:/data
```

Armazena todos os buckets e objetos (arquivos).

### 4.3. Acesso ao Console

**URL:** http://localhost:9001

**Credenciais:**
- **Username:** minioadmin
- **Password:** minioadmin123

**Tarefas no console:**
- Criar buckets
- Upload/download manual de arquivos
- Configurar políticas de acesso
- Monitorar uso de storage

### 4.4. Configuração Inicial

**1. Criar bucket `zoapets`:**

Via Console Web:
1. Acesse http://localhost:9001
2. Login com minioadmin/minioadmin123
3. Clique em **"Create Bucket"**
4. Nome: `zoapets`
5. **Create**

Via CLI (mc):
```bash
# Instalar MinIO Client
brew install minio/stable/mc  # Mac
# ou
docker run -it --rm --network zoapets_zoapets-network minio/mc

# Configurar alias
mc alias set local http://minio:9000 minioadmin minioadmin123

# Criar bucket
mc mb local/zoapets

# Definir política pública (para imagens de pets, etc)
mc anonymous set download local/zoapets
```

### 4.5. Uso na Aplicação

**Variáveis no `.env`:**
```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false
MINIO_BUCKET=zoapets
```

**Integração com NestJS:**

```typescript
import { S3 } from 'aws-sdk';

const s3 = new S3({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  s3ForcePathStyle: true, // ⚠️ Necessário para MinIO
  signatureVersion: 'v4',
});

// Upload de arquivo
async uploadFile(file: Express.Multer.File) {
  const key = `pets/${Date.now()}-${file.originalname}`;

  await s3.upload({
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }).promise();

  return {
    url: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${key}`,
    key,
  };
}

// Download de arquivo
async downloadFile(key: string) {
  const result = await s3.getObject({
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
  }).promise();

  return result.Body;
}

// Deletar arquivo
async deleteFile(key: string) {
  await s3.deleteObject({
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
  }).promise();
}
```

### 4.6. Estrutura de Diretórios no Bucket

```
zoapets/
├── pets/
│   ├── avatar-123.jpg
│   └── xray-456.dcm
├── tutores/
│   └── documento-789.pdf
├── internacoes/
│   ├── prontuario-001.pdf
│   └── exame-002.pdf
├── exames/
│   ├── hemograma-003.pdf
│   └── raio-x-004.dcm
└── temp/
    └── upload-temp-005.tmp
```

### 4.7. Migração para AWS S3 (Produção)

**Variáveis no `.env` (produção):**
```bash
# Comentar MinIO
# MINIO_ENDPOINT=...

# Descomentar AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXU...
S3_BUCKET=zoapets-prod
```

**Código permanece o mesmo!** AWS SDK funciona transparentemente com S3.

---

## 5. Networking

### 5.1. Rede Docker

```yaml
networks:
  zoapets-network:
    driver: bridge
```

Todos os containers estão na mesma rede `zoapets-network`.

**Comunicação entre containers:**
- Backend → PostgreSQL: `postgres:5432` (usa nome do container)
- Backend → Redis: `redis:6379`
- Backend → MinIO: `minio:9000`

**Comunicação host → containers:**
- Host → PostgreSQL: `localhost:5432`
- Host → Redis: `localhost:6379`
- Host → MinIO: `localhost:9000`

### 5.2. Resolução DNS

Docker automaticamente resolve nomes de containers dentro da rede:

```typescript
// ✅ Dentro de outro container
DATABASE_HOST=postgres

// ✅ Do host (sua máquina)
DATABASE_HOST=localhost
```

---

## 6. Comandos Docker

### 6.1. Iniciar Stack Completa

```bash
# Iniciar todos os serviços em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f postgres
```

**Saída esperada:**
```
Creating zoapets-postgres ... done
Creating zoapets-redis ... done
Creating zoapets-minio ... done
Creating zoapets-adminer ... done
Creating zoapets-redis-insight ... done
```

### 6.2. Parar Stack

```bash
# Parar todos os containers (volumes são mantidos)
docker-compose down

# Parar E remover volumes (⚠️ perde todos os dados!)
docker-compose down -v
```

### 6.3. Reiniciar Serviço Específico

```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Parar PostgreSQL
docker-compose stop postgres

# Iniciar PostgreSQL
docker-compose start postgres
```

### 6.4. Ver Status

```bash
# Listar containers
docker-compose ps

# Ver recursos (CPU, memória)
docker stats zoapets-postgres zoapets-redis zoapets-minio
```

**Saída esperada:**
```
NAME                CPU %   MEM USAGE / LIMIT     MEM %   NET I/O
zoapets-postgres    0.50%   50MiB / 2GiB          2.5%    1.2kB / 850B
zoapets-redis       0.25%   10MiB / 2GiB          0.5%    800B / 600B
zoapets-minio       0.75%   80MiB / 2GiB          4.0%    1.5kB / 1.2kB
```

### 6.5. Acessar Shell do Container

```bash
# PostgreSQL
docker exec -it zoapets-postgres psql -U postgres -d zoapets_dev

# Redis
docker exec -it zoapets-redis redis-cli

# Shell bash
docker exec -it zoapets-postgres bash
```

### 6.6. Backup e Restore

#### Backup PostgreSQL

```bash
# Backup completo
docker exec zoapets-postgres pg_dump -U postgres zoapets_dev > backup.sql

# Backup de schema específico (tenant)
docker exec zoapets-postgres pg_dump -U postgres -n hospital_abc zoapets_dev > hospital_abc_backup.sql

# Backup com compressão
docker exec zoapets-postgres pg_dump -U postgres zoapets_dev | gzip > backup.sql.gz
```

#### Restore PostgreSQL

```bash
# Restore completo
cat backup.sql | docker exec -i zoapets-postgres psql -U postgres -d zoapets_dev

# Restore com compressão
gunzip -c backup.sql.gz | docker exec -i zoapets-postgres psql -U postgres -d zoapets_dev
```

#### Backup MinIO

```bash
# Via MinIO Client
mc mirror local/zoapets ./minio-backup/

# Via volume docker
docker run --rm \
  -v zoapets_minio_data:/data \
  -v $(pwd)/minio-backup:/backup \
  alpine tar czf /backup/minio-backup.tar.gz /data
```

### 6.7. Limpeza

```bash
# Remover containers parados
docker container prune

# Remover volumes não utilizados
docker volume prune

# Remover tudo (⚠️ cuidado!)
docker system prune -a --volumes
```

---

## 7. Monitoramento e Logs

### 7.1. Logs Centralizados

```bash
# Todos os serviços (últimas 100 linhas)
docker-compose logs --tail=100

# Seguir logs em tempo real
docker-compose logs -f

# Logs de serviço específico
docker-compose logs -f postgres redis

# Buscar erro específico
docker-compose logs | grep ERROR
```

### 7.2. Inspeção de Containers

```bash
# Inspecionar configuração completa
docker inspect zoapets-postgres

# Ver variáveis de ambiente
docker inspect zoapets-postgres | grep -A 20 Env

# Ver volumes montados
docker inspect zoapets-postgres | grep -A 10 Mounts
```

### 7.3. Health Checks

```bash
# Ver status de saúde
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Saída:**
```
NAMES                  STATUS
zoapets-postgres       Up 2 hours (healthy)
zoapets-redis          Up 2 hours (healthy)
zoapets-minio          Up 2 hours (healthy)
zoapets-adminer        Up 2 hours
zoapets-redis-insight  Up 2 hours
```

---

## 8. Ambientes

### 8.1. Desenvolvimento Local

**Arquivo:** `docker-compose.yml` (padrão)

**Características:**
- Adminer e RedisInsight habilitados
- Senhas simples (postgres123, minioadmin123)
- Volumes locais persistentes
- Todos os serviços expostos no host

**Iniciar:**
```bash
docker-compose up -d
```

### 8.2. Staging

**Arquivo:** `docker-compose.staging.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # Variável de ambiente do host
    volumes:
      - /mnt/data/postgres:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

  # Sem Adminer/RedisInsight em staging/prod
```

**Iniciar:**
```bash
export POSTGRES_PASSWORD=strong-password-here
export REDIS_PASSWORD=another-strong-password

docker-compose -f docker-compose.staging.yml up -d
```

### 8.3. Produção

**Recomendações:**

1. **Usar serviços gerenciados:**
   - AWS RDS (PostgreSQL)
   - AWS ElastiCache (Redis)
   - AWS S3 (Storage)

2. **Se usar Docker em produção:**
   - Docker Swarm ou Kubernetes
   - Secrets gerenciados externamente
   - Health checks obrigatórios
   - Limites de recursos
   - Logs centralizados (CloudWatch, Datadog)

**Exemplo docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

secrets:
  postgres_password:
    external: true
```

---

## 9. Troubleshooting

### 9.1. PostgreSQL não inicia

**Erro:**
```
FATAL: database files are incompatible with server
```

**Solução:**
```bash
# Remover volume e recriar
docker-compose down -v
docker-compose up -d
```

### 9.2. Redis sem persistência

**Problema:** Dados perdidos após reinicialização.

**Verificar:**
```bash
docker exec zoapets-redis redis-cli CONFIG GET appendonly
```

**Deve retornar:** `appendonly yes`

**Corrigir:**
```bash
docker exec zoapets-redis redis-cli CONFIG SET appendonly yes
docker exec zoapets-redis redis-cli CONFIG REWRITE
```

### 9.3. MinIO não acessa console

**Erro:** `Unable to connect to MinIO console on port 9001`

**Verificar porta:**
```bash
docker ps | grep minio
```

**Deve mostrar:** `0.0.0.0:9001->9001/tcp`

**Reiniciar:**
```bash
docker-compose restart minio
```

### 9.4. Container reiniciando constantemente

**Verificar logs:**
```bash
docker-compose logs --tail=50 postgres
```

**Verificar health check:**
```bash
docker inspect zoapets-postgres | grep -A 10 Health
```

### 9.5. Disco cheio

**Ver uso de volumes:**
```bash
docker system df

# Detalhado
docker system df -v
```

**Limpar:**
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes órfãos
docker volume prune -f
```

---

## 10. Variáveis de Ambiente

### 10.1. Arquivo .env

**Criar a partir do exemplo:**
```bash
cp .env.example .env
```

**Editar variáveis críticas:**
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123  # ⚠️ Alterar em prod

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin    # ⚠️ Alterar em prod
MINIO_SECRET_KEY=minioadmin123 # ⚠️ Alterar em prod
MINIO_BUCKET=zoapets

# JWT
JWT_SECRET=change-me-in-production        # ⚠️ OBRIGATÓRIO alterar
JWT_REFRESH_SECRET=change-me-too          # ⚠️ OBRIGATÓRIO alterar
```

### 10.2. Variáveis Docker vs Aplicação

**Docker Compose** usa variáveis do **host**:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}
```

**Aplicação** (backend/frontend) usa variáveis do **arquivo .env**:
```typescript
process.env.DATABASE_PASSWORD
```

**Elas são independentes!**

---

## 11. Performance

### 11.1. PostgreSQL

**Otimizações em produção:**
```yaml
postgres:
  environment:
    POSTGRES_SHARED_BUFFERS: 256MB
    POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
    POSTGRES_WORK_MEM: 16MB
    POSTGRES_MAINTENANCE_WORK_MEM: 128MB
    POSTGRES_MAX_CONNECTIONS: 100
```

**Ou via arquivo de configuração:**
```yaml
postgres:
  volumes:
    - ./postgresql.conf:/etc/postgresql/postgresql.conf
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

### 11.2. Redis

**Otimizações:**
```yaml
redis:
  command: redis-server
    --appendonly yes
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
```

### 11.3. Limites de Recursos

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

---

## 12. Segurança

### 12.1. Boas Práticas

✅ **Fazer:**
1. Alterar todas as senhas padrão em produção
2. Usar secrets do Docker em prod
3. Restringir portas expostas (bind só localhost quando possível)
4. Habilitar SSL/TLS em produção
5. Usar health checks
6. Limitar recursos (CPU, memória)
7. Rotacionar logs regularmente
8. Manter imagens atualizadas

❌ **Evitar:**
1. Expor Adminer/RedisInsight em produção
2. Usar senhas fracas ou padrão
3. Commitar `.env` no Git
4. Rodar containers como root
5. Desabilitar health checks
6. Ignorar avisos de segurança

### 12.2. Secrets do Docker

**Criar secret:**
```bash
echo "super-secure-password" | docker secret create postgres_password -
```

**Usar no compose:**
```yaml
secrets:
  postgres_password:
    external: true

services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

### 12.3. Network Security

**Isolar serviços:**
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Sem acesso externo

services:
  postgres:
    networks:
      - backend  # Apenas rede interna

  backend-api:
    networks:
      - frontend
      - backend  # Ponte entre redes
```

---

## 13. Referência Rápida

### URLs de Acesso

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **PostgreSQL** | `localhost:5432` | postgres / postgres123 |
| **Adminer** | http://localhost:8080 | postgres / postgres123 |
| **Redis** | `localhost:6379` | Sem senha |
| **RedisInsight** | http://localhost:8001 | - |
| **MinIO API** | http://localhost:9000 | minioadmin / minioadmin123 |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |

### Comandos Essenciais

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Parar e apagar volumes (⚠️ perde dados)
docker-compose down -v

# Reiniciar serviço
docker-compose restart postgres

# Ver status
docker-compose ps

# Backup PostgreSQL
docker exec zoapets-postgres pg_dump -U postgres zoapets_dev > backup.sql

# Acessar PostgreSQL
docker exec -it zoapets-postgres psql -U postgres -d zoapets_dev

# Acessar Redis
docker exec -it zoapets-redis redis-cli
```

---

## 14. Checklist de Setup

### Primeira Vez

- [ ] Copiar `.env.example` para `.env`
- [ ] Editar variáveis críticas (senhas, JWT secrets)
- [ ] Executar `docker-compose up -d`
- [ ] Aguardar todos os serviços ficarem `healthy`
- [ ] Acessar Adminer (http://localhost:8080) e verificar conexão
- [ ] Criar bucket `zoapets` no MinIO (http://localhost:9001)
- [ ] Executar migrations do backend (`npm run migration:run`)
- [ ] Executar seeds (`npm run seed`)
- [ ] Testar login na aplicação

### Deploy Produção

- [ ] Alterar TODAS as senhas padrão
- [ ] Configurar secrets do Docker
- [ ] Configurar SSL/TLS
- [ ] Configurar backup automático
- [ ] Configurar monitoramento (Prometheus, Grafana)
- [ ] Configurar logs centralizados
- [ ] Restringir acesso às portas
- [ ] Remover Adminer e RedisInsight
- [ ] Configurar alertas de saúde
- [ ] Testar procedimento de restore
- [ ] Documentar runbook

---

## Conclusão

A infraestrutura Docker do Zoa Pets oferece:

- **Ambiente completo** com PostgreSQL, Redis e MinIO
- **Ferramentas de administração** (Adminer, RedisInsight)
- **Multi-tenant** com PostgreSQL schemas isolados
- **Persistência de dados** via volumes Docker
- **Health checks** para monitoramento
- **Fácil migração** para produção (AWS RDS, S3, ElastiCache)

**Status:** ✅ **Totalmente funcional e pronto para desenvolvimento**

Basta executar `docker-compose up -d` e toda a infraestrutura estará pronta!
