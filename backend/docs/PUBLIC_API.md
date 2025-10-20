# ZoaPets Public API Documentation

## Visão Geral

A API Pública do ZoaPets permite que aplicações externas **leiam e escrevam** dados do sistema de forma segura e controlada. Todos os endpoints requerem autenticação via API Key.

**Versão**: 2.0.0
**Features**: Read + Write Operations (Integração completa com ERPs)

## Segurança

### Requisitos

- **Cadastro de Usuário**: Para obter uma API Key, você deve ter uma conta registrada no sistema
- **Autenticação**: Todas as requisições devem incluir uma API Key válida
- **Rate Limiting**: Cada API Key tem um limite de requisições por hora (padrão: 1000 req/hora)
- **IP Whitelist**: Opcionalmente, pode-se restringir o acesso a IPs específicos

### Obtendo uma API Key

1. Faça login no sistema como Administrador ou Gerente
2. Acesse o módulo de API Keys
3. Crie uma nova API Key informando:
   - Nome da aplicação
   - Descrição (opcional)
   - Permissões necessárias
   - IPs permitidos (opcional)
   - Limite de requisições por hora
   - Data de expiração (opcional)

**IMPORTANTE**: A chave completa será exibida apenas uma vez na criação. Armazene-a com segurança!

### Formato da API Key

```
zp_[64-caracteres-hexadecimais]
```

Exemplo: `zp_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Autenticação

Existem duas formas de enviar a API Key:

### 1. Header (Recomendado)

```http
GET /public/pets
Host: api.zoapets.com
X-API-Key: zp_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
X-Tenant-Slug: sua-clinica
```

### 2. Query Parameter

```http
GET /public/pets?apiKey=zp_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
Host: api.zoapets.com
X-Tenant-Slug: sua-clinica
```

## Rate Limiting

Cada resposta inclui headers de rate limiting:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-01-20T15:00:00.000Z
```

Quando o limite é excedido:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "statusCode": 429,
  "message": "Rate limit excedido. Tente novamente após 2025-01-20T15:00:00.000Z"
}
```

## Endpoints Disponíveis

### Health Check

Verifica o status da API.

**Endpoint**: `GET /public/health`

**Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T14:30:00.000Z",
  "api": "Zoa Pets Public API",
  "version": "1.0.0"
}
```

---

### Pets

#### Listar Pets

**Endpoint**: `GET /public/pets`

**Query Parameters**:
- `search` (opcional): Busca por nome do pet
- `tutorId` (opcional): Filtrar por ID do tutor

**Exemplo**:
```http
GET /public/pets?search=Rex&tutorId=123e4567-e89b-12d3-a456-426614174000
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nome": "Rex",
    "especie": "Cachorro",
    "raca": "Labrador",
    "sexo": "Macho",
    "cor": "Amarelo",
    "dataNascimento": "2020-03-15",
    "microchip": "982000123456789",
    "castrado": true,
    "pesoKg": 32.5,
    "tutor": {
      "id": "987e6543-e21b-12d3-a456-426614174000",
      "nome": "João Silva",
      "telefone": "(11) 98765-4321"
    }
  }
]
```

#### Buscar Pet por ID

**Endpoint**: `GET /public/pets/:id`

**Exemplo**:
```http
GET /public/pets/123e4567-e89b-12d3-a456-426614174000
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**: Objeto pet com todos os detalhes

#### Buscar Pet por Microchip

**Endpoint**: `GET /public/pets/microchip/:microchip`

**Exemplo**:
```http
GET /public/pets/microchip/982000123456789
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**: Objeto pet com todos os detalhes

---

### Internações

#### Listar Internações

**Endpoint**: `GET /public/internacoes`

**Query Parameters**:
- `status` (opcional): Filtrar por status (ativa, alta, obito)
- `prioridade` (opcional): Filtrar por prioridade (baixa, media, alta, urgencia)

**Exemplo**:
```http
GET /public/internacoes?status=ativa&prioridade=alta
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "pet": {
      "id": "987e6543-e21b-12d3-a456-426614174000",
      "nome": "Rex",
      "especie": "Cachorro"
    },
    "dataEntrada": "2025-01-20T10:00:00.000Z",
    "dataSaida": null,
    "motivo": "Parvovirose",
    "diagnostico": "Parvovirose confirmada",
    "status": "ativa",
    "prioridade": "alta",
    "leito": "L-05"
  }
]
```

#### Listar Internações Ativas

**Endpoint**: `GET /public/internacoes/active`

**Resposta**: Lista de internações com status "ativa"

#### Ocupação de Leitos

**Endpoint**: `GET /public/internacoes/ocupacao-leitos`

**Resposta**:
```json
{
  "total": 20,
  "ocupados": 12,
  "livres": 8,
  "taxaOcupacao": 60.0,
  "porPrioridade": {
    "urgencia": 2,
    "alta": 5,
    "media": 3,
    "baixa": 2
  }
}
```

#### Buscar Internação por ID

**Endpoint**: `GET /public/internacoes/:id`

**Resposta**: Objeto internação com todos os detalhes

#### Internações de um Pet

**Endpoint**: `GET /public/internacoes/pet/:petId`

