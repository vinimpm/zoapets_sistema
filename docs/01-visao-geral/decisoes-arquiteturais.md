# Decisões Arquiteturais (ADRs) - Zoa Pets

## Sobre este Documento

Este documento registra as principais **Architecture Decision Records (ADRs)** do projeto Zoa Pets. Cada decisão é documentada com contexto, alternativas consideradas e justificativa da escolha final.

---

## ADR-001: Escolha do Framework Backend

**Status:** ✅ Aceito
**Data:** 2025-10-19
**Decisores:** Equipe Técnica

### Contexto
Precisamos escolher um framework backend robusto, escalável e adequado para um sistema SaaS hospitalar veterinário enterprise-grade.

### Decisão
Escolhemos **NestJS + TypeScript** como framework principal do backend.

### Alternativas Consideradas

| Framework | Prós | Contras | Decisão |
|-----------|------|---------|---------|
| **NestJS** | Arquitetura modular, DI nativo, TypeScript, enterprise-ready, ótima documentação | Curva aprendizado média | ✅ **ESCOLHIDO** |
| Django (Python) | Maduro, admin panel grátis, excelente para CRUD | Python (diferente do frontend), menos adequado para real-time | ❌ |
| Express.js | Simples, flexível, grande comunidade | Pouca estrutura, precisa muita configuração manual | ❌ |
| Spring Boot (Java) | Muito robusto, enterprise | Verboso, Java (stack diferente) | ❌ |

### Justificativa
- **Mesma linguagem** do frontend (TypeScript) facilita compartilhamento de código e onboarding
- **Arquitetura modular** perfeita para sistema complexo com 15 módulos
- **Dependency Injection** nativo simplifica testes e manutenção
- **Comunidade ativa** e ecossistema maduro para saúde/enterprise
- **Suporte robusto** a WebSocket, microservices, GraphQL (futuro)

### Consequências
- **Positivas:** Code reuse, equipe unificada, manutenção facilitada
- **Negativas:** Curva de aprendizado para devs novos em NestJS
- **Riscos:** Nenhum significativo

---

## ADR-002: Estratégia de Multi-Tenancy

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Como SaaS, precisamos isolar dados de diferentes hospitais (tenants) de forma segura, escalável e com bom custo-benefício.

### Decisão
Adotamos a estratégia **Schema-per-Tenant** no PostgreSQL.

### Alternativas Consideradas

| Estratégia | Isolamento | Custo | Escalabilidade | Complexidade | Decisão |
|------------|------------|-------|----------------|--------------|---------|
| **Schema-per-Tenant** | Alto | Médio | Alta | Média | ✅ **ESCOLHIDO** |
| Database-per-Tenant | Máximo | Alto | Média | Alta | ❌ |
| Row-level (Shared) | Baixo | Baixo | Alta | Baixa | ❌ |
| Híbrido | Variável | Alto | Alta | Muito alta | ❌ |

### Justificativa
- **Isolamento forte:** Cada hospital tem seu próprio schema PostgreSQL (impossível "vazar" dados entre tenants)
- **Performance:** Queries mais simples, sem filtros de tenant_id em toda query
- **Compliance:** LGPD/CFMV exigem isolamento robusto de dados médicos
- **Backups independentes:** Pode restaurar dados de um hospital específico
- **Migrations gerenciáveis:** Mais fácil que DB-per-tenant, mais seguro que row-level
- **Custo razoável:** Um único PostgreSQL suporta centenas de schemas

### Implementação
```typescript
// NestJS com multi-tenant
@Injectable()
export class TenantService {
  async switchTenant(tenantId: string) {
    // SET search_path TO tenant_123;
    await this.connection.query(`SET search_path TO tenant_${tenantId}`);
  }
}
```

### Consequências
- **Positivas:** Segurança máxima, compliance garantido, performance superior
- **Negativas:** Migrations mais complexas (loop por tenant), schemas ilimitados?
- **Riscos:** Necessário monitorar número de schemas (limite PostgreSQL: praticamente ilimitado)

