# Documentação Técnica - Zoa Pets Sistema Hospitalar

## Sobre este Repositório

Esta é a **documentação técnica completa** do Sistema Hospitalar Zoa Pets, um SaaS enterprise-grade para gestão de hospitais veterinários.

**Versão:** 1.0
**Última Atualização:** 2025-10-19
**Status:** 🔨 Em Desenvolvimento

---

## Navegação Rápida

### 📋 Para Começar
- [Escopo do Projeto](./escopo.md) - Visão completa das funcionalidades
- [Stack Tecnológica](./01-visao-geral/stack-tecnologica.md) - Tecnologias escolhidas
- [Decisões Arquiteturais (ADRs)](./01-visao-geral/decisoes-arquiteturais.md) - Por que escolhemos cada tecnologia
- [Roadmap](./01-visao-geral/roadmap-desenvolvimento.md) - Fases de desenvolvimento (12 meses)

### 🏗️ Arquitetura
- [Visão Geral da Arquitetura](./02-arquitetura/visao-geral.md) - Diagramas e camadas do sistema

### 💾 Banco de Dados
- [DER Completo](./03-banco-de-dados/der-completo.md) - Todas as ~70 tabelas documentadas

###  🔒 Segurança
- Autenticação JWT + RBAC (a criar)
- Compliance LGPD/CFMV (a criar)

### 🔌 Integrações
- Stripe/Mercado Pago (a criar)
- WhatsApp Business (a criar)
- DICOM/PACS (a criar)
- Nota Fiscal (a criar)

### 🎨 UX/Design
- Design System (a criar)
- User Flows (a criar)

### 📡 APIs
- Padrões REST (a criar)
- OpenAPI/Swagger (a criar)

