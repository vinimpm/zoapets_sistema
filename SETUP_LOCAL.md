# 🚀 Guia de Setup Local - Zoa Pets

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **VS Code** (recomendado) - [Download](https://code.visualstudio.com/)

### Verificar Instalações

```bash
node --version    # Deve mostrar v20.x.x ou superior
npm --version     # Deve mostrar 10.x.x ou superior
docker --version  # Deve mostrar Docker version 20.x.x ou superior
git --version     # Qualquer versão recente
```

---

## 📥 Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/vinimpm/zoapets_sistema.git

# Entre na pasta do projeto
cd zoapets_sistema
```

---

## 🐳 Passo 2: Iniciar Infraestrutura (Docker)

```bash
# Inicie os containers Docker (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Aguarde ~30 segundos para os serviços iniciarem
# Verifique se todos os containers estão rodando
docker-compose ps
```

**Você deve ver:**
```
NAME                  STATUS
zoapets-postgres      Up (healthy)
zoapets-redis         Up (healthy)
zoapets-minio         Up
zoapets-adminer       Up
zoapets-redisinsight  Up
```

### 🔍 Verificar o Banco de Dados

Acesse o Adminer em: **http://localhost:8080**

**Credenciais:**
- Server: `postgres`
- Username: `postgres`
- Password: `postgres123`
- Database: `zoapets_dev`

**Verificações:**
- ✅ Schemas `public` e `tenant_demo` devem existir
- ✅ Tabela `public.tenants` deve ter 1 registro (Hospital Demo)
- ✅ Tabela `tenant_demo.users` deve ter 1 registro (admin@demo.com)

---

## 🖥️ Passo 3: Configurar e Rodar o Backend

### 3.1 Instalar Dependências

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install
```

### 3.2 Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp ../.env.example .env
```

O arquivo `.env` já vem com valores padrão que funcionam localmente:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=zoapets_dev

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro-mude-em-producao
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3000
NODE_ENV=development
```

### 3.3 Iniciar o Backend

```bash
# Rode o backend em modo desenvolvimento
npm run start:dev
```

**Você deve ver:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application is running on: http://localhost:3000
```

### ✅ Testar o Backend

Abra outro terminal e teste:

```bash
# Health check
curl http://localhost:3000/api/health

# Você deve receber:
# {"status":"ok","timestamp":"..."}
```

**Ou acesse no navegador:** http://localhost:3000/api/health

---

## 🌐 Passo 4: Configurar e Rodar o Frontend

### 4.1 Instalar Dependências

Abra um **NOVO terminal** (deixe o backend rodando):

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install
```

### 4.2 Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local
```

O arquivo `.env.local` deve conter:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_TENANT_SLUG=demo
```

### 4.3 Iniciar o Frontend

```bash
# Rode o frontend em modo desenvolvimento
npm run dev
```

**Você deve ver:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001
  - Network:      http://192.168.x.x:3001

✓ Ready in 3.2s
```

---

## 🎉 Passo 5: Acessar o Sistema

### Abra o navegador em: **http://localhost:3001**

### Credenciais de Login:

```
Email: admin@demo.com
Senha: Admin@123
Tenant: demo (já vem preenchido)
```

**Após o login você verá:**
- ✅ Dashboard com métricas
- ✅ Menu lateral com todos os módulos
- ✅ Sistema funcionando completamente!

---

## 📊 Passo 6: Explorar o Sistema

### Módulos Disponíveis:

1. **Dashboard** - Visão geral com métricas
2. **Tutores** - Gestão de donos de pets
3. **Pets** - Cadastro de pacientes
4. **Internações** - Gestão de internações hospitalares
5. **RAEM** - Administração de medicamentos (crítico!)
6. **Prescrições** - Prescrições médicas
7. **Medicamentos** - Catálogo + controle de estoque
8. **Agendamentos** - Calendário de consultas
9. **Financeiro** - Contas e pagamentos

### Testar Funcionalidades:

1. **Criar um Tutor**:
   - Vá em "Tutores"
   - Clique em "Novo Tutor"
   - Preencha o formulário e salve

2. **Criar um Pet**:
   - Vá em "Pets"
   - Clique em "Novo Pet"
   - Selecione o tutor criado
   - Preencha os dados e salve

3. **Criar uma Internação**:
   - Vá em "Internações"
   - Clique em "Nova Internação"
   - Selecione o pet
   - Escolha prioridade e preencha dados

4. **Testar o RAEM**:
   - Primeiro crie uma prescrição em "Prescrições"
   - Depois vá em "RAEM" para ver as administrações agendadas
   - Registre uma administração

---

## 🔧 Comandos Úteis

### Docker

```bash
# Ver logs de todos os containers
docker-compose logs -f

# Ver logs só do PostgreSQL
docker-compose logs -f postgres

# Parar todos os containers
docker-compose stop

# Parar e remover containers (CUIDADO: apaga dados!)
docker-compose down -v

# Restartar apenas um serviço
docker-compose restart postgres
```

### Backend

```bash
cd backend

# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Modo debug
npm run start:debug

# Build de produção
npm run build

# Rodar em produção
npm run start:prod
```

### Frontend

```bash
cd frontend

# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar build de produção
npm start

# Limpar cache
rm -rf .next
```

---

## 🐛 Troubleshooting

### Problema: Backend não conecta no banco

**Solução:**
```bash
# 1. Verifique se o PostgreSQL está rodando
docker-compose ps

# 2. Teste a conexão diretamente
docker exec -it zoapets-postgres psql -U postgres -d zoapets_dev

# 3. Verifique as credenciais no .env do backend
```

### Problema: Frontend não conecta no backend

**Solução:**
```bash
# 1. Verifique se o backend está rodando
curl http://localhost:3000/api/health

# 2. Verifique o .env.local do frontend
cat frontend/.env.local
# Deve ter: NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 3. Limpe o cache do Next.js
cd frontend
rm -rf .next
npm run dev
```

### Problema: Porta 3000 ou 3001 já está em uso

**Solução:**

**Windows:**
```bash
# Ver o que está usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua <PID> pelo número)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Ver o que está usando a porta
lsof -i :3000

# Matar o processo
kill -9 <PID>
```

### Problema: Docker não inicia

**Solução:**
1. Certifique-se de que o Docker Desktop está aberto
2. Reinicie o Docker Desktop
3. No Windows, verifique se WSL2 está instalado

---

## 📚 Recursos Adicionais

### Acessos Admin

- **Adminer** (PostgreSQL): http://localhost:8080
- **MinIO Console**: http://localhost:9001
  - User: `minioadmin`
  - Password: `minioadmin123`
- **RedisInsight**: http://localhost:8001

### Documentação

- **README.md** - Visão geral do projeto
- **STATUS_FINAL.md** - Status completo de implementação
- **PROJETO_100_COMPLETO.md** - Documentação detalhada
- **backend/docs/PUBLIC_API.md** - Documentação da API Pública
- **backend/docs/PUBLIC_API_WRITE_OPERATIONS.md** - Operações de escrita da API

### API Documentation (Endpoints)

- Backend API Base: http://localhost:3000/api
- Public API Base: http://localhost:3000/public

**Principais Endpoints:**
- `POST /api/auth/login` - Login
- `GET /api/pets` - Listar pets
- `GET /api/internacoes` - Listar internações
- `GET /public/health` - Health check público

---

## 🎯 Próximos Passos

### Após Setup Local Completo:

1. ✅ Explore todas as páginas do sistema
2. ✅ Teste criar, editar e excluir dados
3. ✅ Veja o RAEM em ação (administração de medicamentos)
4. ✅ Teste o calendário de agendamentos
5. ✅ Registre pagamentos no módulo financeiro

### Para Deploy em Produção:

1. Configure variáveis de ambiente de produção
2. Use banco de dados gerenciado (RDS, Cloud SQL)
3. Configure Redis gerenciado (ElastiCache, Redis Cloud)
4. Deploy backend (Railway, Render, AWS)
5. Deploy frontend (Vercel, Netlify)
6. Configure domínio e SSL
7. Setup de monitoramento (Sentry, DataDog)

---

## 📞 Precisa de Ajuda?

- **Documentação completa**: Veja a pasta `docs/`
- **Issues do GitHub**: https://github.com/vinimpm/zoapets_sistema/issues
- **README principal**: Veja o `README.md` na raiz do projeto

---

## ✨ Sistema Funcionando!

Se você chegou até aqui e tudo está rodando, **PARABÉNS!** 🎉

Você agora tem um sistema hospitalar veterinário completo rodando localmente:
- ✅ Backend com 125+ endpoints
- ✅ Frontend com 10 páginas CRUD
- ✅ Public API v2.0 para integração ERP
- ✅ Sistema RAEM completo
- ✅ Multi-tenancy funcional
- ✅ Autenticação + RBAC

**O sistema está 100% pronto para uso!** 🚀

---

**Desenvolvido com ❤️ pela equipe Zoa Pets**

_Versão: 2.0.0 (Production Ready)_
_Data: Janeiro 2025_
