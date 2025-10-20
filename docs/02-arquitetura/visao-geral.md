# Arquitetura Geral - Zoa Pets Sistema Hospitalar

## Visão Geral

Sistema SaaS multi-tenant enterprise-grade para gestão hospitalar veterinária, composto por **3 aplicações** principais interconectadas através de APIs REST e comunicação em tempo real.

---

## Diagrama de Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APRESENTAÇÃO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │   Web App (PWA)      │  │   Mobile App         │  │  Landing Page     │ │
│  │                      │  │                      │  │                   │ │
│  │  Next.js 14          │  │  React Native        │  │  Next.js (SSG)    │ │
│  │  + React 18          │  │  + Expo SDK 51       │  │  Marketing        │ │
│  │  + TypeScript        │  │  + TypeScript        │  │                   │ │
│  │                      │  │                      │  │                   │ │
│  │  Usuários:           │  │  Usuários:           │  │  Público em       │ │
│  │  - Médicos           │  │  - Tutores           │  │  geral            │ │
│  │  - Enfermeiros       │  │  - Donos de pets     │  │                   │ │
│  │  - Recepção          │  │                      │  │                   │ │
│  │  - Admin             │  │                      │  │                   │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬────────┘ │
│             │                         │                          │          │
│             └─────────────────────────┼──────────────────────────┘          │
│                                       │                                     │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
                    ┌───────────────────▼──────────────────┐
                    │      NGINX / CloudFlare CDN          │
                    │   (Load Balancer + SSL + DDoS)       │
                    └───────────────────┬──────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────┐
│                           CAMADA DE APLICAÇÃO                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌────────────────────────────┐                           │
│                    │     Backend API (REST)     │                           │
│                    │                            │                           │
│                    │      NestJS + TypeScript   │                           │
│                    │                            │                           │
│                    │  ┌──────────────────────┐  │                           │
│                    │  │  Auth Module         │  │                           │
│                    │  │  - JWT               │  │                           │
│                    │  │  - RBAC              │  │                           │
│                    │  │  - Multi-tenant      │  │                           │
│                    │  └──────────────────────┘  │                           │
│                    │                            │                           │
│                    │  ┌──────────────────────┐  │                           │
│                    │  │  Business Modules    │  │                           │
│                    │  │  - Internações       │  │                           │
│                    │  │  - RAEM             │  │                           │
│                    │  │  - Prontuário        │  │                           │
│                    │  │  - Farmácia          │  │                           │
│                    │  │  - POPs              │  │                           │
│                    │  │  - Equipamentos      │  │                           │
│                    │  │  - Relatórios        │  │                           │
│                    │  │  - Billing           │  │                           │
│                    │  └──────────────────────┘  │                           │
│                    │                            │                           │
│                    │  ┌──────────────────────┐  │                           │
│                    │  │  Infrastructure      │  │                           │
│                    │  │  - Logging           │  │                           │
│                    │  │  - Caching           │  │                           │
│                    │  │  - Queue             │  │                           │
│                    │  │  - WebSocket         │  │                           │
│                    │  └──────────────────────┘  │                           │
│                    └────────┬──────────┬────────┘                           │
│                             │          │                                    │
│               ┌─────────────┘          └─────────────┐                      │
│               │                                      │                      │
│       ┌───────▼────────┐                  ┌──────────▼────────┐             │
│       │  WebSocket     │                  │  Message Queue    │             │
│       │  Gateway       │                  │                   │             │
│       │                │                  │  BullMQ + Redis   │             │
│       │  Socket.io     │                  │                   │             │
│       │  (Real-time)   │                  │  Jobs:            │             │
│       │                │                  │  - Email          │             │
│       │  - Dashboard   │                  │  - SMS            │             │
│       │  - Alerts      │                  │  - WhatsApp       │             │
│       │  - Chat        │                  │  - Reports        │             │
│       └────────────────┘                  │  - Notifications  │             │
│                                           └───────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────┐
│                           CAMADA DE DADOS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL 16  │  │   Redis    │  │   MinIO/S3   │  │   Orthanc    │  │
│  │                 │  │            │  │              │  │   (PACS)     │  │
│  │  Multi-Tenant:  │  │  - Cache   │  │  - Images    │  │              │  │
│  │                 │  │  - Session │  │  - Documents │  │  - DICOM     │  │
│  │  • tenant_1     │  │  - Locks   │  │  - PDFs      │  │  - Studies   │  │
│  │  • tenant_2     │  │  - Jobs    │  │  - Photos    │  │              │  │
│  │  • tenant_3     │  │            │  │              │  │              │  │
│  │  • ...          │  │            │  │              │  │              │  │
│  │                 │  │            │  │              │  │              │  │
│  │  Schemas por    │  │            │  │              │  │              │  │
│  │  hospital       │  │            │  │              │  │              │  │
│  └─────────────────┘  └────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────┐
│                        INTEGRAÇÕES EXTERNAS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Stripe     │  │  Focus NFe   │  │   WhatsApp   │  │   SendGrid   │   │
│  │              │  │              │  │   Business   │  │              │   │
│  │  Pagamentos  │  │  Nota Fiscal │  │   API        │  │  Email       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Mercado     │  │   Twilio     │  │   Firebase   │  │   Sentry     │   │
│  │  Pago        │  │              │  │   FCM        │  │              │   │
│  │              │  │  SMS         │  │  Push        │  │  Monitoring  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura em Camadas

