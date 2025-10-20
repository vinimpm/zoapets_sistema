# Diagrama Entidade-Relacionamento (DER) - Zoa Pets

## Visão Geral

Este documento apresenta o **DER completo** do sistema Zoa Pets, organizando por **domínios funcionais** e respeitando a arquitetura **multi-tenant (schema-per-tenant)**.

**Total de Entidades:** ~70 tabelas

---

## Estrutura Multi-Tenant

```
Database: zoapets_production

├── Schema: public (Dados globais do SaaS)
│   ├── tenants
│   ├── subscriptions
│   ├── plans
│   ├── global_users (super admin)
│   └── feature_flags
│
└── Schema: tenant_123 (Dados de cada hospital)
    ├── Core
    │   ├── users
    │   ├── roles
    │   ├── permissions
    │   ├── user_roles
    │   └── audit_logs
    │
    ├── Clínico
    │   ├── tutores
    │   ├── pets
    │   ├── internacoes
    │   ├── prontuarios
    │   ├── evolucoes
    │   ├── diagnosticos
    │   └── exames
    │
    ├── RAEM (Medicamentos)
    │   ├── medicamentos
    │   ├── prescricoes
    │   ├── prescricao_itens
    │   ├── administracoes
    │   └── alertas_medicamento
    │
    ├── Farmácia
    │   ├── produtos
    │   ├── lotes
    │   ├── estoque
    │   ├── movimentacoes
    │   └── dispensacoes
    │
    ├── POPs
    │   ├── pops
    │   ├── checklist_templates
    │   ├── checklist_itens
    │   └── execucoes_checklist
    │
    ├── Rastreabilidade
    │   ├── amostras
    │   ├── bolsas_sangue
    │   └── custodia_eventos
    │
    ├── Equipamentos
    │   ├── equipamentos
    │   ├── calibracoes
    │   └── manutencoes
    │
    ├── Documentos
    │   ├── documentos
    │   ├── templates_documentos
    │   └── assinaturas_digitais
    │
    ├── Convênios
    │   ├── convenios
    │   ├── planos_pet
    │   ├── autorizacoes
    │   └── repasses
    │
    ├── Financeiro
    │   ├── contas_receber
    │   ├── contas_pagar
    │   ├── pagamentos
    │   ├── notas_fiscais
    │   └── lancamentos
    │
    ├── Marketing
    │   ├── campanhas
    │   ├── segmentos
    │   ├── disparos
    │   └── fidelidade_pontos
    │
    ├── DICOM/PACS
    │   ├── estudos_dicom
    │   ├── series
    │   └── laudos
    │
    └── Notificações
        ├── notificacoes
        └── notificacoes_lidas
```

---

## 1. Schema PUBLIC (Global - SaaS)

Dados compartilhados entre todos os hospitais.

### **tenants** (Hospitais)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | ID único do tenant |
| nome | VARCHAR(255) | Nome do hospital |
| slug | VARCHAR(100) UNIQUE | URL-friendly (ex: hospital-abc) |
| cnpj | VARCHAR(18) UNIQUE | CNPJ do hospital |
| email | VARCHAR(255) | Email de contato |
| telefone | VARCHAR(20) | Telefone |
| endereco_completo | JSONB | Endereço estruturado |
| schema_name | VARCHAR(63) UNIQUE | Nome do schema PostgreSQL |
| status | ENUM | active, suspended, cancelled |
| config | JSONB | Configurações personalizadas |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Índices:** slug, cnpj, schema_name

---

### **subscriptions** (Assinaturas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | ID da assinatura |
| tenant_id | UUID FK → tenants | Hospital |
| plan_id | UUID FK → plans | Plano contratado |
| status | ENUM | trialing, active, past_due, cancelled |
| current_period_start | TIMESTAMP | Início do período atual |
| current_period_end | TIMESTAMP | Fim do período atual |
| trial_end | TIMESTAMP NULL | Fim do trial (se aplicável) |
| stripe_subscription_id | VARCHAR(255) | ID no Stripe |
| cancel_at_period_end | BOOLEAN | Cancela ao fim do período? |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** tenant_id, stripe_subscription_id

---

### **plans** (Planos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | ID do plano |
| nome | VARCHAR(100) | Básico, Pro, Enterprise |
| descricao | TEXT | Descrição do plano |
| preco_mensal | DECIMAL(10,2) | Valor mensal (R$) |
| preco_anual | DECIMAL(10,2) | Valor anual (R$) |
| limites | JSONB | { "usuarios": 10, "pets": 1000, ... } |
| features | JSONB | { "raem": true, "dicom": false, ... } |
| stripe_price_id | VARCHAR(255) | ID do preço no Stripe |
| ativo | BOOLEAN | Plano disponível para venda? |
| created_at | TIMESTAMP | |

**Índices:** ativo

---

### **feature_flags** (Feature Flags Globais)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| key | VARCHAR(100) UNIQUE | Nome da feature |
| enabled_globally | BOOLEAN | Habilitada globalmente? |
| enabled_for_plans | UUID[] | Array de plan_ids |
| enabled_for_tenants | UUID[] | Array de tenant_ids |
| created_at | TIMESTAMP | |

---

## 2. Schema TENANT_XXX (Por Hospital)

Cada hospital possui um schema PostgreSQL isolado com as tabelas abaixo.

---

### **CORE: Usuários e Permissões**

#### **users**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome_completo | VARCHAR(255) | |
| email | VARCHAR(255) UNIQUE | |
| senha_hash | VARCHAR(255) | Bcrypt |
| cpf | VARCHAR(14) UNIQUE | |
| crmv | VARCHAR(20) NULL | Médicos veterinários |
| telefone | VARCHAR(20) | |
| avatar_url | VARCHAR(500) NULL | URL da foto |
| cargo | VARCHAR(100) | Médico, Enfermeiro, etc |
| ativo | BOOLEAN DEFAULT true | |
| ultimo_acesso | TIMESTAMP NULL | |
| refresh_token_hash | VARCHAR(255) NULL | Hash do refresh token |
| totp_secret | VARCHAR(255) NULL | 2FA |
| totp_enabled | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** email, cpf, ativo

---

#### **roles** (Perfis)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(100) | Admin, Médico, Enfermeiro, Recepção, Farmácia |
| descricao | TEXT | |
| created_at | TIMESTAMP | |

**Dados iniciais:** Admin, Médico, Enfermeiro, Recepção, Farmácia, Tutor

---

#### **permissions** (Permissões)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| resource | VARCHAR(100) | internacao, medicamento, pet, etc |
| action | VARCHAR(50) | create, read, update, delete |
| description | TEXT | |

**Exemplos:**
- `{ resource: 'internacao', action: 'create' }`
- `{ resource: 'medicamento', action: 'prescrever' }`
- `{ resource: 'prontuario', action: 'editar' }`

---

#### **role_permissions**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| role_id | UUID FK → roles | |
| permission_id | UUID FK → permissions | |

**PK:** (role_id, permission_id)

---

#### **user_roles**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| user_id | UUID FK → users | |
| role_id | UUID FK → roles | |

**PK:** (user_id, role_id)

---

#### **audit_logs** (Logs de Auditoria)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| user_id | UUID FK → users NULL | NULL se sistema |
| action | VARCHAR(100) | CREATE, UPDATE, DELETE, LOGIN, etc |
| resource_type | VARCHAR(100) | Pet, Internacao, Medicamento, etc |
| resource_id | UUID NULL | ID do recurso afetado |
| old_data | JSONB NULL | Dados antes da alteração |
| new_data | JSONB NULL | Dados após a alteração |
| ip_address | INET | IP do usuário |
| user_agent | TEXT | Browser/dispositivo |
| timestamp | TIMESTAMP DEFAULT NOW() | |

**Índices:** user_id, resource_type, resource_id, timestamp

---

### **CLÍNICO: Pets e Internações**

#### **tutores**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome_completo | VARCHAR(255) | |
| cpf | VARCHAR(14) UNIQUE | |
| rg | VARCHAR(20) NULL | |
| email | VARCHAR(255) | |
| telefone_principal | VARCHAR(20) | |
| telefone_secundario | VARCHAR(20) NULL | |
| endereco_completo | JSONB | CEP, rua, número, bairro, cidade, UF |
| data_nascimento | DATE NULL | |
| profissao | VARCHAR(100) NULL | |
| observacoes | TEXT NULL | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** cpf, email, telefone_principal

---

#### **pets**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| tutor_id | UUID FK → tutores | |
| nome | VARCHAR(100) | |
| especie | ENUM | canino, felino, silvestre, exotico |
| raca | VARCHAR(100) NULL | |
| sexo | ENUM | macho, femea |
| data_nascimento | DATE NULL | Aproximada se desconhecida |
| peso_kg | DECIMAL(5,2) NULL | Peso atual |
| cor_pelagem | VARCHAR(100) NULL | |
| castrado | BOOLEAN NULL | |
| microchip | VARCHAR(50) NULL UNIQUE | Número do microchip |
| foto_url | VARCHAR(500) NULL | URL da foto |
| alergias | TEXT[] NULL | Array de alergias conhecidas |
| doencas_previas | TEXT[] NULL | |
| observacoes | TEXT NULL | |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** tutor_id, microchip, ativo

---

#### **internacoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| pet_id | UUID FK → pets | |
| medico_responsavel_id | UUID FK → users | |
| data_entrada | TIMESTAMP | Data/hora de internação |
| data_alta | TIMESTAMP NULL | NULL se ainda internado |
| motivo | TEXT | Motivo da internação |
| diagnostico_inicial | TEXT NULL | |
| tipo | ENUM | clinica, cirurgica, urgencia |
| status | ENUM | aguardando, em_andamento, alta, obito |
| leito | VARCHAR(50) NULL | Número do leito |
| isolamento | BOOLEAN DEFAULT false | Requer isolamento? |
| prioridade | ENUM | baixa, media, alta, critica |
| custo_total | DECIMAL(10,2) NULL | Calculado automaticamente |
| observacoes | TEXT NULL | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** pet_id, medico_responsavel_id, status, data_entrada

---

#### **prontuarios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes UNIQUE | Um prontuário por internação |
| anamnese | TEXT NULL | História clínica |
| queixa_principal | TEXT | Motivo da consulta |
| exame_fisico | JSONB NULL | { temperatura, fc, fr, tpc, hidratacao, ... } |
| diagnostico_presuntivo | TEXT NULL | |
| diagnostico_definitivo | TEXT NULL | |
| prognostico | ENUM NULL | excelente, bom, reservado, grave, critico |
| conduta_terapeutica | TEXT NULL | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Índices:** internacao_id

---

#### **evolucoes** (Evolução Clínica Diária)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| prontuario_id | UUID FK → prontuarios | |
| user_id | UUID FK → users | Quem fez a evolução |
| data_hora | TIMESTAMP DEFAULT NOW() | |
| descricao | TEXT | Evolução narrativa |
| parametros_vitais | JSONB NULL | { temperatura, fc, fr, dor, ... } |
| procedimentos_realizados | TEXT[] NULL | |
| assinatura_digital_hash | VARCHAR(255) NULL | SHA256 do conteúdo |
| created_at | TIMESTAMP | |

**Índices:** prontuario_id, data_hora

---

#### **exames**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| tipo | ENUM | hemograma, bioquimico, urina, raio_x, ultrassom, tomografia |
| solicitante_id | UUID FK → users | Médico que solicitou |
| data_solicitacao | TIMESTAMP | |
| data_realizacao | TIMESTAMP NULL | |
| data_resultado | TIMESTAMP NULL | |
| arquivo_url | VARCHAR(500) NULL | PDF do resultado |
| observacoes | TEXT NULL | |
| created_at | TIMESTAMP | |

