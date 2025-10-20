-- ZoaPets Database Initialization Script
-- PostgreSQL 16 - Multi-tenant schema-per-tenant architecture

-- Create public schema tables (shared across all tenants)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  tenant_slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tenant_slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(nome, tenant_slug)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- API Keys table (tenant-specific)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permissions JSONB,
  ip_whitelist JSONB,
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_ativo ON public.api_keys(ativo);

-- Function to create tenant schema with all tables
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_slug VARCHAR)
RETURNS void AS $$
BEGIN
  -- Create schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', tenant_slug);

  -- Tutores table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.tutores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(255) NOT NULL,
      cpf VARCHAR(14) UNIQUE,
      rg VARCHAR(20),
      telefone VARCHAR(20),
      celular VARCHAR(20),
      email VARCHAR(255),
      endereco TEXT,
      observacoes TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug);

  -- Pets table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.pets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(255) NOT NULL,
      especie VARCHAR(100) NOT NULL,
      raca VARCHAR(100),
      sexo VARCHAR(10),
      cor VARCHAR(100),
      data_nascimento DATE,
      microchip VARCHAR(50) UNIQUE,
      castrado BOOLEAN DEFAULT false,
      peso_kg DECIMAL(5,2),
      observacoes TEXT,
      tutor_id UUID REFERENCES %I.tutores(id) ON DELETE CASCADE,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Internações table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.internacoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id UUID NOT NULL REFERENCES %I.pets(id) ON DELETE CASCADE,
      veterinario_id UUID NOT NULL,
      data_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_saida TIMESTAMP,
      motivo TEXT NOT NULL,
      diagnostico TEXT,
      status VARCHAR(50) DEFAULT ''ativa'',
      prioridade VARCHAR(20) DEFAULT ''media'',
      leito VARCHAR(50),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Medicamentos table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.medicamentos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(255) NOT NULL UNIQUE,
      principio_ativo VARCHAR(255),
      tipo VARCHAR(100),
      forma_farmaceutica VARCHAR(100),
      concentracao VARCHAR(100),
      estoque_minimo INTEGER DEFAULT 0,
      estoque_atual INTEGER DEFAULT 0,
      unidade_medida VARCHAR(50),
      observacoes TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug);

  -- Prescrições table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.prescricoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      internacao_id UUID NOT NULL REFERENCES %I.internacoes(id) ON DELETE CASCADE,
      medicamento_id UUID NOT NULL REFERENCES %I.medicamentos(id),
      veterinario_id UUID NOT NULL,
      dose VARCHAR(100) NOT NULL,
      via_administracao VARCHAR(50),
      frequencia VARCHAR(100),
      data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_fim TIMESTAMP,
      status VARCHAR(50) DEFAULT ''ativa'',
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug, tenant_slug);

  -- Administrações table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.administracoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prescricao_id UUID NOT NULL REFERENCES %I.prescricoes(id) ON DELETE CASCADE,
      usuario_id UUID NOT NULL,
      data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      dose_administrada VARCHAR(100),
      via_administracao VARCHAR(50),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Evoluções table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.evolucoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      internacao_id UUID NOT NULL REFERENCES %I.internacoes(id) ON DELETE CASCADE,
      veterinario_id UUID NOT NULL,
      data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      relato TEXT NOT NULL,
      estado_geral VARCHAR(50),
      alimentacao VARCHAR(100),
      hidratacao VARCHAR(100),
      consciencia VARCHAR(100),
      deambulacao VARCHAR(100),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Sinais Vitais table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.sinais_vitais (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      internacao_id UUID NOT NULL REFERENCES %I.internacoes(id) ON DELETE CASCADE,
      usuario_id UUID NOT NULL,
      data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      temperatura_c DECIMAL(4,2),
      frequencia_cardiaca INTEGER,
      frequencia_respiratoria INTEGER,
      pressao_arterial_sistolica INTEGER,
      pressao_arterial_diastolica INTEGER,
      spo2 INTEGER,
      peso_kg DECIMAL(5,2),
      glicemia INTEGER,
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Agendamentos table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.agendamentos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id UUID NOT NULL REFERENCES %I.pets(id) ON DELETE CASCADE,
      veterinario_id UUID NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      data_hora_inicio TIMESTAMP NOT NULL,
      data_hora_fim TIMESTAMP NOT NULL,
      status VARCHAR(50) DEFAULT ''agendado'',
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Exames table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.exames (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      internacao_id UUID REFERENCES %I.internacoes(id) ON DELETE CASCADE,
      pet_id UUID NOT NULL REFERENCES %I.pets(id) ON DELETE CASCADE,
      veterinario_solicitante_id UUID NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      nome VARCHAR(255) NOT NULL,
      descricao TEXT,
      data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_coleta TIMESTAMP,
      data_resultado TIMESTAMP,
      status VARCHAR(50) DEFAULT ''solicitado'',
      resultado TEXT,
      valores JSONB,
      arquivos JSONB,
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug, tenant_slug);

  -- Contas (Financeiro) table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.contas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tutor_id UUID NOT NULL REFERENCES %I.tutores(id) ON DELETE CASCADE,
      pet_id UUID REFERENCES %I.pets(id) ON DELETE SET NULL,
      internacao_id UUID REFERENCES %I.internacoes(id) ON DELETE SET NULL,
      numero_conta VARCHAR(50) UNIQUE NOT NULL,
      descricao TEXT,
      valor_total DECIMAL(10,2) NOT NULL,
      valor_pago DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT ''aberta'',
      data_vencimento DATE,
      data_emissao DATE DEFAULT CURRENT_DATE,
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug, tenant_slug, tenant_slug);

  -- Pagamentos table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.pagamentos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_id UUID NOT NULL REFERENCES %I.contas(id) ON DELETE CASCADE,
      usuario_id UUID NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      forma_pagamento VARCHAR(50) NOT NULL,
      data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      comprovante VARCHAR(255),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', tenant_slug, tenant_slug);

  -- Create indexes for better performance
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_pets_tutor_id ON %I.pets(tutor_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_pets_microchip ON %I.pets(microchip)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_internacoes_pet_id ON %I.internacoes(pet_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_internacoes_status ON %I.internacoes(status)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_prescricoes_internacao_id ON %I.prescricoes(internacao_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_administracoes_prescricao_id ON %I.administracoes(prescricao_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_evolucoes_internacao_id ON %I.evolucoes(internacao_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_sinais_vitais_internacao_id ON %I.sinais_vitais(internacao_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_agendamentos_pet_id ON %I.agendamentos(pet_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_agendamentos_veterinario_id ON %I.agendamentos(veterinario_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_exames_pet_id ON %I.exames(pet_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_exames_internacao_id ON %I.exames(internacao_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_contas_tutor_id ON %I.contas(tutor_id)', tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_pagamentos_conta_id ON %I.pagamentos(conta_id)', tenant_slug);

END;
$$ LANGUAGE plpgsql;

-- Create default tenant (for development)
SELECT create_tenant_schema('default');

-- Insert default roles for default tenant
INSERT INTO public.roles (nome, descricao, tenant_slug) VALUES
  ('Administrador', 'Acesso completo ao sistema', 'default'),
  ('Veterinário', 'Veterinário com acesso às funções clínicas', 'default'),
  ('Auxiliar', 'Auxiliar com acesso limitado', 'default'),
  ('Recepcionista', 'Recepcionista com acesso ao agendamento e cadastros', 'default'),
  ('Gerente', 'Gerente com acesso administrativo', 'default')
ON CONFLICT (nome, tenant_slug) DO NOTHING;

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123' - should be changed in production
INSERT INTO public.users (nome, email, senha, tenant_slug, ativo) VALUES
  ('Administrador', 'admin@zoapets.com', '$2b$10$YourHashedPasswordHere', 'default', true)
ON CONFLICT (email) DO NOTHING;

-- Link admin user to admin role
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u, public.roles r
WHERE u.email = 'admin@zoapets.com'
  AND r.nome = 'Administrador'
  AND r.tenant_slug = 'default'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.api_keys IS 'API keys for public API access - linked to registered users';
COMMENT ON COLUMN public.api_keys.key IS 'Unique API key (format: zp_[64-char-hex])';
COMMENT ON COLUMN public.api_keys.permissions IS 'JSONB array of granted permissions';
COMMENT ON COLUMN public.api_keys.ip_whitelist IS 'JSONB array of allowed IP addresses';
COMMENT ON COLUMN public.api_keys.rate_limit IS 'Maximum requests per hour';
