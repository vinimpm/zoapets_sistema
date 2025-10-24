import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { PermissionsSeedService } from '../modules/roles/permissions-seed.service';

async function bootstrap() {
  console.log('🌱 Semeando permissões no tenant_demo...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const permissionsSeedService = app.get(PermissionsSeedService);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('1️⃣ Verificando estrutura do tenant_demo...\n');

    // Garantir que estamos no schema correto
    await queryRunner.query(`SET search_path TO "tenant_demo", public`);

    // Verificar se tabela permissions existe
    const permissionsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'tenant_demo'
        AND table_name = 'permissions'
      ) as exists
    `);

    if (!permissionsTableExists[0]?.exists) {
      console.log('❌ Tabela permissions não existe no tenant_demo!');
      console.log('💡 Execute o script fix-tenant-demo.ts primeiro.\n');
      await queryRunner.rollbackTransaction();
      await app.close();
      return;
    }

    console.log('✅ Tabela permissions encontrada\n');

    // Verificar permissões existentes
    const existingPermissions = await queryRunner.query(`
      SELECT COUNT(*) as total FROM "tenant_demo".permissions
    `);

    console.log(`📊 Permissões existentes: ${existingPermissions[0].total}\n`);

    // Semear permissões usando o serviço
    console.log('2️⃣ Semeando 106 permissões do sistema...\n');

    await permissionsSeedService.seedPermissionsForTenantWithQueryRunner(
      queryRunner,
      'tenant_demo',
    );

    // Verificar total após seed
    const finalPermissions = await queryRunner.query(`
      SELECT COUNT(*) as total FROM "tenant_demo".permissions
    `);

    console.log(`\n✅ Total de permissões após seed: ${finalPermissions[0].total}\n`);

    // Commit da transação
    await queryRunner.commitTransaction();

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PRONTO! PERMISSÕES SEMEADAS NO TENANT_DEMO!       ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║                                                        ║');
    console.log('║  Faça LOGOUT e LOGIN novamente para carregar           ║');
    console.log('║  as permissões no seu token JWT!                      ║');
    console.log('║                                                        ║');
    console.log('║  Agora você verá a matriz de permissões completa! 🎉  ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

bootstrap();