**Índices:** internacao_id, tipo, data_solicitacao

---

### **RAEM: Medicamentos**

#### **medicamentos** (Catálogo)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome_comercial | VARCHAR(255) | |
| principio_ativo | VARCHAR(255) | |
| concentracao | VARCHAR(100) | Ex: "50mg/ml" |
| forma_farmaceutica | ENUM | comprimido, injetavel, suspensao, etc |
| fabricante | VARCHAR(255) NULL | |
| controlado | BOOLEAN DEFAULT false | Requer controle especial? |
| temperatura_armazenamento | VARCHAR(50) NULL | Ex: "2-8°C" |
| observacoes | TEXT NULL | |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |

**Índices:** nome_comercial, principio_ativo, ativo

---

#### **prescricoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| medico_id | UUID FK → users | |
| data_prescricao | TIMESTAMP DEFAULT NOW() | |
| validade_dias | INTEGER DEFAULT 7 | Prescrição válida por X dias |
| observacoes | TEXT NULL | |
| status | ENUM | ativa, suspensa, finalizada |
| assinatura_digital_hash | VARCHAR(255) NULL | |
| created_at | TIMESTAMP | |

**Índices:** internacao_id, medico_id, status

---

#### **prescricao_itens**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| prescricao_id | UUID FK → prescricoes | |
| medicamento_id | UUID FK → medicamentos | |
| dose | VARCHAR(100) | Ex: "10mg/kg" |
| via_administracao | ENUM | oral, IV, IM, SC, topica |
| frequencia | VARCHAR(100) | Ex: "8/8h", "BID", "TID" |
| duracao_dias | INTEGER | Duração do tratamento |
| instrucoes_especiais | TEXT NULL | |
| created_at | TIMESTAMP | |

**Índices:** prescricao_id, medicamento_id

---

#### **administracoes** (RAEM)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| prescricao_item_id | UUID FK → prescricao_itens | |
| data_hora_programada | TIMESTAMP | Horário que deveria ser dado |
| data_hora_administrada | TIMESTAMP NULL | Horário que realmente foi dado |
| enfermeiro_id | UUID FK → users NULL | Quem administrou |
| lote_id | UUID FK → lotes NULL | Rastreabilidade |
| status | ENUM | pendente, administrado, nao_administrado |
| motivo_nao_administrado | TEXT NULL | Se status = nao_administrado |
| observacoes | TEXT NULL | |
| assinatura_digital_hash | VARCHAR(255) NULL | |
| created_at | TIMESTAMP | |

**Índices:** prescricao_item_id, data_hora_programada, status

---

### **FARMÁCIA: Estoque**

#### **produtos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(255) | |
| tipo | ENUM | medicamento, insumo, material |
| unidade_medida | VARCHAR(50) | Un, Cx, Fr, ml, etc |
| estoque_minimo | INTEGER | Alerta quando menor que X |
| controlado | BOOLEAN DEFAULT false | |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |

---

#### **lotes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| produto_id | UUID FK → produtos | |
| numero_lote | VARCHAR(100) | |
| fabricante | VARCHAR(255) | |
| data_fabricacao | DATE | |
| data_validade | DATE | |
| quantidade_inicial | INTEGER | |
| quantidade_atual | INTEGER | |
| created_at | TIMESTAMP | |

**Índices:** produto_id, data_validade

---

#### **movimentacoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| lote_id | UUID FK → lotes | |
| tipo | ENUM | entrada, saida, ajuste, perda |
| quantidade | INTEGER | |
| motivo | TEXT | |
| user_id | UUID FK → users | Quem fez a movimentação |
| created_at | TIMESTAMP | |

---

### **POPs e Checklists**

