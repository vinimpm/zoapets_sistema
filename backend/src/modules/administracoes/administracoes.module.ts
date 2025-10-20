import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracoesService } from './administracoes.service';
import { AdministracoesController } from './administracoes.controller';
import { Administracao } from '../../common/entities/administracao.entity';
import { PrescricaoItem } from '../../common/entities/prescricao-item.entity';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Administracao, PrescricaoItem, User])],
  controllers: [AdministracoesController],
  providers: [AdministracoesService],
  exports: [AdministracoesService],
})
export class AdministracoesModule {}
