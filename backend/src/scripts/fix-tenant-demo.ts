import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('🔧 Corrigindo tenant_demo...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('1️⃣ Verificando estrutura do tenant_demo...\n');

    // Verificar se users table existe
    const usersTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'tenant_demo'
        AND table_name = 'users'
      ) as exists
    `);

    if (!usersTableExists[0]?.exists) {
      console.log('⚠️  Tabela users não existe. Criando estrutura completa...\n');

      await dataSource.query(`SET search_path TO "tenant_demo", public`);

      // Criar tabela users
      await dataSource.query(`
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
      console.log('✅ Tabela users criada');

      // Criar tabelas de roles e permissions se não existirem
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome VARCHAR(255) NOT NULL UNIQUE,
          descricao TEXT,
          tenant_slug VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabela roles criada');

      await dataSource.query(`
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
      console.log('✅ Tabela permissions criada');

      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          PRIMARY KEY (role_id, permission_id)
        )
      `);
      console.log('✅ Tabela role_permissions criada');

      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, role_id)
        )
      `);
      console.log('✅ Tabela user_roles criada\n');
    } else {
      console.log('✅ Tabela users já existe\n');
    }

    // 2. Criar role Administrador
    console.log('2️⃣ Criando role Administrador...\n');
    const [existingRole] = await dataSource.query(`
      SELECT id FROM "tenant_demo".roles WHERE nome = 'Administrador'
    `);

    let adminRoleId;
    if (!existingRole) {
      const [role] = await dataSource.query(`
        INSERT INTO "tenant_demo".roles (nome, descricao, tenant_slug)
        VALUES ('Administrador', 'Acesso total ao sistema', 'tenant_demo')
        RETURNING id
      `);
      adminRoleId = role.id;
      console.log('✅ Role Administrador criada');
    } else {
      adminRoleId = existingRole.id;
      console.log('✅ Role Administrador já existe');
    }

    // 3. Criar usuário admin
    console.log('\n3️⃣ Criando usuário admin...\n');

    const senhaHash = await bcrypt.hash('admin123', 10);

    const [user] = await dataSource.query(`
      INSERT INTO "tenant_demo".users (
        email, senha_hash, nome_completo, ativo, tenant_slug
      )
      VALUES ($1, $2, $3, TRUE, 'tenant_demo')
      ON CONFLICT (email) DO UPDATE
      SET senha_hash = $2, tenant_slug = 'tenant_demo'
      RETURNING id, email
    `, ['admin@zoapets.com', senhaHash, 'Administrador']);

    console.log(`✅ Usuário criado/atualizado: ${user.email}`);

    // 4. Associar role
    await dataSource.query(`
      INSERT INTO "tenant_demo".user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [user.id, adminRoleId]);

    console.log('✅ Role associada ao usuário\n');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PRONTO! TENANT_DEMO CORRIGIDO!                     ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║                                                        ║');
    console.log('║  Faça LOGOUT e LOGIN novamente com:                   ║');
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
