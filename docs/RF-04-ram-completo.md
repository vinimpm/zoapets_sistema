# RF-04: Módulo RAM - Registro de Administração de Medicamentos

## 📋 Visão Geral

O módulo RAM (Registro de Administração de Medicamentos) é o coração da segurança medicamentosa hospitalar, automatizando todo o processo de prescrição, agendamento e registro de administração de medicamentos durante internações.

## 🎯 Objetivo

Garantir rastreabilidade completa da administração de medicamentos, desde a prescrição médica até a aplicação pelo enfermeiro, com registros de quem administrou, quando e eventuais intercorrências, atendendo às normas do CFMV e LGPD.

## ✅ Status de Implementação

**Backend:** ✅ Completo
**Frontend:** 🔨 Parcial (painel básico, precisa refinamento)
**Integração:** ⏳ Pendente (geração automática de administrações)

---

## 🏥 Arquitetura RAM

### Fluxo Completo

```
Prescrição Hospitalar (Veterinário)
    ↓
Sistema Gera Administrações Automáticas
    ↓
Painel de Enfermagem (Doses Pendentes)
    ↓
Enfermeiro Administra no Horário
    ↓
Registro RAM (Quem, Quando, Observações)
    ↓
Auditoria Completa (CFMV/LGPD)
```

### Entidades Relacionadas

- **Prescricao** (tipo: 'hospitalar')
- **PrescricaoItem** (medicamento + dose + frequência)
- **Administracao** (registro de cada aplicação)
- **Medicamento** (catálogo)
- **Internacao** (vínculo ao paciente)

---

## 🔧 Funcionalidades Implementadas

### 1. Criar Prescrição Hospitalar

**Ator:** Veterinário, Administrador

**Descrição:** Cria prescrição vinculada a uma internação. Ao criar prescrição tipo='hospitalar', o sistema DEVE gerar automaticamente os horários de administração baseados na frequência.

**Endpoint:** `POST /prescricoes`

**Payload:**
```json
{
  "tipo": "hospitalar",
  "petId": "uuid",
  "internacaoId": "uuid",
  "veterinarioId": "uuid",
  "dataPrescricao": "2025-01-15T10:00:00Z",
  "dataValidade": "2025-01-18T10:00:00Z",
  "observacoes": "Monitorar sinais de melhora",
  "itens": [
    {
      "medicamentoId": "uuid",
      "dose": "10mg/kg",
      "viaAdministracao": "IV",
      "frequencia": "8/8h",
      "dataInicio": "2025-01-15T12:00:00Z",
      "dataFim": "2025-01-18T12:00:00Z",
      "observacoes": "Aplicar lentamente"
    }
  ]
}
```

**Regras de Negócio:**
- Prescrição tipo='hospitalar' SEMPRE vinculada a internação
- Internação deve estar ativa (status: 'em_andamento')
- Para cada item, sistema deve gerar administrações automáticas
- Frequência parseada (ex: "8/8h" = a cada 8 horas)
- Administrações criadas entre dataInicio e dataFim

**Exemplo de Cálculo:**
```
Medicamento: Amoxicilina
Frequência: 8/8h
Início: 15/01/2025 12:00
Fim: 17/01/2025 12:00

Administrações Geradas:
1. 15/01 12:00 (pendente)
2. 15/01 20:00 (pendente)
3. 16/01 04:00 (pendente)
4. 16/01 12:00 (pendente)
5. 16/01 20:00 (pendente)
6. 17/01 04:00 (pendente)
7. 17/01 12:00 (pendente)
```

---

### 2. Listar Administrações (Painel de Enfermagem)

**Ator:** Enfermeiro, Veterinário, Administrador

**Descrição:** Lista todas as administrações com filtros para o painel de enfermagem.

**Endpoint:** `GET /administracoes?status=pendente&internacaoId=uuid`

**Filtros Disponíveis:**
- `status`: pendente, realizado, atrasado, nao_realizado
- `internacaoId`: Filtra por internação específica
- `petId`: Filtra por pet
- `data`: Filtra por data específica

