import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PermissionsSeedService } from '../roles/permissions-seed.service';
import { Subscription, SubscriptionStatus, BillingInterval } from '../../common/entities/subscription.entity';
import { Plan, PlanSlug } from '../../common/entities/plan.entity';
import { UsageTracking } from '../../common/entities/usage-tracking.entity';

export interface ProvisionTenantDto {
  tenantSlug: string;
  nomeClinica: string;
  adminEmail: string;
  adminPassword: string;
  adminNomeCompleto: string;
}

export interface SignupDto {
  nomeClinica: string;
  adminEmail: string;
  adminPassword: string;
  adminNomeCompleto: string;
  adminTelefone?: string;
  adminCpf?: string;
  planSlug?: string; // Opcional - padrão é FREE
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private permissionsSeedService: PermissionsSeedService,
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(UsageTracking)
    private usageTrackingRepository: Repository<UsageTracking>,
  ) {}

  /**
   * Provisiona um novo tenant completo:
   * 1. Cria o schema PostgreSQL
   * 2. Cria todas as tabelas
   * 3. Popula permissões
   * 4. Cria roles padrão
   * 5. Cria usuário admin
   */
  async provisionNewTenant(dto: ProvisionTenantDto): Promise<void> {
    this.logger.log(`Iniciando provisionamento do tenant: ${dto.tenantSlug}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Criar schema PostgreSQL
      await this.createSchema(queryRunner, dto.tenantSlug);

      // 2. Criar tabelas
      await this.createTables(queryRunner, dto.tenantSlug);

      // 3. Seed de permissões (usando queryRunner para garantir schema correto)
      await this.permissionsSeedService.seedPermissionsForTenantWithQueryRunner(
        queryRunner,
        dto.tenantSlug,
      );

      // 4. Criar roles padrão
      await this.createDefaultRoles(queryRunner, dto.tenantSlug);

      // 5. Criar usuário admin
      await this.createAdminUser(queryRunner, dto.tenantSlug, dto);

      await queryRunner.commitTransaction();
      this.logger.log(`Tenant ${dto.tenantSlug} provisionado com sucesso!`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erro ao provisionar tenant ${dto.tenantSlug}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * AUTO-SIGNUP: Provisiona tenant completo a partir de um signup
   * Inclui:
   * 1. Gera slug único baseado no nome da clínica
   * 2. Provisiona tenant completo
   * 3. Cria assinatura (FREE por padrão ou plano escolhido)
   * 4. Inicia rastreamento de uso
   * 5. Retorna dados de acesso
   */
  async provisionTenantFromSignup(dto: SignupDto): Promise<{
    tenantSlug: string;
    subscription: Subscription;
    adminEmail: string;
    message: string;
  }> {
    this.logger.log(`🚀 Iniciando auto-signup para: ${dto.nomeClinica}`);

    // 1. Gerar slug único baseado no nome da clínica
    const baseSlug = this.generateSlugFromName(dto.nomeClinica);
    const tenantSlug = await this.generateUniqueSlug(baseSlug);

    this.logger.log(`Slug gerado: ${tenantSlug}`);

    // 2. Verificar se email já está em uso
    await this.validateEmailNotInUse(dto.adminEmail);

    // 3. Buscar o plano (FREE por padrão)
    const planSlug = dto.planSlug || PlanSlug.FREE;
    const plan = await this.plansRepository.findOne({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new Error(`Plano ${planSlug} não encontrado. Execute o seed de planos primeiro.`);
    }

    // 4. Provisionar tenant completo
    await this.provisionNewTenant({
      tenantSlug,
      nomeClinica: dto.nomeClinica,
      adminEmail: dto.adminEmail,
      adminPassword: dto.adminPassword,
      adminNomeCompleto: dto.adminNomeCompleto,
    });

    // 4.5. Registrar email no mapeamento global tenant_users
    await this.registerEmailToTenant(dto.adminEmail, tenantSlug);

    // 5. Criar assinatura
    const subscription = await this.createInitialSubscription(tenantSlug, plan);

    // 6. Iniciar rastreamento de uso
    await this.initializeUsageTracking(tenantSlug);

    this.logger.log(`✅ Auto-signup completo para ${tenantSlug}!`);

    return {
      tenantSlug,
      subscription,
      adminEmail: dto.adminEmail,
      message: `Tenant ${tenantSlug} criado com sucesso! Trial de ${plan.trialDays} dias iniciado.`,
    };
  }

  /**
   * Gera slug a partir do nome da clínica
   */
  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
      .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
      .substring(0, 30); // Limita tamanho
  }

  /**
   * Gera slug único adicionando sufixo numérico se necessário
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.tenantExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;

      if (counter > 100) {
        throw new ConflictException('Não foi possível gerar um slug único. Tente outro nome.');
      }
    }

    return slug;
  }

  /**
   * Valida se email já está em uso em algum tenant
   */
  private async validateEmailNotInUse(email: string): Promise<void> {
    // Buscar em todos os schemas se o email existe
    const schemas = await this.dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public')
      AND schema_name NOT LIKE 'pg_%'
    `);

    for (const { schema_name } of schemas) {
      const users = await this.dataSource.query(
        `SELECT email FROM "${schema_name}".users WHERE email = $1 LIMIT 1`,
        [email],
      );

      if (users.length > 0) {
        throw new ConflictException(`Email ${email} já está em uso por outro tenant.`);
      }
    }
  }

  /**
   * SECURITY: Registra email no mapeamento global tenant_users
   * Permite descoberta do tenant pelo email durante login
   */
  private async registerEmailToTenant(email: string, tenantSlug: string): Promise<void> {
    this.logger.log(`Registrando email ${email} para tenant ${tenantSlug} em public.tenant_users`);

    await this.dataSource.query(`
      INSERT INTO public.tenant_users (email, tenant_slug)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE
      SET tenant_slug = EXCLUDED.tenant_slug,
          updated_at = CURRENT_TIMESTAMP
    `, [email, tenantSlug]);

    this.logger.log(`✅ Email ${email} registrado com sucesso`);
  }

  /**
   * Cria assinatura inicial para o tenant
   */
  private async createInitialSubscription(tenantSlug: string, plan: Plan): Promise<Subscription> {
    const now = new Date();
    const trialEndsAt = plan.trialDays > 0
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null;

    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription = this.subscriptionsRepository.create({
      tenantSlug,
      planId: plan.id,
      status: plan.trialDays > 0 ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      billingInterval: BillingInterval.MONTHLY,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd,
      metadata: {
        signupDate: now.toISOString(),
        planAtSignup: plan.slug,
      },
    });

    return this.subscriptionsRepository.save(subscription);
  }

  /**
   * Inicializa rastreamento de uso do tenant
   */
  private async initializeUsageTracking(tenantSlug: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageTracking = this.usageTrackingRepository.create({
      tenantSlug,
      periodStart,
      periodEnd,
      currentUsers: 1, // Admin criado
      currentPets: 0,
      currentConsultas: 0,
      currentInternacoes: 0,
      currentExames: 0,
      currentUnidades: 1,
      peakUsers: 1,
      peakPets: 0,
    });

    await this.usageTrackingRepository.save(usageTracking);
  }

  /**
   * Cria o schema PostgreSQL para o tenant
   */
  private async createSchema(queryRunner: any, tenantSlug: string): Promise<void> {
    this.logger.log(`Criando schema: ${tenantSlug}`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${tenantSlug}"`);
  }

  /**
   * Cria todas as tabelas necessárias no schema do tenant
   */
  private async createTables(queryRunner: any, tenantSlug: string): Promise<void> {
    this.logger.log(`Criando tabelas para: ${tenantSlug}`);

    // Criar extensão UUID no public (precisa ser feito antes de usar no schema do tenant)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public`);

    // Usar o schema do tenant
    await queryRunner.query(`SET search_path TO "${tenantSlug}", public`);

    // Tabela de Roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL UNIQUE,
        descricao TEXT,
        tenant_slug VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Permissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(100) NOT NULL UNIQUE,
        recurso VARCHAR(50) NOT NULL,
        acao VARCHAR(20) NOT NULL,
        descricao TEXT,
        tenant_slug VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de relacionamento Role-Permission
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    // Tabela de Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        nome_completo VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        cpf VARCHAR(14),
        data_nascimento DATE,
        crmv VARCHAR(20),
        especialidade VARCHAR(100),
        ativo BOOLEAN DEFAULT TRUE,
        avatar_url TEXT,
        refresh_token_hash TEXT,
        ultimo_acesso TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de relacionamento User-Role
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);

    // Tabela de Tutores
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tutores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome_completo VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        email VARCHAR(255),
        telefone VARCHAR(20),
        celular VARCHAR(20),
        cep VARCHAR(9),
        logradouro VARCHAR(255),
        numero VARCHAR(20),
        complemento VARCHAR(100),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Pets
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tutor_id UUID NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
        nome VARCHAR(100) NOT NULL,
        especie VARCHAR(50) NOT NULL,
        raca VARCHAR(100),
        sexo VARCHAR(20),
        cor VARCHAR(50),
        data_nascimento DATE,
        peso DECIMAL(10, 2),
        microchip VARCHAR(50) UNIQUE,
        castrado BOOLEAN DEFAULT FALSE,
        observacoes TEXT,
        foto_url TEXT,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Internações
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS internacoes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pet_id UUID NOT NULL REFERENCES pets(id),
        veterinario_id UUID REFERENCES users(id),
        data_entrada TIMESTAMP NOT NULL,
        data_prevista_alta TIMESTAMP,
        data_alta TIMESTAMP,
        motivo TEXT NOT NULL,
        diagnostico TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
        leito VARCHAR(50),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Medicamentos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS medicamentos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL,
        principio_ativo VARCHAR(255),
        concentracao VARCHAR(100),
        forma_farmaceutica VARCHAR(100),
        fabricante VARCHAR(255),
        lote VARCHAR(100),
        data_validade DATE,
        quantidade_estoque INTEGER DEFAULT 0,
        unidade_medida VARCHAR(50),
        valor_unitario DECIMAL(10, 2),
        estoque_minimo INTEGER DEFAULT 0,
        controlado BOOLEAN DEFAULT FALSE,
        prescricao_obrigatoria BOOLEAN DEFAULT FALSE,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Agendamentos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pet_id UUID NOT NULL REFERENCES pets(id),
        tutor_id UUID NOT NULL REFERENCES tutores(id),
        veterinario_id UUID REFERENCES users(id),
        data_hora TIMESTAMP NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'AGENDADO',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de Configurações
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome_clinica VARCHAR(255) NOT NULL,
        logo_url TEXT,
        endereco TEXT,
        telefone VARCHAR(20),
        email VARCHAR(255),
        horario_atendimento TEXT,
        cnpj VARCHAR(18),
        site_url TEXT,
        whatsapp VARCHAR(20),
        facebook_url TEXT,
        instagram_url TEXT,
        notificacoes_email BOOLEAN DEFAULT TRUE,
        notificacoes_sms BOOLEAN DEFAULT FALSE,
        notificacoes_whatsapp BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar registro inicial de configurações
    await queryRunner.query(`
      INSERT INTO configuracoes (nome_clinica)
      VALUES ('Nova Clínica')
      ON CONFLICT DO NOTHING
    `);

    // Voltar ao schema public
    await queryRunner.query(`SET search_path TO public`);
  }

  /**
   * Cria roles padrão para o tenant
   */
  private async createDefaultRoles(queryRunner: any, tenantSlug: string): Promise<void> {
    this.logger.log(`Criando roles padrão para: ${tenantSlug}`);

    await queryRunner.query(`SET search_path TO "${tenantSlug}"`);

    const defaultRoles = [
      {
        nome: 'Administrador',
        descricao: 'Acesso total ao sistema',
      },
      {
        nome: 'Veterinário',
        descricao: 'Acesso a funcionalidades clínicas e de atendimento',
      },
      {
        nome: 'Recepcionista',
        descricao: 'Acesso a agendamentos, tutores e pets',
      },
      {
        nome: 'Gerente',
        descricao: 'Acesso a relatórios e gestão',
      },
    ];

    for (const role of defaultRoles) {
      await queryRunner.query(
        `INSERT INTO roles (nome, descricao, tenant_slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (nome) DO NOTHING`,
        [role.nome, role.descricao, tenantSlug],
      );
    }

    await queryRunner.query(`SET search_path TO public`);
  }

  /**
   * Cria o usuário administrador inicial
   */
  private async createAdminUser(
    queryRunner: any,
    tenantSlug: string,
    dto: ProvisionTenantDto,
  ): Promise<void> {
    this.logger.log(`Criando usuário admin para: ${tenantSlug}`);

    const bcrypt = require('bcrypt');
    const senhaHash = await bcrypt.hash(dto.adminPassword, 10);

    await queryRunner.query(`SET search_path TO "${tenantSlug}"`);

    // Criar usuário
    const [user] = await queryRunner.query(
      `INSERT INTO users (email, senha_hash, nome_completo, ativo)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id`,
      [dto.adminEmail, senhaHash, dto.adminNomeCompleto],
    );

    // Buscar role de Administrador
    const [adminRole] = await queryRunner.query(
      `SELECT id FROM roles WHERE nome = 'Administrador' LIMIT 1`,
    );

    // Associar usuário à role
    if (adminRole) {
      await queryRunner.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
        [user.id, adminRole.id],
      );
    }

    await queryRunner.query(`SET search_path TO public`);
  }

  /**
   * Verifica se um tenant já existe
   */
  async tenantExists(tenantSlug: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
      [tenantSlug],
    );
    return result.length > 0;
  }

  /**
   * Lista todos os schemas existentes no banco de dados
   */
  async listAllSchemas(): Promise<any> {
    // Listar todos os schemas (exceto os do sistema)
    const schemas = await this.dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public')
      AND schema_name NOT LIKE 'pg_%'
      ORDER BY schema_name
    `);

    // Tentar consultar a tabela public.tenants se existir
    let tenantsTable = null;
    try {
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'tenants'
        ) as exists
      `);

      if (tableExists[0]?.exists) {
        tenantsTable = await this.dataSource.query(`
          SELECT id, slug, schema_name, status
          FROM public.tenants
          ORDER BY created_at DESC
        `);
      }
    } catch (error) {
      this.logger.warn('Tabela public.tenants não existe ou não pôde ser consultada');
    }

    return {
      schemas: schemas.map(s => s.schema_name),
      tenantsTable,
      info: {
        totalSchemas: schemas.length,
        hasTenantTable: tenantsTable !== null,
      },
    };
  }
}
