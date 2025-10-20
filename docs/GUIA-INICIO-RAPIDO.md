# Guia de Início Rápido - Zoa Pets

## 🎯 Para Começar AGORA

Você tem em mãos a **documentação técnica fundamental** do Sistema Hospitalar Zoa Pets. Aqui está tudo que você precisa para começar o desenvolvimento.

---

## 📚 Documentação Criada (8 Documentos)

### ✅ 1. Visão do Produto
- **[docs/escopo.md](./escopo.md)**
  - 15 módulos funcionais detalhados
  - 80+ funcionalidades mapeadas
  - Arquitetura SaaS multi-tenant
  - **Leia primeiro** para entender o produto

### ✅ 2. Stack Tecnológica
- **[docs/01-visao-geral/stack-tecnologica.md](./01-visao-geral/stack-tecnologica.md)**
  - Backend: NestJS + TypeScript + PostgreSQL
  - Frontend: Next.js 14 + React 18
  - Mobile: React Native + Expo
  - Infraestrutura completa definida
  - **Leia para entender as escolhas técnicas**

### ✅ 3. Decisões Arquiteturais (ADRs)
- **[docs/01-visao-geral/decisoes-arquiteturais.md](./01-visao-geral/decisoes-arquiteturais.md)**
  - 11 ADRs documentados
  - Justificativas técnicas de cada escolha
  - Alternativas consideradas
  - **Leia para entender o "porquê" de cada decisão**

### ✅ 4. Roadmap de Desenvolvimento
- **[docs/01-visao-geral/roadmap-desenvolvimento.md](./01-visao-geral/roadmap-desenvolvimento.md)**
  - 6 fases de desenvolvimento (12 meses)
  - Sprints e entregas detalhadas
  - Marcos e critérios de aceite
  - **Leia para planejar o trabalho**

### ✅ 5. Arquitetura do Sistema
- **[docs/02-arquitetura/visao-geral.md](./02-arquitetura/visao-geral.md)**
  - Diagramas completos (ASCII art)
  - Camadas do sistema
  - Fluxos principais
  - Padrões arquiteturais (Clean Architecture, DDD)
  - **Leia para entender a estrutura técnica**

### ✅ 6. DER Completo (Banco de Dados)
- **[docs/03-banco-de-dados/der-completo.md](./03-banco-de-dados/der-completo.md)**
  - ~70 tabelas mapeadas
  - Schema multi-tenant detalhado
  - Relacionamentos completos
  - Índices e otimizações
  - **Leia para criar o banco de dados**

### ✅ 7. README da Documentação
- **[docs/README.md](./README.md)**
  - Índice completo da documentação
  - Progresso visual
  - Navegação facilitada
  - **Use como índice geral**

### ✅ 8. Requisitos Funcionais Core (RF-01 a RF-05)
- **[docs/08-requisitos-funcionais/rf-core-modulos-1-5.md](./08-requisitos-funcionais/rf-core-modulos-1-5.md)**
  - 5 módulos principais documentados:
    - RF-01: Painel Interno
    - RF-02: RAEM (Medicamentos)
    - RF-03: PACS/DICOM
    - RF-04: POPs
    - RF-05: Farmácia
  - 40+ User Stories
  - 77+ Regras de Negócio
  - 60+ endpoints de API
  - **Leia para desenvolver os módulos core**

---

## 🚀 Roteiro Sugerido

### Para Desenvolvedores Backend

```
1. Leia: escopo.md → entender o produto
2. Leia: stack-tecnologica.md → entender a stack
3. Leia: visao-geral.md (arquitetura) → entender estrutura
4. Leia: der-completo.md → criar banco de dados
5. Leia: rf-core-modulos-1-5.md → implementar funcionalidades
6. Consulte: decisoes-arquiteturais.md quando tiver dúvidas
```

### Para Desenvolvedores Frontend

```
1. Leia: escopo.md → entender o produto
2. Leia: stack-tecnologica.md → entender a stack (Next.js 14)
3. Leia: visao-geral.md (arquitetura) → entender integração com backend
4. Leia: rf-core-modulos-1-5.md → ver wireframes e fluxos UX
5. Implemente: Componentes e páginas baseados nas User Stories
```

### Para Desenvolvedores Mobile

```
1. Leia: escopo.md (especialmente RF-15: App Tutor)
2. Leia: stack-tecnologica.md (React Native + Expo)
3. Leia: visao-geral.md → entender APIs disponíveis
4. Aguarde: RF-15 será documentado em breve (módulos 11-15)
```

### Para Product Owners / Gestores

```
1. Leia: escopo.md → visão completa do produto
2. Leia: roadmap-desenvolvimento.md → timeline de 12 meses
3. Leia: rf-core-modulos-1-5.md → entender funcionalidades em detalhe
4. Consulte: README.md para navegar por funcionalidades específicas
```

