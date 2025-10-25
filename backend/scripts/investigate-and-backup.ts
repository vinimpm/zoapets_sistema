import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'zoapets_dev',
});

async function investigateAndBackup() {
  await dataSource.initialize();
  console.log('📦 Conectado ao banco de dados\n');

  const backupData: any = {
    timestamp: new Date().toISOString(),
    investigation: {},
    data: {},
  };

  try {
    // 1. Listar schemas existentes
    console.log('🔍 === SCHEMAS EXISTENTES ===');
    const schemas = await dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    console.log('Schemas encontrados:', schemas.map((s: any) => s.schema_name).join(', '));
    backupData.investigation.schemas = schemas;
    console.log('');

    // 2. Listar tabelas no schema public
    console.log('📋 === TABELAS NO SCHEMA PUBLIC ===');
    const tables = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tableNames = tables.map((t: any) => t.table_name);
    console.log(`Total de tabelas: ${tableNames.length}`);
    console.log('Tabelas:', tableNames.join(', '));
    backupData.investigation.publicTables = tableNames;
    console.log('');

    // 3. Verificar se existem schemas para tenants
    console.log('🏢 === SCHEMAS DE TENANTS ===');
    const tenantSchemas = schemas.filter((s: any) =>
      !['public', 'pg_toast', 'pg_catalog', 'information_schema'].includes(s.schema_name)
    );
    if (tenantSchemas.length > 0) {
      console.log(`Encontrados ${tenantSchemas.length} schemas de tenants:`, tenantSchemas.map((s: any) => s.schema_name).join(', '));

      for (const schema of tenantSchemas) {
        const schemaName = schema.schema_name;
        const schemaTables = await dataSource.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = $1 AND table_type = 'BASE TABLE'
        `, [schemaName]);
        console.log(`  Schema "${schemaName}": ${schemaTables.length} tabelas`);
      }
    } else {
      console.log('❌ Nenhum schema de tenant encontrado (confirmando que os dados estão em public com tenant_slug)');
    }
    console.log('');

    // 4. Contar dados por tenant no schema public
    console.log('📊 === CONTAGEM DE DADOS POR TENANT ===');

    // Verificar se as tabelas têm coluna tenant_slug
    const tablesWithTenant = [];
    for (const tableName of tableNames) {
      const columns = await dataSource.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenant_slug'
      `, [tableName]);

      if (columns.length > 0) {
        tablesWithTenant.push(tableName);
        const counts = await dataSource.query(`
          SELECT tenant_slug, COUNT(*) as count
          FROM "${tableName}"
          GROUP BY tenant_slug
        `);

        if (counts.length > 0) {
          console.log(`${tableName}:`);
          counts.forEach((c: any) => {
            console.log(`  - ${c.tenant_slug}: ${c.count} registros`);
          });
        }
      }
    }
    console.log('');

    // 5. Fazer backup de TODOS os dados do tenant 'demo'
    console.log('💾 === CRIANDO BACKUP DO TENANT DEMO ===');

    for (const tableName of tablesWithTenant) {
      try {
        const data = await dataSource.query(`SELECT * FROM "${tableName}" WHERE tenant_slug = $1`, ['demo']);
        if (data.length > 0) {
          backupData.data[tableName] = data;
          console.log(`✅ ${tableName}: ${data.length} registros`);
        }
      } catch (error: any) {
        console.log(`⚠️  ${tableName}: Erro ao fazer backup - ${error.message}`);
      }
    }
    console.log('');

    // 6. Backup de tabelas globais (sem tenant_slug)
    console.log('🌍 === BACKUP DE TABELAS GLOBAIS ===');
    const globalTables = ['plans', 'subscriptions', 'usage_tracking'];

    for (const tableName of globalTables) {
      if (tableNames.includes(tableName)) {
        try {
          const data = await dataSource.query(`SELECT * FROM "${tableName}"`);
          if (data.length > 0) {
            backupData.data[tableName] = data;
            console.log(`✅ ${tableName}: ${data.length} registros`);
          }
        } catch (error: any) {
          console.log(`⚠️  ${tableName}: Erro ao fazer backup - ${error.message}`);
        }
      }
    }
    console.log('');

    // 7. Salvar backup em arquivo JSON
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_demo_${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup salvo em: ${backupPath}`);
    console.log(`📦 Tamanho do backup: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
    console.log('');

    // 8. Resumo final
    console.log('📈 === RESUMO ===');
    console.log(`Total de schemas: ${schemas.length}`);
    console.log(`Total de tabelas em public: ${tableNames.length}`);
    console.log(`Tabelas com tenant_slug: ${tablesWithTenant.length}`);
    console.log(`Tabelas com dados do tenant 'demo': ${Object.keys(backupData.data).length}`);

    let totalRecords = 0;
    Object.keys(backupData.data).forEach(table => {
      totalRecords += backupData.data[table].length;
    });
    console.log(`Total de registros no backup: ${totalRecords}`);

  } catch (error) {
    console.error('❌ Erro durante investigação:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

investigateAndBackup()
  .then(() => {
    console.log('\n✅ Investigação e backup concluídos com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });
