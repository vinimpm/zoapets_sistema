import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔧 Adicionando coluna tenant_slug em todos os schemas...\\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 1. Listar todos os schemas (exceto system schemas)
    const schemas = await dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND schema_name NOT LIKE 'pg_%'
      ORDER BY schema_name
    `);

    console.log(`📂 Schemas encontrados: ${schemas.length}\\n`);

    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 Processando schema: "${schemaName}"`);

      // Verificar se tabela users existe
      const usersTableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = $1
          AND table_name = 'users'
        ) as exists
      `, [schemaName]);

      if (!usersTableExists[0]?.exists) {
        console.log(`  ⚠️  Tabela users não existe - pulando`);
        continue;
      }

      // Verificar se coluna tenant_slug já existe
      const columnExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = $1
          AND table_name = 'users'
          AND column_name = 'tenant_slug'
        ) as exists
      `, [schemaName]);

      if (columnExists[0]?.exists) {
        console.log(`  ✅ Coluna tenant_slug já existe - pulando`);
        continue;
      }

      // Adicionar coluna tenant_slug
      console.log(`  ➕ Adicionando coluna tenant_slug...`);
      await dataSource.query(`
        ALTER TABLE "${schemaName}".users
        ADD COLUMN tenant_slug VARCHAR(255)
      `);

      // Preencher com valor do schema para usuários existentes
      await dataSource.query(`
        UPDATE "${schemaName}".users
        SET tenant_slug = '${schemaName}'
        WHERE tenant_slug IS NULL
      `);

      // Tornar NOT NULL após popular
      await dataSource.query(`
        ALTER TABLE "${schemaName}".users
        ALTER COLUMN tenant_slug SET NOT NULL
      `);

      console.log(`  ✅ Coluna adicionada e populada com '${schemaName}'`);

      // Verificar quantos usuários foram atualizados
      const count = await dataSource.query(`
        SELECT COUNT(*) as total
        FROM "${schemaName}".users
        WHERE tenant_slug = '${schemaName}'
      `);

      console.log(`  📊 ${count[0].total} usuário(s) atualizado(s)`);
    }

    console.log('\\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ MIGRATION CONCLUÍDA COM SUCESSO!                  ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║                                                        ║');
    console.log('║  Todos os schemas agora têm:                          ║');
    console.log('║  - Coluna tenant_slug na tabela users                 ║');
    console.log('║  - Usuários existentes vinculados ao seu tenant       ║');
    console.log('║                                                        ║');
    console.log('║  ⚠️  IMPORTANTE:                                       ║');
    console.log('║  Faça logout e login novamente para gerar novo JWT!  ║');
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
