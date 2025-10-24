import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './core/auth/auth.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UsersModule } from './modules/users/users.module';
import { TutoresModule } from './modules/tutores/tutores.module';
import { PetsModule } from './modules/pets/pets.module';
import { InternacoesModule } from './modules/internacoes/internacoes.module';
import { PrescricoesModule } from './modules/prescricoes/prescricoes.module';
import { AdministracoesModule } from './modules/administracoes/administracoes.module';
import { MedicamentosModule } from './modules/medicamentos/medicamentos.module';
import { EvolucoesModule } from './modules/evolucoes/evolucoes.module';
import { SinaisVitaisModule } from './modules/sinais-vitais/sinais-vitais.module';
import { AgendamentosModule } from './modules/agendamentos/agendamentos.module';
import { ExamesModule } from './modules/exames/exames.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { RolesModule } from './modules/roles/roles.module';
import { TenantsModule } from './modules/tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres123',
      database: process.env.DATABASE_NAME || 'zoapets_dev',
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    TutoresModule,
    PetsModule,
    InternacoesModule,
    PrescricoesModule,
    AdministracoesModule,
    MedicamentosModule,
    EvolucoesModule,
    SinaisVitaisModule,
    AgendamentosModule,
    ExamesModule,
    FinanceiroModule,
    ApiKeysModule,
    PublicApiModule,
    RolesModule,
    TenantsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Aplicar em todas as rotas

    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('public/*'); // Rate limiting para rotas públicas
  }
}
 
