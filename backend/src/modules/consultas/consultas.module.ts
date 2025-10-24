import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { Consulta } from '../../common/entities/consulta.entity';
import { Pet } from '../../common/entities/pet.entity';
import { Tutor } from '../../common/entities/tutor.entity';
import { User } from '../../common/entities/user.entity';
import { Internacao } from '../../common/entities/internacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consulta, Pet, Tutor, User, Internacao]),
  ],
  controllers: [ConsultasController],
  providers: [ConsultasService],
  exports: [ConsultasService],
})
export class ConsultasModule {}
