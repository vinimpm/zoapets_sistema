# Arquitetura Frontend - Next.js

## Visão Geral

O frontend do **Zoa Pets** é uma aplicação web moderna construída com **Next.js 14** (App Router), React 18, TypeScript e Tailwind CSS, seguindo padrões de design responsivo e componentização.

**Tecnologias Principais:**
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Linguagem:** TypeScript 5+
- **Estilo:** Tailwind CSS 3+
- **Componentes:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** React Query (@tanstack/react-query)
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Validação:** Zod
- **Ícones:** Lucide React
- **Toasts:** react-hot-toast

---

## Estrutura de Diretórios

```
frontend/
├── src/
│   ├── app/                       # App Router (Next.js 14)
│   │   ├── layout.tsx             # Layout raiz com providers
│   │   ├── page.tsx               # Homepage (redirect para dashboard)
│   │   ├── login/                 # Página de login
│   │   │   └── page.tsx
│   │   ├── dashboard/             # Dashboard principal
│   │   │   └── page.tsx
│   │   ├── agendamentos/          # 📅 Agendamentos
│   │   │   └── page.tsx
│   │   ├── consultas/             # 🩺 Consultas
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Detalhes da consulta
│   │   ├── internacoes/           # 🏥 Internações
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Detalhes com tabs
│   │   ├── ram/                   # 💊 Painel de Enfermagem (RAM)
│   │   │   └── page.tsx
│   │   ├── prescricoes/           # 📋 Prescrições
│   │   │   └── page.tsx
│   │   ├── medicamentos/          # 💊 Medicamentos
│   │   │   └── page.tsx
│   │   ├── pets/                  # 🐾 Pets
│   │   │   └── page.tsx
│   │   ├── tutores/               # 👤 Tutores
│   │   │   └── page.tsx
│   │   ├── exames/                # 🧪 Exames
│   │   │   └── page.tsx
│   │   ├── financeiro/            # 💰 Financeiro
│   │   │   └── page.tsx
│   │   ├── pagamentos/            # 💳 Pagamentos
│   │   │   └── page.tsx
│   │   ├── estoque/               # 📦 Estoque
│   │   │   └── page.tsx
│   │   ├── produtos/              # 🏷️ Produtos
│   │   │   └── page.tsx
│   │   ├── escalas/               # 📆 Escalas
│   │   │   └── page.tsx
│   │   ├── checklists/            # ✅ Checklists
│   │   │   └── page.tsx
│   │   ├── sops/                  # 📖 SOPs
│   │   │   └── page.tsx
│   │   ├── equipamentos/          # 🔧 Equipamentos
│   │   │   └── page.tsx
│   │   ├── mensagens/             # 💬 Mensagens
│   │   │   └── page.tsx
│   │   ├── convenios/             # 🏢 Convênios
│   │   │   └── page.tsx
│   │   ├── campanhas/             # 📢 Campanhas
│   │   │   └── page.tsx
│   │   ├── relatorios/            # 📊 Relatórios
│   │   │   └── page.tsx
│   │   ├── configuracoes/         # ⚙️ Configurações
│   │   │   └── page.tsx
│   │   ├── globals.css            # Estilos globais + Tailwind
│   │   └── providers.tsx          # Providers (React Query, Toaster)
│   │
│   ├── components/                # Componentes React
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── ... (~30 componentes)
│   │   └── layout/                # Layout components
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── ...
│   │
│   ├── services/                  # API Services (25 services)
│   │   ├── auth.service.ts
│   │   ├── administracoes.service.ts
│   │   ├── agendamentos.service.ts
│   │   ├── campanhas.service.ts
│   │   ├── checklists.service.ts
│   │   ├── configuracoes.service.ts
│   │   ├── consultas.service.ts
│   │   ├── convenios.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── equipamentos.service.ts
│   │   ├── escalas.service.ts
│   │   ├── evolucoes.service.ts
│   │   ├── exames.service.ts
│   │   ├── financeiro.service.ts
│   │   ├── internacoes.service.ts
│   │   ├── medicamentos.service.ts
│   │   ├── mensagens.service.ts
│   │   ├── movimentacoes-estoque.service.ts
│   │   ├── pets.service.ts
│   │   ├── prescricoes.service.ts
│   │   ├── produtos.service.ts
│   │   ├── roles.service.ts
│   │   ├── sinais-vitais.service.ts
│   │   ├── sops.service.ts
│   │   ├── tutores.service.ts
│   │   └── users.service.ts
│   │
│   ├── lib/                       # Utilitários
│   │   ├── api-client.ts          # Axios instance configurado
│   │   └── utils.ts               # Helper functions
│   │
│   └── types/                     # TypeScript types (se houver)
│
├── public/                        # Assets estáticos
│   ├── images/
│   └── ...
│
├── .env.example
├── .env.local                     # Variáveis de ambiente
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Páginas Implementadas (28)

### 1. **Login** (`/login`)
- Autenticação com email/senha
- Validação de formulário
- Armazenamento de token no localStorage
- Redirect para /dashboard após login

### 2. **Dashboard** (`/dashboard`)
- Estatísticas em tempo real
- Cards de resumo (internações, consultas, agendamentos)
- Gráficos e métricas
- Acesso rápido aos módulos principais

### 3. **Agendamentos** (`/agendamentos`)
- Lista de agendamentos
- Filtros (data, veterinário, status)
- Criação de novo agendamento
- Confirmação de presença
- Iniciar atendimento (gera consulta)

### 4. **Consultas** (`/consultas`)
- Lista de consultas
- Filtros por status, data, veterinário
- **Página de detalhes** (`/consultas/[id]`):
  - Anamnese completa
  - Exame físico (temperatura, FC, FR, TPC, mucosas, etc.)
  - Diagnóstico e conduta
  - Prescrições ambulatoriais
  - **Botão "Gerar Internação"** (abre dialog com formulário)
  - Concluir consulta

### 5. **Internações** (`/internacoes`)
- Dashboard de internações
- Status (aguardando, em_andamento, alta, óbito)
- Filtros por prioridade, tipo, status
- **Página de detalhes** (`/internacoes/[id]`):
  - **Tabs:**
    1. **Resumo:** Dados da internação, médico, leito, prioridade
    2. **Evoluções:** Notas de evolução diárias
    3. **Sinais Vitais:** Monitoramento contínuo com gráficos
    4. **Prescrições:** Lista de prescrições hospitalares com medicamentos
  - Botões de ação: Alta, Óbito

### 6. **RAM - Painel de Enfermagem** (`/ram`)
- **Painel consolidado** (1 única query ao backend)
- **Cards de Resumo:**
  - Total de administrações
  - Pendentes (com ícone Clock)
  - Atrasadas (com ícone AlertTriangle)
  - Realizadas (com ícone CheckCircle)
  - Taxa de Adesão (%)
- **Alerta de Atrasadas** (card vermelho se houver)
- **Tabela de Pendentes:**
  - Pet, Medicamento, Dose, Via, Horário Agendado, Status
  - Botões: "Registrar" e "Não Realizado"
- **Próximas 2h:** Preview de administrações futuras
- **Dialogs:**
  - Registrar: dose administrada, via, observações, horário
  - Não Realizar: motivo obrigatório + observações

### 7. **Prescrições** (`/prescricoes`)
- Lista de todas as prescrições
- Filtros (tipo: ambulatorial/hospitalar, internação, status)
- Criação de nova prescrição
- Items de prescrição (medicamentos)

### 8. **Medicamentos** (`/medicamentos`)
- CRUD de medicamentos
- Busca por nome, princípio ativo
- Apresentação, via de administração
- Controle de estoque vinculado

### 9. **Pets** (`/pets`)
- CRUD de pets
- Busca por nome, espécie, tutor
- Informações: espécie, raça, data nascimento, sexo
- Histórico clínico completo
- Relacionamento com tutor

### 10. **Tutores** (`/tutores`)
- CRUD de tutores/clientes
- Informações de contato (telefone, celular, email)
- Endereço completo
- Lista de pets do tutor
- Histórico de consultas

### 11. **Exames** (`/exames`)
- Solicitação de exames
- Status: pendente, coletado, em_analise, concluído
- Upload de resultados
- Visualização de laudos
- Integração com prontuário

### 12. **Sinais Vitais** (integrado em `/internacoes/[id]`)
- Monitoramento contínuo
- FC, FR, temperatura, SpO2, pressão arterial, glicemia
- Gráficos de evolução
- Alertas de valores críticos

### 13. **Financeiro** (`/financeiro`)
- Contas a receber
- Status: pendente, pago, vencido, cancelado
- Total a receber, recebido no período
- Filtros por data, status, cliente
- Emissão de recibos

### 14. **Pagamentos** (`/pagamentos`)
- Registro de pagamentos
- Formas: Pix, cartão débito/crédito, dinheiro, transferência
- Vinculação com conta
- Comprovantes

### 15. **Estoque** (`/estoque`)
- Movimentações de estoque
- Entrada e saída
- Lote e validade
- Alertas de estoque crítico
- Alertas de vencimento próximo
- Relatórios de consumo

### 16. **Produtos** (`/produtos`)
- CRUD de produtos (não medicamentos)
- Insumos, materiais
- Controle de estoque integrado

### 17. **Escalas** (`/escalas`)
- Escalas de funcionários
- Turnos (manhã, tarde, noite)
- Plantões
- Calendário visual
- Troca de plantões

### 18. **Checklists** (`/checklists`)
- Checklists digitais executáveis
- Templates de checklist
- Execução em tempo real
- Itens marcáveis
- Assinatura digital
- Rastreabilidade

### 19. **SOPs** (`/sops`)
- POPs digitais (Procedimentos Operacionais Padrão)
- Categorização
- Versionamento
- Histórico de atualizações
- Acesso rápido por categoria

### 20. **Equipamentos** (`/equipamentos`)
- Cadastro de equipamentos hospitalares
- Manutenção preventiva e corretiva
- Calibrações
- Alertas de próxima manutenção
- Histórico completo

### 21. **Mensagens** (`/mensagens`)
- Comunicação interna da equipe
- Mensagens entre usuários
- Notificações
- Lidas/não lidas

### 22. **Convênios** (`/convenios`)
- Planos pet
- Autorizações de procedimentos
- Coberturas e limites
- Repasses financeiros

### 23. **Campanhas** (`/campanhas`)
- Campanhas de marketing
- Segmentação de clientes
- Disparos automáticos
- Fidelização
- Métricas de engajamento

### 24. **Relatórios** (`/relatorios`)
- Diversos relatórios gerenciais
- Exportação em PDF e Excel
- Filtros personalizados

### 25. **Configurações** (`/configuracoes`)
- Configurações do sistema
- Perfil do usuário
- Preferências

---

## Arquitetura de Componentes

### App Router (Next.js 14)

**Layout Raiz:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Providers:**
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

---

## Services (API Clients)

Cada módulo tem seu próprio service que encapsula as chamadas à API.

**Exemplo: administracoes.service.ts**
```typescript
import apiClient from '@/lib/api-client';