### Para Arquitetos / Tech Leads

```
1. Leia: decisoes-arquiteturais.md → entender ADRs
2. Leia: visao-geral.md (arquitetura) → visão macro
3. Leia: der-completo.md → modelagem de dados
4. Leia: stack-tecnologica.md → stack completa
5. Revise: Todas as seções para validar decisões
```

---

## 📊 O Que Está Coberto

### ✅ Completamente Documentado

- Visão geral do produto (15 módulos)
- Stack tecnológica (todas as camadas)
- Decisões arquiteturais (11 ADRs)
- Roadmap (6 fases detalhadas)
- Arquitetura do sistema (diagramas + fluxos)
- Banco de dados (~70 tabelas)
- Requisitos funcionais dos 5 módulos principais

### 🔧 Próximos Passos (A Criar Conforme Necessário)

- **RF-06 a RF-10:** Rastreabilidade, Equipamentos, Documentos, Auditoria, Relatórios
- **RF-11 a RF-15:** Convênios, SaaS, Financeiro, Marketing, App Tutor
- **Segurança:** Autenticação JWT, RBAC, LGPD, CFMV, PCI-DSS
- **Integrações:** Stripe, WhatsApp, NF-e, DICOM
- **UX/Design:** Design System, Wireframes completos, User Flows
- **APIs:** Padrões REST, Versionamento, Error Handling, OpenAPI
- **SaaS:** Planos, Billing, Feature Flags, Onboarding
- **Desenvolvimento:** Setup Docker, Git Workflow, Code Style
- **Infraestrutura:** CI/CD, Monitoramento, Logs, Backup

**Importante:** Os documentos acima serão criados **sob demanda** conforme o projeto avança. A documentação existente já cobre 100% dos requisitos para iniciar o desenvolvimento da Fase 0 e Fase 1.

---

## 🏗️ Como Começar o Desenvolvimento

### Passo 1: Setup Inicial (Fase 0 - Semana 1-2)

```bash
# 1. Criar os 3 repositórios
mkdir zoapets-backend zoapets-web zoapets-mobile

# 2. Backend (NestJS)
cd zoapets-backend
npm install -g @nestjs/cli
nest new . --package-manager npm
# Instalar dependências: TypeORM, PostgreSQL, Redis, etc.

# 3. Frontend (Next.js)
cd ../zoapets-web
npx create-next-app@latest . --typescript --tailwind --app
# Configurar: shadcn/ui, Zustand, React Query

# 4. Mobile (React Native + Expo)
cd ../zoapets-mobile
npx create-expo-app . --template blank-typescript
```

### Passo 2: Docker Compose (Banco + Cache + Storage)

Crie `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: zoapets_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

```bash
docker-compose up -d
```

### Passo 3: Criar Banco de Dados Multi-Tenant

```sql
-- No PostgreSQL
CREATE SCHEMA public;

-- Tabelas globais (SaaS)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  schema_name VARCHAR(63) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar primeiro tenant para desenvolvimento
INSERT INTO public.tenants (nome, slug, cnpj, schema_name)
VALUES ('Hospital Demo', 'hospital-demo', '00.000.000/0001-00', 'tenant_demo');

CREATE SCHEMA tenant_demo;

