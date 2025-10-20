# Roadmap de Desenvolvimento - Zoa Pets

## Vis ão Geral

Este documento apresenta o roadmap completo de desenvolvimento do **Sistema Hospitalar Zoa Pets**, organizado em **6 fases incrementais** com entregas de valor progressivas.

---

## Estratégia de Desenvolvimento

### Princípios
1. **MVP First:** Lançar funcionalidades core rapidamente
2. **Iterativo:** Cada fase entrega valor utilizável
3. **Feedback Loop:** Validar com usuários reais entre fases
4. **Qualidade:** Testes e documentação desde o início
5. **Escalabilidade:** Arquitetura preparada para crescimento

### Metodologia
- **Sprints:** 2 semanas
- **Releases:** Ao final de cada fase
- **Retrospectivas:** Entre fases
- **Demo:** Ao final de cada sprint

---

## Linha do Tempo Estimada

```
Fase 0: Fundação          ████░░░░░░░░░░░░░░ (1 mês)
Fase 1: Core MVP          ░░░░████░░░░░░░░░░ (2 meses)
Fase 2: Operação Clínica  ░░░░░░░░████░░░░░░ (2 meses)
Fase 3: Gestão Hospitalar ░░░░░░░░░░░░████░░ (2 meses)
Fase 4: SaaS & Comercial  ░░░░░░░░░░░░░░░░██ (1.5 meses)
Fase 5: Mobile App Tutor  ░░░░░░░░░░░░░░░░░░ (2 meses)
Fase 6: Integrações Avanç ░░░░░░░░░░░░░░░░░░ (1.5 meses)

TOTAL: ~12 meses (podendo ser paralelizado)
```

---

## FASE 0: Fundação e Infraestrutura 🔧

**Objetivo:** Preparar ambiente de desenvolvimento, CI/CD e arquitetura base.

**Duração:** 4 semanas

### Entregas

#### Semana 1-2: Setup e Arquitetura
- [ ] ✅ Documentação completa (já em progresso)
- [ ] Criar os 3 repositórios (backend, web, mobile)
- [ ] Setup Docker Compose (PostgreSQL, Redis, MinIO)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Definir variáveis de ambiente (.env.example)
- [ ] Modelagem de banco de dados completa
- [ ] Criar migrations iniciais (schema core)

#### Semana 3-4: Base da Aplicação
- [ ] NestJS: Estrutura de módulos, auth, RBAC
- [ ] PostgreSQL: Multi-tenant (schema-per-tenant)
- [ ] Next.js: Setup, design system básico, rotas auth
- [ ] Autenticação JWT (access + refresh tokens)
- [ ] Sistema de permissões RBAC
- [ ] Testes unitários básicos
- [ ] Deploy em staging (Vercel + Railway)

### Critérios de Aceite
- ✅ 3 repositórios criados e CI/CD funcionando
- ✅ Login funcional (web) com multi-tenant
- ✅ DER completo validado
- ✅ Ambiente de desenvolvimento rodando em Docker

---

## FASE 1: Core MVP - Gestão Básica de Internações 🏥

**Objetivo:** Sistema funcional para registrar e acompanhar internações de pets.

**Duração:** 8 semanas

### Entregas

#### Sprint 1-2 (Semanas 1-4): Cadastros Base
**Backend:**
- [ ] CRUD de Hospitais (tenants)
- [ ] CRUD de Usuários (médicos, enfermeiros, recepção)
- [ ] CRUD de Tutores
- [ ] CRUD de Pets (com foto, histórico básico)
- [ ] Sistema de roles e permissions

**Frontend Web:**
- [ ] Tela de Login/Logout
- [ ] Dashboard inicial (vazio ainda)
- [ ] Listagem de pets
- [ ] Cadastro de pet (formulário completo)
- [ ] Perfil do pet (visualização)

#### Sprint 3-4 (Semanas 5-8): Internações
**Backend:**
- [ ] CRUD de Internações
- [ ] Estados de internação (Aguardando, Em andamento, Alta, Óbito)
- [ ] Histórico de eventos na internação
- [ ] WebSocket para updates em tempo real