#### **pops**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| titulo | VARCHAR(255) | |
| descricao | TEXT | |
| versao | VARCHAR(20) | Ex: "1.0", "2.1" |
| categoria | ENUM | higienizacao, coleta, descarte, emergencia |
| arquivo_url | VARCHAR(500) NULL | PDF do POP |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

#### **checklist_templates**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(255) | |
| tipo_internacao | ENUM | clinica, cirurgica, urgencia |
| pop_id | UUID FK → pops NULL | POP relacionado |
| created_at | TIMESTAMP | |

---

#### **checklist_itens**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| checklist_template_id | UUID FK → checklist_templates | |
| descricao | TEXT | Item a ser checado |
| ordem | INTEGER | Ordem de exibição |
| obrigatorio | BOOLEAN DEFAULT true | |

---

#### **execucoes_checklist**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| checklist_template_id | UUID FK → checklist_templates | |
| checklist_item_id | UUID FK → checklist_itens | |
| concluido | BOOLEAN DEFAULT false | |
| user_id | UUID FK → users NULL | Quem executou |
| data_execucao | TIMESTAMP NULL | |
| observacoes | TEXT NULL | |

---

### **RASTREABILIDADE**

#### **amostras**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| tipo | ENUM | sangue, urina, fezes, tecido, swab |
| qrcode | VARCHAR(255) UNIQUE | QR Code único |
| coletado_por | UUID FK → users | |
| data_coleta | TIMESTAMP | |
| armazenamento | VARCHAR(255) | Geladeira X, prateleira Y |
| temperatura | DECIMAL(4,1) NULL | Temperatura de armazenamento |
| status | ENUM | coletada, transporte, armazenada, descartada |
| data_descarte | TIMESTAMP NULL | |
| created_at | TIMESTAMP | |

**Índices:** qrcode, internacao_id

---

#### **custodia_eventos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| amostra_id | UUID FK → amostras | |
| evento | ENUM | coleta, transporte, armazenamento, analise, descarte |
| responsavel_id | UUID FK → users | |
| localizacao | VARCHAR(255) NULL | |
| temperatura | DECIMAL(4,1) NULL | |
| timestamp | TIMESTAMP DEFAULT NOW() | |

**Índices:** amostra_id, timestamp

---

### **EQUIPAMENTOS**

#### **equipamentos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(255) | |
| tipo | VARCHAR(100) | Bomba de infusão, ventilador, etc |
| fabricante | VARCHAR(255) | |
| modelo | VARCHAR(100) | |
| numero_serie | VARCHAR(100) UNIQUE | |
| data_aquisicao | DATE | |
| status | ENUM | operacional, manutencao, inativo |
| localizacao | VARCHAR(255) | Sala X, Setor Y |
| created_at | TIMESTAMP | |

---

#### **calibracoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| equipamento_id | UUID FK → equipamentos | |
| data_calibracao | DATE | |
| data_proxima_calibracao | DATE | |
| empresa_calibradora | VARCHAR(255) | |
| certificado_url | VARCHAR(500) NULL | PDF do certificado |
| created_at | TIMESTAMP | |

---

#### **manutencoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| equipamento_id | UUID FK → equipamentos | |
| tipo | ENUM | preventiva, corretiva, emergencial |
| descricao | TEXT | |
| data_manutencao | DATE | |
| responsavel | VARCHAR(255) | Técnico ou empresa |
| custo | DECIMAL(10,2) NULL | |
| created_at | TIMESTAMP | |

---

### **DOCUMENTOS**

#### **templates_documentos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| tipo | ENUM | receita, atestado, termo, laudo |
| nome | VARCHAR(255) | |
| conteudo_html | TEXT | Template com variáveis: {{pet.nome}} |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |

---