export interface Administracao {
  id: string;
  prescricaoId: string;
  dataHoraAgendada: string;
  dataHoraRealizada?: string;
  usuarioId?: string;
  doseAdministrada?: string;
  viaAdministracao?: string;
  status: 'pendente' | 'realizada' | 'nao_realizada' | 'atrasada';
  observacoes?: string;
  motivo?: string;
  prescricao?: {
    medicamento: {
      nome: string;
    };
    internacao: {
      pet: {
        nome: string;
      };
    };
  };
}

export interface RegistrarAdministracaoDto {
  doseAdministrada: string;
  viaAdministracao: string;
  observacoes?: string;
}

export interface PainelEnfermagem {
  atrasadas: Administracao[];
  pendentes: Administracao[];
  proximas: Administracao[];
  estatisticas: {
    total: number;
    realizadas: number;
    pendentes: number;
    atrasadas: number;
    taxaAdesao: number;
  };
}

class AdministracoesService {
  async getPainelEnfermagem(horas: number = 2): Promise<PainelEnfermagem> {
    const { data } = await apiClient.get(`/administracoes/painel-enfermagem?horas=${horas}`);
    return data;
  }

  async registrar(id: string, dto: RegistrarAdministracaoDto): Promise<Administracao> {
    const { data } = await apiClient.patch(`/administracoes/${id}/registrar`, dto);
    return data;
  }

  async naoRealizar(id: string, dto: any): Promise<Administracao> {
    const { data } = await apiClient.patch(`/administracoes/${id}/nao-realizar`, dto);
    return data;
  }
}

export const administracoesService = new AdministracoesService();
```

**API Client (Axios):**
```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## State Management (React Query)

Usamos **React Query** para gerenciar estado do servidor (cache, loading, erro).

**Exemplo: Painel de Enfermagem (RAM)**
```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { administracoesService } from '@/services/administracoes.service';
import toast from 'react-hot-toast';

export default function RamPage() {
  const queryClient = useQueryClient();

  // Query única consolidada
  const { data: painelData, isLoading } = useQuery({
    queryKey: ['painel-enfermagem'],
    queryFn: () => administracoesService.getPainelEnfermagem(2),
  });

  // Extrair dados
  const atrasadas = painelData?.atrasadas || [];
  const pendentes = painelData?.pendentes || [];
  const proximas = painelData?.proximas || [];
  const resumo = painelData?.estatisticas;

  // Mutation para registrar
  const registrarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      administracoesService.registrar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-enfermagem'] });
      toast.success('Administração registrada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar');
    },
  });

  // Render...
}
```

**Vantagens do React Query:**
- ✅ Cache automático (evita requisições desnecessárias)
- ✅ Refetch inteligente
- ✅ Loading e error states embutidos
- ✅ Invalidação de cache otimizada
- ✅ Mutations com callbacks (onSuccess, onError)

---

## Componentes shadcn/ui

Sistema de componentes baseado em **Radix UI** estilizados com **Tailwind CSS**.

**Principais Componentes Usados:**

### Button
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default">Salvar</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>
<Button size="sm">Pequeno</Button>
```

### Card
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
</Card>
```

### Dialog (Modal)
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const [isOpen, setIsOpen] = useState(false);

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Registrar Administração</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Formulário */}
    </div>
    <DialogFooter>
      <Button onClick={handleSave}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table
```typescript
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Pet</TableHead>
      <TableHead>Medicamento</TableHead>
      <TableHead>Dose</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.pet.nome}</TableCell>
        <TableCell>{item.medicamento.nome}</TableCell>
        <TableCell>{item.dose}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tabs
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="resumo">
  <TabsList>
    <TabsTrigger value="resumo">Resumo</TabsTrigger>
    <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
    <TabsTrigger value="sinais-vitais">Sinais Vitais</TabsTrigger>
    <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
  </TabsList>

  <TabsContent value="resumo">
    {/* Conteúdo do resumo */}
  </TabsContent>

  <TabsContent value="evolucoes">
    {/* Lista de evoluções */}
  </TabsContent>

  {/* ... */}
</Tabs>
```

### Badge
```typescript
import { Badge } from '@/components/ui/badge';

const getStatusBadge = (status: string) => {
  const variants = {
    pendente: 'warning',
    realizada: 'success',
    atrasada: 'destructive',
    nao_realizada: 'secondary',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
};
```

---

## Padrões de Código

### Estrutura de uma Página

```typescript
'use client'; // Necessário para client components

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceName } from '@/services/service-name.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function PageName() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['resource-name'],
    queryFn: () => serviceName.findAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newData) => serviceName.create(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-name'] });
      toast.success('Criado com sucesso!');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro');
    },
  });

  // Handlers
  const handleCreate = (formData) => {
    createMutation.mutate(formData);
  };

  // Render
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Título da Página</h1>

      {isLoading && <div>Carregando...</div>}

      {error && <div>Erro ao carregar</div>}

      {data && (
        <Card>
          {/* Conteúdo */}
        </Card>
      )}
    </div>
  );
}
```

### Forms com Validação

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof formSchema>;

export default function FormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('nome')} />
      {errors.nome && <span className="text-red-500">{errors.nome.message}</span>}

      <Input {...register('email')} type="email" />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

---

## Estilização (Tailwind CSS)

**Configuração:**
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... outros tokens
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**Classes Comuns:**
```typescript
// Layout
<div className="flex flex-col gap-4">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Espaçamento
<div className="p-8"> // padding
<div className="mb-6"> // margin-bottom

// Tipografia
<h1 className="text-3xl font-bold">
<p className="text-muted-foreground">

// Cores
<Badge className="bg-red-500 text-white">
<Button variant="destructive">
```

---

## Autenticação

**Login Flow:**
```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { accessToken, user } = await authService.login({ email, senha });

      // Salvar token
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Formulário */}
    </form>
  );
}
```

**Protected Routes:**
```typescript
// Middleware ou verificação em cada página
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Render...
}
```

---

## Performance

### Code Splitting
Next.js faz code splitting automático por rota.

### Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Carregando...</div>,
  ssr: false,
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Para imagens above-the-fold
/>
```

---

## Build e Deploy

**Scripts NPM:**
```json
{
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

**Variáveis de Ambiente:**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Build de Produção:**
```bash
npm run build
npm run start
```

---

## Próximos Passos

1. **PWA:** Configurar service workers para funcionar offline
2. **Internacionalização (i18n):** Suporte a múltiplos idiomas
3. **Dark Mode:** Tema escuro completo
4. **Acessibilidade:** ARIA labels, navegação por teclado
5. **Testes:** Jest + React Testing Library
6. **Storybook:** Documentação de componentes
7. **Analytics:** Google Analytics ou similar

---

**Versão:** 1.0
**Data:** 2025-10-21
**Status:** ✅ 100% Implementado - 28 Páginas Operacionais
