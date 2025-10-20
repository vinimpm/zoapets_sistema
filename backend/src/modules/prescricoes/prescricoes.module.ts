import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescricoesService } from './prescricoes.service';
import { PrescricoesController } from './prescricoes.controller';
import { Prescricao } from '../../common/entities/prescricao.entity';
import { PrescricaoItem } from '../../common/entities/prescricao-item.entity';
import { Administracao } from '../../common/entities/administracao.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';
import { Medicamento } from '../../common/entities/medicamento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescricao,
      PrescricaoItem,
      Administracao,
      Pet,
      User,
      Medicamento,
    ]),
  ],
  controllers: [PrescricoesController],
  providers: [PrescricoesService],
  exports: [PrescricoesService],
})
export class PrescricoesModule {}
