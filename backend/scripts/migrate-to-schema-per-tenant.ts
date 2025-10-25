import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'zoapets_dev',
});

async function migrateToSchemaPerTenant() {
  await dataSource.initialize();
  console.log('📦 Conectado ao banco de dados\n');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('🔧 === CRIANDO SCHEMA DEMO ===');
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "demo"`);
    console.log('✅ Schema "demo" criado\n');

    console.log('📋 === CRIANDO TABELAS NO SCHEMA DEMO ===');

    // Definir todas as tabelas que devem ser tenant-specific (vão para o schema do tenant)
    const tenantTables = [
      'users',
      'roles',
      'permissions',
      'role_permissions',
      'user_roles',
      'pets',
      'tutores',
      'agendamentos',
      'evolucoes',
      'exames',
      'internacoes',
      'medicamentos',
      'prescricoes',
      'prescricao_itens',
      'sinais_vitais',
      'procedimentos',
      'resultados_exames',
      'conta_itens',
      'contas',
      'pagamentos',
      'administracoes',
    ];

    // Para cada tabela, obter a estrutura da tabela em public e recriar no schema demo
    for (const tableName of tenantTables) {
      try {
        console.log(`\n📌 Processando tabela: ${tableName}`);

        // Verificar se a tabela existe em public
        const tableExists = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tableName]);

        if (!tableExists[0].exists) {
          console.log(`⚠️  Tabela "${tableName}" não existe em public, pulando...`);
          continue;
        }

        // Obter o DDL da tabela (colunas, tipos, constraints)
        const columns = await queryRunner.query(`
          SELECT
            column_name,
            data_type,
            character_maximum_length,
            column_default,
            is_nullable,
            udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        if (columns.length === 0) {
          console.log(`⚠️  Nenhuma coluna encontrada para "${tableName}", pulando...`);
          continue;
        }

        // Construir o CREATE TABLE
        let createTableSQL = `CREATE TABLE IF NOT EXISTS demo."${tableName}" (\n`;

        const columnDefinitions = columns
          .filter((col: any) => col.column_name !== 'tenant_slug') // Remove tenant_slug
          .map((col: any) => {
            let def = `  "${col.column_name}" `;

            // Tipo de dado
            if (col.data_type === 'character varying') {
              def += `VARCHAR${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`;
            } else if (col.data_type === 'USER-DEFINED') {
              def += col.udt_name;
            } else {
              def += col.data_type.toUpperCase();
            }

            // Default
            if (col.column_default) {
              def += ` DEFAULT ${col.column_default}`;
            }

            // Nullable
            if (col.is_nullable === 'NO') {
              def += ' NOT NULL';
            }

            return def;
          });

        createTableSQL += columnDefinitions.join(',\n');
        createTableSQL += '\n)';

        // Criar tabela
        await queryRunner.query(createTableSQL);
        console.log(`✅ Estrutura da tabela "${tableName}" criada no schema demo`);

        // Obter constraints (PK, FK, UNIQUE) e recriar
        const constraints = await queryRunner.query(`
          SELECT
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          LEFT JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = $1
            AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
        `, [tableName]);

        for (const constraint of constraints) {
          try {
            if (constraint.constraint_type === 'PRIMARY KEY') {
              await queryRunner.query(`
                ALTER TABLE demo."${tableName}"
                ADD PRIMARY KEY ("${constraint.column_name}")
              `);
              console.log(`  ✅ Primary key adicionada: ${constraint.column_name}`);
            } else if (constraint.constraint_type === 'UNIQUE') {
              await queryRunner.query(`
                ALTER TABLE demo."${tableName}"
                ADD UNIQUE ("${constraint.column_name}")
              `);
              console.log(`  ✅ Constraint UNIQUE adicionada: ${constraint.column_name}`);
            }
          } catch (error: any) {
            // Ignorar erros de constraint já existente
            if (!error.message.includes('already exists')) {
              console.log(`  ⚠️  Erro ao adicionar constraint: ${error.message}`);
            }
          }
        }

        // Obter índices
        const indexes = await queryRunner.query(`
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE schemaname = 'public' AND tablename = $1
        `, [tableName]);

        for (const index of indexes) {
          try {
            // Substituir "public" por "demo" no indexdef
            const demoIndexDef = index.indexdef
              .replace(/public\./g, 'demo.')
              .replace(/ON public\./g, 'ON demo.')
              .replace(new RegExp(`${index.indexname}`, 'g'), `demo_${index.indexname}`);

            await queryRunner.query(demoIndexDef);
            console.log(`  ✅ Índice criado: demo_${index.indexname}`);
          } catch (error: any) {
            // Ignorar erros de índice já existente
            if (!error.message.includes('already exists')) {
              console.log(`  ⚠️  Erro ao criar índice: ${error.message}`);
            }
          }
        }

      } catch (error: any) {
        console.error(`❌ Erro ao processar tabela "${tableName}":`, error.message);
      }
    }

    console.log('\n\n💾 === MIGRANDO DADOS DO TENANT DEMO ===');

    for (const tableName of tenantTables) {
      try {
        // Verificar se a tabela existe em public
        const tableExists = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tableName]);

        if (!tableExists[0].exists) {
          continue;
        }

        // Verificar se a tabela tem coluna tenant_slug
        const hasTenantSlug = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = $1
            AND column_name = 'tenant_slug'
          )
        `, [tableName]);

        if (!hasTenantSlug[0].exists) {
          console.log(`⚠️  Tabela "${tableName}" não tem tenant_slug, pulando migração...`);
          continue;
        }

        // Contar registros em public
        const countPublic = await queryRunner.query(`
          SELECT COUNT(*) as count FROM public."${tableName}" WHERE tenant_slug = 'demo'
        `);

        if (countPublic[0].count === 0) {
          console.log(`⚠️  Nenhum registro para migrar em "${tableName}"`);
          continue;
        }

        // Obter nomes de colunas (exceto tenant_slug)
        const columns = await queryRunner.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = $1
            AND column_name != 'tenant_slug'
          ORDER BY ordinal_position
        `, [tableName]);

        const columnNames = columns.map((c: any) => `"${c.column_name}"`).join(', ');

        // Migrar dados
        await queryRunner.query(`
          INSERT INTO demo."${tableName}" (${columnNames})
          SELECT ${columnNames}
          FROM public."${tableName}"
          WHERE tenant_slug = 'demo'
        `);

        // Contar registros em demo
        const countDemo = await queryRunner.query(`
          SELECT COUNT(*) as count FROM demo."${tableName}"
        `);

        console.log(`✅ ${tableName}: ${countPublic[0].count} registros migrados (verificação: ${countDemo[0].count})`);

      } catch (error: any) {
        console.error(`❌ Erro ao migrar dados de "${tableName}":`, error.message);
      }
    }

    console.log('\n\n📊 === VALIDAÇÃO FINAL ===');

    for (const tableName of tenantTables) {
      try {
        const tableExists = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'demo'
            AND table_name = $1
          )
        `, [tableName]);

        if (!tableExists[0].exists) {
          continue;
        }

        const countDemo = await queryRunner.query(`
          SELECT COUNT(*) as count FROM demo."${tableName}"
        `);

        const countPublic = await queryRunner.query(`
          SELECT COUNT(*) as count FROM public."${tableName}" WHERE tenant_slug = 'demo'
        `);

        if (countDemo[0].count === countPublic[0].count) {
          console.log(`✅ ${tableName}: ${countDemo[0].count} registros (OK)`);
        } else {
          console.log(`❌ ${tableName}: demo=${countDemo[0].count}, public=${countPublic[0].count} (DIVERGÊNCIA!)`);
        }

      } catch (error: any) {
        // Ignorar erros
      }
    }

    console.log('\n✨ Migração concluída com sucesso!');
    console.log('\n⚠️  IMPORTANTE: Os dados ainda estão em public também. Após validar que tudo funciona,');
    console.log('você pode remover os dados de public com: DELETE FROM public.[tabela] WHERE tenant_slug = \'demo\'');

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

migrateToSchemaPerTenant()
  .then(() => {
    console.log('\n✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });
