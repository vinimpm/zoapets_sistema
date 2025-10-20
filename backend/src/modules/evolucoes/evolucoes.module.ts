import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvolucoesService } from './evolucoes.service';
import { EvolucoesController } from './evolucoes.controller';
import { Evolucao } from '../../common/entities/evolucao.entity';
import { Internacao } from '../../common/entities/internacao.entity';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evolucao, Internacao, User])],
  controllers: [EvolucoesController],
  providers: [EvolucoesService],
  exports: [EvolucoesService],
})
export class EvolucoesModule {}