**Resposta:**
```json
[
  {
    "id": "uuid",
    "prescricaoItem": {
      "id": "uuid",
      "dose": "10mg/kg",
      "viaAdministracao": "IV",
      "medicamento": {
        "id": "uuid",
        "nome": "Amoxicilina",
        "principioAtivo": "Amoxicilina triidratada"
      },
      "prescricao": {
        "id": "uuid",
        "pet": {
          "id": "uuid",
          "nome": "Rex",
          "especie": "Canina"
        },
        "internacao": {
          "id": "uuid",
          "leito": "L-12",
          "status": "em_andamento"
        }
      }
    },
    "dataHoraPrevista": "2025-01-15T12:00:00Z",
    "dataHoraRealizada": null,
    "status": "pendente",
    "responsavel": null,
    "observacoes": null
  }
]
```

---

### 3. Buscar Administrações Pendentes

**Ator:** Enfermeiro

**Descrição:** Retorna todas as administrações pendentes, ordenadas por horário previsto.

**Endpoint:** `GET /administracoes/pendentes`

**Resposta:** Array de administrações com status='pendente'

---

### 4. Buscar Administrações Atrasadas

**Ator:** Enfermeiro, Coordenador de Enfermagem

**Descrição:** Retorna administrações pendentes com horário previsto já passado (atrasadas).

**Endpoint:** `GET /administracoes/atrasadas`

**Lógica:**
```sql
WHERE status = 'pendente'
  AND dataHoraPrevista < NOW()
ORDER BY dataHoraPrevista ASC
```

**Uso:** Alertas de doses atrasadas no painel de enfermagem.

---

### 5. Buscar Próximas Administrações

**Ator:** Enfermeiro

**Descrição:** Retorna administrações pendentes nas próximas N horas (padrão: 2h).

**Endpoint:** `GET /administracoes/proximas?horas=2`

**Parâmetros:**
- `horas` (opcional): Janela de tempo (padrão: 2)

**Lógica:**
```sql
WHERE status = 'pendente'
  AND dataHoraPrevista BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
ORDER BY dataHoraPrevista ASC
```

**Uso:** Preparação antecipada de medicamentos.

---

### 6. Registrar Administração

**Ator:** Enfermeiro

**Descrição:** Registra que uma administração foi realizada.

**Endpoint:** `PATCH /administracoes/:id/registrar`

**Payload:**
```json
{
  "responsavelId": "uuid",
  "dataHoraRealizada": "2025-01-15T12:05:00Z",
  "observacoes": "Aplicado sem intercorrências. Pet tolerou bem."
}
```

**Regras de Negócio:**
- Status muda para 'realizado'
- Registra enfermeiro responsável
- Horário real pode diferir do previsto
- Se atraso > 30min, gerar alerta automático
- Observações obrigatórias se tiver intercorrência

**Auditoria:**
- Cria log: "Enfermeiro X administrou medicamento Y ao pet Z"
- Registra IP, timestamp, user_agent

---

### 7. Marcar Administração como Não Realizada

**Ator:** Enfermeiro, Coordenador de Enfermagem

**Descrição:** Marca administração como não realizada (ex: pet vomitou, recusou).

**Endpoint:** `PATCH /administracoes/:id/nao-realizar`

**Payload:**
```json
{
  "responsavelId": "uuid",
  "motivoNaoRealizado": "Pet apresentou vômito logo antes da administração",
  "observacoes": "Veterinário notificado. Aguardando nova conduta."
}
```

**Regras de Negócio:**
- Status muda para 'nao_realizado'
- Motivo é OBRIGATÓRIO
- Veterinário deve ser notificado (sistema ou manualmente)
- Gera alerta para revisão da prescrição

---

### 8. Buscar Administrações de uma Internação

**Ator:** Veterinário, Enfermeiro

**Descrição:** Lista todas as administrações de uma internação específica.

**Endpoint:** `GET /administracoes/internacao/:internacaoId`

**Resposta:** Array completo do histórico medicamentoso

**Uso:**
- Histórico medicamentoso do paciente
- Verificar aderência ao tratamento
- Auditoria clínica

---

### 9. Buscar Detalhes de Administração

**Ator:** Veterinário, Enfermeiro, Auditor

**Descrição:** Retorna detalhes completos de uma administração específica.

**Endpoint:** `GET /administracoes/:id`

