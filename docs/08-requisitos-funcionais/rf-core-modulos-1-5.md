# Requisitos Funcionais - Módulos Core (RF-01 a RF-05)

## Vis ão Geral

Este documento detalha os requisitos funcionais dos **5 módulos core** do sistema Zoa Pets, essenciais para a operação básica do hospital veterinário.

---

## RF-01: Painel Interno – Equipe Zoa Pets

### Objetivo
Centralizar toda a operação clínica e hospitalar em um ambiente web responsivo (PWA), acessível em computadores, tablets e celulares.

### Usuários
- Médicos Veterinários
- Enfermeiros
- Recepção
- Administradores
- Farmácia

---

### Funcionalidades

#### 1.1 Dashboard de Internações em Tempo Real

**User Story:**
> Como **médico/enfermeiro**, eu quero **visualizar todas as internações ativas em tempo real** para **acompanhar o status de cada paciente sem precisar atualizar a página**.

**Critérios de Aceite:**
- [ ] Exibir cards de internações com informações principais:
  - Nome do pet + foto
  - Tutor
  - Médico responsável
  - Data/hora de entrada
  - Status (Aguardando, Em andamento, Observação, Alta, Óbito)
  - Prioridade (Baixa, Média, Alta, Crítica)
  - Leito/localização
  - Alertas ativos (medicamentos atrasados, exames pendentes)
- [ ] Atualização em tempo real via WebSocket quando:
  - Nova internação é registrada
  - Status é alterado
  - Alta médica é dada
  - Alerta é acionado
- [ ] Filtros disponíveis:
  - Por status
  - Por médico responsável
  - Por leito/setor
  - Por prioridade
  - Por data de entrada
- [ ] Ordenação:
  - Mais recentes primeiro (padrão)
  - Por prioridade (crítica → baixa)
  - Alfabético (nome do pet)
- [ ] Indicadores visuais:
  - Cores por prioridade (verde, amarelo, laranja, vermelho)
  - Badge de alertas pendentes
  - Ícone de isolamento (se aplicável)

**Regras de Negócio:**
- RN-001: Usuários veem apenas internações do seu tenant (hospital)
- RN-002: Alertas críticos devem piscar/vibrar
- RN-003: Dashboard deve carregar em < 2 segundos

**Protótipo/Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 Dashboard de Internações            [Filtros ▼] [🔔]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ 🐕 Rex        │  │ 😺 Mia        │  │ 🐩 Spike      │  │
│  │ Tutor: João   │  │ Tutor: Maria  │  │ Tutor: Pedro  │  │
│  │ Dr. Silva     │  │ Dra. Ana      │  │ Dr. Silva     │  │
│  │ Leito: 12     │  │ Leito: 08     │  │ UTI - 02      │  │
│  │ ⚠️ 2 alertas   │  │ ✅ OK         │  │ 🔴 CRÍTICO    │  │
│  │ Em andamento  │  │ Observação    │  │ Em andamento  │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### 1.2 Escala de Funcionários e Turnos de Plantão

**User Story:**
> Como **administrador**, eu quero **gerenciar escalas de plantão** para **garantir cobertura adequada em todos os turnos**.

**Critérios de Aceite:**
- [ ] Cadastro de turnos:
  - Manhã (ex: 07:00-15:00)
  - Tarde (ex: 15:00-23:00)
  - Noite (ex: 23:00-07:00)
  - Personalizado
- [ ] Alocar usuários a turnos específicos por data
- [ ] Visualização em calendário:
  - Semanal
  - Mensal
  - Lista
- [ ] Troca de plantão:
  - Solicitar troca
  - Aprovar troca
  - Histórico de trocas
- [ ] Alertas de ausências/descobertura
- [ ] Exportar escala em PDF

**Regras de Negócio:**
- RN-004: Mínimo de 1 médico + 1 enfermeiro por turno
- RN-005: Troca de plantão requer aprovação do gestor
- RN-006: Não permitir aloca ção em turnos sobrepostos

---

#### 1.3 Ficha Individual do Animal (Prontuário)

**User Story:**
> Como **médico**, eu quero **acessar rapidamente o histórico clínico completo do pet** para **embasar minhas decisões médicas**.

**Critérios de Aceite:**
- [ ] Ficha dividida em abas:
  - **Dados Cadastrais:** Nome, espécie, raça, sexo, idade, peso, tutor
  - **Histórico de Internações:** Lista cronológica
  - **Vacinas:** Cartão de vacinas digital
  - **Alergias e Doenças Prévias:** Destaque visual
  - **Exames:** Histórico de todos os exames (lab + imagem)
  - **Medicamentos:** Histórico de prescrições
  - **Documentos:** Receitas, atestados, termos
- [ ] Busca rápida: Por nome, microchip, tutor
- [ ] Linha do tempo (timeline) de todos os eventos
- [ ] Anexar arquivos (PDFs, imagens)
- [ ] Edição de dados cadastrais (com auditoria)

**Regras de Negócio:**
- RN-007: Prontuário é imutável (soft delete, auditoria completa)
- RN-008: Acesso ao prontuário gera log de auditoria
- RN-009: Alergias devem aparecer em destaque vermelho

---

#### 1.4 Checklists Automáticos por Tipo de Internação

**User Story:**
> Como **enfermeiro**, eu quero **que o sistema sugira automaticamente um checklist** quando inicio uma internação, para **garantir que nenhum procedimento seja esquecido**.