**Frontend Web:**
- [ ] Dashboard de internações (cards com status)
- [ ] Registrar nova internação
- [ ] Visualizar detalhes da internação
- [ ] Linha do tempo de eventos
- [ ] Filtros (por status, data, médico)
- [ ] Updates em tempo real (WebSocket)

### Critérios de Aceite
- ✅ Médico consegue registrar internação de um pet
- ✅ Dashboard mostra internações em tempo real
- ✅ Sistema multi-tenant funcionando (2+ hospitais isolados)
- ✅ 80%+ cobertura de testes
- ✅ Deploy em produção (beta fechado)

**Milestone:** **MVP Utilizável por 1-2 hospitais piloto**

---

## FASE 2: Operação Clínica - RAEM e Prontuário 💊

**Objetivo:** Prescrição e administração de medicamentos + prontuário eletrônico.

**Duração:** 8 semanas

### Entregas

#### Sprint 5-6 (Semanas 9-12): Prescrição de Medicamentos (RAEM)
**Backend:**
- [ ] CRUD de Medicamentos (catálogo)
- [ ] CRUD de Prescrições
- [ ] Agendamento automático de doses
- [ ] Controle de lote, validade, estoque básico
- [ ] Logs de quem prescreveu/quando

**Frontend Web:**
- [ ] Cadastro de medicamentos
- [ ] Prescrição digital (formulário médico)
- [ ] Painel de enfermagem (doses pendentes)
- [ ] Checagem de administração (RAEM)
- [ ] Alertas visuais de doses atrasadas
- [ ] Histórico de medicação do pet

#### Sprint 7-8 (Semanas 13-16): Prontuário Eletrônico
**Backend:**
- [ ] Prontuário digital (anamnese, exame físico, diagnóstico)
- [ ] Evolução clínica (notas diárias)
- [ ] Anexos (PDFs, imagens)
- [ ] Assinatura digital simples (hash + timestamp)
- [ ] Auditoria (quem editou/quando)

**Frontend Web:**
- [ ] Prontuário completo (aba na internação)
- [ ] Editor de evolução (rich text)
- [ ] Upload de documentos
- [ ] Visualizador de PDFs/imagens
- [ ] Histórico de alterações

### Critérios de Aceite
- ✅ Médico prescreve → Enfermeiro administra → Log completo
- ✅ Prontuário eletrônico completo e auditável
- ✅ Assinatura digital básica funcionando
- ✅ Compliance CFMV (prontuário veterinário)

**Milestone:** **Sistema usável para operação diária de hospitais**

---

## FASE 3: Gestão Hospitalar Completa 📋

**Objetivo:** POPs, farmácia, rastreabilidade, equipamentos, relatórios.

**Duração:** 8 semanas

### Entregas

#### Sprint 9-10 (Semanas 17-20): POPs e Farmácia
**Backend:**
- [ ] CRUD de POPs (Procedimentos Operacionais Padrão)
- [ ] Checklists automáticos por tipo de internação
- [ ] Controle de estoque (entrada, saída, transferência)
- [ ] Alertas de estoque crítico
- [ ] Dispensação vinculada à prescrição
- [ ] Medicamentos controlados (registro especial)

**Frontend Web:**
- [ ] Cadastro de POPs
- [ ] Checklists interativos (durante internação)
- [ ] Gestão de estoque (dashboard, movimentações)
- [ ] Dispensação de medicamentos
- [ ] Alertas de vencimento

#### Sprint 11-12 (Semanas 21-24): Rastreabilidade e Equipamentos
**Backend:**
- [ ] Rastreabilidade de sangue/amostras (QR code)
- [ ] Cadeia de custódia digital
- [ ] CRUD de Equipamentos
- [ ] Calibração e manutenção preventiva
- [ ] Alertas de manutenção

**Frontend Web:**
- [ ] Registro de coleta (amostras/sangue)
- [ ] Leitura de QR code (câmera)
- [ ] Rastreamento completo
- [ ] Gestão de equipamentos
- [ ] Calendário de manutenções
- [ ] Relatórios gerenciais (taxa de ocupação, consumo, etc.)

### Critérios de Aceite
- ✅ Hospital opera 100% dentro do sistema (sem papel)
- ✅ Rastreabilidade completa de amostras
- ✅ Estoque controlado e alertas funcionando
- ✅ Relatórios gerenciais disponíveis