---

## ADR-003: Banco de Dados Relacional

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Escolher banco de dados principal para dados estruturados (pacientes, internações, medicamentos, etc.).

### Decisão
Escolhemos **PostgreSQL 16** como banco de dados principal.

### Alternativas Consideradas

| Banco | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **PostgreSQL** | ACID, JSONB, extensões, multi-tenant friendly, grátis | - | ✅ **ESCOLHIDO** |
| MySQL/MariaDB | Popular, bom desempenho | Menos features avançadas | ❌ |
| SQL Server | Enterprise, ótimo para .NET | Caro, vendor lock-in | ❌ |
| MongoDB | Flexível, escalável | NoSQL (dados relacionais complexos) | ❌ |

### Justificativa
- **ACID compliant:** Essencial para dados médicos críticos
- **JSONB:** Flexibilidade para campos customizados (sem schema rígido)
- **Schema-per-tenant:** Suporte nativo e eficiente
- **Extensões:** PostGIS (geolocalização), pg_cron, etc.
- **Full-Text Search:** Busca de prontuários nativa
- **Comunidade:** Open-source, sem custos de licença
- **Performance:** Superior para queries complexas (JOINs, CTEs, Window Functions)

### Consequências
- **Positivas:** Robustez, zero custo de licença, suporte excelente
- **Negativas:** Backup/restore mais demorado que NoSQL (aceito pelo benefício ACID)

---

## ADR-004: Frontend Framework

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Escolher framework para o painel web (PWA) acessível por equipe interna.

### Decisão
Escolhemos **Next.js 14+ (App Router) + React 18 + TypeScript**.

### Alternativas Consideradas

| Framework | SSR/SSG | DX | Ecosystem | PWA | Decisão |
|-----------|---------|-----|-----------|-----|---------|
| **Next.js** | ✅ Nativo | Excelente | Gigante | ✅ | ✅ **ESCOLHIDO** |
| Vue.js (Nuxt) | ✅ Nativo | Bom | Grande | ✅ | ❌ |
| Angular | ✅ Possível | Médio | Grande | ✅ | ❌ |
| SPA React (CRA/Vite) | ❌ | Bom | Gigante | ✅ | ❌ |

### Justificativa
- **Mesma stack do backend:** TypeScript (reduz complexidade)
- **SSR/SSG:** Performance superior, SEO excelente (landing pages comerciais)
- **PWA nativo:** Offline-first, installable, notificações
- **React Server Components:** Reduz bundle size, melhora performance
- **Vercel deployment:** Deploy automático, edge functions, CDN global
- **File-based routing:** Intuitivo e escalável
- **API Routes:** Backend integrado quando necessário

### Consequências
- **Positivas:** Performance, DX excelente, comunidade gigante
- **Negativas:** App Router é recente (menos recursos/tutoriais que Pages Router)

---

## ADR-005: Mobile Framework

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Desenvolver app nativo (iOS + Android) para tutores dos pets.

### Decisão
Escolhemos **React Native 0.74+ + Expo SDK 51+**.

### Alternativas Consideradas

| Framework | Code Sharing | Performance | Manutenção | Custo Dev | Decisão |
|-----------|--------------|-------------|------------|-----------|---------|
| **React Native + Expo** | Alto | Boa | Fácil | Médio | ✅ **ESCOLHIDO** |
| Flutter | Alto | Excelente | Fácil | Médio | ❌ |
| Swift + Kotlin (Nativo) | Zero | Máxima | Difícil | Alto | ❌ |
| Ionic/Capacitor | Máximo | Média | Fácil | Baixo | ❌ |