**Critérios de Aceite:**
- [ ] Templates de checklist por tipo:
  - Clínica
  - Cirúrgica
  - Urgência/Emergência
  - Observação
- [ ] Checklist aparece automaticamente ao registrar internação
- [ ] Itens do checklist:
  - Descrição do procedimento
  - Checkbox de conclusão
  - Campo de observações
  - Responsável pela execução
  - Data/hora de execução
- [ ] Progresso visual (ex: "7/10 concluídos")
- [ ] Alertas de itens obrigatórios pendentes

**Regras de Negócio:**
- RN-010: Itens obrigatórios bloqueiam alta se não concluídos
- RN-011: Checklist pode ser customizado por hospital

---

#### 1.5 Alertas Automáticos

**User Story:**
> Como **enfermeiro**, eu quero **receber alertas automáticos** de medicamentos atrasados, exames pendentes e retornos agendados, para **não esquecer nenhuma tarefa crítica**.

**Critérios de Aceite:**
- [ ] Tipos de alertas:
  - 🔴 **Crítico:** Medicamento > 30min atrasado
  - 🟠 **Urgente:** Exame sem resultado há > 24h
  - 🟡 **Atenção:** Retorno agendado hoje
  - 🔵 **Info:** Vacina próxima do vencimento
- [ ] Alertas exibidos:
  - Badge no ícone de notificações (contador)
  - Toast notification quando novo alerta
  - Lista de alertas (ordenados por criticidade)
  - Som para alertas críticos (opcional)
- [ ] Marcar alerta como lido/resolvido
- [ ] Filtrar alertas por tipo
- [ ] Histórico de alertas

**Regras de Negócio:**
- RN-012: Alertas críticos não podem ser descartados sem justificativa
- RN-013: Notificações push para mobile (futuro)
- RN-014: Alertas devem persistir até resolução

---

#### 1.6 Comunicação Interna Entre Equipe

**User Story:**
> Como **médico**, eu quero **enviar mensagens diretas para enfermeiros ou para toda a equipe** sobre um paciente específico, para **facilitar a comunicação sem depender de WhatsApp pessoal**.

**Critérios de Aceite:**
- [ ] Chat interno vinculado a internações
- [ ] Enviar mensagem para:
  - Usuário específico
  - Toda a equipe da internação
  - Broadcast (todos os online)
- [ ] Mensagens incluem:
  - Texto
  - Anexos (imagens, PDFs)
  - Menção (@usuario)
- [ ] Notificações de novas mensagens
- [ ] Marcar mensagem como urgente
- [ ] Histórico de conversas por internação

**Regras de Negócio:**
- RN-015: Mensagens são armazenadas no prontuário (auditoria)
- RN-016: Mensagens urgentes enviam notificação push
- RN-017: Histórico acessível apenas a usuários autorizados

---

#### 1.7 Registro Eletrônico de Administração de Medicamentos (RAEM)

Ver **RF-02** abaixo (módulo dedicado).

---

#### 1.8 Controle de Isolamento e Higienização de Leitos

**User Story:**
> Como **enfermeiro**, eu quero **marcar leitos como "em isolamento" ou "em higienização"** para **evitar alocação incorreta de pacientes**.

**Critérios de Aceite:**
- [ ] Status de leitos:
  - 🟢 Disponível
  - 🔴 Ocupado
  - 🟡 Higienização (com countdown/timer)
  - ⚫ Isolamento
  - 🔧 Manutenção
- [ ] Mapa visual de leitos (grid/planta baixa)
- [ ] Registrar início/fim de higienização:
  - Responsável
  - Tipo de higienização (leve, profunda, terminal)
  - Checklist de higienização
- [ ] Tempo estimado de liberação
- [ ] Histórico de uso do leito
- [ ] Alertas de leitos indisponíveis há muito tempo

**Regras de Negócio:**
- RN-018: Leito em isolamento não aparece como disponível
- RN-019: Higienização segue POP específico (checklist obrigatório)

---

### APIs Necessárias

#### Dashboard
- `GET /api/internacoes/dashboard` - Lista internações com status
- `WS /ws/dashboard` - WebSocket para updates em tempo real

#### Escalas
- `GET /api/escalas?mes=2025-01` - Lista escalas do mês
- `POST /api/escalas` - Criar escala
- `PUT /api/escalas/:id` - Atualizar escala
- `POST /api/escalas/trocar` - Solicitar troca de plantão

#### Prontuário
- `GET /api/pets/:id/prontuario` - Prontuário completo
- `GET /api/pets/:id/timeline` - Linha do tempo
- `POST /api/pets/:id/anexos` - Upload de arquivo

#### Checklists
- `GET /api/checklist-templates?tipo=cirurgica` - Templates
- `POST /api/internacoes/:id/checklist` - Criar checklist para internação
- `PUT /api/checklist-itens/:id` - Marcar item como concluído

#### Alertas
- `GET /api/alertas?status=pendente` - Lista alertas
- `PUT /api/alertas/:id/resolver` - Marcar como resolvido

#### Chat
- `GET /api/internacoes/:id/mensagens` - Histórico
- `POST /api/mensagens` - Enviar mensagem
- `WS /ws/chat/:internacaoId` - Chat em tempo real

#### Leitos
- `GET /api/leitos` - Lista todos os leitos
- `PUT /api/leitos/:id/status` - Atualizar status
- `POST /api/leitos/:id/higienizacao` - Registrar higienização

---

## RF-02: Prescrição e Administração de Medicamentos (RAEM)

### Objetivo
Automatizar todo o processo de prescrição e aplicação de medicamentos, garantindo rastreabilidade e segurança.

---

### Funcionalidades

#### 2.1 Prescrição Digital pelo Médico

**User Story:**
> Como **médico**, eu quero **prescrever medicamentos digitalmente** diretamente no prontuário da internação, para **eliminar prescrições em papel e reduzir erros**.

**Critérios de Aceite:**
- [ ] Formulário de prescrição:
  - Buscar medicamento (autocomplete)
  - Dose (com sugestão baseada em peso do animal)
  - Via de administração (Oral, IV, IM, SC, Tópica)
  - Frequência (Ex: "8/8h", "BID", "TID", "PRN")
  - Duração do tratamento (dias)
  - Instruções especiais (texto livre)
- [ ] Adicionar múltiplos medicamentos na mesma prescrição
- [ ] Validações:
  - Dose máxima por kg de peso
  - Interações medicamentosas (alerta se houver)
  - Alergias do pet (bloqueio se alérgico)
- [ ] Salvar como rascunho ou confirmar prescrição
- [ ] Assinatura digital automática (médico logado)

**Regras de Negócio:**
- RN-020: Apenas médicos podem prescrever
- RN-021: Prescrição inválida sem assinatura digital
- RN-022: Alerta de interação medicamentosa é obrigatório
- RN-023: Prescrições válidas por 7 dias (padrão)

---

#### 2.2 Agendamento Automático de Doses e Horários

**User Story:**
> Como **sistema**, eu quero **gerar automaticamente os horários de administração** com base na frequência prescrita, para **facilitar o trabalho da enfermagem**.

**Critérios de Aceite:**
- [ ] Ao confirmar prescrição, sistema calcula horários automaticamente:
  - "8/8h" → próximas doses a cada 8 horas
  - "BID" → 2x ao dia (08:00 e 20:00)
  - "TID" → 3x ao dia (08:00, 14:00, 20:00)
  - "QID" → 4x ao dia
  - "PRN" (se necessário) → não agenda automaticamente
- [ ] Respeitar duração do tratamento (parar após N dias)
- [ ] Permitir ajuste manual de horários
- [ ] Gerar notificações/alertas 15min antes do horário
- [ ] Listar todas as doses pendentes (painel de enfermagem)

**Regras de Negócio:**
- RN-024: Doses geradas automaticamente não podem ser deletadas (apenas marcadas como "não administrada")
- RN-025: Horários devem respeitar rotina do hospital

**Cálculo de Frequências:**
```typescript
enum Frequencia {
  BID = '12/12h',  // 2x dia
  TID = '8/8h',    // 3x dia
  QID = '6/6h',    // 4x dia
  PRN = 'se_necessario'
}
```

---

#### 2.3 Painel de Enfermagem com Checagem de Aplicação

**User Story:**
> Como **enfermeiro**, eu quero **visualizar todas as doses pendentes de medicamentos** organizadas por horário, para **administrar no tempo correto**.

**Critérios de Aceite:**
- [ ] Lista de doses pendentes:
  - Horário programado
  - Pet (nome + foto)
  - Medicamento + dose
  - Via de administração
  - Status (Pendente, Atrasado, Administrado)
  - Tempo restante até horário (countdown)
- [ ] Filtros:
  - Por leito/setor
  - Por horário
  - Apenas atrasadas
  - Apenas críticas
- [ ] Ordenação: Por horário (mais urgente primeiro)
- [ ] Cores visuais:
  - 🟢 Verde: > 15min até horário
  - 🟡 Amarelo: < 15min até horário
  - 🔴 Vermelho: Atrasado
- [ ] Botão "Administrar" abre modal de confirmação

**Protótipo:**
```
┌──────────────────────────────────────────────────────────┐
│ 💊 Painel de Medicamentos             [Filtros ▼]        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔴 ATRASADO - 08:00 (30min atraso)                     │
│  🐕 Rex (Leito 12)                                       │
│  Amoxicilina 500mg - IV                                  │
│  [⚠️ Administrar Agora]                                  │
│  ─────────────────────────────────────────────────────── │
│  🟡 PRÓXIMO - 09:00 (em 10min)                          │
│  😺 Mia (Leito 08)                                       │
│  Dipirona 25mg/kg - IM                                   │
│  [✅ Administrar]                                        │
│  ─────────────────────────────────────────────────────── │
│  🟢 AGENDADO - 10:00 (em 1h20min)                       │
│  🐩 Spike (UTI-02)                                       │
│  Enrofloxacina 10mg - SC                                 │
│  [🕐 Aguardar]                                           │
└──────────────────────────────────────────────────────────┘
```

---

#### 2.4 Registro Eletrônico de Administração (RAEM Propriamente Dito)

**User Story:**
> Como **enfermeiro**, eu quero **registrar que administrei o medicamento** com minha assinatura digital, para **garantir rastreabilidade completa**.

**Critérios de Aceite:**
- [ ] Modal de confirmação ao clicar "Administrar":
  - Pet + medicamento + dose (readonly)
  - Selecionar lote do medicamento (vinculação)
  - Horário real de administração (auto-preenchido com agora)
  - Campo de observações (opcional)
  - Checkbox "Confirmo que administrei corretamente"
  - Botão "Confirmar e Assinar"
- [ ] Ao confirmar:
  - Gera hash de assinatura digital (SHA256)
  - Registra enfermeiro_id, timestamp, lote_id
  - Status muda para "Administrado"
  - Remove da lista de pendentes
  - Cria log de auditoria
- [ ] Não é possível "desfazer" administração (apenas adicionar observação posterior)

**Regras de Negócio:**
- RN-026: Assinatura digital obrigatória para validar administração
- RN-027: Lote deve ser informado (rastreabilidade)
- RN-028: Log de auditoria imutável

---

#### 2.5 Controle de Atrasos e Justificativas Obrigatórias

**User Story:**
> Como **gestor**, eu quero **saber o motivo de medicamentos administrados com atraso**, para **auditar a qualidade do atendimento**.

**Critérios de Aceite:**
- [ ] Se administrado > 30min após horário programado:
  - Campo "Motivo do Atraso" torna-se obrigatório
  - Opções predefinidas:
    - Alta demanda / falta de pessoal
    - Pet agitado / dificuldade de acesso
    - Medicamento indisponível temporariamente
    - Esquecimento (honestidade)
    - Outro (texto livre)
- [ ] Relatório de atrasos:
  - Total de doses atrasadas
  - Motivos mais frequentes
  - Enfermeiros com mais atrasos (para treinamento, não punição)
  - Horários críticos (ex: virada de turno)

**Regras de Negócio:**
- RN-029: Atraso > 30min requer justificativa obrigatória
- RN-030: Atraso > 2h gera alerta para gestor
- RN-031: Relatórios são confidenciais (não punitivos, apenas educativos)

---

#### 2.6 Vinculação a Lote/Validade e Logs Detalhados

**User Story:**
> Como **farmacêutico/gestor**, eu quero **rastrear qual lote de medicamento foi usado** em cada administração, para **recall em caso de problemas**.

**Critérios de Aceite:**
- [ ] Ao administrar, enfermeiro seleciona lote disponível:
  - Autocomplete mostra lotes do medicamento
  - Exibe validade (alerta se próximo do vencimento)
  - Exibe quantidade disponível
- [ ] Sistema registra:
  - lote_id
  - quantidade_utilizada
  - validade do lote
  - fabricante
- [ ] Rastreabilidade completa:
  - "Medicamento X, lote Y foi administrado em quais pets?"
  - "Pet Z recebeu quais lotes de Medicamento X?"
- [ ] Logs incluem:
  - quem_prescreveu (médico)
  - quem_administrou (enfermeiro)
  - quando_prescreveu
  - quando_deveria_administrar
  - quando_realmente_administrou
  - lote_utilizado

**Regras de Negócio:**
- RN-032: Lote vencido não pode ser selecionado
- RN-033: Lote com estoque zero não aparece nas opções
- RN-034: Logs são imutáveis (compliance CFMV/LGPD)

---

#### 2.7 Alertas de Doses Pendentes

**User Story:**
> Como **enfermeiro**, eu quero **receber alertas sonoros/visuais** 15 minutos antes do horário de cada medicamento, para **não esquecer nenhuma dose**.

**Critérios de Aceite:**
- [ ] Sistema envia notificação:
  - 15 minutos antes do horário programado
  - No horário exato
  - 30 minutos após (se ainda pendente)
- [ ] Tipos de notificação:
  - Toast notification (web)
  - Badge no ícone de medicamentos
  - Som (opcional, configurável)
  - Notificação push (futuro - mobile)
- [ ] Notificação inclui:
  - Pet
  - Medicamento + dose
  - Via de administração
  - Leito
  - Link direto para administrar
- [ ] Usuário pode "Adiar por 15min" (com justificativa)

**Regras de Negócio:**
- RN-035: Alertas críticos não podem ser silenciados
- RN-036: Adiamento > 2x requer aprovação do supervisor

---

### APIs Necessárias

#### Prescrição
- `POST /api/prescricoes` - Criar prescrição
- `GET /api/prescricoes/:id` - Detalhes da prescrição
- `PUT /api/prescricoes/:id` - Editar prescrição (se ativa)
- `DELETE /api/prescricoes/:id` - Cancelar prescrição
- `POST /api/prescricoes/:id/assinar` - Assinatura digital

#### Administração (RAEM)
- `GET /api/administracoes/pendentes` - Doses pendentes (painel enfermagem)
- `POST /api/administracoes/:id/administrar` - Registrar administração
- `POST /api/administracoes/:id/nao-administrar` - Marcar como não administrada (com motivo)
- `GET /api/administracoes/atrasadas` - Relatório de atrasos

#### Medicamentos (Catálogo)
- `GET /api/medicamentos?search=amoxicilina` - Buscar medicamento
- `GET /api/medicamentos/:id/lotes` - Lotes disponíveis
- `GET /api/medicamentos/:id/interacoes` - Interações medicamentosas

---

## RF-03: Integração de Imagens (PACS/DICOM)

### Objetivo
Conectar o sistema Zoa Pets aos equipamentos de imagem (RX, US, CT) sem necessidade de PACS próprio.

---

### Funcionalidades

#### 3.1 Registro de Pedidos de Exame (Accession Number)

**User Story:**
> Como **médico**, eu quero **solicitar exames de imagem** diretamente no prontuário, para **que o técnico saiba o que fazer e o PACS vincule as imagens corretamente**.

**Critérios de Aceite:**
- [ ] Formulário de solicitação de exame:
  - Tipo (Raio-X, Ultrassom, Tomografia, Ressonância)
  - Região anatômica (ex: "Tórax", "Abdômen", "Membro anterior D")
  - Indicação clínica (motivo do exame)
  - Urgência (Normal, Urgente, Emergência)
- [ ] Sistema gera automaticamente:
  - **Accession Number** único (ex: "ZP2025001234")
  - Study Instance UID (DICOM padrão)
- [ ] Exame aparece na fila do técnico de imagem
- [ ] Status do exame:
  - Solicitado
  - Em andamento
  - Imagens disponíveis
  - Laudado
  - Cancelado

**Regras de Negócio:**
- RN-037: Accession Number é único e sequencial
- RN-038: Apenas médicos podem solicitar exames de imagem
- RN-039: Indicação clínica é obrigatória

---

#### 3.2 Vinculação de Estudos e Laudos ao Prontuário

**User Story:**
> Como **médico**, eu quero **visualizar as imagens e laudos** diretamente no prontuário do pet, sem precisar acessar outro sistema.

**Critérios de Aceite:**
- [ ] Na aba "Exames" do prontuário:
  - Lista de exames de imagem solicitados
  - Status de cada exame
  - Link "Visualizar Imagens" (abre viewer)
  - Link "Ver Laudo" (se disponível)
  - Botão "Laudar" (apenas médicos)
- [ ] Integração com Orthanc PACS:
  - Busca estudo por Accession Number
  - Retorna Study Instance UID
  - Exibe thumbnail das imagens
- [ ] Laudo inclui:
  - Descrição técnica (texto livre)
  - Conclusão
  - Médico responsável
  - Data/hora
  - Assinatura digital

**Regras de Negócio:**
- RN-040: Laudo só pode ser criado se imagens estiverem disponíveis
- RN-041: Laudo assinado é imutável (pode criar adendo)

---

#### 3.3 Abertura Direta do Viewer do Fabricante

**User Story:**
> Como **médico**, eu quero **visualizar imagens DICOM** em um viewer apropriado, com ferramentas de medição e zoom.

**Critérios de Aceite:**
- [ ] Ao clicar "Visualizar Imagens":
  - Abre viewer DICOM (Orthanc Web Viewer ou integração com viewer do equipamento)
  - Exibe todas as imagens do estudo (séries)
  - Ferramentas disponíveis:
    - Zoom/Pan
    - Ajuste de janela (W/L - Window/Level)
    - Medições (distância, área, ângulo)
    - Anotações
- [ ] Viewer é embeddable (iframe) ou nova aba
- [ ] Funciona em qualquer navegador moderno

**Regras de Negócio:**
- RN-042: Acesso ao viewer gera log de auditoria
- RN-043: Apenas médicos e técnicos de imagem acessam viewer

---

#### 3.4 Upload e Vinculação de Laudos em PDF

**User Story:**
> Como **médico**, eu quero **fazer upload de laudos externos** (de clínicas terceirizadas) e vincular ao prontuário.

**Critérios de Aceite:**
- [ ] Botão "Upload de Laudo Externo"
- [ ] Arrastar e soltar arquivo PDF
- [ ] Validação:
  - Apenas PDF (max 10MB)
  - Nome do arquivo sugerido automaticamente: "{PetNome}_{TipoExame}_{Data}.pdf"
- [ ] Laudo vinculado ao exame específico ou ao prontuário geral
- [ ] Preview do PDF integrado

**Regras de Negócio:**
- RN-044: PDF é armazenado em S3 criptografado
- RN-045: Apenas formatos seguros (PDF, JPEG, PNG)

---

#### 3.5 Compatibilidade com Protocolos DICOM Padrão

**User Story:**
> Como **técnico de TI**, eu quero **integrar com qualquer equipamento DICOM padrão**, sem precisar de software proprietário.

**Critérios de Aceite:**
- [ ] Integração via Orthanc PACS (open-source)
- [ ] Suporte a:
  - DICOM C-STORE (receber imagens)
  - DICOM C-FIND (buscar estudos)
  - DICOM C-MOVE (recuperar imagens)
  - DICOM Web (WADO, QIDO, STOW)
- [ ] Configuração de AE Title (Application Entity):
  - Zoa Pets AE Title: "ZOAPETS"
  - IP/Porta configuráveis por hospital
- [ ] Worklist integration (DICOM MWL) (futuro)

**Regras de Negócio:**
- RN-046: Orthanc deve rodar em container Docker separado
- RN-047: Dados DICOM são isolados por tenant (schemas separados)

---

#### 3.6 Logs e Controle de Acesso às Imagens

**User Story:**
> Como **gestor/compliance**, eu quero **saber quem acessou quais imagens** e quando, para **auditoria LGPD**.

**Critérios de Aceite:**
- [ ] Logs registram:
  - user_id (quem acessou)
  - estudo_dicom_id (qual estudo)
  - acao (visualizar, laudar, download)
  - timestamp
  - ip_address
- [ ] Relatório de acessos:
  - Por usuário
  - Por exame
  - Por período
- [ ] Exportar logs em CSV

**Regras de Negócio:**
- RN-048: Logs são imutáveis e retidos por 5 anos (LGPD)
- RN-049: Acesso sem motivo válido é flagged para auditoria

---

### APIs Necessárias

#### Exames de Imagem
- `POST /api/exames-imagem` - Solicitar exame (gera Accession Number)
- `GET /api/exames-imagem/:id` - Detalhes do exame
- `PUT /api/exames-imagem/:id/status` - Atualizar status
- `POST /api/exames-imagem/:id/laudo` - Criar laudo
- `GET /api/exames-imagem/:id/viewer-url` - URL do viewer

