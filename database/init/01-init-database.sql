-- ============================================
-- Zoa Pets - Database Initialization Script
-- ============================================
-- Este script cria a estrutura multi-tenant básica
-- Schema PUBLIC: Dados globais do SaaS
-- Schema TENANT_XXX: Dados de cada hospital

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- ============================================
-- SCHEMA PUBLIC - SaaS Global
-- ============================================

-- Tabela: tenants (Hospitais)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco_completo JSONB,
    schema_name VARCHAR(63) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- Tabela: plans (Planos SaaS)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_mensal DECIMAL(10,2) NOT NULL,
    preco_anual DECIMAL(10,2),
    limites JSONB DEFAULT '{}', -- { "usuarios": 10, "pets": 1000, "storage_gb": 50 }
    features JSONB DEFAULT '{}', -- { "raem": true, "dicom": false, "api_access": true }
    stripe_price_id VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_ativo ON public.plans(ativo);

-- Inserir planos padrão
INSERT INTO public.plans (nome, descricao, preco_mensal, preco_anual, limites, features) VALUES
('Básico', 'Plano para pequenas clínicas', 299.00, 2990.00, '{"usuarios": 5, "pets": 500, "storage_gb": 10}', '{"raem": true, "dicom": false, "pops": true, "relatorios_basicos": true}'),
('Pro', 'Plano para hospitais de médio porte', 799.00, 7990.00, '{"usuarios": 20, "pets": 2000, "storage_gb": 50}', '{"raem": true, "dicom": true, "pops": true, "relatorios_avancados": true, "api_access": true}'),
('Enterprise', 'Plano para grandes hospitais', 1999.00, 19990.00, '{"usuarios": -1, "pets": -1, "storage_gb": 200}', '{"raem": true, "dicom": true, "pops": true, "relatorios_avancados": true, "api_access": true, "white_label": true, "suporte_dedicado": true}')
ON CONFLICT DO NOTHING;

