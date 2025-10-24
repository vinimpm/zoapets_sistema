import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔍 Procurando dados em TODOS os schemas...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 1. Listar todos os schemas
    const schemas = await dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND schema_name NOT LIKE 'pg_%'
      ORDER BY schema_name
    `);

    console.log('📂 Schemas encontrados:');
    schemas.forEach((s: any) => console.log(`  - ${s.schema_name}`));
    console.log('');

    // 2. Para cada schema, verificar se tem dados
    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 Verificando schema: "${schemaName}"\n`);

      try {
        // Verificar se tabela tutores existe
        const tutoresTableExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = $1
            AND table_name = 'tutores'
          ) as exists
        `, [schemaName]);

        if (tutoresTableExists[0]?.exists) {
          const tutores = await dataSource.query(`
            SELECT COUNT(*) as total FROM "${schemaName}".tutores
          `);
          console.log(`  📋 Tutores: ${tutores[0].total}`);

          if (parseInt(tutores[0].total) > 0) {
            // Listar alguns tutores
            const someTutores = await dataSource.query(`
              SELECT id, nome_completo, email, cpf
              FROM "${schemaName}".tutores
              LIMIT 5
            `);
            console.log('     Exemplos:');
            someTutores.forEach((t: any) => {
              console.log(`       - ${t.nome_completo} (${t.email || 'sem email'})`);
            });
          }
        } else {
          console.log(`  ⚠️  Tabela tutores não existe`);
        }

        // Verificar se tabela pets existe
        const petsTableExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = $1
            AND table_name = 'pets'
          ) as exists
        `, [schemaName]);

        if (petsTableExists[0]?.exists) {
          const pets = await dataSource.query(`
            SELECT COUNT(*) as total FROM "${schemaName}".pets
          `);
          console.log(`  🐕 Pets: ${pets[0].total}`);

          if (parseInt(pets[0].total) > 0) {
            // Listar alguns pets
            const somePets = await dataSource.query(`
              SELECT id, nome, especie, raca
              FROM "${schemaName}".pets
              LIMIT 5
            `);
            console.log('     Exemplos:');
            somePets.forEach((p: any) => {
              console.log(`       - ${p.nome} (${p.especie} - ${p.raca || 'sem raça'})`);
            });
          }
        } else {
          console.log(`  ⚠️  Tabela pets não existe`);
        }

        // Verificar agendamentos
        const agendamentosTableExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = $1
            AND table_name = 'agendamentos'
          ) as exists
        `, [schemaName]);

        if (agendamentosTableExists[0]?.exists) {
          const agendamentos = await dataSource.query(`
            SELECT COUNT(*) as total FROM "${schemaName}".agendamentos
          `);
          console.log(`  📅 Agendamentos: ${agendamentos[0].total}`);
        }

        // Verificar internações
        const internacoesTableExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = $1
            AND table_name = 'internacoes'
          ) as exists
        `, [schemaName]);

        if (internacoesTableExists[0]?.exists) {
          const internacoes = await dataSource.query(`
            SELECT COUNT(*) as total FROM "${schemaName}".internacoes
          `);
          console.log(`  🏥 Internações: ${internacoes[0].total}`);
        }

      } catch (error) {
        console.log(`  ❌ Erro: ${error.message}`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