#### Integração DICOM/Orthanc
- `GET /api/dicom/estudos?accessionNumber=ZP2025001234` - Buscar estudo
- `GET /api/dicom/estudos/:studyInstanceUID/series` - Listar séries
- `GET /api/dicom/estudos/:studyInstanceUID/viewer` - Abrir viewer
- `POST /api/dicom/upload-laudo` - Upload de PDF externo

#### Auditoria
- `GET /api/audit/acessos-dicom?userId=xxx` - Logs de acesso

---

## RF-04: POPs e Protocolos Clínicos

### Objetivo
Transformar os Procedimentos Operacionais Padrão (POPs) em fluxos digitais interativos e rastreáveis.

---

### Funcionalidades

#### 4.1 Cadastro de POPs Personalizáveis

**User Story:**
> Como **gestor**, eu quero **cadastrar POPs customizados** para o meu hospital, seguindo nossos protocolos internos.

**Critérios de Aceite:**
- [ ] Formulário de cadastro de POP:
  - Título (ex: "Higienização de Leito - Terminal")
  - Descrição completa
  - Categoria (Higienização, Coleta de Amostra, Descarte, Emergência, etc)
  - Versão (ex: "1.0", "2.1")
  - Upload de PDF (documento completo)
  - Status (Ativo, Em revisão, Obsoleto)
- [ ] Histórico de versões (quando atualizar POP)
- [ ] Aprovação de POP:
  - Criado por: [usuário]
  - Revisado por: [usuário]
  - Aprovado por: [gestor]
  - Data de vigência
- [ ] Busca e filtros:
  - Por categoria
  - Por palavra-chave
  - Apenas ativos

**Regras de Negócio:**
- RN-050: POP obsoleto não pode ser usado em novos checklists
- RN-051: Alteração de POP gera nova versão (não sobrescreve)
- RN-052: POPs devem ser revisados anualmente

---

#### 4.2 Checklists Automáticos Vinculados a Internações

**User Story:**
> Como **enfermeiro**, eu quero **que o checklist do POP apareça automaticamente** quando marco um leito para higienização ou inicio uma internação cirúrgica.

**Critérios de Aceite:**
- [ ] Templates de checklist baseados em POPs:
  - POP "Higienização Terminal" → Checklist de 10 itens
  - POP "Coleta de Sangue" → Checklist de 5 itens
  - POP "Pré-Operatório" → Checklist de 15 itens
- [ ] Checklist aparece automaticamente quando:
  - Leito vai para "Em Higienização"
  - Internação do tipo "Cirúrgica" é criada
  - Procedimento específico é iniciado
- [ ] Itens do checklist:
  - Descrição do passo
  - Checkbox de conclusão
  - Ordem de execução (opcional vs obrigatório)
  - Campo de observações
- [ ] Progresso visual: "8/10 itens concluídos"

**Regras de Negócio:**
- RN-053: Itens obrigatórios devem ser concluídos antes de finalizar
- RN-054: Checklist incompleto bloqueia conclusão da tarefa

---

#### 4.3 Registro de Responsável e Data/Hora de Execução

**User Story:**
> Como **auditor**, eu quero **saber quem executou cada item do POP** e quando, para **garantir conformidade**.

**Critérios de Aceite:**
- [ ] Ao marcar item como concluído:
  - Registra automaticamente:
    - user_id (quem concluiu)
    - timestamp (quando concluiu)
    - observacoes (se houver)
- [ ] Não é possível alterar "concluído" para "pendente" (imutável)
- [ ] Pode adicionar observação posterior (com novo timestamp)
- [ ] Relatório de execuções:
  - Por POP
  - Por usuário
  - Por período

**Regras de Negócio:**
- RN-055: Execução gera log de auditoria imutável
- RN-056: Apenas usuário logado pode marcar como concluído

---

#### 4.4 Assinatura Eletrônica de Conformidade

**User Story:**
> Como **responsável técnico**, eu quero **assinar digitalmente a conclusão do checklist**, atestando que todos os passos foram seguidos corretamente.

**Critérios de Aceite:**
- [ ] Ao finalizar checklist:
  - Modal "Confirmar Conformidade"
  - Exibe resumo: POP, data, itens concluídos, responsáveis
  - Checkbox "Declaro que todos os itens foram executados conforme POP"
  - Botão "Assinar e Finalizar"
- [ ] Assinatura digital:
  - Gera hash SHA256 do checklist completo
  - Registra user_id do assinante
  - Timestamp
  - Certificado digital (futuro - ICP-Brasil)
- [ ] Checklist assinado é imutável

**Regras de Negócio:**
- RN-057: Apenas supervisor ou responsável técnico pode assinar
- RN-058: Assinatura inválida se algum item obrigatório pendente
- RN-059: Hash garante integridade (detecta alterações)

---

#### 4.5 Relatórios de Auditoria e Conformidade

**User Story:**
> Como **gestor de qualidade**, eu quero **relatórios de conformidade com POPs**, para **auditorias internas e externas**.

**Critérios de Aceite:**
- [ ] Relatórios disponíveis:
  - **Conformidade por POP:**
    - Total de execuções
    - % de conformidade (concluídos vs pendentes)
    - Média de tempo de execução
    - Itens frequentemente pulados
  - **Conformidade por Usuário:**
    - Checklists concluídos
    - Taxa de conformidade
    - Atrasos médios
  - **Conformidade por Período:**
    - Execuções por mês
    - Tendências de melhoria
