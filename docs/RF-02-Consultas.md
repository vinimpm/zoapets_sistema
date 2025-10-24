\# RF-02: Módulo de Consultas

\## 📋 Visão Geral

O módulo de consultas é o núcleo do atendimento veterinário ambulatorial, permitindo registro completo da anamnese, exame físico, diagnóstico e conduta médica.

\## 🎯 Objetivo

Documentar o atendimento clínico veterinário de forma estruturada, desde a avaliação inicial até a conclusão do caso, servindo como prontuário médico eletrônico ambulatorial.

\## ✅ Status de Implementação

\*\*Backend:\*\* ✅ Completo
\*\*Frontend:\*\* ✅ Completo
\*\*Integração:\*\* ✅ Funcional

\---

\## 🔧 Funcionalidades Implementadas

\### 1. Criar Consulta

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Cria um novo registro de consulta. Geralmente criado automaticamente via "Iniciar Atendimento" do agendamento (RF-01).

\*\*Endpoint:\*\* \`POST /consultas\`

\*\*Payload:\*\*
\`\`\`json
{
  "petId": "uuid",
  "tutorId": "uuid",
  "veterinarioId": "uuid",
  "agendamentoId": "uuid", // opcional - preenchido automaticamente ao iniciar de agendamento
  "tipo": "ambulatorial", // ambulatorial, emergencia, retorno
  "dataAtendimento": "2025-01-15T10:00:00Z",
  "queixaPrincipal": "Tosse há 3 dias",
  "historico": "Pet está com tosse seca, pior à noite"
}
\`\`\`

\*\*Regras de Negócio:\*\*
\- Status inicial: \`em_atendimento\`
\- Pet e tutor devem existir no sistema
\- Veterinário deve ter papel "Veterinário"
\- Se criado via agendamento, \`agendamentoId\` é preenchido automaticamente
\- Campos clínicos (exame físico, diagnóstico) podem ser preenchidos posteriormente

\---

\### 2. Listar Consultas

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Lista consultas com filtros opcionais.

\*\*Endpoint:\*\* \`GET /consultas?data=2025-01-15&veterinarioId=uuid&status=em_atendimento&petId=uuid\`

\*\*Filtros Disponíveis:\*\*
\- \`data\`: Filtra por data específica
\- \`veterinarioId\`: Filtra por veterinário
\- \`status\`: Filtra por status (em_atendimento, concluida, gerou_internacao)
\- \`petId\`: Filtra consultas de um pet específico

\*\*Resposta:\*\*
\`\`\`json
[
  {
    "id": "uuid",
    "pet": {
      "id": "uuid",
      "nome": "Rex",
      "especie": "Canina",
      "raca": "Labrador"
    },
    "tutor": {
      "id": "uuid",
      "nome": "João Silva",
      "telefone": "(11) 98765-4321"
    },
    "veterinario": {
      "id": "uuid",
      "nome": "Dra. Maria Santos"
    },
    "tipo": "ambulatorial",
    "dataAtendimento": "2025-01-15T10:00:00Z",
    "status": "em_atendimento",
    "queixaPrincipal": "Tosse há 3 dias",
    "diagnostico": null
  }
]
\`\`\`

\---

\### 3. Buscar Consultas por Pet

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Retorna histórico de consultas de um pet específico (prontuário).

\*\*Endpoint:\*\* \`GET /consultas/pet/:petId\`

\*\*Uso:\*\* Visualizar histórico médico completo do animal

\---

\### 4. Buscar Consulta Específica

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Busca detalhes completos de uma consulta.

\*\*Endpoint:\*\* \`GET /consultas/:id\`

\*\*Relações Carregadas:\*\*
\- Pet (com tutor)
\- Tutor
\- Veterinário
\- Agendamento (se aplicável)

\---

\### 5. Atualizar Consulta

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Permite editar e preencher informações da consulta durante o atendimento.

\*\*Endpoint:\*\* \`PATCH /consultas/:id\`

\*\*Payload:\*\* (todos os campos são opcionais)
\`\`\`json
{
  // Anamnese
  "queixaPrincipal": "Tosse há 3 dias, pior à noite",
  "historico": "Pet está com tosse seca. Já teve traqueobronquite há 1 ano.",

  // Exame Físico
  "temperatura": 38.5,
  "frequenciaCardiaca": 120,
  "frequenciaRespiratoria": 30,
  "tpc": "<2s",
  "mucosas": "rosadas",
  "hidratacao": "normal",
  "ausculta": "Sons respiratórios aumentados, sem crepitações",
  "palpacao": "Abdome mole e indolor",
  "exameFisicoObs": "Animal alerta e responsivo",

  // Diagnóstico e Conduta
  "diagnostico": "Suspeita de traqueobronquite infecciosa canina",
  "conduta": "Terapia antibiótica e antitussígeno",
  "orientacoes": "Manter em repouso. Retornar em 5 dias para reavaliação.",

  // Financeiro
  "custoTotal": 250.00
}
\`\`\`

\*\*Regras de Negócio:\*\*
\- Só pode atualizar consulta com status \`em_atendimento\`
\- Campos podem ser salvos parcialmente (save-as-you-go)

\---

\### 6. Concluir Consulta

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Finaliza a consulta, marcando como concluída.

\*\*Endpoint:\*\* \`PATCH /consultas/:id/concluir\`

\*\*Ação:\*\*
1. Altera status para \`concluida\`
2. Valida que campos obrigatórios estão preenchidos
3. Atualiza agendamento vinculado para status \`concluido\` (se houver)

\*\*Regras de Negócio:\*\*
\- Campos obrigatórios para conclusão:
  - \`queixaPrincipal\`
  - \`diagnostico\`
  - \`conduta\`
\- Só pode concluir consulta com status \`em_atendimento\`
\- Após conclusão, consulta não pode mais ser editada (exceto por Administrador)

\*\*Fluxo Subsequente:\*\*
\- Se prescrição ambulatorial necessária → RF-03 (Prescrições)
\- Se necessita internação → usar "Gerar Internação"
\- Se consulta simples → Finalizado, documentos impressos para tutor

\---

\### 7. Gerar Internação

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Marca que a consulta resultou em internação hospitalar.

\*\*Endpoint:\*\* \`PATCH /consultas/:id/gerar-internacao\`

\*\*Payload:\*\*
\`\`\`json
{
  "internacaoId": "uuid"
}
\`\`\`

\*\*Ação:\*\*
1. Altera status para \`gerou_internacao\`
2. Vincula \`internacaoId\` à consulta
3. Finaliza consulta automaticamente

\*\*Regras de Negócio:\*\*
\- Internação deve existir no sistema
\- Internação deve ser do mesmo pet da consulta
\- Após gerar internação, workflow segue para módulo hospitalar

\*\*Fluxo Subsequente:\*\*
\- Sistema redireciona para tela de internação
\- Prescrições subsequentes serão do tipo \`hospitalar\` (com RAM)

\---

\### 8. Deletar Consulta

\*\*Ator:\*\* Administrador

\*\*Descrição:\*\* Remove permanentemente uma consulta.

\*\*Endpoint:\*\* \`DELETE /consultas/:id\`

\*\*Regras de Negócio:\*\*
\- Apenas Administrador pode deletar
\- Não pode deletar consulta que gerou internação
\- Não pode deletar consulta com prescrições vinculadas

\---

\## 📊 Modelo de Dados

\`\`\`typescript
interface Consulta {
  id: string;
  petId: string;
  tutorId: string;
  veterinarioId: string;
  agendamentoId?: string;
  tipo: 'ambulatorial' | 'emergencia' | 'retorno';
  dataAtendimento: Date;

  // Anamnese
  queixaPrincipal: string;
  historico?: string;

  // Exame Físico
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  tpc?: string;
  mucosas?: string;
  hidratacao?: string;
  ausculta?: string;
  palpacao?: string;
  exameFisicoObs?: string;

  // Diagnóstico e Conduta
  diagnostico?: string;
  conduta?: string;
  orientacoes?: string;

  // Status e Controle
  status: 'em_atendimento' | 'concluida' | 'gerou_internacao';
  internacaoId?: string;
  custoTotal?: number;

  createdAt: Date;
  updatedAt: Date;

  // Relações
  pet: Pet;
  tutor: Tutor;
  veterinario: User;
}
\`\`\`

\---

\## 🔄 Diagrama de Estados

\`\`\`mermaid
stateDiagram-v2
    [*] --> em_atendimento: Criar consulta
    em_atendimento --> em_atendimento: Atualizar dados
    em_atendimento --> concluida: Concluir
    em_atendimento --> gerou_internacao: Gerar Internação

    concluida --> [*]
    gerou_internacao --> [*]
\`\`\`

\---

\## 🩺 Estrutura do Atendimento

\### Fase 1: Anamnese
\- Queixa principal (obrigatório)
\- Histórico clínico
\- Informações do tutor sobre comportamento, alimentação, etc.

\### Fase 2: Exame Físico
\- Sinais vitais (temperatura, FC, FR)
\- Tempo de preenchimento capilar (TPC)
\- Coloração de mucosas
\- Hidratação
\- Ausculta cardiorrespiratória
\- Palpação abdominal
\- Observações gerais

\### Fase 3: Diagnóstico
\- Diagnóstico presuntivo ou definitivo (obrigatório para conclusão)
\- Exames complementares solicitados (se aplicável)

\### Fase 4: Conduta
\- Tratamento prescrito (obrigatório para conclusão)
\- Orientações ao tutor
\- Plano de acompanhamento

\---

\## 🔐 Controle de Acesso

| Ação | Recepcionista | Veterinário | Enfermeiro | Administrador | Gerente |
|------|--------------|-------------|------------|---------------|---------|
| Criar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Listar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Atualizar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Concluir | ❌ | ✅ | ❌ | ✅ | ✅ |
| Gerar Internação | ❌ | ✅ | ❌ | ✅ | ✅ |
| Deletar | ❌ | ❌ | ❌ | ✅ | ❌ |

\---

\## 🎨 Interface Frontend

\### Tela: /consultas

\*\*Componentes:\*\*
\- Lista de consultas em atendimento
\- Filtros: veterinário, data, status, pet
\- Cards com resumo: pet, queixa principal, veterinário
\- Indicador de status colorido
\- Botão "Nova Consulta" (uso raro - geralmente criado via agendamento)

\### Tela: /consultas/\[id\]

\*\*Seções:\*\*
1. \*\*Cabeçalho\*\*
   \- Informações do pet e tutor
   \- Veterinário responsável
   \- Data/hora do atendimento
   \- Status da consulta

2. \*\*Aba: Anamnese\*\*
   \- Campo queixa principal (textarea)
   \- Campo histórico (textarea)
   \- Botão "Salvar" (save-as-you-go)

3. \*\*Aba: Exame Físico\*\*
   \- Campos de sinais vitais (inputs numéricos)
   \- Selects para TPC, mucosas, hidratação
   \- Textareas para ausculta, palpação
   \- Observações gerais

4. \*\*Aba: Diagnóstico e Conduta\*\*
   \- Diagnóstico (textarea)
   \- Conduta (textarea)
   \- Orientações (textarea)
   \- Custo total (input monetário)

5. \*\*Aba: Prescrições\*\*
   \- Lista de prescrições da consulta
   \- Botão "Nova Prescrição" → RF-03

6. \*\*Rodapé\*\*
   \- Botão "Salvar" (salva alterações)
   \- Botão "Concluir Consulta" (valida e finaliza)
   \- Botão "Gerar Internação" (abre dialog para vincular internação)

\---

\## 📝 Regras de Negócio Consolidadas

1. \*\*RN-01:\*\* Consulta geralmente é criada automaticamente ao "Iniciar Atendimento" de um agendamento
2. \*\*RN-02:\*\* Status inicial sempre é \`em_atendimento\`
3. \*\*RN-03:\*\* Campos clínicos podem ser salvos parcialmente durante atendimento
4. \*\*RN-04:\*\* Para concluir, campos obrigatórios: queixaPrincipal, diagnostico, conduta
5. \*\*RN-05:\*\* Consulta concluída não pode mais ser editada (exceto por Admin)
6. \*\*RN-06:\*\* Gerar internação finaliza automaticamente a consulta
7. \*\*RN-07:\*\* Consulta serve como prontuário médico eletrônico ambulatorial
8. \*\*RN-08:\*\* Histórico de consultas do pet deve ser facilmente acessível
9. \*\*RN-09:\*\* Consulta pode gerar prescrições ambulatoriais (RF-03)

\---

\## 🔗 Integrações

\### Upstream (módulos que dependem de Consultas):
\- \*\*RF-03 (Prescrições):\*\* Prescrições ambulatoriais vinculam \`consultaId\`
\- \*\*Internações:\*\* Consulta pode gerar internação (\`internacaoId\`)
\- \*\*Financeiro:\*\* Custo total da consulta vai para faturamento

\### Downstream (módulos dos quais Consultas depende):
\- \*\*RF-01 (Agendamentos):\*\* Consulta geralmente criada a partir de agendamento
\- \*\*Pets:\*\* Busca informações do pet
\- \*\*Tutores:\*\* Busca informações do tutor
\- \*\*Users (Veterinários):\*\* Busca informações do profissional

\---

\## 📌 Observações de Implementação

\### Backend
\- Entidade: \`backend/src/common/entities/consulta.entity.ts\`
\- Controller: \`backend/src/modules/consultas/consultas.controller.ts\`
\- Service: \`backend/src/modules/consultas/consultas.service.ts\`
\- DTOs: \`backend/src/modules/consultas/dto/\`

\### Frontend
\- Página lista: \`frontend/src/app/consultas/page.tsx\`
\- Página detalhes: \`frontend/src/app/consultas/[id]/page.tsx\`
\- Service: \`frontend/src/services/consultas.service.ts\`
\- Componentes: Tabs para anamnese/exame/diagnóstico, forms, dialogs

\### Banco de Dados
\- Tabela: \`consultas\`
\- Índices: \`pet_id\`, \`tutor_id\`, \`veterinario_id\`, \`data_atendimento\`, \`status\`, \`agendamento_id\`
\- Foreign Keys: pet_id, tutor_id, veterinario_id, agendamento_id, internacao_id

\---

\## 🚀 Melhorias Futuras

1. \*\*Templates de Diagnóstico:\*\* Diagnósticos comuns pré-configurados
2. \*\*Exames Complementares:\*\* Vincular solicitações de exames laboratoriais
3. \*\*Fotos/Anexos:\*\* Upload de fotos (lesões, radiografias digitais)
4. \*\*Prontuário Integrado:\*\* Visualização unificada de histórico ambulatorial + hospitalar
5. \*\*IA para Sugestões:\*\* Sugestões de diagnóstico baseadas em sintomas
6. \*\*Assinatura Digital:\*\* Assinatura eletrônica do veterinário no prontuário
7. \*\*Impressão de Receitas:\*\* Gerar PDF de receita médica formatada
8. \*\*Teleconsulta:\*\* Suporte para consultas remotas com vídeo
9. \*\*Gráficos de Evolução:\*\* Visualizar evolução de peso, sinais vitais ao longo do tempo

\---

\*\*Última atualização:\*\* 2025-01-21
\*\*Versão:\*\* 1.0
\*\*Status:\*\* ✅ Implementado e Funcional
