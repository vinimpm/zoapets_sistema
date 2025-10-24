import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipamento } from '@/common/entities/equipamento.entity';
import { EquipamentosService } from './equipamentos.service';
import { EquipamentosController } from './equipamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Equipamento])],
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
  exports: [EquipamentosService],
})
export class EquipamentosModule {}
