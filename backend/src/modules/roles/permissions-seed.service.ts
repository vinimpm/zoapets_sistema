import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../common/entities/permission.entity';

@Injectable()
export class PermissionsSeedService {
  private readonly logger = new Logger(PermissionsSeedService.name);

  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  /**
   * Define todas as permissões do sistema organizadas por recurso
   */
  private readonly systemPermissions = [
    // Clínico
    {
      recurso: 'consultas',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'cancelar'],
      descricoes: {
        criar: 'Criar novas consultas',
        ler: 'Visualizar consultas',
        atualizar: 'Editar consultas existentes',
        deletar: 'Deletar consultas',
        cancelar: 'Cancelar consultas agendadas',
      },
    },
    {
      recurso: 'internacoes',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'alta', 'transferir'],
      descricoes: {
        criar: 'Criar novas internações',
        ler: 'Visualizar internações',
        atualizar: 'Editar internações existentes',
        deletar: 'Deletar internações',
        alta: 'Dar alta em internações',
        transferir: 'Transferir pacientes internados',
      },
    },
    {
      recurso: 'ram',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'aplicar'],
      descricoes: {
        criar: 'Criar registros de RAM',
        ler: 'Visualizar registros de RAM',
        atualizar: 'Editar registros de RAM',
        deletar: 'Deletar registros de RAM',
        aplicar: 'Aplicar medicamentos no RAM',
      },
    },
    {
      recurso: 'exames',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'solicitar', 'laudar'],
      descricoes: {
        criar: 'Criar novos exames',
        ler: 'Visualizar exames',
        atualizar: 'Editar exames existentes',
        deletar: 'Deletar exames',
        solicitar: 'Solicitar novos exames',
        laudar: 'Adicionar laudos aos exames',
      },
    },
    {
      recurso: 'checklists',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'preencher'],
      descricoes: {
        criar: 'Criar novos checklists',
        ler: 'Visualizar checklists',
        atualizar: 'Editar checklists',
        deletar: 'Deletar checklists',
        preencher: 'Preencher checklists',
      },
    },

    // Pacientes
    {
      recurso: 'pets',
      acoes: ['criar', 'ler', 'atualizar', 'deletar'],
      descricoes: {
        criar: 'Cadastrar novos pets',
        ler: 'Visualizar pets',
        atualizar: 'Editar dados dos pets',
        deletar: 'Deletar pets',
      },
    },
    {
      recurso: 'tutores',
      acoes: ['criar', 'ler', 'atualizar', 'deletar'],
      descricoes: {
        criar: 'Cadastrar novos tutores',
        ler: 'Visualizar tutores',
        atualizar: 'Editar dados dos tutores',
        deletar: 'Deletar tutores',
      },
    },

    // Agendamentos
    {
      recurso: 'agendamentos',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'confirmar', 'cancelar'],
      descricoes: {
        criar: 'Criar novos agendamentos',
        ler: 'Visualizar agendamentos',
        atualizar: 'Editar agendamentos',
        deletar: 'Deletar agendamentos',
        confirmar: 'Confirmar agendamentos',
        cancelar: 'Cancelar agendamentos',
      },
    },

    // Mensagens
    {
      recurso: 'mensagens',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'enviar'],
      descricoes: {
        criar: 'Criar mensagens',
        ler: 'Visualizar mensagens',
        atualizar: 'Editar mensagens',
        deletar: 'Deletar mensagens',
        enviar: 'Enviar mensagens aos clientes',
      },
    },

    // Financeiro
    {
      recurso: 'financeiro',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'aprovar', 'estornar'],
      descricoes: {
        criar: 'Criar lançamentos financeiros',
        ler: 'Visualizar dados financeiros',
        atualizar: 'Editar lançamentos',
        deletar: 'Deletar lançamentos',
        aprovar: 'Aprovar pagamentos',
        estornar: 'Estornar transações',
      },
    },
    {
      recurso: 'pagamentos',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'processar'],
      descricoes: {
        criar: 'Registrar novos pagamentos',
        ler: 'Visualizar pagamentos',
        atualizar: 'Editar pagamentos',
        deletar: 'Deletar pagamentos',
        processar: 'Processar pagamentos',
      },
    },

    // Estoque
    {
      recurso: 'produtos',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ajustar_estoque'],
      descricoes: {
        criar: 'Cadastrar novos produtos e serviços',
        ler: 'Visualizar produtos e serviços',
        atualizar: 'Editar produtos e serviços',
        deletar: 'Deletar produtos e serviços',
        ajustar_estoque: 'Ajustar quantidade em estoque',
      },
    },
    {
      recurso: 'medicamentos',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ajustar_estoque'],
      descricoes: {
        criar: 'Cadastrar novos medicamentos',
        ler: 'Visualizar medicamentos',
        atualizar: 'Editar medicamentos',
        deletar: 'Deletar medicamentos',
        ajustar_estoque: 'Ajustar estoque de medicamentos',
      },
    },

    // Gestão
    {
      recurso: 'sops',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'publicar'],
      descricoes: {
        criar: 'Criar novos SOPs',
        ler: 'Visualizar SOPs',
        atualizar: 'Editar SOPs',
        deletar: 'Deletar SOPs',
        publicar: 'Publicar SOPs',
      },
    },
    {
      recurso: 'equipamentos',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'manutencao'],
      descricoes: {
        criar: 'Cadastrar novos equipamentos',
        ler: 'Visualizar equipamentos',
        atualizar: 'Editar equipamentos',
        deletar: 'Deletar equipamentos',
        manutencao: 'Registrar manutenções',
      },
    },
    {
      recurso: 'convenios',
      acoes: ['criar', 'ler', 'atualizar', 'deletar'],
      descricoes: {
        criar: 'Cadastrar novos convênios',
        ler: 'Visualizar convênios',
        atualizar: 'Editar convênios',
        deletar: 'Deletar convênios',
      },
    },
    {
      recurso: 'campanhas',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'publicar'],
      descricoes: {
        criar: 'Criar novas campanhas',
        ler: 'Visualizar campanhas',
        atualizar: 'Editar campanhas',
        deletar: 'Deletar campanhas',
        publicar: 'Publicar campanhas',
      },
    },

    // Escalas
    {
      recurso: 'escalas',
      acoes: ['criar', 'ler', 'atualizar', 'deletar'],
      descricoes: {
        criar: 'Criar escalas de trabalho',
        ler: 'Visualizar escalas',
        atualizar: 'Editar escalas',
        deletar: 'Deletar escalas',
      },
    },

    // Configurações
    {
      recurso: 'usuarios',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ativar', 'desativar'],
      descricoes: {
        criar: 'Cadastrar novos usuários',
        ler: 'Visualizar usuários',
        atualizar: 'Editar usuários',
        deletar: 'Deletar usuários',
        ativar: 'Ativar usuários',
        desativar: 'Desativar usuários',
      },
    },
    {
      recurso: 'roles',
      acoes: ['criar', 'ler', 'atualizar', 'deletar', 'atribuir_permissoes'],
      descricoes: {
        criar: 'Criar novas roles',
        ler: 'Visualizar roles',
        atualizar: 'Editar roles',
        deletar: 'Deletar roles',
        atribuir_permissoes: 'Atribuir permissões às roles',
      },
    },
    {
      recurso: 'configuracoes',
      acoes: ['ler', 'atualizar'],
      descricoes: {
        ler: 'Visualizar configurações do sistema',
        atualizar: 'Alterar configurações do sistema',
      },
    },

    // Relatórios
    {
      recurso: 'relatorios',
      acoes: ['ler', 'exportar'],
      descricoes: {
        ler: 'Visualizar relatórios',
        exportar: 'Exportar relatórios',
      },
    },

    // Dashboard
    {
      recurso: 'dashboard',
      acoes: ['ler'],
      descricoes: {
        ler: 'Visualizar dashboard',
      },
    },
  ];

  /**
   * Seed das permissões para um tenant específico usando queryRunner
   * Este método é idempotente - pode ser executado múltiplas vezes sem duplicar
   */
  async seedPermissionsForTenantWithQueryRunner(
    queryRunner: any,
    tenantSlug: string,
  ): Promise<void> {
    this.logger.log(`Iniciando seed de permissões para tenant: ${tenantSlug}`);

    // Garantir que estamos no schema correto
    await queryRunner.query(`SET search_path TO "${tenantSlug}", public`);

    let createdCount = 0;
    let existingCount = 0;

    for (const resourcePermissions of this.systemPermissions) {
      for (const acao of resourcePermissions.acoes) {
        const nome = `${resourcePermissions.recurso}:${acao}`;
        const descricao =
          resourcePermissions.descricoes[acao] || `${acao} ${resourcePermissions.recurso}`;

        // Verificar se a permissão já existe
        const existing = await queryRunner.query(
          `SELECT id FROM permissions WHERE nome = $1 AND tenant_slug = $2 LIMIT 1`,
          [nome, tenantSlug],
        );

        if (!existing || existing.length === 0) {
          // Criar nova permissão
          await queryRunner.query(
            `INSERT INTO permissions (nome, recurso, acao, descricao, tenant_slug)
             VALUES ($1, $2, $3, $4, $5)`,
            [nome, resourcePermissions.recurso, acao, descricao, tenantSlug],
          );
          createdCount++;
        } else {
          existingCount++;
        }
      }
    }

    this.logger.log(
      `Seed de permissões concluído para ${tenantSlug}: ${createdCount} criadas, ${existingCount} já existiam`,
    );
  }

  /**
   * Seed das permissões para um tenant específico (versão com repository)
   * Este método é idempotente - pode ser executado múltiplas vezes sem duplicar
   */
  async seedPermissionsForTenant(tenantSlug: string): Promise<void> {
    this.logger.log(`Iniciando seed de permissões para tenant: ${tenantSlug}`);

    let createdCount = 0;
    let existingCount = 0;

    for (const resourcePermissions of this.systemPermissions) {
      for (const acao of resourcePermissions.acoes) {
        const nome = `${resourcePermissions.recurso}:${acao}`;
        const descricao =
          resourcePermissions.descricoes[acao] || `${acao} ${resourcePermissions.recurso}`;

        // Verificar se a permissão já existe
        const existing = await this.permissionsRepository.findOne({
          where: { nome, tenantSlug } as any,
        });

        if (!existing) {
          // Criar nova permissão
          const permission = this.permissionsRepository.create({
            nome,
            recurso: resourcePermissions.recurso,
            acao,
            descricao,
            tenantSlug,
          } as any);

          await this.permissionsRepository.save(permission);
          createdCount++;
        } else {
          existingCount++;
        }
      }
    }

    this.logger.log(
      `Seed de permissões concluído para ${tenantSlug}: ${createdCount} criadas, ${existingCount} já existiam`,
    );
  }

  /**
   * Verifica e cria permissões faltantes para todos os tenants
   * Útil quando adicionamos novos recursos/ações ao sistema
   */
  async syncPermissionsForAllTenants(): Promise<void> {
    this.logger.log('Iniciando sincronização de permissões para todos os tenants');

    // Buscar todos os tenants únicos da tabela de permissões
    const result = await this.permissionsRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.tenantSlug', 'tenantSlug')
      .getRawMany();

    const tenants = result.map((r) => r.tenantSlug);

    if (tenants.length === 0) {
      this.logger.warn('Nenhum tenant encontrado. Aguardando primeiro tenant ser criado.');
      return;
    }

    for (const tenantSlug of tenants) {
      await this.seedPermissionsForTenant(tenantSlug);
    }

    this.logger.log('Sincronização de permissões concluída para todos os tenants');
  }

  /**
   * Lista todas as permissões disponíveis no sistema
   */
  getAvailablePermissions(): { recurso: string; acoes: string[]; total: number }[] {
    return this.systemPermissions.map((perm) => ({
      recurso: perm.recurso,
      acoes: perm.acoes,
      total: perm.acoes.length,
    }));
  }

  /**
   * Retorna o total de permissões que devem existir no sistema
   */
  getTotalPermissionsCount(): number {
    return this.systemPermissions.reduce((total, perm) => total + perm.acoes.length, 0);
  }
}
