import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SinaisVitaisService } from './sinais-vitais.service';
import { SinaisVitaisController } from './sinais-vitais.controller';
import { SinaisVitais } from '../../common/entities/sinais-vitais.entity';
import { Internacao } from '../../common/entities/internacao.entity';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SinaisVitais, Internacao, User])],
  controllers: [SinaisVitaisController],
  providers: [SinaisVitaisService],
  exports: [SinaisVitaisService],
})
export class SinaisVitaisModule {}
