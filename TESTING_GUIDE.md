# Guia de Testes - Sistema SaaS ZoaPets

## Visão Geral

Este documento descreve como testar o sistema completo de auto-signup e gerenciamento de assinaturas do ZoaPets.

## Pré-requisitos

- Backend rodando em `http://localhost:3001`
- Frontend rodando em `http://localhost:3000`
- PostgreSQL rodando com banco de dados configurado
- Planos seedados no banco de dados (executar PlansSeeder)

## 1. Testar Seed de Planos

### Via Backend (Recomendado)

```bash
# Se ainda não executou o seed, execute:
cd backend
npm run build
# Depois execute manualmente o seeder ou via endpoint
```

### Verificar Planos no Banco

```sql
SELECT * FROM public.plans ORDER BY preco_mensal;
```

Deve retornar 4 planos:
- FREE (R$ 0)
- STARTER (R$ 199)
- PROFESSIONAL (R$ 299)
- ENTERPRISE (R$ 799)

## 2. Testar Landing Page

### Acesso
1. Abra `http://localhost:3000`
2. Você deve ver a landing page com:
   - Hero section com CTAs
   - Seção de Features (9 recursos)
   - Seção de Benefícios (6 itens)
   - CTA final
   - Footer

### Navegação
- Clique em "Recursos" → Deve rolar para #features
- Clique em "Benefícios" → Deve rolar para #benefits
- Clique em "Preços" → Deve ir para `/pricing`
- Clique em "Começar Grátis" → Deve ir para `/signup`
- Clique em "Entrar" → Deve ir para `/login`

## 3. Testar Pricing Page

### Acesso
1. Vá para `http://localhost:3000/pricing`

### Verificações
- ✅ 4 cards de planos visíveis
- ✅ Toggle mensal/anual funciona
- ✅ Badge "Mais Popular" no plano Professional
- ✅ Badge "14 dias grátis" nos planos pagos
- ✅ Seção de FAQ com 6 perguntas
- ✅ Botão "Começar Grátis" redireciona para `/signup?plan=free`
- ✅ Botão "Começar Trial" redireciona para `/signup?plan={slug}`

### Teste de Cálculo Anual
1. Clique em "Anual"
2. Verificar que:
   - STARTER: R$ 199 → R$ 165/mês (R$ 1.990/ano = 10 meses)
   - PROFESSIONAL: R$ 299 → R$ 249/mês (R$ 2.990/ano = 10 meses)
   - ENTERPRISE: R$ 799 → R$ 665/mês (R$ 7.990/ano = 10 meses)
   - Mensagem "Economize R$ XXX/ano" aparece

## 4. Testar Signup Wizard (Frontend)

### Fluxo Completo

#### Passo 1: Informações da Clínica
1. Acesse `http://localhost:3000/signup`
2. Preencha:
   ```
   Nome da Clínica: Clínica Veterinária Teste
   ```
3. Observe:
   - ✅ Mensagem de disponibilidade aparece
   - ✅ Botão "Próximo" habilitado
4. Clique em "Próximo"

#### Passo 2: Dados do Administrador
1. Preencha:
   ```
   Nome Completo: João da Silva
   Email: joao@teste.com
   Senha: 123456
   Confirmar Senha: 123456
   ```
2. Verificações:
   - ✅ Validação de senha mínima (6 caracteres)
   - ✅ Validação de email
   - ✅ Senhas devem coincidir
3. Clique em "Próximo"

#### Passo 3: Escolha do Plano
1. Observe:
   - ✅ 4 cards de planos
   - ✅ Plano selecionado via URL (se veio de /pricing)
   - ✅ Badge "Popular" no Professional
2. Selecione um plano (ex: STARTER)
3. Clique em "Criar Conta"

#### Passo 4: Sucesso
1. Aguarde processamento
2. Verificar:
   - ✅ Tela de sucesso com:
     - ✅ Check verde
     - ✅ Mensagem de boas-vindas com nome
     - ✅ Nome da clínica
     - ✅ Informação sobre trial (se plano pago)
   - ✅ Redirecionamento automático para /dashboard após 3 segundos
   - ✅ Ou clique em "Ir para o Dashboard"

## 5. Testar API de Signup (Backend)

### Teste via cURL