### Justificativa
- **Mesma stack:** TypeScript + React (equipe única, code sharing)
- **Manutenção 70% menor:** Único codebase vs 2 apps nativos
- **UX nativa:** Não é webview, usa componentes nativos reais
- **Expo:** Simplifica builds, notificações push, OTA updates
- **Comunidade:** Gigante, muitas libs, usado por apps médicos (Practo, Zocdoc)
- **Cost-effective:** 1 dev RN = 2 devs (Swift + Kotlin)

### Consequências
- **Positivas:** Velocidade de desenvolvimento, custo reduzido
- **Negativas:** Performance 5-10% menor que nativo puro (aceitável para nosso caso)

---

## ADR-006: Sistema de Real-Time

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Dashboard precisa de updates em tempo real (internações, alertas) e chat entre equipe.

### Decisão
Implementar **WebSockets (Socket.io) + Server-Sent Events (SSE)** híbrido.

### Alternativas Consideradas

| Tecnologia | Bidirecional | Simplicidade | Recursos Servidor | Decisão |
|------------|--------------|--------------|-------------------|---------|
| **WebSocket (Socket.io)** | ✅ | Média | Alto | ✅ Dashboard crítico |
| **SSE** | ❌ (unidirecional) | Alta | Baixo | ✅ Notificações |
| Polling | ❌ | Alta | Muito alto | ❌ |
| GraphQL Subscriptions | ✅ | Média | Médio | ❌ (futuro) |

### Justificativa
- **WebSocket para:**
  - Dashboard de internações (updates em tempo real)
  - Chat entre equipe
  - Alertas críticos de medicamentos
- **SSE para:**
  - Notificações não-críticas
  - Updates de status (progresso de jobs)
  - Fallback mais leve

### Implementação
```typescript
// NestJS
@WebSocketGateway()
export class DashboardGateway {
  @SubscribeMessage('join-dashboard')
  handleJoin(client: Socket, payload: { tenantId: string }) {
    client.join(`tenant:${payload.tenantId}`);
  }
}
```

### Consequências
- **Positivas:** UX excelente, dados sempre atualizados
- **Negativas:** Complexidade de infraestrutura (load balancing com sticky sessions)

---

## ADR-007: Sistema de Filas (Message Queue)

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Processar tarefas assíncronas (emails, relatórios, alertas) de forma confiável e escalável.

### Decisão
Usar **BullMQ + Redis** como sistema de filas.

### Alternativas Consideradas

| Solução | Integração NestJS | Simplicidade | Escalabilidade | Custo | Decisão |
|---------|-------------------|--------------|----------------|-------|---------|
| **BullMQ + Redis** | ✅ Nativa | Alta | Alta | Baixo | ✅ **ESCOLHIDO** |
| RabbitMQ | Possível | Média | Muito alta | Médio | ❌ |
| AWS SQS | Boa | Média | Infinita | Médio | ❌ (futuro) |
| Kafka | Possível | Baixa | Infinita | Alto | ❌ |

### Justificativa
- **Integração nativa:** `@nestjs/bull` oficial
- **Redis já presente:** Usado para cache (reuso de infraestrutura)
- **Recursos:** Retry automático, cron jobs, priorização, rate limiting
- **UI:** Bull Dashboard para monitoramento
- **Perfect para:** Emails, SMS, WhatsApp, geração de PDFs, alertas

### Casos de Uso
```typescript
// Envio de email assíncrono
@Queue('email')
export class EmailQueue {
  @Process('send-prescription')
  async sendPrescription(job: Job<{ email: string; pdf: Buffer }>) {
    await this.emailService.send(job.data);
  }
}
```

### Consequências
- **Positivas:** Confiabilidade, retry automático, escalável
- **Negativas:** Redis single-point-of-failure (mitigado com Redis Sentinel)

---

## ADR-008: Multi-Repositório vs Monorepo

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Organizar código-fonte dos 3 projetos (backend, web, mobile).

### Decisão
Começar com **Multi-Repo (3 repositórios separados)**.

### Alternativas Consideradas

