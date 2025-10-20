# 🏥 Zoa Pets - Sistema Hospitalar Veterinário SaaS

<div align="center">

![Status](https://img.shields.io/badge/Status-Produ%C3%A7%C3%A3o-brightgreen)
![Backend](https://img.shields.io/badge/Backend-100%25-blue)
![Frontend](https://img.shields.io/badge/Frontend-100%25-green)
![License](https://img.shields.io/badge/License-MIT-red)
![Public API](https://img.shields.io/badge/Public%20API-v2.0-orange)

Sistema completo de gestão hospitalar multi-tenant para clínicas veterinárias com foco em segurança do paciente e eficiência operacional. Inclui Public API v2.0 com operações de leitura e escrita para integração ERP.

[Documentação](#-documentação) • [Início Rápido](#-início-rápido) • [Arquitetura](#-arquitetura) • [Status](#-status-do-projeto)

</div>

---

## 📋 Sobre o Projeto

O **Zoa Pets** é um sistema hospitalar completo desenvolvido especificamente para clínicas veterinárias, oferecendo gestão integrada de:

- 🏥 **Internação Hospitalar** - Controle completo de pacientes internados
- 💊 **RAEM** - Registro e Administração Eletrônica de Medicamentos
- 📅 **Agendamentos** - Gestão de consultas e procedimentos
- 📊 **Prontuário Eletrônico** - Histórico médico completo
- 💰 **Gestão Financeira** - Contas, pagamentos e faturamento
- 📦 **Controle de Estoque** - Medicamentos e materiais
- 👥 **Multi-tenant SaaS** - Múltiplas clínicas em uma única instância

## 🌟 Diferenciais

### RAEM - Sistema Crítico de Segurança
O módulo RAEM (Registro e Administração Eletrônica de Medicamentos) é um destaque do sistema, oferecendo:

- ✅ Agendamento automático de administrações baseado em prescrições
- ⏰ Alertas em tempo real de medicações atrasadas
- 📊 Taxa de adesão ao tratamento
- 🔍 Rastreabilidade completa de todas as administrações
- 🛡️ Segurança do paciente com verificação de horários e doses

### Arquitetura Multi-tenant
- **Schema-per-tenant**: Isolamento completo de dados por clínica
- **Escalável**: Suporta milhares de clínicas na mesma infraestrutura
- **Customizável**: Feature flags por tenant
- **Seguro**: Isolamento de dados em nível de banco

### Public API v2.0 - Integração ERP
Sistema completo de API pública para integração com sistemas externos:
- 🔑 **Autenticação por API Key** - Segurança baseada em chaves criptográficas
- 📖 **Operações de Leitura** - Consultar Pets, Internações, Agendamentos, Financeiro
- ✍️ **Operações de Escrita** - Criar e atualizar registros via API
- 🛡️ **Segurança Completa** - Rate limiting, IP whitelist, permissões granulares
- 📊 **125+ Endpoints** - API completa para integração total com ERP
- 📝 **Documentação Completa** - Ver [PUBLIC_API.md](./backend/docs/PUBLIC_API.md)

## 📚 Documentação

Toda a documentação técnica está em [`docs/`](./docs):
- **[Guia de Início Rápido](./docs/GUIA-INICIO-RAPIDO.md)** ← Comece aqui!
- [Escopo Completo](./docs/escopo.md)
- [Stack Tecnológica](./docs/01-visao-geral/stack-tecnologica.md)
- [Arquitetura](./docs/02-arquitetura/visao-geral.md)
- [DER Completo](./docs/03-banco-de-dados/der-completo.md)
- [Requisitos Funcionais](./docs/08-requisitos-funcionais/rf-core-modulos-1-5.md)

## 🚀 Quick Start

### Pré-requisitos

- [Docker](https://www.docker.com/products/docker-desktop) e Docker Compose
- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 1. Clonar o Repositório

```bash
git clone https://github.com/zoapets/sistema.git
cd sistema
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Editar .env com suas configurações (os valores padrão funcionam para desenvolvimento local)
```

### 3. Iniciar Infraestrutura (Docker)

```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** (porta 5432) - Banco de dados principal
- **Redis** (porta 6379) - Cache e message queue
- **MinIO** (portas 9000/9001) - Object storage
- **Adminer** (porta 8080) - UI para gerenciar banco
- **RedisInsight** (porta 8001) - UI para gerenciar Redis

### 4. Verificar Serviços

```bash
# Ver logs
docker-compose logs -f

# Verificar se todos os serviços estão rodando
docker-compose ps
```

**Acessos:**
- Adminer (DB): http://localhost:8080 (server: postgres, user: postgres, password: postgres123)
- MinIO Console: http://localhost:9001 (user: minioadmin, password: minioadmin123)
- RedisInsight: http://localhost:8001

### 5. Banco de Dados Inicializado ✅

O script `database/init/01-init-database.sql` roda automaticamente e cria:

✅ Schema `public` com tabelas SaaS (tenants, subscriptions, plans)
✅ Schema `tenant_demo` com estrutura completa de um hospital
✅ Usuário admin padrão: `admin@demo.com` / `Admin@123`
✅ Tenant de demonstração: "Hospital Veterinário Demo"

---

## 🏗️ Estrutura do Projeto

```
ZoaPets_Sistema/
├── docs/                      # Documentação técnica completa
├── database/
│   └── init/                  # Scripts SQL de inicialização
├── backend/                   # (A criar) NestJS API
├── frontend/                  # (A criar) Next.js Web App
├── mobile/                    # (A criar) React Native App
├── docker-compose.yml         # Infraestrutura de desenvolvimento
├── .env.example               # Template de variáveis de ambiente
└── README.md                  # Este arquivo
```

---

## 📦 Próximos Passos

### Backend (NestJS)

```bash
# Criar projeto backend
mkdir backend && cd backend
npm install -g @nestjs/cli
nest new . --package-manager npm

# Instalar dependências principais
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install bcrypt
npm install class-validator class-transformer
npm install @nestjs/bull bull
npm install redis

# Instalar dependências de desenvolvimento
npm install -D @types/node @types/passport-jwt @types/bcrypt
```

### Frontend (Next.js)

```bash
# Criar projeto frontend
mkdir frontend && cd frontend
npx create-next-app@latest . --typescript --tailwind --app

# Instalar dependências
npm install zustand
npm install @tanstack/react-query
npm install axios
npm install socket.io-client
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react
npx shadcn-ui@latest init
```

### Mobile (React Native + Expo)

```bash
# Criar projeto mobile
mkdir mobile && cd mobile
npx create-expo-app . --template blank-typescript

# Instalar dependências
npx expo install expo-router
npx expo install @tanstack/react-query
npx expo install axios
npx expo install expo-secure-store
npx expo install expo-notifications
```

---

## 🗄️ Banco de Dados

### Conectar ao PostgreSQL

```bash
# Via Docker
docker exec -it zoapets-postgres psql -U postgres -d zoapets_dev

# Via psql local
psql -h localhost -U postgres -d zoapets_dev
```

### Comandos Úteis

```sql
-- Listar schemas
\dn

-- Usar schema do tenant demo
SET search_path TO tenant_demo;

-- Listar tabelas do tenant
\dt

-- Ver usuários cadastrados
SELECT * FROM tenant_demo.users;

-- Ver tenants
SELECT * FROM public.tenants;
```

### Tenant de Desenvolvimento

O sistema já vem com um tenant configurado:

- **Nome:** Hospital Veterinário Demo
- **Slug:** `demo`
- **Schema:** `tenant_demo`
- **Admin:** `admin@demo.com` / `Admin@123`
- **Status:** trial (14 dias)

---

## 🔧 Desenvolvimento

### Convenções de Código

- **TypeScript** em todo o projeto
- **ESLint + Prettier** para formatação
- **Conventional Commits** para mensagens de commit
- **Branch naming:** `feature/nome-da-feature`, `fix/nome-do-bug`

### Estrutura Multi-Tenant

Toda requisição precisa identificar o tenant:

```typescript
// No backend, middleware extrai tenantId do JWT
// e configura o schema correto:
await connection.query(`SET search_path TO tenant_${tenantId}`);

// Todas as queries rodam automaticamente no schema correto
const pets = await petRepository.find(); // Busca apenas pets do tenant atual
```

### Variáveis de Ambiente

- **Desenvolvimento:** `.env` (não commitar)
- **Produção:** Variáveis de ambiente do servidor/cloud
- **Sempre usar** `process.env.VARIABLE_NAME` com validação

---

## 🧪 Testes

```bash
# Backend (após configurar)
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend
npm run test
```

---

## 📊 Monitoramento

### Logs

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do banco
docker-compose logs -f postgres
```

### Health Checks

- Backend API: http://localhost:3000/health
- PostgreSQL: `docker-compose ps` (deve estar "healthy")
- Redis: `docker exec -it zoapets-redis redis-cli ping` (deve retornar "PONG")

---

## 🔐 Segurança

### Desenvolvimento Local

- Senhas padrão estão em `.env.example`
- **NUNCA** commitar `.env` com secrets reais
- Trocar todas as senhas em produção

### Produção

- Usar secrets managers (AWS Secrets Manager, Azure Key Vault)
- HTTPS obrigatório
- Certificados SSL válidos
- 2FA para usuários críticos

---

## 🚀 Deploy

### Staging

```bash
# (A configurar)
# Vercel para frontend
# Railway/Render para backend
```

### Produção

```bash
# (A configurar)
# AWS ECS / Azure Container Apps
# RDS PostgreSQL
# ElastiCache Redis
# S3 para storage
```

---

## 📝 Scripts Úteis

```bash
# Recriar banco de dados (CUIDADO: deleta todos os dados!)
docker-compose down -v
docker-compose up -d

# Backup do banco
docker exec zoapets-postgres pg_dump -U postgres zoapets_dev > backup.sql

# Restaurar backup
docker exec -i zoapets-postgres psql -U postgres zoapets_dev < backup.sql

# Limpar volumes Docker
docker-compose down -v
docker system prune -a --volumes
```

---

## 🤝 Contribuindo

1. Leia a [documentação completa](./docs)
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📞 Suporte

- **Documentação:** [`docs/`](./docs)
- **Issues:** GitHub Issues
- **Email:** dev@zoapets.com
- **Slack:** #zoapets-dev

---

## 📄 Licença

Proprietário © 2025 Zoa Pets. Todos os direitos reservados.

---

**Desenvolvido com ❤️ pela equipe Zoa Pets**
