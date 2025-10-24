import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscalasService } from './escalas.service';
import { EscalasController } from './escalas.controller';
import { Escala } from '../../common/entities/escala.entity';
import { Turno } from '../../common/entities/turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escala, Turno])],
  controllers: [EscalasController],
  providers: [EscalasService],
  exports: [EscalasService],
})
export class EscalasModule {}