| Estratégia | CI/CD | Deploy | Complexidade | Decisão |
|------------|-------|--------|--------------|---------|
| **Multi-Repo** | Rápido | Independente | Baixa | ✅ **ESCOLHIDO (MVP)** |
| Monorepo (Nx/Turborepo) | Lento | Sincronizado | Alta | ⏭️ Futuro |

### Justificativa

**Multi-Repo (Fase Inicial):**
- Deploy independente (backend não afeta mobile)
- CI/CD mais rápido (testa só o que mudou)
- Separação clara de responsabilidades
- Permissões granulares (devs mobile não precisam acessar backend)

**Repositories:**
1. `zoapets-backend` → NestJS API
2. `zoapets-web` → Next.js PWA
3. `zoapets-mobile` → React Native + Expo

**Código Compartilhado:**
- NPM packages privados para types, utils, validators
- Publicar em registry privado (GitHub Packages ou Verdaccio)

**Migração Futura para Monorepo (quando necessário):**
- Quando code sharing ficar muito frequente
- Quando precisar sincronizar releases
- Ferramentas: Nx ou Turborepo

### Consequências
- **Positivas:** Simplicidade, velocidade, autonomia de equipes
- **Negativas:** Code sharing via NPM é mais trabalhoso

---

## ADR-009: Autenticação e Autorização

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Autenticar usuários de forma segura e escalável em um SaaS multi-tenant.

### Decisão
Implementar **JWT (Access + Refresh Tokens) + RBAC**.

### Alternativas Consideradas

| Estratégia | Stateless | Escalabilidade | Segurança | Decisão |
|------------|-----------|----------------|-----------|---------|
| **JWT (Access + Refresh)** | ✅ | Alta | Alta | ✅ **ESCOLHIDO** |
| Sessions (Redis) | ❌ | Média | Alta | ❌ |
| OAuth 2.0 (terceiros) | ✅ | Alta | Alta | ⏭️ Futuro |

### Justificativa

**Access Token:**
- JWT curto (15 minutos)
- Payload: `{ userId, tenantId, roles, permissions }`
- Armazenado em memória (nunca em localStorage)

**Refresh Token:**
- Longa duração (7 dias)
- Armazenado em httpOnly cookie (XSS protection)
- Rotação automática a cada uso
- Stored em database (pode revogar)

**RBAC (Role-Based Access Control):**
```typescript
enum Role {
  ADMIN = 'admin',
  MEDICO = 'medico',
  ENFERMEIRO = 'enfermeiro',
  RECEPCAO = 'recepcao',
  FARMACIA = 'farmacia',
  TUTOR = 'tutor'
}

enum Permission {
  // Internações
  'internacao:create',
  'internacao:read',
  'internacao:update',
  'internacao:delete',
  // Medicamentos
  'medicamento:prescrever',
  'medicamento:administrar',
  // etc...
}
```

### Implementação
```typescript
// NestJS Guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MEDICO)
@Permissions('internacao:update')
async updateInternacao() {}
```

### Consequências
- **Positivas:** Escalável, stateless, seguro
- **Negativas:** Não pode revogar access token antes de expirar (aceitável por TTL curto)

---

## ADR-010: Armazenamento de Arquivos

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Armazenar imagens DICOM, laudos PDF, documentos assinados, fotos de pets.

### Decisão
Usar **Object Storage (MinIO para dev, AWS S3 para produção)**.

### Alternativas Consideradas

| Solução | Custo | Escalabilidade | S3-Compatible | Decisão |
|---------|-------|----------------|---------------|---------|
| **MinIO (dev) + S3 (prod)** | Baixo (dev) / Médio (prod) | Infinita | ✅ | ✅ **ESCOLHIDO** |
| Filesystem local | Zero | Baixa | ❌ | ❌ |
| Database (bytea) | Médio | Baixa | ❌ | ❌ |
| Google Cloud Storage | Médio | Infinita | ❌ | ❌ |