**Milestone:** **Sistema Hospitalar Completo**

---

## FASE 4: SaaS e Comercialização 💰

**Objetivo:** Transformar em SaaS comercializável (billing, onboarding, marketing).

**Duração:** 6 semanas

### Entregas

#### Sprint 13-14 (Semanas 25-28): Billing e Planos
**Backend:**
- [ ] Sistema de planos (Básico, Pro, Enterprise)
- [ ] Feature flags por plano
- [ ] Integração com Stripe (billing recorrente)
- [ ] Webhooks de pagamento
- [ ] Trial period (14 dias)
- [ ] Downgrade/Upgrade de plano

**Frontend Web:**
- [ ] Página de pricing (pública)
- [ ] Checkout de plano
- [ ] Painel de assinatura (cliente)
- [ ] Histórico de faturas
- [ ] Painel admin (gerenciar tenants)

#### Sprint 15 (Semanas 29-30): Onboarding e Marketing
**Backend:**
- [ ] Onboarding automatizado (signup → tenant criado)
- [ ] Email transacional (boas-vindas, confirmação)
- [ ] Sistema de campanhas (email marketing)

**Frontend Web:**
- [ ] Onboarding flow (signup → tour guiado)
- [ ] Landing page comercial (SEO otimizado)
- [ ] Documentação pública (help center)
- [ ] Sistema de suporte (tickets)

### Critérios de Aceite
- ✅ Qualquer hospital pode se cadastrar e começar trial
- ✅ Billing recorrente funcionando automaticamente
- ✅ Onboarding completo em <5 minutos
- ✅ Landing page profissional e conversiva

**Milestone:** **SaaS Comercializável**

---

## FASE 5: Aplicativo Móvel para Tutores 📱

**Objetivo:** App nativo (iOS/Android) para tutores acompanharem seus pets.

**Duração:** 8 semanas

### Entregas

#### Sprint 16-17 (Semanas 31-34): App Core
**Backend:**
- [ ] API específica para mobile
- [ ] Notificações push (Firebase)
- [ ] Webhook de eventos (internação iniciada, alta, etc.)

**Mobile (React Native + Expo):**
- [ ] Autenticação (tutor)
- [ ] Listagem de pets do tutor
- [ ] Perfil do pet (histórico, vacinas, exames)
- [ ] Status de internação (se houver)
- [ ] Chat com equipe veterinária
- [ ] Notificações push

#### Sprint 18-19 (Semanas 35-38): Features Avançadas
**Mobile:**
- [ ] Agendamento de consultas
- [ ] Visualizar exames e laudos (PDF)
- [ ] Lembretes de medicação/vacina
- [ ] Programa de pontos/fidelidade
- [ ] Avaliação da internação (NPS)
- [ ] Modo offline (leitura)

### Critérios de Aceite
- ✅ Tutor consegue acompanhar internação em tempo real
- ✅ Chat funcional com equipe
- ✅ Notificações push confiáveis
- ✅ App publicado nas lojas (TestFlight/Beta)

**Milestone:** **App Tutor em Produção**

---

## FASE 6: Integrações Avançadas 🔌

**Objetivo:** Integrar com DICOM/PACS, NF-e, WhatsApp, pagamentos.

**Duração:** 6 semanas

### Entregas

#### Sprint 20-21 (Semanas 39-42): DICOM/PACS e Documentos
**Backend:**
- [ ] Integração DICOM/PACS (Orthanc)
- [ ] Registro de estudos DICOM
- [ ] Vinculação de laudos ao prontuário
- [ ] Assinatura digital qualificada (ICP-Brasil)
- [ ] Geração de documentos (receita, atestado, termo)

**Frontend Web:**
- [ ] Solicitar exame de imagem
- [ ] Visualizar imagens DICOM (viewer integrado)
- [ ] Laudar exames
- [ ] Assinar documentos digitalmente
- [ ] Modelos de documentos (templates)

#### Sprint 22 (Semanas 43-44): Integrações Comerciais
**Backend:**
- [ ] Integração Nota Fiscal (Focus NFe)
- [ ] WhatsApp Business API
- [ ] Gateway de pagamento nacional (Mercado Pago/PagSeguro)
- [ ] SMS (Twilio)

