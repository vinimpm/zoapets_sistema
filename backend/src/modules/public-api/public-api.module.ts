import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicApiController } from './public-api.controller';
import { ApiKey } from '../../common/entities/api-key.entity';
import { PetsModule } from '../pets/pets.module';
import { TutoresModule } from '../tutores/tutores.module';
import { InternacoesModule } from '../internacoes/internacoes.module';
import { AgendamentosModule } from '../agendamentos/agendamentos.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    PetsModule,
    TutoresModule,
    InternacoesModule,
    AgendamentosModule,
    FinanceiroModule,
  ],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