**Resposta:**
```json
{
  "id": "uuid",
  "prescricaoItem": {
    "medicamento": { ... },
    "dose": "10mg/kg",
    "viaAdministracao": "IV",
    "prescricao": {
      "veterinario": { ... },
      "pet": { ... },
      "internacao": { ... }
    }
  },
  "dataHoraPrevista": "2025-01-15T12:00:00Z",
  "dataHoraRealizada": "2025-01-15T12:05:00Z",
  "status": "realizado",
  "responsavel": {
    "id": "uuid",
    "nome": "Maria Enfermeira",
    "coren": "123456-SP"
  },
  "observacoes": "Aplicado sem intercorrências",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### 10. Painel de Enfermagem Consolidado

**Ator:** Enfermeiro

**Descrição:** Endpoint consolidado que retorna todas as informações necessárias para o painel de enfermagem.

**Endpoint:** `GET /administracoes/painel-enfermagem`

**Resposta:**
```json
{
  "atrasadas": [
    {
      "internacao": { ... },
      "pet": { ... },
      "administracoes": [ ... ]
    }
  ],
  "pendentes": [
    {
      "internacao": { ... },
      "pet": { ... },
      "administracoes": [ ... ]
    }
  ],
  "proximas": [
    {
      "internacao": { ... },
      "pet": { ... },
      "administracoes": [ ... ]
    }
  ],
  "estatisticas": {
    "totalAtrasadas": 3,
    "totalPendentes": 15,
    "totalProximas": 8,
    "totalRealizadasHoje": 42
  }
}
```

**Uso:** Tela principal de enfermagem (/ram)

---

## 📊 Regras de Negócio Completas

### RN-001: Tipos de Prescrição
- **Ambulatorial:** Receita para casa, tutor administra, NÃO gera RAM
- **Hospitalar:** Pet internado, enfermeiro administra, GERA RAM automático

### RN-002: Geração Automática de Administrações
- Ao criar prescrição tipo='hospitalar', sistema DEVE criar administrações
- Frequências suportadas: 6/6h, 8/8h, 12/12h, 24/24h, 48/48h
- Horário inicial = dataInicio do item
- Horário final = dataFim do item
- Todas criadas com status='pendente'

### RN-003: Status de Administração
- **pendente:** Aguardando aplicação
- **realizado:** Aplicado com sucesso
- **atrasado:** Automático se pendente + horário passado
- **nao_realizado:** Marcado manualmente com justificativa

### RN-004: Alertas de Atraso
- Se atraso > 30 minutos: Alerta amarelo
- Se atraso > 60 minutos: Alerta vermelho + notificar veterinário
- Se atraso > 2 horas: Alerta crítico + registrar ocorrência

### RN-005: Permissões
- **Prescrever:** Apenas Veterinário
- **Administrar:** Enfermeiro, Veterinário
- **Visualizar:** Todos os perfis clínicos
- **Auditar:** Administrador, Gerente

### RN-006: Auditoria (LGPD/CFMV)
- TODA administração gera log de auditoria
- Logs incluem: quem, quando, onde (IP), dispositivo
- Logs são imutáveis (append-only)
- Retenção: 5 anos (CFMV) ou 10 anos (medicamentos controlados)

### RN-007: Medicamentos Controlados
- Portaria 344/98 ANVISA
- Registro especial com: lote, validade, receituário
- Dupla checagem obrigatória
- Relatório trimestral para ANVISA

---

## 🔐 Segurança e Compliance

### CFMV (Conselho Federal de Medicina Veterinária)
- ✅ Registro de quem prescreveu
- ✅ Registro de quem administrou
- ✅ Data/hora de cada ação
- ✅ Dose e via de administração
- ✅ Rastreabilidade completa

### LGPD
- ✅ Logs de acesso ao prontuário
- ✅ Consentimento do tutor (termo)
- ✅ Direito ao esquecimento (soft delete)
- ✅ Portabilidade de dados

### ANVISA (Medicamentos Controlados)
- ✅ Rastreabilidade de lote
- ✅ Controle de validade
- ✅ Registro de dispensação
- ✅ Relatórios trimestrais

---

## 🎨 UX - Painel de Enfermagem

### Layout Proposto

```
┌─────────────────────────────────────────────────────┐
│ 🏥 Painel de Enfermagem - RAM                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔴 ATRASADAS (3)                                    │
│ ┌──────────────────────────────────────────┐       │
│ │ Rex (L-12) - Amoxicilina 10mg/kg IV      │       │
│ │ ⏰ Previsto: 10:00  Atraso: 2h15min      │       │
│ │ [REGISTRAR AGORA]                        │       │
│ └──────────────────────────────────────────┘       │
│                                                     │
│ 🟡 PENDENTES (15)                                   │
│ [Filtrar: Todos | Por Leito | Por Pet]             │
│ ┌──────────────────────────────────────────┐       │
│ │ Mia (L-08) - Dipirona 25mg/kg SC         │       │
│ │ ⏰ Previsto: 14:00                       │       │
│ │ [REGISTRAR]                              │       │
│ └──────────────────────────────────────────┘       │
│                                                     │
│ ⏰ PRÓXIMAS 2H (8)                                  │
│ [Preparar Medicação]                                │
│                                                     │
│ 📊 ESTATÍSTICAS DO DIA                              │
│ Realizadas: 42 | Pendentes: 15 | Atrasadas: 3     │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Casos de Uso

