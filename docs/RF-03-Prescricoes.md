\# RF-03: Módulo de Prescrições

\## 📋 Visão Geral

O módulo de prescrições gerencia a prescrição médica de medicamentos tanto para tratamento ambulatorial (em casa) quanto hospitalar (internação), implementando a distinção crítica entre RAM (Registro de Administração de Medicamentos) e receitas para casa.

\## 🎯 Objetivo

Registrar prescrições médicas veterinárias de forma estruturada, diferenciando prescrições ambulatoriais (tutor administra em casa) de prescrições hospitalares (enfermeiro administra no hospital com RAM automático).

\## ✅ Status de Implementação

\*\*Backend:\*\* ✅ Completo
\*\*Frontend:\*\* ✅ Completo
\*\*Integração:\*\* ✅ Funcional
\*\*Lógica Condicional:\*\* ✅ Implementada (ambulatorial vs hospitalar)

\---

\## 🔑 Conceito Central: Ambulatorial vs Hospitalar

\### 🏠 Prescrição Ambulatorial
\- \*\*Tipo:\*\* \`ambulatorial\`
\- \*\*Origem:\*\* Consulta (RF-02)
\- \*\*Referência:\*\* \`consultaId\`
\- \*\*RAM:\*\* ❌ NÃO gera administrações automáticas
\- \*\*Responsável:\*\* Tutor administra em casa
\- \*\*Documento:\*\* Receita impressa para o tutor

\### 🏥 Prescrição Hospitalar
\- \*\*Tipo:\*\* \`hospitalar\`
\- \*\*Origem:\*\* Internação
\- \*\*Referência:\*\* \`internacaoId\`
\- \*\*RAM:\*\* ✅ Gera administrações automáticas
\- \*\*Responsável:\*\* Enfermeiro administra no hospital
\- \*\*Documento:\*\* Prontuário hospitalar interno

\---

\## 🔧 Funcionalidades Implementadas

\### 1. Criar Prescrição

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Cria uma nova prescrição médica (ambulatorial ou hospitalar).

\*\*Endpoint:\*\* \`POST /prescricoes\`

\*\*Payload:\*\*
\`\`\`json
{
  "petId": "uuid",
  "veterinarioId": "uuid",
  "tipo": "ambulatorial", // "ambulatorial" ou "hospitalar" (default: "hospitalar")

  // Para prescrição ambulatorial:
  "consultaId": "uuid",

  // Para prescrição hospitalar:
  "internacaoId": "uuid",

  "dataPrescricao": "2025-01-15T10:00:00Z",
  "dataValidade": "2025-01-22T10:00:00Z", // validade de 7 dias
  "observacoes": "Administrar com alimento",

  "itens": [
    {
      "medicamentoId": "uuid",
      "dose": "10mg",
      "viaAdministracao": "oral",
      "frequencia": "BID", // BID, TID, QID, SID, etc.
      "duracaoDias": 7,
      "horarios": ["08:00", "20:00"], // horários de administração
      "instrucoes": "Administrar após refeição"
    }
  ]
}
\`\`\`

\*\*Lógica Condicional (Implementada em prescricoes.service.ts:88-91):\*\*
\`\`\`typescript
if (tipo === 'hospitalar') {
  await this.scheduleAdministracoes(savedItem, new Date(createPrescricaoDto.dataPrescricao));
}
// Prescrições ambulatoriais NÃO agendam administrações
\`\`\`

\*\*Regras de Negócio:\*\*
\- Status inicial: \`ativa\`
\- Pet e veterinário devem existir
\- Medicamentos devem existir no cadastro
\- \`dataValidade\` deve ser posterior a \`dataPrescricao\`
\- Se \`tipo === 'hospitalar'\`, DEVE ter \`internacaoId\`
\- Se \`tipo === 'ambulatorial'\`, DEVE ter \`consultaId\`
\- Horários devem estar no formato HH:mm
\- Duração em dias deve ser >= 1

\*\*Ação Automática para Prescrições Hospitalares:\*\*
\- Para cada item da prescrição
  - Para cada dia (duracaoDias)
    - Para cada horário
      - Cria registro em \`administracoes\` com:
        - \`prescricaoItemId\`
        - \`dataHoraPrevista\` (data + horário)
        - \`status: 'pendente'\`

\---

\### 2. Listar Prescrições

\*\*Ator:\*\* Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Lista prescrições com filtros opcionais.

\*\*Endpoint:\*\* \`GET /prescricoes?status=ativa&petId=uuid\`

\*\*Filtros Disponíveis:\*\*
\- \`status\`: ativa, suspensa, concluida, cancelada
\- \`petId\`: Filtra por pet específico

\*\*Resposta:\*\*
\`\`\`json
[
  {
    "id": "uuid",
    "tipo": "ambulatorial",
    "pet": {
      "id": "uuid",
      "nome": "Rex",
      "tutor": {
        "nome": "João Silva"
      }
    },
    "veterinario": {
      "id": "uuid",
      "nome": "Dra. Maria Santos"
    },
    "consultaId": "uuid",
    "dataPrescricao": "2025-01-15T10:00:00Z",
    "dataValidade": "2025-01-22T10:00:00Z",
    "status": "ativa",
    "itens": [
      {
        "id": "uuid",
        "medicamento": {
          "nome": "Amoxicilina",
          "unidade": "mg"
        },
        "dose": "10mg",
        "viaAdministracao": "oral",
        "frequencia": "BID",
        "duracaoDias": 7,
        "horarios": ["08:00", "20:00"]
      }
    ]
  }
]
\`\`\`

\---

\### 3. Buscar Prescrições por Pet

\*\*Ator:\*\* Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Retorna todas as prescrições de um pet.

\*\*Endpoint:\*\* \`GET /prescricoes/pet/:petId\`

\*\*Uso:\*\* Histórico de medicações do animal

\---

\### 4. Buscar Prescrições por Internação

\*\*Ator:\*\* Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Retorna prescrições hospitalares de uma internação.

\*\*Endpoint:\*\* \`GET /prescricoes/internacao/:internacaoId\`

\*\*Uso:\*\* Visualizar protocolo de medicação hospitalar (RAM)

\---

\### 5. Buscar Prescrições por Consulta

\*\*Ator:\*\* Veterinário, Enfermeiro, Administrador, Gerente, Recepcionista

\*\*Descrição:\*\* Retorna prescrições ambulatoriais de uma consulta.

\*\*Endpoint:\*\* \`GET /prescricoes/consulta/:consultaId\`

\*\*Uso:\*\* Visualizar receita da consulta para impressão

\---

\### 6. Buscar Prescrição Específica

\*\*Ator:\*\* Veterinário, Enfermeiro, Administrador, Gerente

\*\*Descrição:\*\* Busca detalhes completos de uma prescrição.

\*\*Endpoint:\*\* \`GET /prescricoes/:id\`

\*\*Relações Carregadas:\*\*
\- Pet (com tutor)
\- Veterinário
\- Itens da prescrição (com medicamentos)
\- Administrações (para prescrições hospitalares)
\- Internação ou consulta (conforme tipo)

\---

\### 7. Atualizar Prescrição

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Permite editar informações da prescrição (não atualiza itens).

\*\*Endpoint:\*\* \`PATCH /prescricoes/:id\`

\*\*Payload:\*\* (todos os campos são opcionais)
\`\`\`json
{
  "dataValidade": "2025-01-25T10:00:00Z",
  "observacoes": "Observação atualizada"
}
\`\`\`

\*\*Regras de Negócio:\*\*
\- Não pode atualizar prescrição cancelada
\- Não atualiza itens (necessário suspender/criar nova)

\---

\### 8. Suspender Prescrição

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Suspende uma prescrição e todas as administrações pendentes (hospitalares).

\*\*Endpoint:\*\* \`PATCH /prescricoes/:id/suspender\`

\*\*Ação:\*\*
1. Altera status da prescrição para \`suspensa\`
2. Para prescrições hospitalares:
   \- Cancela todas as administrações com status \`pendente\`
   \- Marca como \`nao_realizado\` com motivo "Prescrição suspensa"

\*\*Regras de Negócio:\*\*
\- Só pode suspender prescrição \`ativa\`
\- Administrações já realizadas não são afetadas

\---

\### 9. Reativar Prescrição

\*\*Ator:\*\* Veterinário, Administrador, Gerente

\*\*Descrição:\*\* Reativa uma prescrição suspensa.

\*\*Endpoint:\*\* \`PATCH /prescricoes/:id/reativar\`

\*\*Ação:\*\*
\- Altera status para \`ativa\`

\*\*Observação:\*\*
\- Administrações canceladas NÃO são recriadas automaticamente
\- Pode ser necessário criar nova prescrição

\---

\### 10. Deletar Prescrição

\*\*Ator:\*\* Administrador

\*\*Descrição:\*\* Remove permanentemente uma prescrição.

\*\*Endpoint:\*\* \`DELETE /prescricoes/:id\`

\*\*Regras de Negócio:\*\*
\- Apenas Administrador pode deletar
\- Deleta em cascata os itens e administrações vinculadas

\---

\## 📊 Modelo de Dados

\### Prescrição

\`\`\`typescript
interface Prescricao {
  id: string;
  tipo: 'hospitalar' | 'ambulatorial';
  petId: string;
  internacaoId?: string; // para tipo 'hospitalar'
  consultaId?: string; // para tipo 'ambulatorial'
  veterinarioId: string;
  dataPrescricao: Date;
  dataValidade: Date;
  status: 'ativa' | 'suspensa' | 'concluida' | 'cancelada';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relações
  pet: Pet;
  internacao?: Internacao;
  consulta?: Consulta;
  veterinario: User;
  itens: PrescricaoItem[];
}
\`\`\`

\### Item de Prescrição

\`\`\`typescript
interface PrescricaoItem {
  id: string;
  prescricaoId: string;
  medicamentoId: string;
  dose: string;
  viaAdministracao: string; // oral, IV, IM, SC, tópica
  frequencia: string; // SID, BID, TID, QID, etc.
  duracaoDias: number;
  horarios: string[]; // ["08:00", "14:00", "20:00"]
  instrucoes?: string;
  ativo: boolean;

  // Relações
  medicamento: Medicamento;
  administracoes?: Administracao[]; // apenas para prescrições hospitalares
}
\`\`\`

\---

\## 🔄 Diagrama de Estados

\`\`\`mermaid
stateDiagram-v2
    [*] --> ativa: Criar prescrição
    ativa --> suspensa: Suspender
    suspensa --> ativa: Reativar
    ativa --> concluida: Término do tratamento
    ativa --> cancelada: Cancelar
    suspensa --> cancelada: Cancelar

    concluida --> [*]
    cancelada --> [*]
\`\`\`

\---

\## 🔀 Fluxo Condicional: Ambulatorial vs Hospitalar

\`\`\`mermaid
flowchart TD
    A[Criar Prescrição] --> B{Tipo?}

    B -->|ambulatorial| C[Vincula consultaId]
    B -->|hospitalar| D[Vincula internacaoId]

    C --> E[Salva prescrição e itens]
    D --> E

    E --> F{tipo === 'hospitalar'?}

    F -->|Não| G[Finalizado - Receita para casa]
    F -->|Sim| H[Agendar Administrações RAEM]

    H --> I[Para cada item]
    I --> J[Para cada dia duracaoDias]
    J --> K[Para cada horário]
    K --> L[Criar Administracao status=pendente]

    L --> M[Finalizado - RAEM criado]

    G --> N[Tutor leva receita impressa]
    M --> O[Enfermeiro administra conforme RAEM]
\`\`\`

\---

\## 🔐 Controle de Acesso

| Ação | Recepcionista | Veterinário | Enfermeiro | Administrador | Gerente |
|------|--------------|-------------|------------|---------------|---------|
| Criar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Listar | ❌ | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ❌ | ✅ | ✅ | ✅ | ✅ |
| Buscar por Consulta | ✅ | ✅ | ✅ | ✅ | ✅ |
| Atualizar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Suspender | ❌ | ✅ | ❌ | ✅ | ✅ |
| Reativar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Deletar | ❌ | ❌ | ❌ | ✅ | ❌ |

\---

\## 🎨 Interface Frontend

\### Prescrição Ambulatorial (em /consultas/\[id\])

\*\*Localização:\*\* Aba "Prescrições" dentro da tela de consulta

\*\*Componentes:\*\*
\- Lista de prescrições da consulta
\- Botão "Nova Prescrição"
\- Dialog de criação com:
  - Seleção de medicamento (autocomplete)
  - Campos: dose, via, frequência, duração, horários
  - Botão "Adicionar Medicamento" (múltiplos itens)
  - Observações gerais
  - Botão "Salvar Prescrição"
\- Botão "Imprimir Receita" (gera PDF formatado)

\### Prescrição Hospitalar (em /internacoes/\[id\])

\*\*Localização:\*\* Seção de prescrições na tela de internação

\*\*Componentes:\*\*
\- Protocolo de medicação (lista de prescrições ativas)
\- Botão "Nova Prescrição"
\- Dialog similar à ambulatorial
\- Visualização de RAM (administrações agendadas)
\- Status de cada administração (pendente, realizado, não realizado)

\### Tela: /prescricoes (opcional)

\*\*Componentes:\*\*
\- Lista geral de prescrições
\- Filtros: tipo, status, pet, veterinário
\- Cards com informações resumidas
\- Ações: visualizar, suspender, reativar

\---

\## 📝 Regras de Negócio Consolidadas

1. \*\*RN-01:\*\* Prescrição ambulatorial \`tipo: 'ambulatorial'\` vincula \`consultaId\`
2. \*\*RN-02:\*\* Prescrição hospitalar \`tipo: 'hospitalar'\` vincula \`internacaoId\`
3. \*\*RN-03:\*\* Apenas prescrições hospitalares geram administrações automáticas (RAM)
4. \*\*RN-04:\*\* Prescrições ambulatoriais NÃO geram administrações
5. \*\*RN-05:\*\* Status inicial sempre é \`ativa\`
6. \*\*RN-06:\*\* Suspender prescrição hospitalar cancela administrações pendentes
7. \*\*RN-07:\*\* Data de validade deve ser posterior à data de prescrição
8. \*\*RN-08:\*\* Horários devem estar no formato HH:mm (ex: 08:00, 14:00)
9. \*\*RN-09:\*\* Frequência segue padrão veterinário (SID, BID, TID, QID)
10. \*\*RN-10:\*\* Via de administração: oral, IV, IM, SC, tópica, etc.
11. \*\*RN-11:\*\* Cada prescrição pode ter múltiplos medicamentos (itens)
12. \*\*RN-12:\*\* Administrações agendadas calculam data/hora prevista = dataPrescricao + dia + horário

\---

\## 🔗 Integrações

\### Upstream (módulos que dependem de Prescrições):
\- \*\*Administrações (RAM):\*\* Prescrições hospitalares criam administrações automáticas
\- \*\*Financeiro:\*\* Custo de medicamentos para faturamento
\- \*\*Estoque:\*\* Baixa de medicamentos (prescrições hospitalares)

\### Downstream (módulos dos quais Prescrições depende):
\- \*\*RF-02 (Consultas):\*\* Prescrições ambulatoriais vinculam consulta
\- \*\*Internações:\*\* Prescrições hospitalares vinculam internação
\- \*\*Medicamentos:\*\* Cadastro de medicamentos disponíveis
\- \*\*Users (Veterinários):\*\* Veterinário que prescreveu
\- \*\*Pets:\*\* Pet que recebe a medicação

\---

\## 📌 Observações de Implementação

\### Backend
\- Entidade Prescrição: \`backend/src/common/entities/prescricao.entity.ts\`
\- Entidade Item: \`backend/src/common/entities/prescricao-item.entity.ts\`
\- Controller: \`backend/src/modules/prescricoes/prescricoes.controller.ts\`
\- Service: \`backend/src/modules/prescricoes/prescricoes.service.ts\`
\- \*\*Lógica Condicional:\*\* \`prescricoes.service.ts:88-91\` (agendamento de administrações)
\- DTOs: \`backend/src/modules/prescricoes/dto/\`

\### Frontend
\- Service: \`frontend/src/services/prescricoes.service.ts\`
\- Componentes: Dialog de criação, lista de prescrições (integrado em consultas/internações)
\- Página /prescricoes: \`frontend/src/app/prescricoes/page.tsx\`

\### Banco de Dados
\- Tabelas: \`prescricoes\`, \`prescricao_itens\`, \`administracoes\`
\- Índices: \`pet_id\`, \`veterinario_id\`, \`consulta_id\`, \`internacao_id\`, \`tipo\`, \`status\`
\- Foreign Keys: pet_id, veterinario_id, consulta_id, internacao_id, medicamento_id

\---

\## 🧪 Exemplo Prático

\### Caso 1: Prescrição Ambulatorial

\*\*Cenário:\*\* Consulta de rotina, pet vai para casa com medicação

\`\`\`json
{
  "tipo": "ambulatorial",
  "consultaId": "123",
  "petId": "456",
  "veterinarioId": "789",
  "dataPrescricao": "2025-01-15T10:00:00Z",
  "dataValidade": "2025-01-22T10:00:00Z",
  "itens": [{
    "medicamentoId": "abc",
    "dose": "250mg",
    "viaAdministracao": "oral",
    "frequencia": "BID",
    "duracaoDias": 7,
    "horarios": ["08:00", "20:00"]
  }]
}
\`\`\`

\*\*Resultado:\*\*
\- ✅ Prescrição criada
\- ✅ Item criado
\- ❌ Administrações NÃO criadas (tutor administra em casa)
\- 📄 Receita impressa para tutor

\### Caso 2: Prescrição Hospitalar

\*\*Cenário:\*\* Pet internado, enfermeiro administra medicação no hospital

\`\`\`json
{
  "tipo": "hospitalar",
  "internacaoId": "int123",
  "petId": "456",
  "veterinarioId": "789",
  "dataPrescricao": "2025-01-15T10:00:00Z",
  "dataValidade": "2025-01-17T10:00:00Z",
  "itens": [{
    "medicamentoId": "xyz",
    "dose": "5ml",
    "viaAdministracao": "IV",
    "frequencia": "TID",
    "duracaoDias": 2,
    "horarios": ["08:00", "14:00", "20:00"]
  }]
}
\`\`\`

\*\*Resultado:\*\*
\- ✅ Prescrição criada
\- ✅ Item criado
\- ✅ Administrações criadas automaticamente:
  - 2025-01-15 08:00 - status: pendente
  - 2025-01-15 14:00 - status: pendente
  - 2025-01-15 20:00 - status: pendente
  - 2025-01-16 08:00 - status: pendente
  - 2025-01-16 14:00 - status: pendente
  - 2025-01-16 20:00 - status: pendente
\- 🏥 RAM disponível para enfermeiro

\---

\## 🚀 Melhorias Futuras

1. \*\*Posologia Inteligente:\*\* Cálculo automático de dose baseado em peso do pet
2. \*\*Templates de Protocolos:\*\* Protocolos pré-definidos (ex: "Protocolo Parvovirose")
3. \*\*Interações Medicamentosas:\*\* Alerta de interações entre medicamentos
4. \*\*Assinatura Digital:\*\* Assinatura eletrônica em receitas ambulatoriais
5. \*\*Impressão Formatada:\*\* PDF de receita com cabeçalho da clínica, CRMV
6. \*\*Notificações:\*\* Lembrete para tutor de horários de medicação (WhatsApp/SMS)
7. \*\*Controle de Estoque:\*\* Baixa automática ao prescrever (hospitalares)
8. \*\*Relatório de Consumo:\*\* Relatório de medicamentos mais prescritos
9. \*\*Histórico de Medicações:\*\* Linha do tempo de todas as medicações do pet
10. \*\*Alertas de Alergia:\*\* Verificar alergias registradas no prontuário do pet

\---

\*\*Última atualização:\*\* 2025-01-21
\*\*Versão:\*\* 1.0
\*\*Status:\*\* ✅ Implementado e Funcional (com distinção ambulatorial/hospitalar)
