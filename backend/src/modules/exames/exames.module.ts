import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamesService } from './exames.service';
import { ExamesController } from './exames.controller';
import { ResultadoExame } from '../../common/entities/resultado-exame.entity';
import { Exame } from '../../common/entities/exame.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResultadoExame, Exame, Pet, User])],
  controllers: [ExamesController],
  providers: [ExamesService],
  exports: [ExamesService],
})
export class ExamesModule {}
