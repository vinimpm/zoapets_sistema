import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PlansSeedService } from '../modules/plans/plans-seed.service';

async function bootstrap() {
  console.log('🌱 Populando planos no banco de dados...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const plansSeedService = app.get(PlansSeedService);

  try {
    await plansSeedService.seed();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  ✅ PLANOS CRIADOS COM SUCESSO!                      ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║                                                      ║');
    console.log('║  4 planos foram criados:                            ║');
    console.log('║                                                      ║');
    console.log('║  🆓 FREE        - R$ 0/mês                          ║');
    console.log('║  🚀 STARTER     - R$ 199/mês                        ║');
    console.log('║  ⭐ PROFESSIONAL - R$ 299/mês (Popular)            ║');
    console.log('║  🏢 ENTERPRISE  - R$ 799/mês                        ║');
    console.log('║                                                      ║');
    console.log('║  Acesse GET /api/plans para ver todos os planos.   ║');
    console.log('║                                                      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao popular planos:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