#### **documentos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| template_id | UUID FK → templates_documentos NULL | |
| internacao_id | UUID FK → internacoes NULL | |
| tipo | ENUM | receita, atestado, termo, laudo |
| conteudo_html | TEXT | Conteúdo final renderizado |
| arquivo_pdf_url | VARCHAR(500) NULL | PDF gerado |
| created_at | TIMESTAMP | |

---

#### **assinaturas_digitais**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| documento_id | UUID FK → documentos | |
| user_id | UUID FK → users | Quem assinou |
| tipo_assinatura | ENUM | simples, qualificada_icp |
| hash_documento | VARCHAR(255) | SHA256 do documento |
| timestamp | TIMESTAMP DEFAULT NOW() | |
| certificado_icp | TEXT NULL | Se assinatura qualificada |

---

### **CONVÊNIOS**

#### **convenios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(255) | |
| cnpj | VARCHAR(18) UNIQUE | |
| contato | VARCHAR(255) | |
| telefone | VARCHAR(20) | |
| email | VARCHAR(255) | |
| percentual_cobertura | DECIMAL(5,2) | Percentual padrão de cobertura |
| ativo | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP | |

---

#### **planos_pet**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| convenio_id | UUID FK → convenios | |
| nome_plano | VARCHAR(255) | |
| cobertura_consulta | DECIMAL(5,2) | Percentual |
| cobertura_internacao | DECIMAL(5,2) | |
| cobertura_cirurgia | DECIMAL(5,2) | |
| carencia_dias | INTEGER | |
| ativo | BOOLEAN DEFAULT true | |

---

#### **autorizacoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| plano_pet_id | UUID FK → planos_pet | |
| numero_autorizacao | VARCHAR(100) UNIQUE | |
| valor_autorizado | DECIMAL(10,2) | |
| data_autorizacao | TIMESTAMP | |
| status | ENUM | pendente, autorizado, negado |
| created_at | TIMESTAMP | |

---

### **FINANCEIRO**

#### **contas_receber**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes NULL | |
| tutor_id | UUID FK → tutores | |
| descricao | VARCHAR(255) | |
| valor | DECIMAL(10,2) | |
| data_vencimento | DATE | |
| data_pagamento | DATE NULL | |
| status | ENUM | pendente, pago, vencido, cancelado |
| created_at | TIMESTAMP | |

---

#### **pagamentos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| conta_receber_id | UUID FK → contas_receber | |
| forma_pagamento | ENUM | dinheiro, cartao, pix, boleto |
| valor_pago | DECIMAL(10,2) | |
| data_pagamento | TIMESTAMP | |
| transacao_id | VARCHAR(255) NULL | ID do gateway (Stripe, etc) |
| created_at | TIMESTAMP | |

---

#### **notas_fiscais**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| conta_receber_id | UUID FK → contas_receber | |
| numero_nf | VARCHAR(100) UNIQUE | |
| tipo | ENUM | nfe, nfse | |
| chave_acesso | VARCHAR(44) NULL | |
| xml_url | VARCHAR(500) NULL | |
| pdf_url | VARCHAR(500) NULL | |
| status | ENUM | processando, emitida, cancelada, erro |
| data_emissao | TIMESTAMP NULL | |
| created_at | TIMESTAMP | |

---

### **MARKETING**

#### **campanhas**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| nome | VARCHAR(255) | |
| tipo | ENUM | email, sms, whatsapp, push |
| assunto | VARCHAR(255) NULL | Para email |
| mensagem | TEXT | |
| data_envio | TIMESTAMP NULL | NULL = agendada |
| status | ENUM | rascunho, agendada, enviando, enviada |
| created_at | TIMESTAMP | |

---

#### **disparos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| campanha_id | UUID FK → campanhas | |
| tutor_id | UUID FK → tutores | |
| enviado_em | TIMESTAMP | |
| entregue | BOOLEAN DEFAULT false | |
| aberto | BOOLEAN DEFAULT false | |
| clicado | BOOLEAN DEFAULT false | |

---