- [ ] Exportar relatório em:
  - PDF (para auditoria)
  - Excel (para análise)
- [ ] Filtros:
  - Data início/fim
  - POP específico
  - Usuário
  - Categoria

**Regras de Negócio:**
- RN-060: Relatórios refletem dados imutáveis (auditoria confiável)
- RN-061: Acesso a relatórios é logged

---

### APIs Necessárias

#### POPs
- `GET /api/pops` - Listar POPs ativos
- `POST /api/pops` - Cadastrar novo POP
- `PUT /api/pops/:id` - Atualizar POP (cria nova versão)
- `GET /api/pops/:id/historico` - Histórico de versões

#### Checklists
- `GET /api/checklist-templates` - Templates de checklist
- `POST /api/checklists` - Criar checklist para uma tarefa
- `GET /api/checklists/:id` - Detalhes do checklist
- `PUT /api/checklists/:id/item/:itemId` - Marcar item como concluído
- `POST /api/checklists/:id/assinar` - Assinatura digital de conformidade

#### Relatórios
- `GET /api/relatorios/conformidade-pops?inicio=2025-01&fim=2025-03` - Relatório de conformidade
- `GET /api/relatorios/conformidade-usuario/:userId` - Por usuário
- `POST /api/relatorios/export` - Exportar PDF/Excel

---

## RF-05: Farmácia e Controle de Estoque Hospitalar

### Objetivo
Gerenciar medicamentos e insumos com rastreabilidade total, controle de lotes e validade.

---

### Funcionalidades

#### 5.1 Dispensação Vinculada à Prescrição

**User Story:**
> Como **farmacêutico**, eu quero **dispensar medicamentos apenas com prescrição válida**, garantindo controle rigoroso.

**Critérios de Aceite:**
- [ ] Tela de dispensação:
  - Buscar prescrição por:
    - ID da prescrição
    - Nome do pet
    - Internação
  - Exibir itens prescritos ainda não dispensados:
    - Medicamento
    - Dose total (dose × duração)
    - Status (Pendente, Parcial, Dispensado)
- [ ] Ao dispensar:
  - Selecionar lote
  - Informar quantidade dispensada
  - Confirmar disponibilidade em estoque
  - Gerar movimentação de saída
- [ ] Prescrição fica marcada como "Dispensada"
- [ ] Enfermagem vê status "Disponível no leito"

**Regras de Negócio:**
- RN-062: Dispensação sem prescrição é bloqueada
- RN-063: Quantidade dispensada não pode exceder prescrito
- RN-064: Estoque é descontado automaticamente

---

#### 5.2 Controle de Lote, Validade e Fabricante

**User Story:**
> Como **farmacêutico**, eu quero **registrar lote, validade e fabricante** de cada produto, para **rastreabilidade e recall**.

**Critérios de Aceite:**
- [ ] Cadastro de lote:
  - Produto (FK)
  - Número do lote
  - Fabricante
  - Data de fabricação
  - Data de validade
  - Quantidade inicial
  - Quantidade atual (atualizada automaticamente)
- [ ] Busca de lotes:
  - Por produto
  - Por validade (próximos a vencer)
  - Por fabricante
- [ ] FIFO automático (First In, First Out):
  - Sistema sugere lote mais antigo primeiro
  - Alerta se tentar usar lote mais novo havendo antigo

**Regras de Negócio:**
- RN-065: Lote vencido não pode ser dispensado (bloqueio)
- RN-066: Sistema alerta lotes vencendo em 30 dias
- RN-067: Lote zerado não aparece em dispensação

---

#### 5.3 Alertas de Estoque Crítico e Vencimento

**User Story:**
> Como **farmacêutico/gestor**, eu quero **receber alertas automáticos** quando estoque estiver baixo ou produtos próximos ao vencimento.

**Critérios de Aceite:**
- [ ] Alertas gerados automaticamente:
  - 🔴 **Crítico:** Estoque abaixo do mínimo
  - 🟠 **Atenção:** Estoque em 20% do mínimo
  - 🟡 **Vencimento:** Produtos vencendo em 30 dias
  - 🔵 **Info:** Produtos vencendo em 90 dias
- [ ] Dashboard de farmácia:
  - Lista de alertas ativos
  - Gráfico de estoque por categoria
  - Produtos com movimento alto (fast-movers)
  - Produtos parados (slow-movers)
- [ ] Notificações:
  - Email diário com resumo de alertas
  - Notificação in-app
- [ ] Sugestão de pedido de compra automática (futuro)

**Regras de Negócio:**
- RN-068: Estoque mínimo configurável por produto
- RN-069: Produtos próximos ao vencimento devem ser usados primeiro (FEFO - First Expired First Out)

---

#### 5.4 Relatórios de Consumo por Paciente/Setor

**User Story:**
> Como **gestor**, eu quero **relatórios de consumo de medicamentos** por paciente, setor ou período, para **análise de custos e planejamento**.

**Critérios de Aceite:**
- [ ] Relatórios disponíveis:
  - **Por Paciente:**
    - Pet
    - Internação
    - Lista de medicamentos consumidos
    - Quantidade total
    - Custo total (se cadastrado)
  - **Por Setor:**
    - Setor (UTI, Internação, Cirúrgico)
    - Consumo por medicamento
    - Top 10 medicamentos mais usados
  - **Por Período:**
    - Consumo mensal/trimestral
    - Comparação com períodos anteriores
    - Tendências
