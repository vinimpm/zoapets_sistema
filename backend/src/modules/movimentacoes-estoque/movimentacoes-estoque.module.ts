import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';
import { MovimentacoesEstoqueController } from './movimentacoes-estoque.controller';
import { MovimentacaoEstoque } from '../../common/entities/movimentacao-estoque.entity';
import { Medicamento } from '../../common/entities/medicamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimentacaoEstoque, Medicamento])],
  controllers: [MovimentacoesEstoqueController],
  providers: [MovimentacoesEstoqueService],
  exports: [MovimentacoesEstoqueService],
})
export class MovimentacoesEstoqueModule {}