### 1. **Camada de Apresentação**

Aplicações frontend que interagem com usuários finais.

#### **Web App (PWA)**
- **Tecnologia:** Next.js 14 + React 18 + TypeScript
- **Usuários:** Equipe interna do hospital (médicos, enfermeiros, recepção, admin)
- **Funcionalidades:**
  - Dashboard de internações
  - Prescrição de medicamentos (RAEM)
  - Prontuário eletrônico
  - Gestão de estoque
  - Relatórios gerenciais
  - Administração SaaS
- **Features:**
  - PWA (installable, offline-capable)
  - Server-Side Rendering (SSR)
  - Real-time updates (WebSocket)
  - Responsive (desktop, tablet, mobile)

#### **Mobile App**
- **Tecnologia:** React Native + Expo
- **Usuários:** Tutores/donos dos pets
- **Funcionalidades:**
  - Visualizar pets e histórico
  - Acompanhar internações
  - Chat com equipe
  - Visualizar exames e laudos
  - Lembretes de vacinas/medicamentos
  - Agendamentos
- **Features:**
  - Push notifications
  - Offline-first
  - Biometria (autenticação)

#### **Landing Page**
- **Tecnologia:** Next.js (Static Site Generation)
- **Público:** Prospects e visitantes
- **Funcionalidades:**
  - Marketing do produto
  - Pricing/planos
  - Documentação pública
  - Blog
  - Signup

---

### 2. **Camada de Aplicação (Backend)**

API REST construída com **NestJS** seguindo princípios de **Clean Architecture**.

#### **Estrutura Modular**

```
src/
├── main.ts
├── app.module.ts
│
├── core/                    # Lógica de negócio central
│   ├── auth/                # Autenticação e autorização
│   ├── tenant/              # Multi-tenancy
│   ├── user/                # Usuários
│   └── shared/              # Utilitários compartilhados
│
├── modules/                 # Módulos de negócio
│   ├── hospitais/
│   ├── pets/
│   ├── tutores/
│   ├── internacoes/
│   ├── raem/                # Medicamentos
│   ├── prontuario/
│   ├── farmacia/
│   ├── pops/
│   ├── equipamentos/
│   ├── convenios/
│   ├── financeiro/
│   ├── marketing/
│   └── relatorios/
│
├── infrastructure/          # Infraestrutura técnica
│   ├── database/            # TypeORM / Prisma
│   ├── cache/               # Redis
│   ├── storage/             # S3 / MinIO
│   ├── queue/               # BullMQ
│   ├── websocket/           # Socket.io
│   ├── logging/             # Winston
│   └── monitoring/          # Sentry, Prometheus
│
└── integrations/            # Integrações externas
    ├── payment/             # Stripe, Mercado Pago
    ├── nfe/                 # Focus NFe
    ├── whatsapp/            # WhatsApp API
    ├── email/               # SendGrid
    ├── sms/                 # Twilio
    └── dicom/               # Orthanc PACS
```

#### **Responsabilidades**
- Lógica de negócio
- Validação de dados
- Autorização (RBAC)
- Orquestração de serviços
- Comunicação real-time (WebSocket)
- Processamento assíncrono (filas)

---

### 3. **Camada de Dados**

Armazenamento persistente e cache.

#### **PostgreSQL 16** (Banco Principal)
- **Estratégia:** Schema-per-Tenant
- **Estrutura:**
  ```
  Database: zoapets
    ├── Schema: public (global data)
    │   ├── hospitals
    │   ├── tenants
    │   ├── subscriptions
    │   └── global_users
    │
    ├── Schema: tenant_1 (Hospital A)
    │   ├── users
    │   ├── pets
    │   ├── internacoes
    │   ├── medicamentos
    │   ├── prescricoes
    │   └── ...
    │
    ├── Schema: tenant_2 (Hospital B)
    │   └── ... (mesmas tabelas)
    │
    └── Schema: tenant_N
        └── ...
  ```