**Resposta**: Lista de internações do pet (histórico completo)

---

### Agendamentos

#### Listar Agendamentos

**Endpoint**: `GET /public/agendamentos`

**Query Parameters**:
- `data` (opcional): Filtrar por data (formato: YYYY-MM-DD)
- `veterinarioId` (opcional): Filtrar por veterinário
- `status` (opcional): Filtrar por status (agendado, confirmado, realizado, cancelado, falta)

**Exemplo**:
```http
GET /public/agendamentos?data=2025-01-20&status=agendado
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "pet": {
      "id": "987e6543-e21b-12d3-a456-426614174000",
      "nome": "Rex"
    },
    "tipo": "Consulta",
    "dataHoraInicio": "2025-01-20T14:00:00.000Z",
    "dataHoraFim": "2025-01-20T14:30:00.000Z",
    "status": "agendado",
    "observacoes": "Primeira consulta"
  }
]
```

#### Agendamentos por Período

**Endpoint**: `GET /public/agendamentos/periodo`

**Query Parameters** (obrigatórios):
- `inicio`: Data/hora inicial (ISO 8601)
- `fim`: Data/hora final (ISO 8601)
- `veterinarioId` (opcional): Filtrar por veterinário

**Exemplo**:
```http
GET /public/agendamentos/periodo?inicio=2025-01-20T00:00:00Z&fim=2025-01-27T23:59:59Z
X-API-Key: zp_suakey
X-Tenant-Slug: sua-clinica
```

**Resposta**: Lista de agendamentos no período

#### Buscar Agendamento por ID

**Endpoint**: `GET /public/agendamentos/:id`

**Resposta**: Objeto agendamento com todos os detalhes

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Parâmetros inválidos
- `401 Unauthorized`: API Key inválida, expirada ou inativa
- `403 Forbidden`: Acesso negado (IP não autorizado ou permissão insuficiente)
- `404 Not Found`: Recurso não encontrado
- `429 Too Many Requests`: Limite de requisições excedido
- `500 Internal Server Error`: Erro no servidor

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
const API_KEY = 'zp_suakey';
const TENANT = 'sua-clinica';
const BASE_URL = 'https://api.zoapets.com';

async function getPets() {
  const response = await fetch(`${BASE_URL}/public/pets`, {
    headers: {
      'X-API-Key': API_KEY,
      'X-Tenant-Slug': TENANT
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const pets = await response.json();
  return pets;
}
```

### Python (requests)

```python
import requests

API_KEY = 'zp_suakey'
TENANT = 'sua-clinica'
BASE_URL = 'https://api.zoapets.com'

headers = {
    'X-API-Key': API_KEY,
    'X-Tenant-Slug': TENANT
}

response = requests.get(f'{BASE_URL}/public/pets', headers=headers)
response.raise_for_status()
pets = response.json()
```

### cURL

```bash
curl -X GET 'https://api.zoapets.com/public/pets' \
  -H 'X-API-Key: zp_suakey' \
  -H 'X-Tenant-Slug: sua-clinica'
```

## Boas Práticas

1. **Armazene a API Key com Segurança**
   - Nunca exponha a chave no código frontend
   - Use variáveis de ambiente
   - Nunca commite chaves em repositórios

2. **Implemente Cache**
   - Evite requisições desnecessárias
   - Use cache local quando apropriado

3. **Trate Rate Limiting**
   - Monitore os headers de rate limit
   - Implemente retry com backoff exponencial

4. **Trate Erros Adequadamente**
   - Sempre verifique o status HTTP
   - Trate erros 429 (rate limit)
   - Implemente logging de erros

5. **Use HTTPS**
   - Sempre use conexões seguras
   - Nunca envie API Keys via HTTP

## Gerenciamento de API Keys

### Listar suas API Keys

```http
GET /api-keys
Authorization: Bearer {jwt_token}
```

### Criar Nova API Key

```http
POST /api-keys
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "nome": "Minha Aplicação",
  "descricao": "API Key para integração com sistema X",
  "permissions": ["read:pets", "read:internacoes"],
  "ipWhitelist": ["192.168.1.100", "192.168.1.101"],
  "rateLimit": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Estatísticas de Uso

```http
GET /api-keys/{id}/stats
Authorization: Bearer {jwt_token}
```

**Resposta**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nome": "Minha Aplicação",
  "usageCount": 45678,
  "lastUsedAt": "2025-01-20T14:30:00.000Z",
  "rateLimit": 1000,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Revogar API Key

```http
PATCH /api-keys/{id}/revoke
Authorization: Bearer {jwt_token}
```

### Reativar API Key

```http
PATCH /api-keys/{id}/activate
Authorization: Bearer {jwt_token}
```

## Suporte

Para dúvidas ou problemas com a API:
- Email: suporte@zoapets.com
- Documentação: https://docs.zoapets.com
- GitHub: https://github.com/zoapets/api

## Changelog

### v1.0.0 (2025-01-20)
- Lançamento inicial da API Pública
- Endpoints de Pets, Internações e Agendamentos
- Sistema de autenticação via API Key
- Rate limiting configurável
- IP whitelisting
