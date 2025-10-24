import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantProvisioningService } from '../modules/tenants/tenant-provisioning.service';

async function bootstrap() {
  console.log('🚀 Iniciando provisionamento do tenant DEMO...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const provisioningService = app.get(TenantProvisioningService);

  try {
    // Provisionar tenant demo
    await provisioningService.provisionNewTenant({
      tenantSlug: 'demo',
      nomeClinica: 'Clínica Demo',
      adminEmail: 'admin@demo.com',
      adminPassword: 'admin123',
      adminNomeCompleto: 'Administrador Demo',
    });

    console.log('✅ Tenant DEMO provisionado com sucesso!');
    console.log('\nInformações de acesso:');
    console.log('  Email: admin@demo.com');
    console.log('  Senha: admin123');
    console.log('  Tenant: demo');
  } catch (error) {
    console.error('❌ Erro ao provisionar tenant:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