### 📝 Requisitos Funcionais
- [RF-01: Painel Interno](#) (a criar)
- [RF-02: RAEM (Medicamentos)](#) (a criar)
- ... 13 módulos restantes

### 💼 SaaS
- Planos e Pricing (a criar)
- Billing Recorrente (a criar)
- Onboarding (a criar)

### 👨‍💻 Desenvolvimento
- Setup do Ambiente (a criar)
- Git Workflow (a criar)
- Code Style Guide (a criar)

---

## Estrutura da Documentação

```
docs/
├── README.md (você está aqui)
├── escopo.md ✅
│
├── 01-visao-geral/
│   ├── stack-tecnologica.md ✅
│   ├── decisoes-arquiteturais.md ✅
│   └── roadmap-desenvolvimento.md ✅
│
├── 02-arquitetura/
│   ├── visao-geral.md ✅
│   ├── backend-nestjs.md (a criar)
│   ├── frontend-nextjs.md (a criar)
│   ├── mobile-react-native.md (a criar)
│   ├── multi-tenant.md (a criar)
│   ├── real-time.md (a criar)
│   └── message-queue.md (a criar)
│
├── 03-banco-de-dados/
│   ├── der-completo.md ✅
│   ├── schema-core.md (a criar)
│   ├── schema-clinico.md (a criar)
│   ├── schema-raem.md (a criar)
│   ├── schema-financeiro.md (a criar)
│   ├── migrations.md (a criar)
│   └── otimizacoes.md (a criar)
│
├── 04-seguranca/
│   ├── autenticacao.md (a criar)
│   ├── rbac.md (a criar)
│   ├── criptografia.md (a criar)
│   ├── lgpd.md (a criar)
│   ├── cfmv.md (a criar)
│   └── pci-dss.md (a criar)
│
├── 05-integracoes/
│   ├── pagamentos.md (a criar)
│   ├── nota-fiscal.md (a criar)
│   ├── whatsapp.md (a criar)
│   ├── email-sms.md (a criar)
│   ├── dicom-pacs.md (a criar)
│   └── webhooks.md (a criar)
│
├── 06-ux-design/
│   ├── design-system.md (a criar)
│   ├── wireframes.md (a criar)
│   ├── user-flows.md (a criar)
│   ├── responsividade.md (a criar)
│   └── acessibilidade.md (a criar)
│
├── 07-apis/
│   ├── padroes-rest.md (a criar)
│   ├── versionamento.md (a criar)
│   ├── error-handling.md (a criar)
│   ├── rate-limiting.md (a criar)
│   └── openapi.md (a criar)
│
├── 08-requisitos-funcionais/
│   ├── rf-01-painel-interno.md (a criar)
│   ├── rf-02-raem.md (a criar)
│   ├── rf-03-pacs-dicom.md (a criar)
│   ├── rf-04-pops.md (a criar)
│   ├── rf-05-farmacia.md (a criar)
│   ├── rf-06-rastreabilidade.md (a criar)
│   ├── rf-07-equipamentos.md (a criar)
│   ├── rf-08-documentos.md (a criar)
│   ├── rf-09-auditoria.md (a criar)
│   ├── rf-10-relatorios.md (a criar)
│   ├── rf-11-convenios.md (a criar)
│   ├── rf-12-saas.md (a criar)
│   ├── rf-13-financeiro.md (a criar)
│   ├── rf-14-marketing.md (a criar)
│   └── rf-15-app-tutor.md (a criar)
│
├── 09-saas/
│   ├── planos-pricing.md (a criar)
│   ├── feature-flags.md (a criar)
│   ├── onboarding.md (a criar)
│   ├── billing.md (a criar)
│   └── tenant-provisioning.md (a criar)
│
├── 10-desenvolvimento/
│   ├── setup-ambiente.md (a criar)
│   ├── estrutura-repos.md (a criar)
│   ├── git-workflow.md (a criar)
│   ├── code-style.md (a criar)
│   ├── naming-conventions.md (a criar)
│   └── code-review.md (a criar)
│
├── 11-qualidade/
│   ├── testes.md (a criar)
│   ├── ci-cd.md (a criar)
│   └── performance.md (a criar)
│
└── 12-infraestrutura/
    ├── docker.md (a criar)
    ├── variaveis-ambiente.md (a criar)
    ├── monitoramento.md (a criar)
    ├── logs.md (a criar)
    └── backup-recovery.md (a criar)
```

---

## Resumo Executivo

### O Projeto

**Zoa Pets** é um sistema SaaS completo para gestão hospitalar veterinária, composto por:

1. **Web App (PWA)** - Next.js para equipe interna do hospital
2. **Mobile App** - React Native para tutores dos pets
3. **Backend API** - NestJS com arquitetura multi-tenant
4. **Infraestrutura** - PostgreSQL + Redis + AWS S3

### Principais Funcionalidades

- ✅ **Painel Interno:** Dashboard de internações em tempo real
- ✅ **RAEM:** Prescrição e administração eletrônica de medicamentos
- ✅ **Prontuário Eletrônico:** Completo e auditável (CFMV)
- ✅ **Farmácia:** Controle de estoque com lote/validade
- ✅ **POPs Digitais:** Checklists e procedimentos operacionais
- ✅ **Rastreabilidade:** Sangue, amostras e cadeia de custódia
- ✅ **Equipamentos:** Gestão e manutenção preventiva
- ✅ **Documentos:** Assinatura digital (simples e ICP-Brasil)
- ✅ **Auditoria:** Logs completos (LGPD compliant)
- ✅ **Relatórios:** Indicadores hospitalares gerenciais
- ✅ **Convênios:** Planos pet e autorizações
- ✅ **SaaS:** Multi-tenant, billing, onboarding
- ✅ **Financeiro:** Contas a receber, pagamentos, NF-e
- ✅ **Marketing:** Campanhas e fidelização
- ✅ **App Tutor:** Acompanhamento do pet, chat, agendamentos

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Backend** | NestJS + TypeScript + Node.js 20 |
| **Database** | PostgreSQL 16 (schema-per-tenant) |
| **Cache** | Redis 7.x |
| **Frontend Web** | Next.js 14 + React 18 + TypeScript |
| **Mobile** | React Native + Expo SDK 51 |
| **Real-time** | WebSockets (Socket.io) + SSE |
| **Jobs** | BullMQ + Redis |
| **Storage** | MinIO (dev) / AWS S3 (prod) |
| **PACS** | Orthanc (DICOM) |
| **Pagamentos** | Stripe + Mercado Pago |
| **NF-e** | Focus NFe |
| **Comunicação** | SendGrid (email), Twilio (SMS), WhatsApp API |
| **Monitoring** | Sentry + Grafana + Prometheus |
| **CI/CD** | GitHub Actions |
| **Cloud** | Vercel + Railway (MVP) → AWS/Azure (prod) |

### Arquitetura Multi-Tenant

Estratégia: **Schema-per-Tenant**
- Cada hospital tem seu próprio schema PostgreSQL
- Isolamento total de dados (segurança e compliance)
- Performance superior a row-level filtering
- Backups independentes por hospital

```
Database: zoapets_production
  ├── Schema: public (SaaS global)
  ├── Schema: tenant_1 (Hospital A)
  ├── Schema: tenant_2 (Hospital B)
  └── Schema: tenant_N...
```

### Roadmap de Desenvolvimento

**Total:** ~12 meses divididos em 6 fases

| Fase | Duração | Entregas |
|------|---------|----------|
| **Fase 0: Fundação** | 1 mês | Setup, CI/CD, auth, multi-tenant |
| **Fase 1: Core MVP** | 2 meses | Internações, pets, tutores, dashboard |
| **Fase 2: Operação Clínica** | 2 meses | RAEM, prontuário eletrônico |
| **Fase 3: Gestão Hospitalar** | 2 meses | POPs, farmácia, rastreabilidade, relatórios |
| **Fase 4: SaaS** | 1.5 meses | Billing, onboarding, pricing |
| **Fase 5: Mobile App** | 2 meses | App nativo para tutores (iOS/Android) |
| **Fase 6: Integrações** | 1.5 meses | DICOM, NF-e, WhatsApp, pagamentos |

**Marco Atual:** Fase 0 - Documentação ✅

---

## Documentação Concluída

### ✅ Documentos Principais (6/72)

1. **[escopo.md](./escopo.md)** - Escopo completo do produto
2. **[stack-tecnologica.md](./01-visao-geral/stack-tecnologica.md)** - Decisões técnicas
3. **[decisoes-arquiteturais.md](./01-visao-geral/decisoes-arquiteturais.md)** - 11 ADRs documentados
4. **[roadmap-desenvolvimento.md](./01-visao-geral/roadmap-desenvolvimento.md)** - 6 fases detalhadas
5. **[visao-geral.md](./02-arquitetura/visao-geral.md)** - Arquitetura completa do sistema
6. **[der-completo.md](./03-banco-de-dados/der-completo.md)** - ~70 tabelas mapeadas

### 📊 Progresso Geral

```
Categoria                  Status
========================   ======
Visão Geral (3/3)          ████████████████████ 100%
Arquitetura (1/7)          ███░░░░░░░░░░░░░░░░░  14%
Banco de Dados (1/8)       ██░░░░░░░░░░░░░░░░░░  13%
Segurança (0/6)            ░░░░░░░░░░░░░░░░░░░░   0%
Integrações (0/6)          ░░░░░░░░░░░░░░░░░░░░   0%
UX/Design (0/5)            ░░░░░░░░░░░░░░░░░░░░   0%
APIs (0/5)                 ░░░░░░░░░░░░░░░░░░░░   0%
Requisitos Func (0/15)     ░░░░░░░░░░░░░░░░░░░░   0%
SaaS (0/5)                 ░░░░░░░░░░░░░░░░░░░░   0%
Desenvolvimento (0/6)      ░░░░░░░░░░░░░░░░░░░░   0%
Qualidade (0/3)            ░░░░░░░░░░░░░░░░░░░░   0%
Infraestrutura (0/5)       ░░░░░░░░░░░░░░░░░░░░   0%
------------------------
TOTAL (6/72)               ██░░░░░░░░░░░░░░░░░░   8%
```

---

## Como Usar Esta Documentação

### Para Desenvolvedores

1. **Começar:** Leia o [Escopo](./escopo.md) e a [Stack Tecnológica](./01-visao-geral/stack-tecnologica.md)
2. **Entender Arquitetura:** [Visão Geral](./02-arquitetura/visao-geral.md)
3. **Banco de Dados:** [DER Completo](./03-banco-de-dados/der-completo.md)
4. **Implementar:** Consulte os Requisitos Funcionais específicos (quando disponíveis)

### Para Product Owners

1. **Funcionalidades:** [Escopo](./escopo.md)
2. **Timeline:** [Roadmap](./01-visao-geral/roadmap-desenvolvimento.md)
3. **SaaS:** Documentação da seção 09-saas/ (quando disponível)

### Para Arquitetos

1. **Decisões Técnicas:** [ADRs](./01-visao-geral/decisoes-arquiteturais.md)
2. **Arquitetura:** [Visão Geral](./02-arquitetura/visao-geral.md)
3. **Multi-Tenancy:** Seção específica no DER e arquitetura

---

## Decisões Arquiteturais Chave

Ver [decisoes-arquiteturais.md](./01-visao-geral/decisoes-arquiteturais.md) para detalhes completos.

1. **ADR-001:** NestJS + TypeScript (Backend)
2. **ADR-002:** Schema-per-Tenant (Multi-tenancy)
3. **ADR-003:** PostgreSQL (Database)
4. **ADR-004:** Next.js + React (Frontend Web)
5. **ADR-005:** React Native + Expo (Mobile)
6. **ADR-006:** WebSocket + SSE (Real-time)
7. **ADR-007:** BullMQ + Redis (Message Queue)
8. **ADR-008:** Multi-Repo (Organização de código)
9. **ADR-009:** JWT + RBAC (Auth)
10. **ADR-010:** MinIO/S3 (Storage)
11. **ADR-011:** Sentry + Grafana (Observability)

---

## Modelo de Dados

### Entidades Principais

**Schema PUBLIC (SaaS Global):**
- tenants (hospitais)
- subscriptions (assinaturas)
- plans (planos)
- feature_flags

**Schema TENANT_XXX (Por Hospital) - ~70 tabelas:**

#### Core
- users, roles, permissions, audit_logs

#### Clínico
- tutores, pets, internacoes, prontuarios, evolucoes, exames

#### RAEM (Medicamentos)
- medicamentos, prescricoes, prescricao_itens, administracoes

#### Farmácia
- produtos, lotes, estoque, movimentacoes, dispensacoes

#### POPs
- pops, checklist_templates, checklist_itens, execucoes_checklist

#### Rastreabilidade
- amostras, bolsas_sangue, custodia_eventos

#### Equipamentos
- equipamentos, calibracoes, manutencoes

#### Documentos
- documentos, templates_documentos, assinaturas_digitais

#### Convênios
- convenios, planos_pet, autorizacoes, repasses

#### Financeiro
- contas_receber, pagamentos, notas_fiscais

#### Marketing
- campanhas, segmentos, disparos, fidelidade_pontos

#### DICOM/PACS
- estudos_dicom, series, laudos

Ver [der-completo.md](./03-banco-de-dados/der-completo.md) para detalhes.

---

## Próximos Passos

### Documentação Pendente (Alta Prioridade)

1. **Arquitetura Backend (NestJS):** Estrutura de módulos, camadas, DI
2. **Arquitetura Frontend (Next.js):** Estrutura de pastas, rotas, estado
3. **Schema Core:** Detalhamento de users, roles, permissions
4. **Schema Clínico:** Pets, internações, prontuário
5. **Autenticação:** JWT implementation, RBAC
6. **RF-01 a RF-15:** Requisitos funcionais detalhados de cada módulo
7. **Design System:** Componentes, tokens, guidelines
8. **Setup Ambiente:** Docker Compose, variáveis, scripts

### Implementação (Após Documentação)

1. **Fase 0:** Setup dos 3 repositórios
2. **Fase 0:** Docker Compose (PostgreSQL, Redis, MinIO)
3. **Fase 0:** CI/CD (GitHub Actions)
4. **Fase 0:** Auth + RBAC + Multi-tenant
5. **Fase 1:** CRUD de pets e internações
6. **Fase 1:** Dashboard em tempo real

---

## Contribuindo

### Para Adicionar Documentação

1. Crie o arquivo na pasta apropriada (ex: `04-seguranca/lgpd.md`)
2. Use o template padrão:
   ```markdown
   # Título do Documento

   ## Visão Geral
   [Descrição]

   ## [Seções Relevantes]

   ---
   **Versão:** 1.0
   **Data:** YYYY-MM-DD
   ```
3. Atualize este README adicionando o link

### Padrões de Documentação

- **Formato:** Markdown (.md)
- **Linguagem:** Português (código em inglês)
- **Diagramas:** ASCII art ou Mermaid
- **Código:** Syntax highlighting apropriado
- **Versionamento:** Incluir versão e data no rodapé

---

## Suporte

**Equipe Técnica Zoa Pets**
Email: dev@zoapets.com
Slack: #zoapets-dev

---

## Licença

Documentação proprietária © 2025 Zoa Pets
Uso restrito à equipe de desenvolvimento.

---

**Última Atualização:** 2025-10-19
**Versão da Documentação:** 1.0
**Status do Projeto:** 🔨 Fase 0 - Fundação e Documentação