- **Vantagens:**
  - Isolamento total de dados
  - Performance superior
  - Backups independentes
  - Compliance (LGPD/CFMV)

#### **Redis** (Cache + Sessões + Jobs)
- Cache de queries frequentes
- Sessões de usuário
- Rate limiting
- Locks distribuídos
- Backend para BullMQ

#### **MinIO / AWS S3** (Object Storage)
- Imagens de pets
- Documentos (PDFs)
- Imagens DICOM
- Receitas e laudos assinados
- Backups

#### **Orthanc** (PACS - Picture Archiving)
- Servidor DICOM open-source
- Armazenamento de exames de imagem
- Integração via REST API
- Viewer integrado

---

### 4. **Camada de Integrações**

Serviços externos essenciais para funcionalidades avançadas.

| Integração | Provedor | Finalidade |
|------------|----------|------------|
| **Pagamentos** | Stripe, Mercado Pago | Billing recorrente, checkout |
| **Nota Fiscal** | Focus NFe | Emissão NFe/NFSe |
| **WhatsApp** | WhatsApp Business API | Notificações e atendimento |
| **Email** | SendGrid, AWS SES | Emails transacionais |
| **SMS** | Twilio | Alertas críticos |
| **Push Notifications** | Firebase FCM | Notificações mobile |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Google Analytics, Mixpanel | Métricas de produto |

---

## Padrões Arquiteturais

### **Clean Architecture**

Separação em camadas concêntricas:

```
┌─────────────────────────────────────┐
│        Controllers (HTTP)           │  ← Camada de Interface
├─────────────────────────────────────┤
│         Use Cases                   │  ← Lógica de Aplicação
├─────────────────────────────────────┤
│     Entities (Domain Models)        │  ← Lógica de Domínio
├─────────────────────────────────────┤
│  Infrastructure (DB, Cache, APIs)   │  ← Camada de Dados
└─────────────────────────────────────┘
```

**Benefícios:**
- Testabilidade alta
- Baixo acoplamento
- Fácil manutenção
- Independência de frameworks

### **Domain-Driven Design (DDD)**

Modelagem orientada ao domínio hospitalar veterinário.

**Bounded Contexts:**
- **Internações:** Pet, Internação, Evolução
- **RAEM:** Medicamento, Prescrição, Administração
- **Farmácia:** Estoque, Lote, Movimentação
- **Financeiro:** Plano, Assinatura, Pagamento

### **Event-Driven (Futuro)**

Comunicação assíncrona via eventos para desacoplamento.

**Eventos Exemplo:**
- `PetInternado`
- `MedicamentoAdministrado`
- `PrescricaoAlterada`
- `PagamentoRecebido`

---

## Fluxos Principais

### **Fluxo 1: Autenticação Multi-Tenant**

```
1. Usuário acessa: app.zoapets.com
2. Entra com email + senha
3. Backend:
   - Valida credenciais
   - Identifica tenant do usuário
   - Gera JWT com { userId, tenantId, roles }
4. Frontend armazena JWT em memória
5. Todas as requisições incluem header:
   Authorization: Bearer <JWT>
6. Backend extrai tenantId do JWT
7. SET search_path TO tenant_{id};
8. Query roda no schema correto
```

### **Fluxo 2: Prescrição de Medicamento**

```
1. Médico acessa prontuário do pet internado
2. Clica em "Prescrever Medicamento"
3. Seleciona medicamento, dose, frequência
4. Submete prescrição
5. Backend:
   - Valida permissão (RBAC)
   - Cria registro em 'prescricoes'
   - Gera automaticamente horários de administração
   - Cria jobs BullMQ para alertas
   - Emite evento WebSocket: 'nova-prescricao'
6. Painel de enfermagem atualiza em real-time
7. No horário correto, BullMQ dispara alerta
8. Enfermeiro administra e registra (RAEM)
9. Log de auditoria criado automaticamente
```

### **Fluxo 3: Real-Time Dashboard**

```
1. Enfermeiro abre dashboard
2. Frontend conecta WebSocket:
   socket.emit('join-dashboard', { tenantId })
3. Backend adiciona socket ao room: 'tenant:123'
4. Quando algo muda (nova internação, alta, etc):
   - Backend emite evento:
     io.to('tenant:123').emit('dashboard-update', data)
5. Frontend recebe evento e atualiza UI
6. Sem necessidade de refresh manual
```

---

## Segurança

### **Autenticação**
- JWT (access token 15min, refresh token 7 dias)
- Refresh token rotation
- httpOnly cookies (proteção XSS)
- 2FA/TOTP para usuários críticos

### **Autorização**
- RBAC (Role-Based Access Control)
- Permissions granulares por recurso
- Validação em controllers + guards

### **Multi-Tenancy**
- Schema-per-tenant (isolamento total)
- Tenant context em todas as queries
- Middleware de validação de tenant

### **Criptografia**
- TLS 1.3 (HTTPS obrigatório)
- Bcrypt para senhas (10 rounds)
- AES-256 para dados sensíveis em repouso
- Database encryption (RDS)

### **Compliance**
- LGPD: Logs de acesso, consentimento, right to erasure
- CFMV: Prontuário eletrônico auditável
- PCI-DSS: Tokenização de cartões (Stripe)

---

## Escalabilidade

### **Horizontal Scaling**
- Backend stateless (pode escalar infinitamente)
- Load balancer (NGINX / AWS ALB)
- Redis Sentinel (HA)
- PostgreSQL read replicas

### **Vertical Scaling**
- Otimização de queries (índices, explain analyze)
- Connection pooling
- Caching agressivo (Redis)

### **Auto-Scaling (Futuro)**
- Kubernetes HPA (Horizontal Pod Autoscaler)
- Métricas: CPU > 70%, requests/s > threshold

---

## Observabilidade

### **Logging**
- Winston (structured logs JSON)
- Níveis: error, warn, info, debug
- Correlation ID para rastreamento
- Grafana Loki / ELK (agregação)

### **Monitoring**
- Prometheus (métricas)
- Grafana (dashboards)
- Alertas (CPU, RAM, disk, errors)

### **Error Tracking**
- Sentry (stack traces, breadcrumbs)
- Alertas críticos (Slack, Email)

### **APM (Future)**
- New Relic / Datadog
- Distributed tracing

---

## Deployment

### **Ambientes**

| Ambiente | Objetivo | Deployment |
|----------|----------|------------|
| **Development** | Dev local | Docker Compose |
| **Staging** | QA/Testes | Vercel + Railway |
| **Production** | Clientes reais | AWS/Azure (K8s/ECS) |

### **CI/CD Pipeline**

```
GitHub Push
    ↓
GitHub Actions
    ↓
┌───────────┐
│ Lint      │
│ Type Check│
│ Unit Tests│
└─────┬─────┘
      ↓
┌───────────┐
│ Build     │
│ Docker    │
└─────┬─────┘
      ↓
┌───────────┐
│ Integration│
│ Tests      │
└─────┬─────┘
      ↓
┌───────────┐
│ Deploy    │
│ Staging   │
└─────┬─────┘
      ↓
  Manual Approval
      ↓
┌───────────┐
│ Deploy    │
│ Production│
└───────────┘
```

---

## Performance Targets

| Métrica | Target | Medição |
|---------|--------|---------|
| **API Response Time** | p95 < 200ms | Prometheus |
| **Page Load** | < 3s (First Contentful Paint) | Lighthouse |
| **WebSocket Latency** | < 100ms | Custom metrics |
| **Database Queries** | < 50ms (p95) | PostgreSQL logs |
| **Uptime** | 99.9% | UptimeRobot |

---

## Disaster Recovery

### **Backup Strategy**
- PostgreSQL: Automated daily backups (retention 30 days)
- S3: Versioning enabled + lifecycle policies
- Redis: AOF persistence + snapshots

### **RTO/RPO**
- **RTO (Recovery Time Objective):** < 4 hours
- **RPO (Recovery Point Objective):** < 1 hour

### **Failover**
- Database: Multi-AZ deployment
- Redis: Sentinel (automatic failover)
- Application: Load balancer health checks

---

## Próximos Passos

1. ✅ Arquitetura de alto nível definida
2. ⏭️ Detalhar arquitetura do backend (NestJS)
3. ⏭️ Detalhar arquitetura do frontend (Next.js)
4. ⏭️ Detalhar arquitetura mobile (React Native)
5. ⏭️ Especificar multi-tenancy implementation
6. ⏭️ Documentar comunicação real-time (WebSocket)
7. ⏭️ Documentar sistema de filas (BullMQ)

---

**Versão:** 1.0
**Data:** 2025-10-19
**Revisado por:** Equipe de Arquitetura