### UC-001: Prescrever Medicamento Hospitalar
1. Veterinário acessa internação
2. Clica "Nova Prescrição"
3. Seleciona medicamento, dose, frequência
4. Define data início/fim
5. Salva
6. **Sistema gera administrações automaticamente**
7. Enfermeiro vê no painel

### UC-002: Administrar Medicamento
1. Enfermeiro abre painel RAM
2. Vê doses pendentes
3. Prepara medicamento
4. Administra no pet
5. Registra no sistema (quem, quando)
6. Sistema atualiza status

### UC-003: Justificar Não Administração
1. Enfermeiro tenta administrar
2. Pet recusa ou apresenta reação
3. Marca como "Não Realizado"
4. Descreve motivo detalhadamente
5. Sistema notifica veterinário
6. Veterinário ajusta prescrição

---

## 📈 Métricas e Indicadores

### KPIs Sugeridos
- **Taxa de Aderência:** % de administrações realizadas no horário
- **Tempo Médio de Atraso:** Diferença entre previsto e realizado
- **Taxa de Não Realização:** % marcadas como não realizadas
- **Administrações por Turno:** Distribuição da carga de trabalho

### Relatórios
- Histórico medicamentoso por pet
- Consumo de medicamentos por internação
- Produtividade por enfermeiro
- Intercorrências e eventos adversos

---

## 🔄 Integrações

### Com Outros Módulos

**Internações (RF-05):**
- Prescrição vinculada a internação ativa
- Ao dar alta, suspender prescrições ativas

**Farmácia (RF-07):**
- Baixa automática de estoque ao administrar
- Controle de lote e validade
- Alertas de estoque baixo

**Auditoria (RF-09):**
- Todos os eventos geram logs
- Relatórios para CFMV/ANVISA

**Financeiro (RF-13):**
- Medicamentos administrados → contas
- Faturamento por convênio

---

## 📝 Pendências de Implementação

### Backend
- [x] Entity Administracao
- [x] Entity Prescricao
- [x] Entity PrescricaoItem
- [x] Service AdministracoesService
- [x] Controller com endpoints
- [ ] **Lógica gerar administrações automáticas** (CRÍTICO)
- [ ] **Endpoint painel-enfermagem consolidado**
- [ ] Notificações de atraso
- [ ] Relatórios

### Frontend
- [x] Página /ram básica
- [ ] **Refatorar painel de enfermagem** (CRÍTICO)
- [ ] Cards de atrasadas/pendentes/próximas
- [ ] Dialog registrar administração
- [ ] Filtros por leito/pet
- [ ] Alertas visuais e sonoros

---

## 📚 Referências

- **CFMV:** Resolução nº 1.321/2020 (Prontuário Eletrônico)
- **ANVISA:** Portaria 344/98 (Medicamentos Controlados)
- **LGPD:** Lei 13.709/2018

---

**Versão:** 1.0
**Data:** 2025-10-21
**Autor:** Equipe Técnica Zoa Pets
**Status:** ✅ Documentação Completa