-- Tabela: subscriptions (Assinaturas)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    trial_end TIMESTAMP,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Tabela: feature_flags (Feature Flags Globais)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    enabled_globally BOOLEAN DEFAULT false,
    enabled_for_plans UUID[] DEFAULT '{}',
    enabled_for_tenants UUID[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_key ON public.feature_flags(key);

-- Tabela: global_users (Super Admins - Equipe Zoa Pets)
CREATE TABLE IF NOT EXISTS public.global_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'support' CHECK (role IN ('superadmin', 'support', 'sales')),
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_global_users_email ON public.global_users(email);

-- ============================================
-- FUNÇÃO: Criar schema de tenant
-- ============================================
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Criar schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

    -- Definir search_path
    EXECUTE format('SET search_path TO %I', schema_name);

    -- ==========================================
    -- CORE: Usuários e Permissões
    -- ==========================================

    -- Tabela: users
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome_completo VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            cpf VARCHAR(14) UNIQUE,
            crmv VARCHAR(20),
            telefone VARCHAR(20),
            avatar_url VARCHAR(500),
            cargo VARCHAR(100),
            ativo BOOLEAN DEFAULT true,
            ultimo_acesso TIMESTAMP,
            refresh_token_hash VARCHAR(255),
            totp_secret VARCHAR(255),
            totp_enabled BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    ', schema_name);

    EXECUTE format('CREATE INDEX idx_users_email ON %I.users(email)', schema_name);
    EXECUTE format('CREATE INDEX idx_users_cpf ON %I.users(cpf)', schema_name);
    EXECUTE format('CREATE INDEX idx_users_ativo ON %I.users(ativo)', schema_name);

    -- Tabela: roles
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome VARCHAR(100) UNIQUE NOT NULL,
            descricao TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    ', schema_name);

    -- Inserir roles padrão
    EXECUTE format('
        INSERT INTO %I.roles (nome, descricao) VALUES
        (''admin'', ''Administrador do sistema''),
        (''medico'', ''Médico veterinário''),
        (''enfermeiro'', ''Enfermeiro veterinário''),
        (''recepcao'', ''Recepcionista''),
        (''farmacia'', ''Farmacêutico''),
        (''tutor'', ''Tutor/responsável do pet'')
        ON CONFLICT (nome) DO NOTHING
    ', schema_name);

    -- Tabela: permissions
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.permissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            resource VARCHAR(100) NOT NULL,
            action VARCHAR(50) NOT NULL,
            description TEXT,
            UNIQUE(resource, action)
        )
    ', schema_name);

    -- Tabela: role_permissions
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.role_permissions (
            role_id UUID REFERENCES %I.roles(id) ON DELETE CASCADE,
            permission_id UUID REFERENCES %I.permissions(id) ON DELETE CASCADE,
            PRIMARY KEY (role_id, permission_id)
        )
    ', schema_name, schema_name, schema_name);

    -- Tabela: user_roles
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.user_roles (
            user_id UUID REFERENCES %I.users(id) ON DELETE CASCADE,
            role_id UUID REFERENCES %I.roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
        )
    ', schema_name, schema_name, schema_name);

    -- Tabela: audit_logs
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES %I.users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(100),
            resource_id UUID,
            old_data JSONB,
            new_data JSONB,
            ip_address INET,
            user_agent TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
        )
    ', schema_name, schema_name);

    EXECUTE format('CREATE INDEX idx_audit_logs_user ON %I.audit_logs(user_id)', schema_name);
    EXECUTE format('CREATE INDEX idx_audit_logs_timestamp ON %I.audit_logs(timestamp DESC)', schema_name);
    EXECUTE format('CREATE INDEX idx_audit_logs_resource ON %I.audit_logs(resource_type, resource_id)', schema_name);

    -- ==========================================
    -- CLÍNICO: Tutores e Pets
    -- ==========================================

    -- Tabela: tutores
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.tutores (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome_completo VARCHAR(255) NOT NULL,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            rg VARCHAR(20),
            email VARCHAR(255) NOT NULL,
            telefone_principal VARCHAR(20) NOT NULL,
            telefone_secundario VARCHAR(20),
            endereco_completo JSONB,
            data_nascimento DATE,
            profissao VARCHAR(100),
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    ', schema_name);

    EXECUTE format('CREATE INDEX idx_tutores_cpf ON %I.tutores(cpf)', schema_name);
    EXECUTE format('CREATE INDEX idx_tutores_email ON %I.tutores(email)', schema_name);

    -- Tabela: pets
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.pets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tutor_id UUID REFERENCES %I.tutores(id) ON DELETE RESTRICT,
            nome VARCHAR(100) NOT NULL,
            especie VARCHAR(50) CHECK (especie IN (''canino'', ''felino'', ''silvestre'', ''exotico'')),
            raca VARCHAR(100),
            sexo VARCHAR(20) CHECK (sexo IN (''macho'', ''femea'')),
            data_nascimento DATE,
            peso_kg DECIMAL(5,2),
            cor_pelagem VARCHAR(100),
            castrado BOOLEAN,
            microchip VARCHAR(50) UNIQUE,
            foto_url VARCHAR(500),
            alergias TEXT[],
            doencas_previas TEXT[],
            observacoes TEXT,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    ', schema_name, schema_name);

    EXECUTE format('CREATE INDEX idx_pets_tutor ON %I.pets(tutor_id)', schema_name);
    EXECUTE format('CREATE INDEX idx_pets_microchip ON %I.pets(microchip)', schema_name);
    EXECUTE format('CREATE INDEX idx_pets_ativo ON %I.pets(ativo)', schema_name);

    -- Resetar search_path
    EXECUTE 'SET search_path TO public';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Update timestamp automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRIAR TENANT DE DESENVOLVIMENTO
-- ============================================
INSERT INTO public.tenants (nome, slug, cnpj, email, telefone, schema_name, status)
VALUES (
    'Hospital Veterinário Demo',
    'demo',
    '00.000.000/0001-00',
    'contato@hospitaldemo.com',
    '(11) 98765-4321',
    'tenant_demo',
    'trial'
) ON CONFLICT (slug) DO NOTHING;

-- Criar schema do tenant demo
SELECT create_tenant_schema('tenant_demo');

-- Criar subscription trial para o tenant demo
INSERT INTO public.subscriptions (
    tenant_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    trial_end
)
SELECT
    t.id,
    p.id,
    'trialing',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '14 days'
FROM public.tenants t, public.plans p
WHERE t.slug = 'demo' AND p.nome = 'Pro'
ON CONFLICT DO NOTHING;

-- ============================================
-- CRIAR USUÁRIO ADMIN PADRÃO NO TENANT DEMO
-- ============================================
-- Senha: Admin@123 (hash bcrypt)
-- NOTA: Trocar em produção!
DO $$
DECLARE
    tenant_schema TEXT := 'tenant_demo';
    admin_id UUID;
    role_id UUID;
BEGIN
    -- Inserir usuário admin
    EXECUTE format('
        INSERT INTO %I.users (nome_completo, email, senha_hash, cpf, cargo, ativo)
        VALUES (
            ''Administrador Sistema'',
            ''admin@demo.com'',
            ''$2b$10$rKvVLZxQxhJZ7Y.hYWZ8BejXvC6vX2YJ9xKZQp3qMGYJZqVL7VZJC'',
            ''000.000.000-00'',
            ''Administrador'',
            true
        )
        RETURNING id
    ', tenant_schema) INTO admin_id;

    -- Buscar role admin
    EXECUTE format('SELECT id FROM %I.roles WHERE nome = ''admin''', tenant_schema) INTO role_id;

    -- Vincular usuário ao role admin
    EXECUTE format('
        INSERT INTO %I.user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    ', tenant_schema) USING admin_id, role_id;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================
-- Trigger para tenants
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================
-- View: Tenants ativos com subscription
CREATE OR REPLACE VIEW public.active_tenants AS
SELECT
    t.id,
    t.nome,
    t.slug,
    t.schema_name,
    t.status,
    p.nome AS plan_name,
    s.status AS subscription_status,
    s.trial_end,
    s.current_period_end
FROM public.tenants t
LEFT JOIN public.subscriptions s ON t.id = s.tenant_id
LEFT JOIN public.plans p ON s.plan_id = p.id
WHERE t.status = 'active' OR t.status = 'trial';

-- ============================================
-- CONCLUÍDO
-- ============================================
-- Database initialization completed!
-- Tenant 'demo' criado com schema 'tenant_demo'
-- Usuário admin: admin@demo.com / Admin@123
