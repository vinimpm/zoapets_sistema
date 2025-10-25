import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'zoapets_dev',
});

async function seedDemoData() {
  await dataSource.initialize();
  console.log('📦 Conectado ao banco de dados');

  try {
    // 1. Criar planos se não existirem
    console.log('🎯 Criando planos...');

    const planExists = await dataSource.query('SELECT id FROM plans WHERE slug = $1', ['gratuito']);

    if (planExists.length === 0) {
      await dataSource.query(`
        INSERT INTO plans (slug, nome, descricao, preco_mensal, preco_anual, max_users, max_pets, max_consultas_mes, max_unidades, tem_internacoes, tem_ram, tem_exames, tem_estoque, tem_relatorios_avancados, tem_whatsapp, tem_api, tem_personalizacoes, nivel_suporte, tempo_resposta_suporte, ativo, popular, trial_days, ordem_exibicao)
        VALUES
        ('gratuito', 'Gratuito', 'Ideal para começar e testar o sistema', 0, 0, 2, 50, 30, 1, false, false, false, false, false, false, false, false, 'email', '72h úteis', true, false, 14, 1),
        ('basico', 'Básico', 'Para clínicas pequenas com atendimento básico', 49.90, 539.00, 5, 200, 100, 1, true, false, true, true, false, false, false, false, 'email', '48h úteis', true, false, 14, 2),
        ('profissional', 'Profissional', 'Para clínicas médias com necessidades avançadas', 99.90, 1079.00, 15, 500, 300, 3, true, true, true, true, true, true, false, true, 'chat', '24h úteis', true, true, 14, 3),
        ('empresarial', 'Empresarial', 'Para redes de clínicas e hospitais veterinários', 249.90, 2699.00, -1, -1, -1, -1, true, true, true, true, true, true, true, true, 'telefone', '4h úteis', true, false, 14, 4)
      `);
      console.log('✅ Planos criados');
    } else {
      console.log('✅ Planos já existem');
    }

    // 2. Garantir que existe role Administrador
    console.log('👤 Configurando role Administrador...');

    // Primeiro verificar se já existe
    let checkRole = await dataSource.query(`
      SELECT id FROM roles WHERE tenant_slug = 'demo' AND nome = 'Administrador'
    `);

    let roleId;
    if (checkRole.length > 0) {
      roleId = checkRole[0].id;
      console.log('✅ Role Administrador já existe:', roleId);
    } else {
      // Tentar atualizar role 'Admin' existente para 'Administrador'
      const updateResult = await dataSource.query(`
        UPDATE roles
        SET nome = 'Administrador', descricao = 'Administrador do sistema'
        WHERE tenant_slug = 'demo' AND nome = 'Admin'
        RETURNING id
      `);

      if (updateResult.length > 0) {
        roleId = updateResult[0].id;
        console.log('✅ Role atualizada de Admin para Administrador:', roleId);
      } else {
        // Se não existe nenhuma, criar nova
        const insertResult = await dataSource.query(`
          INSERT INTO roles (nome, descricao, tenant_slug)
          VALUES ('Administrador', 'Administrador do sistema', 'demo')
          RETURNING id
        `);
        roleId = insertResult[0].id;
        console.log('✅ Role Administrador criada:', roleId);
      }
    }

    // 3. Criar usuário admin
    console.log('🔐 Criando usuário admin...');
    const senhaHash = await bcrypt.hash('admin123', 10);

    const userResult = await dataSource.query(`
      INSERT INTO users (nome_completo, email, senha_hash, cpf, ativo, tenant_slug)
      VALUES ('Administrador', 'admin@demo.com', $1, '000.000.000-00', true, 'demo')
      ON CONFLICT (email) DO UPDATE SET senha_hash = $1
      RETURNING id
    `, [senhaHash]);
    const userId = userResult[0].id;
    console.log('✅ Usuário admin criado:', userId);

    // 4. Associar role ao usuário
    console.log('🔗 Associando role ao usuário...');
    await dataSource.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [userId, roleId]);
    console.log('✅ Role associada ao usuário');

    // 5. Criar subscription para o tenant demo
    console.log('📋 Criando subscription...');
    const planGratuito = await dataSource.query('SELECT id FROM plans WHERE slug = $1', ['gratuito']);
    const planId = planGratuito[0].id;

    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 dias de trial

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 mês

    await dataSource.query(`
      INSERT INTO subscriptions (tenant_slug, plan_id, status, billing_interval, trial_ends_at, current_period_start, current_period_end, cancel_at_period_end)
      VALUES ('demo', $1, 'trialing', 'monthly', $2, $3, $4, false)
      ON CONFLICT DO NOTHING
    `, [planId, trialEnd, now, periodEnd]);
    console.log('✅ Subscription criada');

    // 6. Criar usage tracking
    console.log('📊 Criando usage tracking...');
    const periodStart = new Date();
    periodStart.setDate(1); // Primeiro dia do mês

    const periodEndUsage = new Date();
    periodEndUsage.setMonth(periodEndUsage.getMonth() + 1);
    periodEndUsage.setDate(0); // Último dia do mês

    await dataSource.query(`
      INSERT INTO usage_tracking (tenant_slug, period_start, period_end, current_users, current_pets, current_consultas, current_internacoes, current_exames, current_unidades, peak_users, peak_pets)
      VALUES ('demo', $1, $2, 1, 0, 0, 0, 0, 1, 1, 0)
      ON CONFLICT (tenant_slug, period_start) DO NOTHING
    `, [periodStart, periodEndUsage]);
    console.log('✅ Usage tracking criado');

    // 7. Criar todas as permissões do sistema
    console.log('🔑 Criando permissões do sistema...');

    const systemPermissions = [
      // Clínico
      { recurso: 'consultas', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'cancelar'], descricoes: { criar: 'Criar novas consultas', ler: 'Visualizar consultas', atualizar: 'Editar consultas existentes', deletar: 'Deletar consultas', cancelar: 'Cancelar consultas agendadas' } },
      { recurso: 'internacoes', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'alta', 'transferir'], descricoes: { criar: 'Criar novas internações', ler: 'Visualizar internações', atualizar: 'Editar internações existentes', deletar: 'Deletar internações', alta: 'Dar alta em internações', transferir: 'Transferir pacientes internados' } },
      { recurso: 'ram', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'aplicar'], descricoes: { criar: 'Criar registros de RAM', ler: 'Visualizar registros de RAM', atualizar: 'Editar registros de RAM', deletar: 'Deletar registros de RAM', aplicar: 'Aplicar medicamentos no RAM' } },
      { recurso: 'exames', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'solicitar', 'laudar'], descricoes: { criar: 'Criar novos exames', ler: 'Visualizar exames', atualizar: 'Editar exames existentes', deletar: 'Deletar exames', solicitar: 'Solicitar novos exames', laudar: 'Adicionar laudos aos exames' } },
      { recurso: 'checklists', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'preencher'], descricoes: { criar: 'Criar novos checklists', ler: 'Visualizar checklists', atualizar: 'Editar checklists', deletar: 'Deletar checklists', preencher: 'Preencher checklists' } },
      // Pacientes
      { recurso: 'pets', acoes: ['criar', 'ler', 'atualizar', 'deletar'], descricoes: { criar: 'Cadastrar novos pets', ler: 'Visualizar pets', atualizar: 'Editar dados dos pets', deletar: 'Deletar pets' } },
      { recurso: 'tutores', acoes: ['criar', 'ler', 'atualizar', 'deletar'], descricoes: { criar: 'Cadastrar novos tutores', ler: 'Visualizar tutores', atualizar: 'Editar dados dos tutores', deletar: 'Deletar tutores' } },
      // Agendamentos
      { recurso: 'agendamentos', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'confirmar', 'cancelar'], descricoes: { criar: 'Criar novos agendamentos', ler: 'Visualizar agendamentos', atualizar: 'Editar agendamentos', deletar: 'Deletar agendamentos', confirmar: 'Confirmar agendamentos', cancelar: 'Cancelar agendamentos' } },
      // Mensagens
      { recurso: 'mensagens', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'enviar'], descricoes: { criar: 'Criar mensagens', ler: 'Visualizar mensagens', atualizar: 'Editar mensagens', deletar: 'Deletar mensagens', enviar: 'Enviar mensagens aos clientes' } },
      // Financeiro
      { recurso: 'financeiro', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'aprovar', 'estornar'], descricoes: { criar: 'Criar lançamentos financeiros', ler: 'Visualizar dados financeiros', atualizar: 'Editar lançamentos', deletar: 'Deletar lançamentos', aprovar: 'Aprovar pagamentos', estornar: 'Estornar transações' } },
      { recurso: 'pagamentos', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'processar'], descricoes: { criar: 'Registrar novos pagamentos', ler: 'Visualizar pagamentos', atualizar: 'Editar pagamentos', deletar: 'Deletar pagamentos', processar: 'Processar pagamentos' } },
      // Estoque
      { recurso: 'produtos', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ajustar_estoque'], descricoes: { criar: 'Cadastrar novos produtos e serviços', ler: 'Visualizar produtos e serviços', atualizar: 'Editar produtos e serviços', deletar: 'Deletar produtos e serviços', ajustar_estoque: 'Ajustar quantidade em estoque' } },
      { recurso: 'medicamentos', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ajustar_estoque'], descricoes: { criar: 'Cadastrar novos medicamentos', ler: 'Visualizar medicamentos', atualizar: 'Editar medicamentos', deletar: 'Deletar medicamentos', ajustar_estoque: 'Ajustar estoque de medicamentos' } },
      // Gestão
      { recurso: 'sops', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'publicar'], descricoes: { criar: 'Criar novos SOPs', ler: 'Visualizar SOPs', atualizar: 'Editar SOPs', deletar: 'Deletar SOPs', publicar: 'Publicar SOPs' } },
      { recurso: 'equipamentos', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'manutencao'], descricoes: { criar: 'Cadastrar novos equipamentos', ler: 'Visualizar equipamentos', atualizar: 'Editar equipamentos', deletar: 'Deletar equipamentos', manutencao: 'Registrar manutenções' } },
      { recurso: 'convenios', acoes: ['criar', 'ler', 'atualizar', 'deletar'], descricoes: { criar: 'Cadastrar novos convênios', ler: 'Visualizar convênios', atualizar: 'Editar convênios', deletar: 'Deletar convênios' } },
      { recurso: 'campanhas', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'publicar'], descricoes: { criar: 'Criar novas campanhas', ler: 'Visualizar campanhas', atualizar: 'Editar campanhas', deletar: 'Deletar campanhas', publicar: 'Publicar campanhas' } },
      // Escalas
      { recurso: 'escalas', acoes: ['criar', 'ler', 'atualizar', 'deletar'], descricoes: { criar: 'Criar escalas de trabalho', ler: 'Visualizar escalas', atualizar: 'Editar escalas', deletar: 'Deletar escalas' } },
      // Configurações
      { recurso: 'usuarios', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'ativar', 'desativar'], descricoes: { criar: 'Cadastrar novos usuários', ler: 'Visualizar usuários', atualizar: 'Editar usuários', deletar: 'Deletar usuários', ativar: 'Ativar usuários', desativar: 'Desativar usuários' } },
      { recurso: 'roles', acoes: ['criar', 'ler', 'atualizar', 'deletar', 'atribuir_permissoes'], descricoes: { criar: 'Criar novas roles', ler: 'Visualizar roles', atualizar: 'Editar roles', deletar: 'Deletar roles', atribuir_permissoes: 'Atribuir permissões às roles' } },
      { recurso: 'configuracoes', acoes: ['ler', 'atualizar'], descricoes: { ler: 'Visualizar configurações do sistema', atualizar: 'Alterar configurações do sistema' } },
      // Relatórios
      { recurso: 'relatorios', acoes: ['ler', 'exportar'], descricoes: { ler: 'Visualizar relatórios', exportar: 'Exportar relatórios' } },
      // Dashboard
      { recurso: 'dashboard', acoes: ['ler'], descricoes: { ler: 'Visualizar dashboard' } },
    ];

    let permissionsCreated = 0;
    let permissionsExisting = 0;

    for (const resourcePermissions of systemPermissions) {
      for (const acao of resourcePermissions.acoes) {
        const nome = `${resourcePermissions.recurso}:${acao}`;
        const descricao = resourcePermissions.descricoes[acao] || `${acao} ${resourcePermissions.recurso}`;

        const checkPerm = await dataSource.query(
          'SELECT id FROM permissions WHERE nome = $1 AND tenant_slug = $2',
          [nome, 'demo']
        );

        if (checkPerm.length === 0) {
          await dataSource.query(
            `INSERT INTO permissions (nome, recurso, acao, descricao, tenant_slug)
             VALUES ($1, $2, $3, $4, $5)`,
            [nome, resourcePermissions.recurso, acao, descricao, 'demo']
          );
          permissionsCreated++;
        } else {
          permissionsExisting++;
        }
      }
    }

    console.log(`✅ Permissões criadas: ${permissionsCreated} novas, ${permissionsExisting} já existiam`);

    console.log('\n✨ Dados de demo criados com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('   Email: admin@demo.com');
    console.log('   Senha: admin123');
    console.log('   Tenant: demo');

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seedDemoData()
  .then(() => {
    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no seed:', error);
    process.exit(1);
  });