**Frontend Web:**
- [ ] Emissão de NF-e/NF-se
- [ ] Envio automático de mensagens (WhatsApp/SMS)
- [ ] Pagamento no checkout (cartão, Pix, boleto)

### Critérios de Aceite
- ✅ Exames de imagem integrados ao prontuário
- ✅ NF-e emitida automaticamente
- ✅ WhatsApp funcionando para notificações
- ✅ Assinatura digital homologada

**Milestone:** **Sistema Enterprise Completo**

---

## Priorização de Funcionalidades (MoSCoW)

### Must Have (Fase 0-2)
- ✅ Autenticação multi-tenant
- ✅ Gestão de internações
- ✅ Prescrição de medicamentos (RAEM)
- ✅ Prontuário eletrônico
- ✅ Dashboard em tempo real

### Should Have (Fase 3)
- POPs e checklists
- Controle de estoque
- Rastreabilidade de amostras
- Relatórios gerenciais
- Gestão de equipamentos

### Could Have (Fase 4-5)
- Sistema de billing SaaS
- Onboarding automatizado
- App móvel para tutores
- Programa de fidelidade
- Marketing automation

### Won't Have (Por Ora)
- Integração com laboratórios externos
- Telemedicina (vídeo chamada)
- IA para diagnóstico assistido
- Blockchain para rastreabilidade

---

## Métricas de Sucesso por Fase

| Fase | Métrica Principal | Meta |
|------|-------------------|------|
| 0 | Ambiente funcionando | 100% |
| 1 | Hospitais piloto ativos | 2-3 |
| 2 | Internações registradas | 50+ |
| 3 | Checklists completados | 100+ |
| 4 | Hospitais pagantes | 5-10 |
| 5 | Tutores no app | 200+ |
| 6 | NF-es emitidas | 100+ |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade multi-tenant | Média | Alto | POC na Fase 0, testes rigorosos |
| Compliance CFMV/LGPD | Baixa | Alto | Consultoria jurídica, auditoria externa |
| Performance com muitos tenants | Média | Médio | Load testing, otimizações de queries |
| Integração DICOM complexa | Alta | Médio | Orthanc (simplifica), POC antecipado |
| Billing/pagamento falhar | Baixa | Alto | Stripe (robusto), webhooks redundantes |

---

## Stack de Desenvolvimento por Fase

| Fase | Backend | Frontend | Mobile | Infra |
|------|---------|----------|--------|-------|
| 0 | NestJS base | Next.js base | - | Docker, CI/CD |
| 1 | Auth, Internações | Dashboard, CRUD | - | Staging deploy |
| 2 | RAEM, Prontuário | Prescrição, Evolução | - | Prod deploy |
| 3 | POPs, Estoque | Checklists, Relatórios | - | Monitoring |
| 4 | Billing, Onboarding | Pricing, Landing | - | CDN, Email |
| 5 | Mobile API | - | React Native | Push notifications |
| 6 | DICOM, NF-e, Whats | Viewer, NF | Laudos | PACS, APIs |

---

## Equipe Recomendada

**Fase 0-2 (MVP):**
- 1 Tech Lead (Full-stack)
- 1 Backend Developer
- 1 Frontend Developer
- 1 DevOps/Infra (part-time)
- 1 Designer UX/UI (part-time)

**Fase 3-4 (Escala):**
- +1 Backend Developer
- +1 Frontend Developer
- +1 QA Engineer

**Fase 5 (Mobile):**
- +1 Mobile Developer

**Fase 6 (Integrações):**
- +1 Integration Specialist

---

## Próximos Passos

1. ✅ Finalizar toda a documentação técnica (Fase 0 - em progresso)
2. ⏭️ Criar os 3 repositórios e setup Docker
3. ⏭️ Iniciar desenvolvimento do backend (auth + multi-tenant)
4. ⏭️ Desenvolver design system e telas de auth
5. ⏭️ POC de multi-tenancy funcionando
6. ⏭️ Primeira internação registrada (milestone!)

---

**Versão:** 1.0
**Data:** 2025-10-19
**Revisar:** Mensalmente ou ao final de cada fase
