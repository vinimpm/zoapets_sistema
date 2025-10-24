\# RF-01: Módulo de Agendamentos

\## 📋 Visão Geral

O módulo de agendamentos é o ponto de entrada do workflow ambulatorial, permitindo que a recepção organize a agenda de atendimentos veterinários, cirurgias, retornos e vacinações.

\## 🎯 Objetivo

Gerenciar a agenda de atendimentos da clínica/hospital veterinário, desde o contato inicial do cliente até o início efetivo da consulta.

\## ✅ Status de Implementação

\*\*Backend:\*\* ✅ Completo
\*\*Frontend:\*\* ✅ Completo
\*\*Integração:\*\* ✅ Funcional

\---

\## 🔧 Funcionalidades Implementadas

\### 1. Criar Agendamento

\*\*Ator:\*\* Recepcionista, Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Permite criar um novo agendamento para atendimento.

\*\*Endpoint:\*\* \`POST /agendamentos\`

\*\*Payload:\*\*
\`\`\`json
{
  "petId": "uuid",
  "veterinarioId": "uuid",
  "procedimentoId": "uuid", // opcional
  "dataHoraInicio": "2025-01-15T10:00:00Z",
  "dataHoraFim": "2025-01-15T10:30:00Z",
  "tipo": "consulta", // consulta, cirurgia, retorno, vacinacao
  "motivo": "Consulta de rotina",
  "observacoes": "Pet está com tosse há 3 dias"
}
\`\`\`

\*\*Regras de Negócio:\*\*
\- Status inicial: \`agendado\`
\- Pet deve existir no sistema
\- Veterinário deve existir e ter papel de "Veterinário"
\- Data/hora início deve ser futura
\- Data/hora fim deve ser posterior à data/hora início
\- Não deve haver conflito de horário com outro agendamento do mesmo veterinário

\---

\### 2. Listar Agendamentos

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Lista agendamentos com filtros opcionais.

\*\*Endpoint:\*\* \`GET /agendamentos?data=2025-01-15&veterinarioId=uuid&status=agendado\`

\*\*Filtros Disponíveis:\*\*
\- \`data\`: Filtra por data específica
\- \`veterinarioId\`: Filtra por veterinário
\- \`status\`: Filtra por status (agendado, confirmado, em_atendimento, concluido, cancelado, falta)

\*\*Resposta:\*\*
\`\`\`json
[
  {
    "id": "uuid",
    "pet": {
      "id": "uuid",
      "nome": "Rex",
      "tutor": {
        "id": "uuid",
        "nome": "João Silva",
        "telefone": "(11) 98765-4321"
      }
    },
    "veterinario": {
      "id": "uuid",
      "nome": "Dra. Maria Santos"
    },
    "dataHoraInicio": "2025-01-15T10:00:00Z",
    "dataHoraFim": "2025-01-15T10:30:00Z",
    "tipo": "consulta",
    "status": "agendado",
    "motivo": "Consulta de rotina",
    "observacoes": "Pet está com tosse há 3 dias",
    "confirmadoEm": null,
    "lembreteEnviado": false
  }
]
\`\`\`

\---

\### 3. Buscar por Período

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Busca agendamentos em um período específico (útil para visualização em calendário).

\*\*Endpoint:\*\* \`GET /agendamentos/periodo?inicio=2025-01-15&fim=2025-01-21&veterinarioId=uuid\`

\*\*Parâmetros:\*\*
\- \`inicio\` (obrigatório): Data inicial do período
\- \`fim\` (obrigatório): Data final do período
\- \`veterinarioId\` (opcional): Filtra por veterinário específico

\---

\### 4. Buscar Agendamento Específico

\*\*Ator:\*\* Recepcionista, Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Busca um agendamento específico por ID.

\*\*Endpoint:\*\* \`GET /agendamentos/:id\`

\*\*Relações Carregadas:\*\*
\- Pet (com tutor)
\- Veterinário
\- Procedimento (se aplicável)

\---

\### 5. Atualizar Agendamento

\*\*Ator:\*\* Recepcionista, Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Permite editar informações do agendamento (exceto status).

\*\*Endpoint:\*\* \`PATCH /agendamentos/:id\`

\*\*Payload:\*\* (todos os campos são opcionais)
\`\`\`json
{
  "dataHoraInicio": "2025-01-15T14:00:00Z",
  "dataHoraFim": "2025-01-15T14:30:00Z",
  "motivo": "Consulta de retorno",
  "observacoes": "Atualização: tosse persistente"
}
\`\`\`

\*\*Regras de Negócio:\*\*
\- Não pode editar agendamento com status \`concluido\`
\- Se alterar horário, verificar conflitos com outros agendamentos

\---

\### 6. Confirmar Agendamento

\*\*Ator:\*\* Recepcionista, Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Marca agendamento como confirmado pelo cliente.

\*\*Endpoint:\*\* \`PATCH /agendamentos/:id/confirmar\`

\*\*Ação:\*\*
\- Altera status para \`confirmado\`
\- Registra timestamp em \`confirmadoEm\`

\*\*Regras de Negócio:\*\*
\- Só pode confirmar agendamento com status \`agendado\`

\---

\### 7. Cancelar Agendamento

\*\*Ator:\*\* Recepcionista, Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Cancela um agendamento.

\*\*Endpoint:\*\* \`PATCH /agendamentos/:id/cancelar\`

\*\*Ação:\*\*
\- Altera status para \`cancelado\`

\*\*Regras de Negócio:\*\*
\- Não pode cancelar agendamento já \`concluido\` ou em \`em_atendimento\`

\---

\### 8. Marcar Falta

\*\*Ator:\*\* Recepcionista, Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Marca quando o cliente não compareceu ao agendamento.

\*\*Endpoint:\*\* \`PATCH /agendamentos/:id/falta\`

\*\*Ação:\*\*
\- Altera status para \`falta\`

\*\*Regras de Negócio:\*\*
\- Geralmente aplicado após o horário agendado ter passado

\---

\### 9. Iniciar Atendimento

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Transição crítica que inicia o atendimento e cria automaticamente o registro de consulta.

\*\*Endpoint:\*\* \`PATCH /agendamentos/:id/iniciar-atendimento\`

\*\*Ação:\*\*
1. Altera status do agendamento para \`em_atendimento\`
2. Cria automaticamente registro na tabela \`consultas\` com:
   \- \`agendamentoId\`: Referência ao agendamento
   \- \`petId\`: Pet do agendamento
   \- \`veterinarioId\`: Veterinário do agendamento
   \- \`tipo\`: Baseado no tipo do agendamento
   \- \`status\`: \`em_atendimento\`
   \- Campos clínicos vazios (preenchidos durante atendimento)

\*\*Regras de Negócio:\*\*
\- Só pode iniciar agendamento com status \`agendado\` ou \`confirmado\`
\- Cria exatamente UMA consulta por agendamento
\- Esta ação é irreversível (não há "desfazer")

\*\*Fluxo Subsequente:\*\*
\- Veterinário é redirecionado para tela de consulta
\- Continua no módulo RF-02 (Consultas)

\---

\### 10. Deletar Agendamento

\*\*Ator:\*\* Administrador

\*\*Descrição:\*\* Remove permanentemente um agendamento.

\*\*Endpoint:\*\* \`DELETE /agendamentos/:id\`

\*\*Regras de Negócio:\*\*
\- Apenas Administrador pode deletar
\- Não pode deletar agendamento que já gerou consulta

\---

\## 📊 Modelo de Dados

\`\`\`typescript
interface Agendamento {
  id: string;
  petId: string;
  veterinarioId: string;
  procedimentoId?: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  tipo: 'consulta' | 'cirurgia' | 'retorno' | 'vacinacao';
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'falta';
  motivo: string;
  observacoes?: string;
  confirmadoEm?: Date;
  lembreteEnviado: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relações
  pet: Pet;
  veterinario: User;
  procedimento?: Procedimento;
}
\`\`\`

\---

\## 🔄 Diagrama de Estados

\`\`\`mermaid
stateDiagram-v2
    [*] --> agendado: Criar agendamento
    agendado --> confirmado: Confirmar
    agendado --> cancelado: Cancelar
    agendado --> falta: Não compareceu
    agendado --> em_atendimento: Iniciar atendimento

    confirmado --> em_atendimento: Iniciar atendimento
    confirmado --> cancelado: Cancelar
    confirmado --> falta: Não compareceu

    em_atendimento --> concluido: Finalizar consulta

    cancelado --> [*]
    falta --> [*]
    concluido --> [*]
\`\`\`

\---

\## 🔐 Controle de Acesso

| Ação | Recepcionista | Veterinário | Enfermeiro | Administrador | Gerente |
|------|--------------|-------------|------------|---------------|---------|
| Criar | ✅ | ✅ | ❌ | ✅ | ✅ |
| Listar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Atualizar | ✅ | ✅ | ❌ | ✅ | ✅ |
| Confirmar | ✅ | ✅ | ❌ | ✅ | ✅ |
| Cancelar | ✅ | ✅ | ❌ | ✅ | ✅ |
| Marcar Falta | ✅ | ✅ | ❌ | ✅ | ✅ |
| Iniciar Atendimento | ❌ | ✅ | ❌ | ✅ | ✅ |
| Deletar | ❌ | ❌ | ❌ | ✅ | ❌ |

\---

\## 🎨 Interface Frontend

\### Tela: /agendamentos

\*\*Componentes:\*\*
\- Calendário/agenda semanal
\- Filtros: veterinário, tipo, status
\- Botão "Novo Agendamento"
\- Lista de agendamentos do dia
\- Cards com informações do pet, tutor, horário
\- Ações rápidas: confirmar, cancelar, iniciar atendimento

\*\*Interações:\*\*
\- Click no agendamento: abre detalhes
\- Botão "Iniciar": redireciona para /consultas/[id]
\- Atualização em tempo real (opcional: websockets)

\---

\## 📝 Regras de Negócio Consolidadas

1. \*\*RN-01:\*\* Agendamento só pode ser criado para data/hora futura
2. \*\*RN-02:\*\* Não pode haver conflito de horário para o mesmo veterinário
3. \*\*RN-03:\*\* Status inicial sempre é \`agendado\`
4. \*\*RN-04:\*\* Confirmação registra timestamp automático
5. \*\*RN-05:\*\* Iniciar atendimento cria automaticamente uma consulta
6. \*\*RN-06:\*\* Cada agendamento pode gerar apenas UMA consulta
7. \*\*RN-07:\*\* Lembrete pode ser enviado automaticamente (funcionalidade futura)
8. \*\*RN-08:\*\* Agendamento cancelado ou com falta não pode ser iniciado
9. \*\*RN-09:\*\* Pet e veterinário devem existir no sistema

\---

\## 🔗 Integrações

\### Upstream (módulos que dependem de Agendamentos):
\- \*\*RF-02 (Consultas):\*\* Recebe agendamentoId ao ser criado via "Iniciar Atendimento"
\- \*\*Dashboard:\*\* Exibe estatísticas de agendamentos do dia

\### Downstream (módulos dos quais Agendamentos depende):
\- \*\*Pets:\*\* Busca informações do pet e tutor
\- \*\*Users (Veterinários):\*\* Busca informações do profissional
\- \*\*Procedimentos:\*\* Opcional, para vincular procedimento padrão

\---

\## 📌 Observações de Implementação

\### Backend
\- Entidade: \`backend/src/common/entities/agendamento.entity.ts\`
\- Controller: \`backend/src/modules/agendamentos/agendamentos.controller.ts\`
\- Service: \`backend/src/modules/agendamentos/agendamentos.service.ts\`
\- DTOs: \`backend/src/modules/agendamentos/dto/\`

\### Frontend
\- Página principal: \`frontend/src/app/agendamentos/page.tsx\`
\- Service: \`frontend/src/services/agendamentos.service.ts\`
\- Componentes: Dialog de criação/edição, calendário, cards

\### Banco de Dados
\- Tabela: \`agendamentos\`
\- Índices: \`pet_id\`, \`veterinario_id\`, \`data_hora_inicio\`, \`status\`
\- Foreign Keys: pet_id, veterinario_id, procedimento_id

\---

\## 🚀 Melhorias Futuras

1. \*\*Lembretes Automáticos:\*\* Enviar SMS/WhatsApp 24h antes do agendamento
2. \*\*Agendamento Online:\*\* Portal para tutores agendarem via painel público
3. \*\*Recorrência:\*\* Agendamentos recorrentes (vacinas mensais, retornos periódicos)
4. \*\*Sala de Espera:\*\* Painel mostrando agendamentos confirmados aguardando atendimento
5. \*\*Integração com Google Calendar:\*\* Sincronizar agenda do veterinário
6. \*\*Validação de Disponibilidade:\*\* Verificar horários disponíveis antes de criar agendamento

\---

\*\*Última atualização:\*\* 2025-01-21
\*\*Versão:\*\* 1.0
\*\*Status:\*\* ✅ Implementado e Funcional
