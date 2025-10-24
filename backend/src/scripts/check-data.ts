import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔍 Verificando dados no schema PUBLIC...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // Verificar tutores
    const tutores = await dataSource.query(`
      SELECT COUNT(*) as total FROM public.tutores
    `);
    console.log(`📋 Tutores no PUBLIC: ${tutores[0].total}`);

    // Verificar pets
    const pets = await dataSource.query(`
      SELECT COUNT(*) as total FROM public.pets
    `);
    console.log(`🐕 Pets no PUBLIC: ${pets[0].total}`);

    // Verificar agendamentos
    const agendamentos = await dataSource.query(`
      SELECT COUNT(*) as total FROM public.agendamentos
    `);
    console.log(`📅 Agendamentos no PUBLIC: ${agendamentos[0].total}`);

    // Verificar internações
    const internacoes = await dataSource.query(`
      SELECT COUNT(*) as total FROM public.internacoes
    `);
    console.log(`🏥 Internações no PUBLIC: ${internacoes[0].total}`);

    // Verificar exames
    const exames = await dataSource.query(`
      SELECT COUNT(*) as total FROM public.exames
    `);
    console.log(`🧪 Exames no PUBLIC: ${exames[0].total}`);

    console.log('\n🔍 Verificando dados no schema DEFAULT...\n');

    // Verificar tutores no default
    const tutoresDefault = await dataSource.query(`
      SELECT COUNT(*) as total FROM "default".tutores
    `);
    console.log(`📋 Tutores no DEFAULT: ${tutoresDefault[0].total}`);

    // Verificar pets no default
    const petsDefault = await dataSource.query(`
      SELECT COUNT(*) as total FROM "default".pets
    `);
    console.log(`🐕 Pets no DEFAULT: ${petsDefault[0].total}`);

    console.log('\n');

    const totalRegistros =
      parseInt(tutores[0].total) +
      parseInt(pets[0].total) +
      parseInt(agendamentos[0].total) +
      parseInt(internacoes[0].total) +
      parseInt(exames[0].total);

    if (totalRegistros > 0) {
      console.log('✅ Encontrei dados no schema PUBLIC!');
      console.log('💡 Preciso migrar esses dados para o schema DEFAULT.\n');
    } else {
      console.log('⚠️  Não há dados no schema PUBLIC para migrar.\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
