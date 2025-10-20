# Stack Tecnológica - Zoa Pets Sistema Hospitalar

## Visão Geral

Este documento define a stack tecnológica completa do **Sistema Hospitalar Zoa Pets**, um SaaS enterprise-grade voltado para hospitais veterinários.

---

## 1. Backend

### Framework Principal
**NestJS + TypeScript**

**Justificativa:**
- Framework Node.js maduro e enterprise-ready
- TypeScript nativo (type-safety em todo o código)
- Arquitetura modular e escalável (inspirada em Angular)
- Decorators e Dependency Injection integrados
- Suporte robusto a microservices
- Comunidade ativa e documentação excelente
- Integração nativa com TypeORM, Prisma, Bull, etc.

**Versão:** NestJS 10.x + TypeScript 5.x + Node.js 20.x LTS

### Banco de Dados
**PostgreSQL 16**

**Justificativa:**
- Banco relacional robusto e ACID compliant
- Suporte a JSONB (flexibilidade quando necessário)
- Recursos avançados (CTEs, Window Functions, Full-Text Search)
- Excelente para multi-tenancy (schema-per-tenant)
- Performance superior para cargas complexas
- Compliance com LGPD e CFMV (auditoria, logs)
- Extensões úteis: PostGIS (se precisar geolocalização), pg_cron, etc.

**ORM:** TypeORM ou Prisma (decisão a ser feita na implementação)

### Cache e Sessões
**Redis 7.x**

**Justificativa:**
- Cache de alta performance
- Gerenciamento de sessões
- Pub/Sub para real-time features
- Backend para BullMQ (message queue)
- Rate limiting
- TTL automático para dados temporários

---

## 2. Frontend Web (PWA)

### Framework
**Next.js 14+ (App Router) + React 18 + TypeScript**

**Justificativa:**
- SSR/SSG para performance superior
- React Server Components (RSC)
- Mesma linguagem do backend (TypeScript)
- SEO excelente (landing pages comerciais do SaaS)
- PWA support nativo e robusto
- Edge Functions e ISR (Incremental Static Regeneration)
- File-based routing intuitivo
- API Routes integradas
- Deploy fácil na Vercel (ou self-hosted)

**Versão:** Next.js 14.x + React 18.x + TypeScript 5.x

### Estado e Gerenciamento
**Zustand + React Query (TanStack Query)**

**Justificativa:**
- **Zustand:** State management simples e performático (menor que Redux)
- **React Query:** Gerenciamento de server state (cache, refetch, optimistic updates)
- Separação clara entre UI state (Zustand) e server state (React Query)

### UI Components
**shadcn/ui + Tailwind CSS + Radix UI**

**Justificativa:**
- **shadcn/ui:** Componentes copiáveis (não biblioteca NPM), altamente customizáveis
- **Tailwind CSS:** Utility-first, rápido desenvolvimento, design consistente
- **Radix UI:** Componentes acessíveis (WCAG compliant) unstyled
- Dark mode nativo
- Design tokens para white-label

### Real-time
**Socket.io (WebSocket) + Server-Sent Events (SSE)**

**Justificativa:**
- **WebSocket (Socket.io):** Dashboard em tempo real, chat, notificações críticas
- **SSE:** Notificações não-críticas, updates de status (mais leve que WebSocket)
- Fallback automático para polling se necessário

---

## 3. Mobile (App Tutor)

### Framework
**React Native 0.74+ + Expo SDK 51+**

**Justificativa:**
- **Cross-platform:** iOS e Android com único codebase
- **Mesma stack:** TypeScript + React (equipe única)
- **Expo:** Simplifica builds, notificações push, OTA updates
- **UX Nativa:** Não é webview, usa componentes nativos
- **Manutenção 70% mais fácil** que Swift + Kotlin separados
- **Usado por apps médicos:** Practo, Zocdoc, KRY

**Versão:** React Native 0.74 + Expo SDK 51

### Navegação
**React Navigation 6.x**

**Justificativa:**
- Padrão da comunidade React Native
- Navegação nativa performática
- Deep linking support
- State persistence

### Estado
**Zustand + React Query**

**Justificativa:**
- Consistência com web (mesma abordagem)
- Sincronização offline-first
- React Query com persistência local

### Notificações Push
**Expo Notifications + FCM (Firebase Cloud Messaging)**

**Justificativa:**
- Expo facilita configuração cross-platform
- FCM gratuito e confiável
- Suporte a notificações ricas (imagens, ações)

---

## 4. Message Queue e Jobs Assíncronos

### Sistema de Filas
**BullMQ + Redis**

**Justificativa:**
- Integração nativa com NestJS (@nestjs/bull)
- Processamento assíncrono confiável
- Retry automático e dead-letter queue
- Scheduled jobs (cron-like)
- UI para monitoramento (Bull Dashboard)
- Perfect para:
  - Envio de emails/SMS/WhatsApp
  - Geração de relatórios PDF/Excel
  - Processamento de imagens DICOM
  - Alertas de vencimento de medicamentos
  - Backup e sincronização

---

## 5. Armazenamento de Arquivos

### Object Storage
**AWS S3 / MinIO (self-hosted)**

**Justificativa:**
- **AWS S3:** Padrão de mercado, altamente confiável
- **MinIO:** Alternativa open-source S3-compatible (reduz custos)
- Armazenamento de:
  - Imagens DICOM
  - Laudos em PDF
  - Documentos assinados
  - Fotos de pets
  - Receitas e atestados

**Estratégia:** MinIO para desenvolvimento/staging, S3 para produção

---

## 6. Autenticação e Autorização

### Estratégia
**JWT (Access + Refresh Tokens) + RBAC**

**Justificativa:**
- **JWT:** Stateless, escalável, cross-platform
- **Access Token:** Curta duração (15 min)
- **Refresh Token:** Longa duração (7 dias), stored httpOnly cookie
- **RBAC:** Role-Based Access Control granular
  - Roles: Admin, Médico, Enfermeiro, Recepção, Farmácia, Tutor
  - Permissions: Por módulo e ação (create, read, update, delete)

### 2FA/MFA
**TOTP (Time-based OTP) via Authenticator Apps**

**Justificativa:**
- Segurança adicional para usuários críticos (médicos, admin)
- Padrão: Google Authenticator, Authy, 1Password
- Library: `speakeasy` ou `otplib`

---

## 7. Observabilidade

### Logging
**Winston (backend) + Pino (opcional)**

**Justificativa:**
- Winston: Flexível, múltiplos transports
- Structured logging (JSON)
- Níveis: error, warn, info, debug
- Transports: Console (dev), File, CloudWatch/Datadog (prod)

### Monitoramento e APM
**Sentry (Errors) + Grafana + Prometheus (Metrics)**

**Justificativa:**
- **Sentry:** Error tracking, stack traces, alertas
- **Prometheus:** Métricas de sistema (CPU, RAM, requests)
- **Grafana:** Dashboards customizados
- **Alternativa:** New Relic ou Datadog (mais caro, mais features)

### Logs Centralizados
**Elasticsearch + Kibana (ELK) ou Grafana Loki**

**Justificativa:**
- Agregação de logs de todos os serviços
- Busca e análise rápida
- Alertas customizados
- Loki: Mais leve e barato que ELK

---

## 8. Infraestrutura e Deploy

### Containers
**Docker + Docker Compose**

**Justificativa:**
- Ambientes consistentes (dev, staging, prod)
- Isolamento de dependências
- Fácil replicação e escalabilidade
- CI/CD simplificado

### Orquestração (Futuro)
**Kubernetes (K8s) ou AWS ECS**

**Justificativa:**
- **Kubernetes:** Auto-scaling, self-healing, padrão de mercado
- **AWS ECS:** Mais simples, menos overhead, integrado com AWS
- **Decisão:** Começar com Docker Compose, migrar para K8s quando atingir escala

### Cloud Provider

**Fase 1 (MVP):** Vercel (frontend) + Railway/Render (backend + DB)
- Baixo custo inicial
- Deploy automático
- SSL grátis
- Fácil configuração

**Fase 2 (Produção):** AWS ou Azure
- **AWS:** Líder de mercado, mais serviços, compliance robusto
- **Azure:** Excelente para empresas, compliance forte (saúde)
- Serviços core:
  - EC2/ECS (compute)
  - RDS PostgreSQL (database)
  - ElastiCache Redis (cache)
  - S3 (storage)
  - CloudFront (CDN)
  - SES (email)
  - SNS/SQS (mensageria)
  - CloudWatch (logs/metrics)

### CI/CD
**GitHub Actions**

**Justificativa:**
- Integrado com repositório
- Runners gratuitos (2000 min/mês)
- Workflows customizáveis
- Matrix builds (multi-env)
- Secrets management

**Pipeline:**
1. Lint + Type Check
2. Unit Tests
3. Build
4. Integration Tests
5. Deploy (staging → production)

---

## 9. Integrações Externas

### Pagamentos
**Stripe (internacional) + Mercado Pago/PagSeguro (Brasil)**

**Justificativa:**
- Stripe: Melhor DX, webhooks confiáveis, billing recorrente
- Mercado Pago/PagSeguro: Popular no Brasil, aceita boleto e Pix
- PCI-DSS compliance out-of-the-box

### Nota Fiscal Eletrônica
**Focus NFe ou eNotas**

**Justificativa:**
- API REST moderna
- NFe e NFSe
- Suporte a múltiplos municípios
- Webhooks para status
- Armazenamento e backup

### Comunicação
- **Email:** SendGrid ou AWS SES
- **SMS:** Twilio ou AWS SNS
- **WhatsApp:** WhatsApp Business API oficial (Meta)

### DICOM/PACS
**Protocolo DICOM padrão + Orthanc (open-source PACS)**

**Justificativa:**
- Orthanc: PACS leve e gratuito
- REST API para integração
- DICOM Web (WADO, QIDO, STOW)
- Plugins para PostgreSQL

---

## 10. Segurança

### HTTPS/TLS
**Let's Encrypt + CloudFlare (CDN + WAF)**

**Justificativa:**
- SSL grátis e automático
- CloudFlare: DDoS protection, WAF, cache global

### Criptografia
- **Em trânsito:** TLS 1.3
- **Em repouso:** AES-256 (RDS encryption, S3 encryption)
- **Dados sensíveis:** bcrypt (senhas), crypto-js (campos específicos)

### Compliance
- **LGPD:** Logs de acesso, consentimento, direito ao esquecimento
- **CFMV:** Prontuário eletrônico, assinatura digital
- **PCI-DSS:** Tokenização de cartões (Stripe/Mercado Pago)

---

## 11. Ferramentas de Desenvolvimento

### IDE Recomendada
**VS Code** com extensões:
- ESLint
- Prettier
- TypeScript
- Prisma/TypeORM
- Docker
- GitLens
- REST Client

### Controle de Versão
**Git + GitHub**

**Estratégia de Branches:**
- `main`: Produção
- `staging`: Homologação
- `develop`: Desenvolvimento
- `feature/*`: Features
- `hotfix/*`: Correções urgentes

### Code Quality
- **Linter:** ESLint + Prettier
- **Type Check:** TypeScript strict mode
- **Pre-commit:** Husky + lint-staged
- **Code Review:** GitHub Pull Requests obrigatórios

---

## 12. Versionamento da Stack

| Componente | Versão | Update Policy |
|------------|--------|---------------|
| Node.js | 20.x LTS | Seguir LTS releases |
| TypeScript | 5.x | Minor updates trimestrais |
| NestJS | 10.x | Minor updates mensais |
| PostgreSQL | 16.x | Major updates anuais |
| Redis | 7.x | Minor updates semestrais |
| Next.js | 14.x | Seguir stable releases |
| React | 18.x | Major updates com cautela |
| React Native | 0.74+ | Atualizar com Expo |
| Expo | 51+ | Seguir SDK releases |

---

## 13. Decisões Arquiteturais Chave

### Multi-Tenancy
**Schema-per-Tenant**

**Justificativa:**
- Bom equilíbrio entre isolamento e custo
- Cada hospital tem seu próprio schema PostgreSQL
- Dados completamente isolados
- Migrations gerenciadas por tenant
- Performance superior a row-level

### Monorepo vs Multi-repo
**Multi-repo (3 repositórios)**

**Justificativa:**
- `zoapets-backend`: NestJS
- `zoapets-web`: Next.js
- `zoapets-mobile`: React Native + Expo
- **Vantagens:** Deploy independente, CI/CD mais rápido, separação clara
- **Desvantagens:** Código compartilhado via NPM packages

**Alternativa futura:** Nx monorepo ou Turborepo se precisar compartilhar muito código

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zoa Pets SaaS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web PWA   │  │  Mobile App  │  │  Integrações         │  │
│  │             │  │              │  │  - Pagamento         │  │
│  │  Next.js    │  │ React Native │  │  - Nota Fiscal       │  │
│  │  + React    │  │  + Expo      │  │  - WhatsApp/Email    │  │
│  │  + TS       │  │  + TS        │  │  - DICOM/PACS        │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                │                                      │
│         └────────┬───────┘                                      │
│                  │                                              │
│         ┌────────▼────────┐                                     │
│         │   Backend API   │                                     │
│         │                 │                                     │
│         │    NestJS       │◄──────► Redis (Cache + Queue)      │
│         │  + TypeScript   │                                     │
│         └────────┬────────┘                                     │
│                  │                                              │
│         ┌────────▼────────┐                                     │
│         │   PostgreSQL    │                                     │
│         │  (Multi-tenant) │                                     │
│         │ Schema-per-Tent │                                     │
│         └─────────────────┘                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Infraestrutura:                                         │  │
│  │  - Docker + K8s/ECS                                      │  │
│  │  - AWS S3 (Storage)                                      │  │
│  │  - CloudFlare (CDN + WAF)                                │  │
│  │  - Sentry + Grafana (Observability)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

1. ✅ Stack tecnológica definida
2. ⏭️ Documentar decisões arquiteturais (ADRs)
3. ⏭️ Criar roadmap de desenvolvimento
4. ⏭️ Modelar arquitetura detalhada
5. ⏭️ Definir estrutura de banco de dados

---

**Versão:** 1.0
**Data:** 2025-10-19
**Autor:** Equipe Técnica Zoa Pets