#### **fidelidade_pontos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| tutor_id | UUID FK → tutores | |
| pontos | INTEGER DEFAULT 0 | |
| updated_at | TIMESTAMP | |

---

### **DICOM/PACS**

#### **estudos_dicom**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| internacao_id | UUID FK → internacoes | |
| accession_number | VARCHAR(100) UNIQUE | Número de acesso |
| study_instance_uid | VARCHAR(255) UNIQUE | UID único do estudo |
| modalidade | ENUM | RX, US, CT, MR |
| data_estudo | TIMESTAMP | |
| orthanc_id | VARCHAR(255) NULL | ID no Orthanc PACS |
| status | ENUM | aguardando, disponivel, laudado |
| created_at | TIMESTAMP | |

---

#### **laudos**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| estudo_dicom_id | UUID FK → estudos_dicom | |
| medico_id | UUID FK → users | |
| laudo | TEXT | Laudo médico |
| conclusao | TEXT | |
| data_laudo | TIMESTAMP | |
| assinatura_digital_hash | VARCHAR(255) NULL | |

---

### **NOTIFICAÇÕES**

#### **notificacoes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | |
| user_id | UUID FK → users NULL | NULL = todos |
| tipo | ENUM | info, alerta, urgente |
| titulo | VARCHAR(255) | |
| mensagem | TEXT | |
| link_url | VARCHAR(500) NULL | |
| created_at | TIMESTAMP | |

---

#### **notificacoes_lidas**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| notificacao_id | UUID FK → notificacoes | |
| user_id | UUID FK → users | |
| lida_em | TIMESTAMP DEFAULT NOW() | |

**PK:** (notificacao_id, user_id)

---

## Índices e Otimizações

### **Índices Críticos**

```sql
-- Performance de queries multi-tenant
CREATE INDEX idx_internacoes_status ON internacoes(status);
CREATE INDEX idx_internacoes_data_entrada ON internacoes(data_entrada DESC);
CREATE INDEX idx_prescricoes_status ON prescricoes(status);
CREATE INDEX idx_administracoes_status ON administracoes(status);
CREATE INDEX idx_administracoes_data_programada ON administracoes(data_hora_programada);

-- Auditoria
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_resource ON audit_logs(user_id, resource_type);

-- Busca de pets
CREATE INDEX idx_pets_tutor ON pets(tutor_id) WHERE ativo = true;
CREATE INDEX idx_pets_nome ON pets USING gin(to_tsvector('portuguese', nome));

-- Convênios
CREATE INDEX idx_autorizacoes_status ON autorizacoes(status);

-- Financeiro
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
```

---

## Constraints e Regras de Negócio

### **Triggers Importantes**

```sql
-- Atualizar updated_at automaticamente
CREATE TRIGGER update_timestamp
BEFORE UPDATE ON [tabela]
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Criar audit log automaticamente
CREATE TRIGGER audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON [tabela_critica]
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Validar estoque ao dispensar
CREATE TRIGGER validar_estoque
BEFORE INSERT ON dispensacoes
FOR EACH ROW EXECUTE FUNCTION check_estoque_disponivel();
```

---

## Estimativa de Volumes

| Tabela | Registros/Ano (hospital médio) |
|--------|--------------------------------|
| pets | ~500 |
| internacoes | ~1.000 |
| prescricoes | ~3.000 |
| administracoes | ~50.000 |
| evolucoes | ~10.000 |
| audit_logs | ~500.000 |
| movimentacoes_estoque | ~20.000 |

---

## Próximos Passos

1. ✅ DER completo mapeado
2. ⏭️ Detalhar schema core (users, roles, permissions)
3. ⏭️ Detalhar schema clínico
4. ⏭️ Detalhar schema RAEM
5. ⏭️ Detalhar schema financeiro
6. ⏭️ Criar migrations iniciais
7. ⏭️ Definir seeds/fixtures

---

**Total de Tabelas:** ~70
**Versão:** 1.0
**Data:** 2025-10-19