- [ ] Exportar em Excel/PDF
- [ ] Filtros:
  - Data início/fim
  - Produto específico
  - Setor
  - Pet/Internação

**Regras de Negócio:**
- RN-070: Relatórios refletem apenas dispensações confirmadas
- RN-071: Custo é calculado por lote (FIFO)

---

#### 5.5 Gestão de Medicamentos Controlados

**User Story:**
> Como **farmacêutico**, eu quero **controle rigoroso de medicamentos controlados** (portaria 344/SVS), com registros obrigatórios.

**Critérios de Aceite:**
- [ ] Produtos marcados como "Controlado" (flag no cadastro)
- [ ] Dispensação de controlado exige:
  - Prescrição assinada digitalmente
  - Receituário específico (Receita A, B, C)
  - Registro adicional:
    - Número da receita
    - CRV do médico
    - CPF do responsável pelo animal
- [ ] Livro de registro de controlados (digital):
  - Data/hora
  - Medicamento + dose
  - Lote
  - Quantidade dispensada
  - Médico prescritor (CRV)
  - Tutor (CPF)
  - Assinatura farmacêutico
- [ ] Relatório específico para vigilância sanitária
- [ ] Inventário periódico obrigatório (mensal)

**Regras de Negócio:**
- RN-072: Controlados requerem dupla conferência (dois farmacêuticos)
- RN-073: Descarte de controlados segue POP específico
- RN-074: Logs de controlados são retidos por 5 anos (legislação)

---

#### 5.6 Controle de Cadeia Fria

**User Story:**
> Como **farmacêutico**, eu quero **monitorar temperatura de armazenamento** de medicamentos termolábeis, para **garantir eficácia**.

**Critérios de Aceite:**
- [ ] Produtos marcados como "Cadeia Fria" (requer controle de temperatura)
- [ ] Especificar faixa de temperatura:
  - Ex: "2-8°C" (vacinas, insulinas)
  - Ex: "15-25°C" (alguns antibióticos)
- [ ] Registro de temperatura:
  - Manual: Farmacêutico insere temperatura 2x/dia
  - Automático (futuro): Sensor IoT integrado
  - Data/hora
  - Temperatura registrada
  - Geladeira/freezer (localização)
- [ ] Alertas de quebra de cadeia fria:
  - Temperatura fora da faixa → Alerta imediato
  - Notificação para farmacêutico e gestor
  - Produto flagged como "Verificar Integridade"
- [ ] Relatório de cadeia fria:
  - Histórico de temperaturas
  - Incidentes (quebras)
  - Ações corretivas tomadas

**Regras de Negócio:**
- RN-075: Produto com quebra de cadeia fria não pode ser dispensado até aprovação
- RN-076: Quebra de cadeia fria gera alerta crítico
- RN-077: Histórico de temperatura é auditável

---

### APIs Necessárias

#### Dispensação
- `POST /api/dispensacoes` - Dispensar medicamento
- `GET /api/dispensacoes?prescricaoId=xxx` - Listar dispensações de uma prescrição
- `GET /api/prescricoes/:id/pendentes` - Itens ainda não dispensados

#### Estoque
- `GET /api/estoque` - Visão geral do estoque
- `POST /api/movimentacoes` - Registrar entrada/saída/ajuste
- `GET /api/produtos/:id/lotes` - Lotes disponíveis
- `GET /api/alertas/estoque` - Alertas de estoque crítico
- `GET /api/alertas/vencimento` - Produtos vencendo

#### Controlados
- `GET /api/controlados/registro` - Livro de controlados
- `POST /api/controlados/dispensar` - Dispensar controlado (validações extras)
- `GET /api/controlados/inventario` - Inventário mensal

#### Cadeia Fria
- `POST /api/cadeia-fria/temperatura` - Registrar temperatura
- `GET /api/cadeia-fria/temperaturas?geladeira=A&data=2025-01` - Histórico
- `GET /api/cadeia-fria/alertas` - Quebras de cadeia fria

#### Relatórios
- `GET /api/relatorios/consumo-paciente/:petId`
- `GET /api/relatorios/consumo-setor/:setor?inicio=2025-01&fim=2025-03`
- `GET /api/relatorios/consumo-periodo?inicio=2025-01&fim=2025-03`

---

## Resumo dos Módulos Core

| Módulo | Funcionalidades | Complexidade | Prioridade |
|--------|-----------------|--------------|------------|
| **RF-01: Painel Interno** | Dashboard, escalas, prontuário, checklists, alertas, chat, leitos | Alta | 🔥 Crítica (Fase 1) |
| **RF-02: RAEM** | Prescrição, agendamento, painel enfermagem, administração, rastreabilidade | Muito Alta | 🔥 Crítica (Fase 2) |
| **RF-03: PACS/DICOM** | Solicitação, integração Orthanc, viewer, laudos, auditoria | Alta | ⚠️ Importante (Fase 6) |
| **RF-04: POPs** | Cadastro, checklists, rastreabilidade, assinaturas, relatórios | Média | ✅ Desejável (Fase 3) |
| **RF-05: Farmácia** | Dispensação, lotes, alertas, relatórios, controlados, cadeia fria | Alta | ✅ Desejável (Fase 3) |

---

**Total de User Stories:** ~40
**Total de Regras de Negócio:** 77
**Total de APIs:** ~60 endpoints

---

**Versão:** 1.0
**Data:** 2025-10-19
**Próximo:** RF-06 a RF-10 (Gestão Hospitalar)