```bash
# 1. Verificar disponibilidade de nome
curl -X POST http://localhost:3001/signup/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "nomeClinica": "Minha Clínica Veterinária"
  }'

# Resposta esperada:
# {
#   "suggested": "minha-clinica-veterinaria",
#   "available": true,
#   "message": "Este nome está disponível!"
# }

# 2. Criar conta completa
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nomeClinica": "Clínica Teste API",
    "adminNomeCompleto": "Administrador Teste",
    "adminEmail": "admin@api-test.com",
    "adminPassword": "senha123",
    "planSlug": "starter"
  }'

# Resposta esperada:
# {
#   "success": true,
#   "message": "Trial de 14 dias iniciado.",
#   "tenant": {
#     "slug": "clinica-teste-api",
#     "nomeClinica": "Clínica Teste API"
#   },
#   "subscription": {
#     "id": "uuid",
#     "plan": { ... },
#     "status": "trialing",
#     "trialEndsAt": "2025-11-07T...",
#     "isInTrial": true,
#     "daysUntilTrialEnd": 14
#   },
#   "auth": {
#     "accessToken": "jwt-token",
#     "refreshToken": "jwt-refresh-token",
#     "user": { ... }
#   }
# }
```

### Verificações no Banco de Dados

Após signup bem-sucedido, verifique:

```sql
-- 1. Schema do tenant foi criado
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name LIKE 'tenant_%';

-- 2. Assinatura foi criada
SELECT * FROM public.subscriptions
WHERE tenant_slug = 'clinica-teste-api';

-- 3. Usage tracking foi iniciado
SELECT * FROM public.usage_tracking
WHERE tenant_slug = 'clinica-teste-api';

-- 4. Usuário admin foi criado no schema do tenant
SET search_path TO tenant_clinica_teste_api;
SELECT * FROM users WHERE email = 'admin@api-test.com';
```

## 6. Testar Subscription Badge (Dashboard)

### Após Login
1. Faça login com a conta criada
2. No dashboard, procure o SubscriptionBadge
3. Verificar:
   - ✅ Nome do plano exibido
   - ✅ Cor correta do badge (free=gray, starter=blue, professional=purple, enterprise=amber)
   - ✅ Se em trial, mostrar "X dias trial"
   - ✅ Clique no badge leva para `/settings/billing`

### Variante Completa
1. Renderize `<SubscriptionBadge variant="full" />`
2. Verificar:
   - ✅ Card completo com detalhes do plano
   - ✅ Preço mensal
   - ✅ Status (trialing/active)
   - ✅ Limites do plano listados
   - ✅ Aviso se trial está acabando (< 7 dias)
   - ✅ Botão "Ver Detalhes"

## 7. Testar Usage Meters

### No Dashboard ou Billing Page
1. Renderize `<UsageMeter variant="full" />`
2. Verificar:
   - ✅ 3 medidores: Usuários, Pets, Consultas
   - ✅ Barra de progresso mostra % usado
   - ✅ Cor verde quando OK
   - ✅ Cor âmbar quando próximo do limite (>80%)
   - ✅ Cor vermelha quando limite atingido (100%)
   - ✅ Mensagem de alerta se limite atingido
   - ✅ Botão "Fazer Upgrade" aparece se houver warnings

### Simular Limite Atingido
```sql
-- Atualizar usage tracking para simular limite
UPDATE public.usage_tracking
SET current_users = 3,
    current_pets = 50,
    current_consultas = 100
WHERE tenant_slug = 'clinica-teste-api';
```

Recarregue a página e verifique avisos de limite.

## 8. Testar Billing Page

### Acesso
1. Vá para `http://localhost:3000/settings/billing`
2. Deve exibir:
   - ✅ Card de assinatura atual
   - ✅ Card de medidores de uso
   - ✅ Grid com 4 planos disponíveis
   - ✅ Card de forma de pagamento
   - ✅ Histórico de cobrança (vazio inicialmente)

### Teste de Upgrade
1. No plano atual (ex: FREE), verificar badge "Plano Atual"
2. Nos planos superiores, verificar botão "Fazer Upgrade"
3. Clique em "Fazer Upgrade" no STARTER
4. Verificar:
   - ✅ Toast de sucesso
   - ✅ Página recarrega
   - ✅ STARTER agora mostra "Plano Atual"
   - ✅ FREE agora mostra botão "Fazer Downgrade"

### Teste de Downgrade
1. Clique em "Fazer Downgrade" para FREE
2. Confirmar dialog
3. Verificar:
   - ✅ Toast: "Downgrade agendado. Entra em vigor no próximo ciclo."
   - ✅ Mensagem no card indicando mudança agendada

### Teste de Cancelamento
1. Role até "Zona de Perigo"
2. Clique em "Cancelar Assinatura"
3. Confirmar dialog
4. Verificar:
   - ✅ Toast de sucesso
   - ✅ Card de aviso amarelo aparece
   - ✅ Mensagem: "Assinatura será cancelada em [data]"
   - ✅ Botão "Reativar Assinatura" aparece

### Teste de Reativação
1. Clique em "Reativar Assinatura"
2. Verificar:
   - ✅ Toast de sucesso
   - ✅ Card de aviso desaparece
   - ✅ Zona de Perigo volta a aparecer

## 9. Testar Middleware de Limites (UsageTracker)

