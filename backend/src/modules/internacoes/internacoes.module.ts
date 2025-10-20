import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternacoesService } from './internacoes.service';
import { InternacoesController } from './internacoes.controller';
import { Internacao } from '../../common/entities/internacao.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Internacao, Pet, User])],
  controllers: [InternacoesController],
  providers: [InternacoesService],
  exports: [InternacoesService],
})
export class InternacoesModule {}
