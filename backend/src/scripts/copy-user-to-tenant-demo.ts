import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔄 Copiando usuário para tenant_demo...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 1. Verificar se usuário existe no tenant_demo
    const usersInDemo = await dataSource.query(`
      SELECT id, email, nome_completo
      FROM "tenant_demo".users
      WHERE email = 'admin@zoapets.com'
    `);

    if (usersInDemo.length > 0) {
      console.log('✅ Usuário admin@zoapets.com já existe no tenant_demo!');
      console.log(`   - Nome: ${usersInDemo[0].nome_completo}`);
      console.log('');
      console.log('🔑 Faça logout e login novamente para ver seus dados!');
      console.log('');
      await app.close();
      return;
    }

    console.log('⚠️  Usuário não existe no tenant_demo. Copiando...\n');

    // 2. Buscar usuário no tenant default
    const [userDefault] = await dataSource.query(`
      SELECT * FROM "default".users
      WHERE email = 'admin@zoapets.com'
    `);

    if (!userDefault) {
      console.log('❌ Usuário não encontrado no tenant default');
      await app.close();
      return;
    }

    // 3. Copiar usuário para tenant_demo
    await dataSource.query(`
      INSERT INTO "tenant_demo".users (
        id, email, nome_completo, senha_hash, cpf, crmv, telefone,
        avatar_url, ativo, refresh_token_hash, ultimo_acesso,
        tenant_slug, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'tenant_demo', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET tenant_slug = 'tenant_demo'
    `, [
      userDefault.id,
      userDefault.email,
      userDefault.nome_completo,
      userDefault.senha_hash,
      userDefault.cpf,
      userDefault.crmv,
      userDefault.telefone,
      userDefault.avatar_url,
      userDefault.ativo,
      userDefault.refresh_token_hash,
      userDefault.ultimo_acesso
    ]);

    console.log('✅ Usuário copiado!');

    // 4. Associar role Administrador
    const [adminRole] = await dataSource.query(`
      SELECT id FROM "tenant_demo".roles WHERE nome = 'Administrador' LIMIT 1
    `);

    if (adminRole) {
      await dataSource.query(`
        INSERT INTO "tenant_demo".user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [userDefault.id, adminRole.id]);
      console.log('✅ Role Administrador associada');
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PRONTO! SEUS DADOS FORAM RECUPERADOS!             ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║                                                        ║');
    console.log('║  Faça LOGOUT e faça LOGIN novamente com:              ║');
    console.log('║                                                        ║');
    console.log('║  Email: admin@zoapets.com                             ║');
    console.log('║  Senha: admin123                                      ║');
    console.log('║  Tenant: tenant_demo (automático)                     ║');
    console.log('║                                                        ║');
    console.log('║  Agora você verá seu pet Kira e tutor Vinicius! 🎉    ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