### Simular Limite de Usuários
1. Faça login em uma conta com plano FREE (limite: 1 usuário)
2. Tente criar um segundo usuário via API:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu-token}" \
  -H "X-Tenant-Slug: clinica-teste-api" \
  -d '{
    "nomeCompleto": "Segundo Usuário",
    "email": "segundo@teste.com",
    "senha": "123456",
    "cargo": "Veterinário"
  }'

# Resposta esperada:
# {
#   "statusCode": 403,
#   "message": "Limite de 1 usuários atingido. Faça upgrade do seu plano para adicionar mais usuários.",
#   "error": "LIMIT_EXCEEDED",
#   "resource": "user",
#   "limit": 1,
#   "current": 1,
#   "plan": "free",
#   "upgradeRequired": true
# }
```

### Verificar Outros Limites
- Criar pets até atingir limite (50 no FREE)
- Criar consultas até atingir limite mensal (20 no FREE)
- Tentar criar internação no plano FREE (sem permissão)

## 10. Checklist Final

### Backend
- [ ] Planos seedados corretamente
- [ ] Endpoint `/signup` funcionando
- [ ] Endpoint `/signup/check-availability` funcionando
- [ ] Schema de tenant criado automaticamente
- [ ] Usuário admin criado
- [ ] Assinatura criada com trial
- [ ] Usage tracking iniciado
- [ ] Middleware bloqueia recursos quando limite atingido

### Frontend
- [ ] Landing page renderiza corretamente
- [ ] Pricing page mostra 4 planos
- [ ] Toggle mensal/anual funciona
- [ ] Signup wizard completa 4 etapas
- [ ] Auto-login após signup
- [ ] Redirecionamento para dashboard
- [ ] SubscriptionBadge mostra plano atual
- [ ] UsageMeter mostra uso e limites
- [ ] Billing page permite upgrade/downgrade
- [ ] Avisos de trial aparecem quando necessário

### Integração
- [ ] Frontend se comunica com backend
- [ ] Tokens JWT são salvos corretamente
- [ ] tenantSlug é enviado em requisições
- [ ] Erros são tratados com toast
- [ ] Validações funcionam em ambos os lados

## 11. Testes de Borda

### Emails Duplicados
```bash
# Tentar criar conta com email já existente
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nomeClinica": "Outra Clínica",
    "adminEmail": "admin@api-test.com",
    "adminPassword": "senha123",
    "adminNomeCompleto": "Outro Admin"
  }'

# Deve retornar erro 400: Email já está em uso
```

### Nomes de Clínica Duplicados
```bash
# Tentar criar com mesmo nome
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nomeClinica": "Clínica Teste API",
    "adminEmail": "novo@teste.com",
    "adminPassword": "senha123",
    "adminNomeCompleto": "Novo Admin"
  }'

# Deve adicionar sufixo numérico: clinica-teste-api-1
```

### Senhas Fracas
```bash
# Tentar com senha < 6 caracteres
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nomeClinica": "Teste Senha",
    "adminEmail": "teste@senha.com",
    "adminPassword": "123",
    "adminNomeCompleto": "Teste"
  }'

# Deve retornar erro 400: Senha deve ter pelo menos 6 caracteres
```

## 12. Performance

### Tempo de Signup
- Medir tempo total do signup (deve ser < 5 segundos)
- Verificar se provisioning do schema é rápido
- Confirmar que não há timeouts

### Carga
- Criar múltiplos tenants simultaneamente
- Verificar se não há race conditions
- Confirmar que slugs únicos são gerados corretamente

## Problemas Conhecidos

### 1. Erros de Coluna no Console
- Alguns erros sobre colunas não existentes (rg, peso_kg, nome_completo) podem aparecer
- Estes são de entities antigas e não afetam o sistema SaaS
- Para corrigir: atualizar entities ou migrations

### 2. Planos Não Seedados
- Se não houver planos no banco, o signup falhará
- Solução: Executar PlansSeeder manualmente ou criar endpoint para seed

### 3. Mercado Pago
- Integração com SDK ainda não implementada
- Pagamentos não serão processados (apenas estrutura está pronta)
- Implementar quando tiver credenciais de API

## Próximos Passos

1. **Onboarding Tour**: Criar tour guiado para novos usuários
2. **Mercado Pago SDK**: Integrar SDK oficial para processar pagamentos
3. **Webhooks**: Implementar handlers para webhooks do Mercado Pago
4. **Notificações**: Email de boas-vindas, lembrete de trial, etc
5. **Testes E2E**: Cypress ou Playwright para testes automatizados
6. **Monitoramento**: Sentry, analytics de conversão de signup

## Suporte

Para problemas ou dúvidas:
1. Verificar logs do backend
2. Verificar console do navegador
3. Consultar este documento
4. Verificar código fonte nos arquivos mencionados
