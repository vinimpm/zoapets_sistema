# ZoaPets Public API - Write Operations (v2.0)

## 🆕 Novidades da Versão 2.0

A Public API agora suporta **operações de escrita** (POST/PATCH), permitindo integração completa com sistemas ERP e backoffice externos!

### O que mudou?

- ✅ **CREATE**: Criar novos registros (Pets, Tutores, Internações, Agendamentos)
- ✅ **UPDATE**: Atualizar registros existentes
- ✅ **Operações Especiais**: Dar alta, confirmar agendamentos, registrar pagamentos
- ✅ **Mesma segurança**: API Key, Rate Limiting, IP Whitelist
- ✅ **Validação automática**: Todos os dados são validados antes de salvar

---

## 📝 Write Endpoints Disponíveis

### Pets

#### Criar Pet

**Endpoint**: `POST /public/pets`

**Request Body**:
```json
{
  "nome": "Rex",
  "especie": "Cachorro",
  "raca": "Labrador",
  "sexo": "Macho",
  "cor": "Amarelo",
  "dataNascimento": "2020-03-15",
  "microchip": "982000123456789",
  "castrado": true,
  "pesoKg": 32.5,
  "tutorId": "123e4567-e89b-12d3-a456-426614174000",
  "observacoes": "Pet dócil e tranquilo"
}
```

**Resposta** (201 Created):
```json
{
  "id": "987e6543-e21b-12d3-a456-426614174000",
  "nome": "Rex",
  "especie": "Cachorro",
  ...
  "createdAt": "2025-01-20T14:30:00.000Z"
}
```

#### Atualizar Pet

**Endpoint**: `PATCH /public/pets/:id`

**Request Body** (todos os campos opcionais):
```json
{
  "pesoKg": 33.2,
  "observacoes": "Atualização de peso - consulta de rotina"
}
```

---

### Tutores

#### Criar Tutor

**Endpoint**: `POST /public/tutores`

**Request Body**:
```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "celular": "(11) 91234-5678",
  "email": "joao@email.com",
  "endereco": "Rua das Flores, 123 - São Paulo/SP",
  "observacoes": "Cliente preferencial"
}
```

**Resposta** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nome": "João Silva",
  ...
  "ativo": true,
  "createdAt": "2025-01-20T14:30:00.000Z"
}
```

#### Atualizar Tutor

**Endpoint**: `PATCH /public/tutores/:id`

**Request Body** (todos os campos opcionais):
```json
{
  "telefone": "(11) 98888-8888",
  "endereco": "Novo endereço"
}
```

---

### Internações

#### Criar Internação

**Endpoint**: `POST /public/internacoes`

**Request Body**:
```json
{
  "petId": "987e6543-e21b-12d3-a456-426614174000",
  "veterinarioId": "456e7890-e21b-12d3-a456-426614174000",
  "dataEntrada": "2025-01-20T10:00:00Z",
  "motivo": "Parvovirose - vômitos e diarreia",
  "diagnostico": "Parvovirose confirmada via teste rápido",
  "prioridade": "alta",
  "leito": "L-05",
  "observacoes": "Pet desidratado, iniciar fluidoterapia"
}
```

**Resposta** (201 Created):
```json
{
  "id": "789e0123-e21b-12d3-a456-426614174000",
  "status": "ativa",
  ...
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

#### Atualizar Internação

**Endpoint**: `PATCH /public/internacoes/:id`

**Request Body** (campos opcionais):
```json
{
  "diagnostico": "Parvovirose - quadro estabilizado",
  "leito": "L-03",
  "observacoes": "Transferido para leito de observação"
}
```

#### Dar Alta

**Endpoint**: `PATCH /public/internacoes/:id/alta`

**Request Body**:
```json
{
  "dataSaida": "2025-01-25T16:00:00Z",
  "diagnostico": "Parvovirose - alta por melhora",
  "observacoes": "Continuar medicação em casa por 5 dias"
}
```

**Resposta**:
```json
{
  "id": "789e0123-e21b-12d3-a456-426614174000",
  "status": "alta",
  "dataSaida": "2025-01-25T16:00:00.000Z",
  ...
}
```

---

### Agendamentos

#### Criar Agendamento

**Endpoint**: `POST /public/agendamentos`

**Request Body**:
```json
{
  "petId": "987e6543-e21b-12d3-a456-426614174000",
  "veterinarioId": "456e7890-e21b-12d3-a456-426614174000",
  "tipo": "Consulta",
  "dataHoraInicio": "2025-01-22T14:00:00Z",
  "dataHoraFim": "2025-01-22T14:30:00Z",
  "observacoes": "Primeira consulta - retorno parvovirose"
}
```

**Validação de Conflitos**: O sistema verifica automaticamente conflitos de horário do veterinário.

**Resposta** (201 Created):
```json
{
  "id": "321e6543-e21b-12d3-a456-426614174000",
  "status": "agendado",
  ...
  "createdAt": "2025-01-20T14:30:00.000Z"
}
```

**Erro de Conflito** (409 Conflict):
```json
{
  "statusCode": 409,
  "message": "Veterinário já possui agendamento neste horário",
  "conflitos": 1
}
```

#### Atualizar Agendamento

**Endpoint**: `PATCH /public/agendamentos/:id`

**Request Body** (campos opcionais):
```json
{
  "dataHoraInicio": "2025-01-22T15:00:00Z",
  "dataHoraFim": "2025-01-22T15:30:00Z",
  "observacoes": "Horário alterado a pedido do tutor"
}
```

#### Confirmar Agendamento

**Endpoint**: `PATCH /public/agendamentos/:id/confirmar`

**Resposta**:
```json
{
  "id": "321e6543-e21b-12d3-a456-426614174000",
  "status": "confirmado",
  ...
}
```

#### Cancelar Agendamento

**Endpoint**: `PATCH /public/agendamentos/:id/cancelar`

**Request Body** (opcional):
```json
{
  "motivo": "Tutor solicitou cancelamento"
}
```

**Resposta**:
```json
{
  "id": "321e6543-e21b-12d3-a456-426614174000",
  "status": "cancelado",
  ...
}
```

---

### Financeiro

#### Registrar Pagamento

**Endpoint**: `POST /public/financeiro/contas/:id/pagamentos`

**Request Body**:
```json
{
  "valor": 150.00,
  "formaPagamento": "PIX",
  "dataPagamento": "2025-01-20T14:30:00Z",
  "observacoes": "Pagamento via PIX - comprovante anexado"
}
```

**Atualização Automática**: A conta é automaticamente atualizada:
- Status muda para `parcial` se pagamento parcial
- Status muda para `paga` se valor total quitado

**Resposta** (201 Created):
```json
{
  "id": "654e3210-e21b-12d3-a456-426614174000",
  "contaId": "123e4567-e89b-12d3-a456-426614174000",
  "valor": 150.00,
  "formaPagamento": "PIX",
  "dataPagamento": "2025-01-20T14:30:00.000Z",
  ...
}
```

---

## 🔒 Permissões e Segurança

### Permissões Granulares

Ao criar uma API Key, você pode especificar permissões granulares:

```json
{
  "permissions": [
    "read:pets",
    "write:pets",
    "read:tutores",
    "write:tutores",
    "read:internacoes",
    "write:internacoes",
    "read:agendamentos",
    "write:agendamentos",
    "write:financeiro"
  ]
}
```

### Validação de Dados

Todos os endpoints de escrita validam:
- ✅ Campos obrigatórios
- ✅ Formato de dados (emails, CPF, datas)
- ✅ Valores dentro de ranges válidos
- ✅ Referências (IDs) existentes no banco
- ✅ Regras de negócio (ex: conflitos de agenda)

### Erros Comuns

**400 Bad Request** - Dados inválidos:
```json
{
  "statusCode": 400,
  "message": ["nome não deve estar vazio", "tutorId deve ser um UUID"],
  "error": "Bad Request"
}
```

**404 Not Found** - Recurso não encontrado:
```json
{
  "statusCode": 404,
  "message": "Pet com ID xyz não encontrado"
}
```

**409 Conflict** - Conflito de dados:
```json
{
  "statusCode": 409,
  "message": "CPF já cadastrado",
  "conflictField": "cpf"
}
```

---

## 💡 Casos de Uso - Integração ERP

### Caso 1: Sistema de Agendamento Externo

Um sistema externo pode criar e gerenciar agendamentos:

1. **Criar Tutor** (se não existir)
2. **Criar Pet** vinculado ao tutor
3. **Criar Agendamento** para o pet
4. **Confirmar Agendamento** quando tutor confirmar

```javascript
// 1. Criar tutor
const tutor = await fetch('/public/tutores', {
  method: 'POST',
  body: JSON.stringify({ nome: 'João Silva', telefone: '...' })
});

// 2. Criar pet
const pet = await fetch('/public/pets', {
  method: 'POST',
  body: JSON.stringify({
    nome: 'Rex',
    especie: 'Cachorro',
    tutorId: tutor.id
  })
});

// 3. Criar agendamento
const agendamento = await fetch('/public/agendamentos', {
  method: 'POST',
  body: JSON.stringify({
    petId: pet.id,
    veterinarioId: 'vet-id',
    tipo: 'Consulta',
    dataHoraInicio: '2025-01-22T14:00:00Z',
    dataHoraFim: '2025-01-22T14:30:00Z'
  })
});

// 4. Confirmar
await fetch(`/public/agendamentos/${agendamento.id}/confirmar`, {
  method: 'PATCH'
});
```

### Caso 2: Integração com Sistema Financeiro

ERP pode registrar pagamentos automaticamente:

```javascript
// Consultar contas abertas
const contas = await fetch('/public/financeiro/contas?status=aberta');

// Registrar pagamento
for (const conta of contas) {
  await fetch(`/public/financeiro/contas/${conta.id}/pagamentos`, {
    method: 'POST',
    body: JSON.stringify({
      valor: conta.valorTotal - conta.valorPago,
      formaPagamento: 'PIX',
      observacoes: 'Pagamento via integração ERP'
    })
  });
}
```

### Caso 3: Sistema de Internação Remoto

Clínica parceira pode criar internações:

```javascript
// Buscar pet por microchip
const pet = await fetch('/public/pets/microchip/982000123456789');

// Criar internação
const internacao = await fetch('/public/internacoes', {
  method: 'POST',
  body: JSON.stringify({
    petId: pet.id,
    veterinarioId: 'vet-id',
    motivo: 'Transferência de clínica parceira - trauma',
    prioridade: 'urgencia',
    leito: 'UTI-01'
  })
});

// Atualizar diagnóstico após exames
await fetch(`/public/internacoes/${internacao.id}`, {
  method: 'PATCH',
  body: JSON.stringify({
    diagnostico: 'Fratura de fêmur - cirurgia realizada'
  })
});

// Dar alta
await fetch(`/public/internacoes/${internacao.id}/alta`, {
  method: 'PATCH',
  body: JSON.stringify({
    dataSaida: new Date().toISOString(),
    diagnostico: 'Alta por melhora - retorno em 7 dias',
    observacoes: 'Retirar pontos em 10 dias'
  })
});
```

---

## 📊 Resumo de Endpoints

| Recurso | GET | POST | PATCH | DELETE |
|---------|-----|------|-------|--------|
| **Pets** | ✅ | ✅ | ✅ | ❌ |
| **Tutores** | ✅ | ✅ | ✅ | ❌ |
| **Internações** | ✅ | ✅ | ✅ + Alta | ❌ |
| **Agendamentos** | ✅ | ✅ | ✅ + Confirmar/Cancelar | ❌ |
| **Financeiro** | ✅ Contas | ✅ Pagamentos | ❌ | ❌ |

**Total de Endpoints**: 35+ (14 leitura + 21 escrita)

---

## 🚀 Início Rápido

```javascript
const API_KEY = 'zp_suakey';
const TENANT = 'sua-clinica';
const BASE_URL = 'https://api.zoapets.com';

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
  'X-Tenant-Slug': TENANT
};

// Criar tutor
const tutor = await fetch(`${BASE_URL}/public/tutores`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    nome: 'Maria Santos',
    telefone: '(11) 99999-9999',
    email: 'maria@email.com'
  })
}).then(r => r.json());

console.log('Tutor criado:', tutor.id);

// Criar pet
const pet = await fetch(`${BASE_URL}/public/pets`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    nome: 'Miau',
    especie: 'Gato',
    tutorId: tutor.id
  })
}).then(r => r.json());

console.log('Pet criado:', pet.id);
```

---

## 📝 Changelog

### v2.0.0 (2025-01-20)
- ✅ **NOVO**: Endpoints de escrita (POST/PATCH)
- ✅ **NOVO**: Criar Pets, Tutores, Internações, Agendamentos
- ✅ **NOVO**: Atualizar registros existentes
- ✅ **NOVO**: Operações especiais (alta, confirmar, cancelar, pagamentos)
- ✅ **NOVO**: Validação automática de dados
- ✅ **NOVO**: Detecção de conflitos de agendamento
- ✅ Mesma segurança da v1.0 (API Key, Rate Limiting, IP Whitelist)

### v1.0.0 (2025-01-20)
- Endpoints de leitura
- Autenticação via API Key
- Rate limiting
- IP whitelisting

---

**Integração ERP/Backoffice: COMPLETA!** 🎉