### Justificativa
- **MinIO:** S3-compatible, self-hosted, grátis, perfeito para dev/staging
- **AWS S3:** Produção (99.999999999% durability, CDN integrado)
- **Vantagens:**
  - Armazenamento ilimitado
  - Presigned URLs (acesso temporário seguro)
  - Versionamento de arquivos
  - Lifecycle policies (arquivar dados antigos)
  - Integração com CloudFront (CDN)

### Estrutura de Buckets
```
zoapets-documents/
  ├── tenant-{id}/
  │   ├── pets/
  │   │   └── {pet-id}/
  │   │       └── photo.jpg
  │   ├── dicom/
  │   │   └── {study-id}/
  │   │       └── *.dcm
  │   ├── prescriptions/
  │   └── reports/
```

### Consequências
- **Positivas:** Escalabilidade infinita, custo razoável, backup automático
- **Negativas:** Latência maior que filesystem (aceitável)

---

## ADR-011: Observabilidade e Monitoramento

**Status:** ✅ Aceito
**Data:** 2025-10-19

### Contexto
Monitorar saúde do sistema, detectar erros e otimizar performance.

### Decisão
Implementar **Sentry (Errors) + Grafana + Prometheus (Metrics)**.

### Alternativas Consideradas

| Ferramenta | Errors | Metrics | Logs | Custo | Decisão |
|------------|--------|---------|------|-------|---------|
| **Sentry + Grafana + Prometheus** | ✅ | ✅ | ❌ | Médio | ✅ **ESCOLHIDO** |
| New Relic | ✅ | ✅ | ✅ | Alto | ❌ |
| Datadog | ✅ | ✅ | ✅ | Muito alto | ❌ |
| ELK Stack | ❌ | ❌ | ✅ | Médio (self-hosted) | ⏭️ Logs futuros |

### Justificativa

**Sentry:**
- Error tracking com stack traces
- Source maps para código minificado
- Alertas automáticos (Slack, Email)
- Breadcrumbs (contexto antes do erro)
- Release tracking

**Prometheus + Grafana:**
- Métricas customizadas (requests/s, latency, CPU, RAM)
- Dashboards visuais
- Alertas (quando CPU > 80%)
- Open-source (baixo custo)

**Logs Centralizados (Futuro):**
- Grafana Loki ou ELK Stack
- Agregação de logs de todos os serviços

### Consequências
- **Positivas:** Visibilidade completa, troubleshooting rápido
- **Negativas:** Configuração inicial complexa

---

## Resumo das Decisões

| ADR | Decisão | Status |
|-----|---------|--------|
| ADR-001 | NestJS + TypeScript (Backend) | ✅ Aceito |
| ADR-002 | Schema-per-Tenant (Multi-tenancy) | ✅ Aceito |
| ADR-003 | PostgreSQL (Database) | ✅ Aceito |
| ADR-004 | Next.js + React (Frontend) | ✅ Aceito |
| ADR-005 | React Native + Expo (Mobile) | ✅ Aceito |
| ADR-006 | WebSocket + SSE (Real-time) | ✅ Aceito |
| ADR-007 | BullMQ + Redis (Message Queue) | ✅ Aceito |
| ADR-008 | Multi-Repo (Organização) | ✅ Aceito |
| ADR-009 | JWT + RBAC (Auth) | ✅ Aceito |
| ADR-010 | MinIO/S3 (Storage) | ✅ Aceito |
| ADR-011 | Sentry + Grafana (Observability) | ✅ Aceito |

---

## Próximas Decisões (Futuras)

- **ADR-012:** GraphQL vs REST (se precisar de queries complexas)
- **ADR-013:** Migração para Kubernetes (quando atingir escala)
- **ADR-014:** Microservices (se módulos crescerem demais)
- **ADR-015:** Event Sourcing (para auditoria avançada)

---

**Versão:** 1.0
**Data:** 2025-10-19
**Revisar:** A cada decisão arquitetural significativa