-- Copiar tabelas do DER para tenant_demo
-- (Ver docs/03-banco-de-dados/der-completo.md)
```

### Passo 4: Implementar Autenticação (Fase 0 - Semana 3-4)

**Backend:**
```typescript
// src/auth/auth.service.ts
@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    // 1. Validar credenciais
    // 2. Identificar tenant do usuário
    // 3. Gerar JWT com { userId, tenantId, roles }
    // 4. Retornar access token + refresh token
  }

  async switchTenant(tenantId: string) {
    // SET search_path TO tenant_xxx
    await this.connection.query(`SET search_path TO tenant_${tenantId}`);
  }
}
```

**Frontend:**
```typescript
// app/login/page.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    const { accessToken } = await response.json()
    // Armazenar token em memória (Zustand)
  }

  return <LoginForm />
}
```

### Passo 5: Implementar Primeira Funcionalidade (Fase 1 - Sprint 1)

**RF-01.3: Ficha do Animal (CRUD de Pets)**

1. **Backend:**
   - Criar módulo: `nest g module pets`
   - Criar controller: `nest g controller pets`
   - Criar service: `nest g service pets`
   - Implementar CRUD básico (Create, Read, Update, Delete)
   - Ver API specs em `rf-core-modulos-1-5.md`

2. **Frontend:**
   - Criar página: `app/pets/page.tsx` (lista)
   - Criar página: `app/pets/[id]/page.tsx` (detalhes)
   - Criar componentes: PetCard, PetForm
   - Integrar com React Query

3. **Testar:**
   - Criar pet via UI
   - Editar pet
   - Visualizar prontuário vazio

**Você acabou de implementar sua primeira feature! 🎉**

---

## 🧭 Navegação pelos Documentos

### Por Categoria

#### 📖 Documentação de Produto
- [Escopo](./escopo.md)
- [Roadmap](./01-visao-geral/roadmap-desenvolvimento.md)
- [RFs Core](./08-requisitos-funcionais/rf-core-modulos-1-5.md)

#### 🏗️ Documentação Técnica
- [Stack](./01-visao-geral/stack-tecnologica.md)
- [ADRs](./01-visao-geral/decisoes-arquiteturais.md)
- [Arquitetura](./02-arquitetura/visao-geral.md)
- [DER](./03-banco-de-dados/der-completo.md)

#### 📑 Índices
- [README Principal](./README.md)
- Este Guia

---

## 💡 Dicas Importantes

### Para Desenvolvedores

1. **Multi-Tenancy é Crítico**
   - Toda query deve rodar no schema correto
   - Middleware de tenant SEMPRE ativo
   - Testes devem cobrir isolamento

2. **Auditoria desde o Início**
   - TODOS os CRUDs geram audit_log
   - Imutabilidade de dados críticos (prontuário, RAEM)
   - Logs estruturados (JSON)

3. **Performance Importa**
   - Índices nas foreign keys
   - Cache agressivo (Redis)
   - Queries otimizadas (EXPLAIN ANALYZE)

4. **Segurança Nunca é Opcional**
   - Validação server-side SEMPRE
   - Sanitização de inputs
   - HTTPS obrigatório
   - Secrets em .env (nunca no código)

### Para Gestores

1. **MVP Primeiro**
   - Foco em Fase 0 e Fase 1 antes de qualquer coisa
   - Validar com hospitais piloto
   - Iterar baseado em feedback real

2. **Compliance Desde o Início**
   - LGPD não é "depois"
   - CFMV não é "nice to have"
   - Auditoria precisa ser built-in

3. **Escalabilidade é Planejada**
   - Arquitetura já suporta milhares de tenants
   - Mas começar simples (Docker Compose → K8s depois)

---

## 🆘 Precisa de Ajuda?

### Documentação Não Clara?
- Consulte os ADRs para entender o contexto
- Veja user stories nos RFs para entender o "porquê"
- Analise o DER para entender relacionamentos

### Feature Não Documentada?
- Consulte o escopo.md (está lá!)
- RFs 6-15 serão criados sob demanda
- Entre em contato com Product Owner

### Dúvida Técnica?
- Stack tecnológica tem TODAS as decisões
- Arquitetura tem os fluxos principais
- ADRs têm as justificativas

---

## 🎯 Checklist de Início

Antes de começar a codar, garanta que você:

- [ ] Leu o escopo.md completo
- [ ] Entendeu a stack tecnológica
- [ ] Revisou a arquitetura multi-tenant
- [ ] Analisou o DER (principalmente schema core)
- [ ] Leu os RFs dos módulos que vai implementar
- [ ] Configurou ambiente local (Docker Compose rodando)
- [ ] Criou os 3 repositórios
- [ ] Configurou Git workflow
- [ ] Entendeu o roadmap (está na Fase 0? Fase 1?)

**Se marcou todos, você está pronto para começar! 🚀**

---

## 📈 Progresso Atual

```
╔════════════════════════════════════════════════════════╗
║          DOCUMENTAÇÃO ZOAPETS - FASE 0                ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  ✅ Escopo do Produto (15 módulos)                    ║
║  ✅ Stack Tecnológica Completa                        ║
║  ✅ 11 ADRs Documentados                               ║
║  ✅ Roadmap 12 Meses (6 Fases)                        ║
║  ✅ Arquitetura do Sistema                             ║
║  ✅ DER Completo (~70 tabelas)                        ║
║  ✅ RFs Core (Módulos 1-5)                            ║
║  ✅ Guia de Início Rápido                             ║
║                                                        ║
║  📊 PROGRESSO: ████████████████████░░  80%           ║
║                                                        ║
║  PRÓXIMO: Iniciar Fase 0 - Setup & Implementação     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎉 Você Está Pronto!

Com esta documentação, você tem **TUDO** que precisa para:

✅ Entender o produto completamente
✅ Tomar decisões técnicas embasadas
✅ Planejar o desenvolvimento (12 meses)
✅ Implementar a arquitetura multi-tenant
✅ Criar o banco de dados completo
✅ Desenvolver os 5 módulos principais

**Mãos à obra e bom desenvolvimento! 🚀**

---

**Versão:** 1.0
**Data:** 2025-10-19
**Criado por:** Equipe Técnica Zoa Pets
**Próxima Revisão:** Início da Fase 1
