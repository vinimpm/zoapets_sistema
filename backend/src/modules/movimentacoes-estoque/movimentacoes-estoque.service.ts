import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MovimentacaoEstoque } from '../../common/entities/movimentacao-estoque.entity';
import { Medicamento } from '../../common/entities/medicamento.entity';
import { CreateMovimentacaoDto } from './dto';

@Injectable()
export class MovimentacoesEstoqueService {
  constructor(
    @InjectRepository(MovimentacaoEstoque)
    private movimentacoesRepository: Repository<MovimentacaoEstoque>,
    @InjectRepository(Medicamento)
    private medicamentosRepository: Repository<Medicamento>,
  ) {}

  async create(createMovimentacaoDto: CreateMovimentacaoDto, tenantSlug: string): Promise<MovimentacaoEstoque> {
    // Buscar medicamento
    const medicamento = await this.medicamentosRepository.findOne({
      where: { id: createMovimentacaoDto.medicamentoId, tenantSlug } as any,
    });

    if (!medicamento) {
      throw new NotFoundException('Medicamento não encontrado');
    }

    // Validar estoque para saída
    if (createMovimentacaoDto.tipo === 'saida') {
      if (medicamento.estoqueAtual < createMovimentacaoDto.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente. Disponível: ${medicamento.estoqueAtual}, Solicitado: ${createMovimentacaoDto.quantidade}`,
        );
      }
    }

    // Criar movimentação
    const movimentacao = this.movimentacoesRepository.create({
      ...createMovimentacaoDto,
      tenantSlug,
    } as any);

    const savedMovimentacao: any = await this.movimentacoesRepository.save(movimentacao);

    // Atualizar estoque do medicamento
    const novoEstoque =
      createMovimentacaoDto.tipo === 'entrada'
        ? medicamento.estoqueAtual + createMovimentacaoDto.quantidade
        : medicamento.estoqueAtual - createMovimentacaoDto.quantidade;

    await this.medicamentosRepository.update(
      { id: medicamento.id },
      { estoqueAtual: novoEstoque },
    );

    // Retornar com relações
    return this.findOne(savedMovimentacao.id, tenantSlug);
  }

  async findAll(tenantSlug: string, tipo?: string, medicamentoId?: string): Promise<MovimentacaoEstoque[]> {
    const where: any = { tenantSlug };

    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      where.tipo = tipo;
    }

    if (medicamentoId) {
      where.medicamentoId = medicamentoId;
    }

    return this.movimentacoesRepository.find({
      where,
      relations: ['medicamento', 'responsavel'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findByPeriodo(
    tenantSlug: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<MovimentacaoEstoque[]> {
    return this.movimentacoesRepository.find({
      where: {
        tenantSlug,
        createdAt: Between(dataInicio, dataFim),
      } as any,
      relations: ['medicamento', 'responsavel'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findByMedicamento(medicamentoId: string, tenantSlug: string): Promise<MovimentacaoEstoque[]> {
    return this.movimentacoesRepository.find({
      where: { medicamentoId, tenantSlug } as any,
      relations: ['medicamento', 'responsavel'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findOne(id: string, tenantSlug: string): Promise<MovimentacaoEstoque> {
    const movimentacao = await this.movimentacoesRepository.findOne({
      where: { id, tenantSlug } as any,
      relations: ['medicamento', 'responsavel'],
    });

    if (!movimentacao) {
      throw new NotFoundException('Movimentação não encontrada');
    }

    return movimentacao;
  }

  async getResumo(tenantSlug: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = { tenantSlug };

    if (dataInicio && dataFim) {
      where.createdAt = Between(dataInicio, dataFim);
    }

    const movimentacoes = await this.movimentacoesRepository.find({ where });

    const totalEntradas = movimentacoes
      .filter((m) => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.quantidade, 0);

    const totalSaidas = movimentacoes
      .filter((m) => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.quantidade, 0);

    const quantidadeEntradas = movimentacoes.filter((m) => m.tipo === 'entrada').length;
    const quantidadeSaidas = movimentacoes.filter((m) => m.tipo === 'saida').length;

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      quantidadeEntradas,
      quantidadeSaidas,
      totalMovimentacoes: movimentacoes.length,
    };
  }
}
