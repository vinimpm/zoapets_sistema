\# RF-Workflow-Completo: Integração dos Módulos Ambulatoriais

\## 📋 Visão Geral

Este documento descreve a integração completa entre os módulos RF-01 (Agendamentos), RF-02 (Consultas) e RF-03 (Prescrições), demonstrando como o workflow ambulatorial funciona de ponta a ponta no sistema Zoa Pets.

\## 🎯 Objetivo

Documentar o fluxo integrado desde o contato inicial do cliente até a entrega da prescrição médica, mostrando como os módulos se comunicam e transitam dados entre si.

\## ✅ Status de Implementação

\*\*Backend:\*\* ✅ Completo e Integrado
\*\*Frontend:\*\* ✅ Completo e Integrado
\*\*Workflow:\*\* ✅ Funcional de ponta a ponta

\---

\## 🔄 Fluxo Completo: Visão Macro

\`\`\`mermaid
flowchart TD
    A[📞 Cliente Liga] --> B[👤 Recepcionista]
    B --> C[📅 Criar Agendamento]

    C --> D{Status}
    D -->|agendado| E[📞 Cliente Confirma]
    E --> F[✅ Confirmar Agendamento]

    F --> G[🕐 Dia/Hora Agendada]
    G --> H[Pet Chega]

    H --> I[👨‍⚕️ Veterinário]
    I --> J[🟢 Iniciar Atendimento]

    J --> K[🏥 Consulta Criada Automaticamente]

    K --> L[📝 Anamnese]
    L --> M[🩺 Exame Físico]
    M --> N[🔬 Diagnóstico]
    N --> O[💊 Conduta]

    O --> P{Precisa Medicação?}

    P -->|Sim| Q[💊 Criar Prescrição Ambulatorial]
    P -->|Não| R[✅ Concluir Consulta]

    Q --> R

    R --> S[📄 Imprimir Documentos]
    S --> T[🏠 Tutor Leva Pet para Casa]

    T --> U[Fim do Workflow Ambulatorial]
\`\`\`

\---

\## 📋 Passo a Passo Detalhado

\### Etapa 1: Agendamento (RF-01)

\*\*Ator:\*\* Recepcionista

\*\*Ações:\*\*
1. Cliente liga solicitando consulta
2. Recepcionista acessa \`/agendamentos\`
3. Clica em "Novo Agendamento"
4. Preenche:
   \- Pet (autocomplete)
   \- Veterinário
   \- Data/hora início e fim
   \- Tipo: "consulta"
   \- Motivo: "Tosse há 3 dias"
5. Clica em "Salvar"

\*\*API:\*\*
\`\`\`http
POST /agendamentos
{
  "petId": "uuid",
  "veterinarioId": "uuid",
  "dataHoraInicio": "2025-01-15T10:00:00Z",
  "dataHoraFim": "2025-01-15T10:30:00Z",
  "tipo": "consulta",
  "motivo": "Tosse há 3 dias"
}
\`\`\`

\*\*Resultado:\*\*
\- Agendamento criado com status \`agendado\`
\- Aparece no calendário da recepção
\- Veterinário vê na sua agenda

\---

\### Etapa 2: Confirmação (RF-01)

\*\*Ator:\*\* Recepcionista

\*\*Ações:\*\*
1. Cliente liga confirmando presença
2. Recepcionista busca agendamento
3. Clica em "Confirmar"

\*\*API:\*\*
\`\`\`http
PATCH /agendamentos/:id/confirmar
\`\`\`

\*\*Resultado:\*\*
\- Status altera para \`confirmado\`
\- Campo \`confirmadoEm\` registra timestamp

\---

\### Etapa 3: Iniciar Atendimento (RF-01 → RF-02)

\*\*Ator:\*\* Veterinário

\*\*Ações:\*\*
1. Pet chega na clínica
2. Veterinário acessa \`/agendamentos\`
3. Localiza o agendamento confirmado
4. Clica em "Iniciar Atendimento"

\*\*API:\*\*
\`\`\`http
PATCH /agendamentos/:id/iniciar-atendimento
\`\`\`

\*\*Ações do Backend:\*\*
1. Atualiza agendamento:
   \- Status: \`em_atendimento\`
2. Cria automaticamente consulta:
\`\`\`typescript
const consulta = {
  agendamentoId: agendamento.id,
  petId: agendamento.petId,
  tutorId: agendamento.pet.tutorId,
  veterinarioId: agendamento.veterinarioId,
  tipo: 'ambulatorial',
  dataAtendimento: new Date(),
  queixaPrincipal: agendamento.motivo,
  status: 'em_atendimento'
};
\`\`\`

\*\*Resultado:\*\*
\- ✅ Consulta criada automaticamente
\- 🔀 Sistema redireciona para \`/consultas/:id\`
\- Veterinário vê tela de atendimento

\---

\### Etapa 4: Atendimento - Anamnese (RF-02)

\*\*Ator:\*\* Veterinário

\*\*Tela:\*\* \`/consultas/:id\` - Aba "Anamnese"

\*\*Ações:\*\*
1. Conversa com tutor
2. Preenche queixa principal (já pré-preenchida do agendamento)
3. Adiciona histórico clínico
4. Clica em "Salvar"

\*\*API:\*\*
\`\`\`http
PATCH /consultas/:id
{
  "queixaPrincipal": "Tosse seca há 3 dias, pior à noite",
  "historico": "Pet teve traqueobronquite há 1 ano. Vacinação em dia."
}
\`\`\`

\*\*Resultado:\*\*
\- Dados salvos (save-as-you-go)
\- Veterinário pode continuar para próxima aba

\---

\### Etapa 5: Atendimento - Exame Físico (RF-02)

\*\*Ator:\*\* Veterinário

\*\*Tela:\*\* \`/consultas/:id\` - Aba "Exame Físico"

\*\*Ações:\*\*
1. Examina o pet
2. Preenche campos:
   \- Temperatura: 38.7°C
   \- FC: 120 bpm
   \- FR: 32 rpm
   \- TPC: <2s
   \- Mucosas: rosadas
   \- Hidratação: normal
   \- Ausculta: "Sons respiratórios aumentados bilateralmente"
   \- Palpação: "Abdome mole e indolor"
3. Clica em "Salvar"

\*\*API:\*\*
\`\`\`http
PATCH /consultas/:id
{
  "temperatura": 38.7,
  "frequenciaCardiaca": 120,
  "frequenciaRespiratoria": 32,
  "tpc": "<2s",
  "mucosas": "rosadas",
  "hidratacao": "normal",
  "ausculta": "Sons respiratórios aumentados bilateralmente",
  "palpacao": "Abdome mole e indolor"
}
\`\`\`

\*\*Resultado:\*\*
\- Exame físico registrado
\- Dados disponíveis para próxima consulta (histórico)

\---

\### Etapa 6: Atendimento - Diagnóstico e Conduta (RF-02)

\*\*Ator:\*\* Veterinário

\*\*Tela:\*\* \`/consultas/:id\` - Aba "Diagnóstico e Conduta"

\*\*Ações:\*\*
1. Analisa dados da anamnese e exame
2. Preenche:
   \- Diagnóstico: "Traqueobronquite infecciosa canina (Tosse dos Canis)"
   \- Conduta: "Terapia antibiótica e antitussígeno. Repouso."
   \- Orientações: "Manter em repouso por 7 dias. Evitar passeios longos. Retornar se piorar."
   \- Custo Total: R$ 280,00
3. Clica em "Salvar"

\*\*API:\*\*
\`\`\`http
PATCH /consultas/:id
{
  "diagnostico": "Traqueobronquite infecciosa canina (Tosse dos Canis)",
  "conduta": "Terapia antibiótica e antitussígeno. Repouso.",
  "orientacoes": "Manter em repouso por 7 dias. Evitar passeios longos. Retornar se piorar.",
  "custoTotal": 280.00
}
\`\`\`

\*\*Resultado:\*\*
\- Diagnóstico registrado
\- Consulta pronta para ser concluída

\---

\### Etapa 7: Prescrição Médica (RF-02 → RF-03)

\*\*Ator:\*\* Veterinário

\*\*Tela:\*\* \`/consultas/:id\` - Aba "Prescrições"

\*\*Ações:\*\*
1. Clica em "Nova Prescrição"
2. Dialog abre com formulário
3. Adiciona medicamentos:

\*\*Medicamento 1:\*\*
\- Nome: Amoxicilina 250mg
\- Dose: 1 comprimido
\- Via: oral
\- Frequência: BID (2x ao dia)
\- Duração: 7 dias
\- Horários: 08:00, 20:00
\- Instruções: "Administrar com alimento"

\*\*Medicamento 2:\*\*
\- Nome: Bromexina Xarope
\- Dose: 5ml
\- Via: oral
\- Frequência: TID (3x ao dia)
\- Duração: 5 dias
\- Horários: 08:00, 14:00, 20:00
\- Instruções: "Pode misturar com ração"

4. Observações gerais: "Manter hidratação adequada"
5. Clica em "Salvar Prescrição"

\*\*API:\*\*
\`\`\`http
POST /prescricoes
{
  "tipo": "ambulatorial",
  "consultaId": "uuid-consulta",
  "petId": "uuid-pet",
  "veterinarioId": "uuid-vet",
  "dataPrescricao": "2025-01-15T10:00:00Z",
  "dataValidade": "2025-01-22T10:00:00Z",
  "observacoes": "Manter hidratação adequada",
  "itens": [
    {
      "medicamentoId": "uuid-amoxicilina",
      "dose": "1 comprimido",
      "viaAdministracao": "oral",
      "frequencia": "BID",
      "duracaoDias": 7,
      "horarios": ["08:00", "20:00"],
      "instrucoes": "Administrar com alimento"
    },
    {
      "medicamentoId": "uuid-bromexina",
      "dose": "5ml",
      "viaAdministracao": "oral",
      "frequencia": "TID",
      "duracaoDias": 5,
      "horarios": ["08:00", "14:00", "20:00"],
      "instrucoes": "Pode misturar com ração"
    }
  ]
}
\`\`\`

\*\*Lógica do Backend (prescricoes.service.ts:88-91):\*\*
\`\`\`typescript
const tipo = createPrescricaoDto.tipo || 'hospitalar';
// ... cria prescrição e itens ...

if (tipo === 'hospitalar') {
  await this.scheduleAdministracoes(savedItem, new Date(createPrescricaoDto.dataPrescricao));
}
// tipo === 'ambulatorial' → NÃO agenda administrações
\`\`\`

\*\*Resultado:\*\*
\- ✅ Prescrição criada com status \`ativa\`
\- ✅ 2 itens criados
\- ❌ Administrações NÃO criadas (prescrição ambulatorial)
\- 📄 Prescrição aparece na aba de prescrições da consulta
\- 🖨️ Botão "Imprimir Receita" habilitado

\---

\### Etapa 8: Conclusão da Consulta (RF-02)

\*\*Ator:\*\* Veterinário

\*\*Tela:\*\* \`/consultas/:id\`

\*\*Ações:\*\*
1. Revisa todos os dados preenchidos
2. Clica em "Concluir Consulta"

\*\*API:\*\*
\`\`\`http
PATCH /consultas/:id/concluir
\`\`\`

\*\*Validações do Backend:\*\*
\- ✅ \`queixaPrincipal\` preenchida?
\- ✅ \`diagnostico\` preenchido?
\- ✅ \`conduta\` preenchida?
\- ✅ Status é \`em_atendimento\`?

\*\*Ações do Backend:\*\*
1. Atualiza consulta:
   \- Status: \`concluida\`
2. Atualiza agendamento vinculado (se houver):
   \- Status: \`concluido\`

\*\*Resultado:\*\*
\- ✅ Consulta finalizada
\- ✅ Agendamento marcado como concluído
\- 🔒 Consulta não pode mais ser editada (exceto por Admin)
\- 🖨️ Documentos prontos para impressão

\---

\### Etapa 9: Impressão e Entrega (Sistema → Tutor)

\*\*Ator:\*\* Veterinário ou Recepcionista

\*\*Ações:\*\*
1. Clica em "Imprimir Receita" na aba de prescrições
2. Sistema gera PDF formatado com:
   \- Cabeçalho da clínica
   \- Nome do veterinário e CRMV
   \- Nome do pet e tutor
   \- Data da consulta
   \- Diagnóstico
   \- Lista de medicamentos:
     - Nome do medicamento
     - Dose
     - Via de administração
     - Frequência e horários
     - Duração
     - Instruções especiais
   \- Observações gerais
   \- Orientações
   \- Assinatura e carimbo do veterinário
3. Imprime receita
4. Entrega ao tutor

\*\*Tutor Recebe:\*\*
\- 📄 Receita médica
\- 📋 Orientações impressas
\- 🧾 Guia de administração (horários)
\- 💵 Nota fiscal (se aplicável)

\---

\### Etapa 10: Pós-Consulta

\*\*Tutor:\*\*
\- Compra medicamentos na farmácia
\- Administra em casa conforme prescrição
\- Liga se tiver dúvidas
\- Retorna em 7 dias (novo agendamento)

\*\*Sistema:\*\*
\- Consulta fica no histórico do pet
\- Prescrição fica no histórico médico
\- Dados disponíveis para próximas consultas
\- Financeiro registra o custo da consulta

\---

\## 🔀 Pontos de Integração entre Módulos

\### 1. Agendamento → Consulta

\*\*Gatilho:\*\* \`PATCH /agendamentos/:id/iniciar-atendimento\`

\*\*Dados Transferidos:\*\*
\- \`agendamentoId\` → \`consulta.agendamentoId\`
\- \`petId\` → \`consulta.petId\`
\- \`veterinarioId\` → \`consulta.veterinarioId\`
\- \`motivo\` → \`consulta.queixaPrincipal\`
\- \`pet.tutorId\` → \`consulta.tutorId\`

\*\*Status:\*\*
\- Agendamento: \`confirmado\` → \`em_atendimento\`
\- Consulta: criada com \`em_atendimento\`

\---

\### 2. Consulta → Prescrição

\*\*Gatilho:\*\* \`POST /prescricoes\` (com \`tipo: 'ambulatorial'\`)

\*\*Dados Transferidos:\*\*
\- \`consultaId\` → \`prescricao.consultaId\`
\- \`consulta.petId\` → \`prescricao.petId\`
\- \`consulta.veterinarioId\` → \`prescricao.veterinarioId\`

\*\*Relação:\*\*
\- Uma consulta pode ter múltiplas prescrições
\- Prescrição referencia a consulta

\---

\### 3. Consulta → Agendamento (Conclusão)

\*\*Gatilho:\*\* \`PATCH /consultas/:id/concluir\`

\*\*Ação:\*\*
\- Se consulta tem \`agendamentoId\`:
  - Atualiza agendamento: status → \`concluido\`

\*\*Resultado:\*\*
\- Agendamento e consulta sincronizados como finalizados

\---

\## 📊 Diagrama de Sequência

\`\`\`mermaid
sequenceDiagram
    participant T as Tutor
    participant R as Recepcionista
    participant V as Veterinário
    participant S as Sistema
    participant DB as Banco de Dados

    T->>R: Liga solicitando consulta
    R->>S: POST /agendamentos
    S->>DB: Cria Agendamento (status: agendado)
    DB-->>S: Agendamento criado
    S-->>R: Confirmação

    T->>R: Liga confirmando presença
    R->>S: PATCH /agendamentos/:id/confirmar
    S->>DB: Atualiza (status: confirmado)
    DB-->>S: Atualizado
    S-->>R: Confirmado

    Note over T,V: Dia do atendimento

    T->>V: Pet chega para consulta
    V->>S: PATCH /agendamentos/:id/iniciar-atendimento
    S->>DB: Atualiza Agendamento (status: em_atendimento)
    S->>DB: Cria Consulta (status: em_atendimento)
    DB-->>S: Consulta criada
    S-->>V: Redireciona para /consultas/:id

    V->>S: PATCH /consultas/:id (Anamnese)
    S->>DB: Atualiza Consulta
    V->>S: PATCH /consultas/:id (Exame Físico)
    S->>DB: Atualiza Consulta
    V->>S: PATCH /consultas/:id (Diagnóstico)
    S->>DB: Atualiza Consulta

    V->>S: POST /prescricoes (tipo: ambulatorial)
    S->>DB: Cria Prescrição
    S->>DB: Cria Itens
    Note over S,DB: NÃO cria Administrações (ambulatorial)
    DB-->>S: Prescrição criada
    S-->>V: Prescrição disponível

    V->>S: PATCH /consultas/:id/concluir
    S->>DB: Atualiza Consulta (status: concluida)
    S->>DB: Atualiza Agendamento (status: concluido)
    DB-->>S: Atualizado
    S-->>V: Consulta concluída

    V->>S: Imprimir receita
    S-->>V: PDF gerado
    V->>T: Entrega receita

    T-->>T: Administra medicação em casa
\`\`\`

\---

\## 🗂️ Estrutura de Dados Relacionados

\`\`\`typescript
// Agendamento
{
  id: "uuid-agendamento",
  petId: "uuid-pet",
  veterinarioId: "uuid-vet",
  tipo: "consulta",
  status: "concluido", // agendado → confirmado → em_atendimento → concluido
  dataHoraInicio: "2025-01-15T10:00:00Z"
}

// Consulta (referencia Agendamento)
{
  id: "uuid-consulta",
  agendamentoId: "uuid-agendamento", // ✅ Vínculo
  petId: "uuid-pet",
  veterinarioId: "uuid-vet",
  tipo: "ambulatorial",
  status: "concluida", // em_atendimento → concluida
  queixaPrincipal: "Tosse há 3 dias",
  diagnostico: "Traqueobronquite infecciosa canina",
  conduta: "Terapia antibiótica e antitussígeno"
}

// Prescrição (referencia Consulta)
{
  id: "uuid-prescricao",
  tipo: "ambulatorial", // ✅ Tipo
  consultaId: "uuid-consulta", // ✅ Vínculo
  petId: "uuid-pet",
  veterinarioId: "uuid-vet",
  status: "ativa",
  dataPrescricao: "2025-01-15T10:00:00Z",
  dataValidade: "2025-01-22T10:00:00Z"
}

// Itens da Prescrição
[
  {
    id: "uuid-item1",
    prescricaoId: "uuid-prescricao",
    medicamentoId: "uuid-amoxicilina",
    dose: "1 comprimido",
    frequencia: "BID",
    horarios: ["08:00", "20:00"]
  }
]

// Administrações (VAZIO para ambulatorial)
[]
\`\`\`

\---

\## 🔑 Diferenças Críticas: Workflow Ambulatorial vs Hospitalar

| Aspecto | 🏠 Ambulatorial | 🏥 Hospitalar |
|---------|----------------|---------------|
| \*\*Início\*\* | Agendamento → Consulta | Consulta/Emergência → Internação |
| \*\*Prescrição tipo\*\* | \`ambulatorial\` | \`hospitalar\` |
| \*\*Prescrição referencia\*\* | \`consultaId\` | \`internacaoId\` |
| \*\*Cria Administrações?\*\* | ❌ Não | ✅ Sim (RAM) |
| \*\*Quem administra?\*\* | Tutor em casa | Enfermeiro no hospital |
| \*\*Documento\*\* | Receita impressa | Prontuário interno |
| \*\*Controle\*\* | Responsabilidade do tutor | Sistema com checkoffs |
| \*\*Duração\*\* | Geralmente 5-14 dias | Enquanto internado |

\---

\## 📝 Checklist de Validação do Workflow

\### ✅ Agendamento
\- [x] Criar agendamento (status: agendado)
\- [x] Confirmar agendamento (status: confirmado)
\- [x] Iniciar atendimento (status: em_atendimento)
\- [x] Criar consulta automaticamente ao iniciar

\### ✅ Consulta
\- [x] Consulta criada com agendamentoId
\- [x] Salvar anamnese parcialmente
\- [x] Salvar exame físico parcialmente
\- [x] Salvar diagnóstico e conduta
\- [x] Validar campos obrigatórios ao concluir
\- [x] Atualizar agendamento ao concluir

\### ✅ Prescrição
\- [x] Criar prescrição tipo 'ambulatorial'
\- [x] Vincular consultaId
\- [x] Criar múltiplos itens
\- [x] NÃO criar administrações (ambulatorial)
\- [x] Disponibilizar para impressão

\### ✅ Integração
\- [x] Agendamento → Consulta (dados transferidos)
\- [x] Consulta → Prescrição (referência correta)
\- [x] Consulta → Agendamento (status sincronizado)

\---

\## 🚀 Casos de Uso Alternativos

\### Caso 1: Consulta sem Prescrição

\*\*Cenário:\*\* Pet apenas para vacinação de rotina

\*\*Fluxo:\*\*
1. Agendamento → Consulta
2. Veterinário preenche dados mínimos
3. Aplica vacina
4. Concluir consulta SEM criar prescrição
5. Fim

\---

\### Caso 2: Consulta que Gera Internação

\*\*Cenário:\*\* Pet precisa ser internado

\*\*Fluxo:\*\*
1. Agendamento → Consulta
2. Veterinário preenche consulta
3. Clica em "Gerar Internação"
4. Sistema cria internação
5. Consulta status: \`gerou_internacao\`
6. Sistema redireciona para /internacoes/:id
7. Workflow hospitalar inicia
8. Prescrições subsequentes serão tipo \`hospitalar\` (com RAM)

\---

\### Caso 3: Consulta de Emergência (sem Agendamento)

\*\*Cenário:\*\* Pet chega em emergência

\*\*Fluxo:\*\*
1. Veterinário cria consulta diretamente (POST /consultas)
2. Campo \`agendamentoId\` fica vazio
3. Tipo: \`emergencia\`
4. Fluxo continua normalmente (anamnese, exame, diagnóstico, prescrição)
5. Pode gerar prescrição ambulatorial ou internação

\---

\## 📌 Observações Importantes

1. \*\*Criação Automática:\*\* Consulta é criada AUTOMATICAMENTE ao iniciar atendimento de agendamento
2. \*\*Save-as-you-go:\*\* Campos podem ser salvos parcialmente durante atendimento
3. \*\*Validação na Conclusão:\*\* Campos obrigatórios só são validados ao concluir
4. \*\*Sincronização:\*\* Agendamento e consulta mantêm status sincronizados
5. \*\*Prescrição Opcional:\*\* Nem toda consulta precisa gerar prescrição
6. \*\*Múltiplas Prescrições:\*\* Uma consulta pode ter várias prescrições
7. \*\*Distinção de Tipo:\*\* Campo \`tipo\` da prescrição define comportamento (RAM ou não)

\---

\## 🔗 Documentação Relacionada

\- [RF-01: Agendamentos](./RF-01-Agendamentos.md)
\- [RF-02: Consultas](./RF-02-Consultas.md)
\- [RF-03: Prescrições](./RF-03-Prescricoes.md)
\- [WORKFLOW_AMBULATORIAL.md](./WORKFLOW_AMBULATORIAL.md)

\---

\*\*Última atualização:\*\* 2025-01-21
\*\*Versão:\*\* 1.0
\*\*Status:\*\* ✅ Workflow Completo Implementado e Funcional
