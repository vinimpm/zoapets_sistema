import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Conta } from '../../common/entities/conta.entity';
import { ContaItem } from '../../common/entities/conta-item.entity';
import { Pagamento } from '../../common/entities/pagamento.entity';
import { User } from '../../common/entities/user.entity';
import { CreatePagamentoDto } from './dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Conta)
    private contasRepository: Repository<Conta>,
    @InjectRepository(ContaItem)
    private contaItensRepository: Repository<ContaItem>,
    @InjectRepository(Pagamento)
    private pagamentosRepository: Repository<Pagamento>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Contas
  async findAllContas(params?: { status?: string; tutorId?: string }): Promise<Conta[]> {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.tutorId) {
      where.tutorId = params.tutorId;
    }

    return this.contasRepository.find({
      where,
      relations: ['pet', 'tutor', 'internacao', 'itens', 'pagamentos'],
      order: { dataEmissao: 'DESC' },
    });
  }

  async findOneConta(id: string): Promise<Conta> {
    const conta = await this.contasRepository.findOne({
      where: { id },
      relations: ['pet', 'tutor', 'internacao', 'itens', 'pagamentos', 'pagamentos.responsavel'],
    });

    if (!conta) {
      throw new NotFoundException(`Conta com ID ${id} não encontrada`);
    }

    return conta;
  }

  async getContasVencidas(): Promise<Conta[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return this.contasRepository
      .createQueryBuilder('conta')
      .where('conta.status IN (:...status)', { status: ['aberta', 'parcial'] })
      .andWhere('conta.dataVencimento < :hoje', { hoje })
      .leftJoinAndSelect('conta.pet', 'pet')
      .leftJoinAndSelect('conta.tutor', 'tutor')
      .orderBy('conta.dataVencimento', 'ASC')
      .getMany();
  }

  async getResumoFinanceiro(inicio: Date, fim: Date): Promise<any> {
    const pagamentos = await this.pagamentosRepository.find({
      where: {
        dataPagamento: Between(inicio, fim),
        status: 'aprovado',
      },
    });

    const totalRecebido = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);

    const contas = await this.contasRepository.find({
      where: {
        dataEmissao: Between(inicio, fim),
      },
    });

    const totalFaturado = contas.reduce((sum, c) => sum + Number(c.valorTotal), 0);
    const totalPendente = contas
      .filter(c => c.status === 'aberta' || c.status === 'parcial')
      .reduce((sum, c) => sum + (Number(c.valorTotal) - Number(c.valorPago)), 0);

    return {
      periodo: { inicio, fim },
      totalFaturado,
      totalRecebido,
      totalPendente,
      quantidadeContas: contas.length,
      quantidadePagamentos: pagamentos.length,
    };
  }

  // Pagamentos
  async createPagamento(createPagamentoDto: CreatePagamentoDto): Promise<Pagamento> {
    // Verify conta exists
    const conta = await this.findOneConta(createPagamentoDto.contaId);

    // Verify user exists
    const responsavel = await this.usersRepository.findOne({
      where: { id: createPagamentoDto.responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException(`Usuário com ID ${createPagamentoDto.responsavelId} não encontrado`);
    }

    // Check if payment exceeds remaining balance
    const saldoRestante = Number(conta.valorTotal) - Number(conta.valorPago);
    if (createPagamentoDto.valor > saldoRestante) {
      throw new BadRequestException(`Valor do pagamento (${createPagamentoDto.valor}) excede o saldo restante (${saldoRestante})`);
    }

    const pagamento = this.pagamentosRepository.create({
      ...createPagamentoDto,
      dataPagamento: new Date(createPagamentoDto.dataPagamento),
      status: 'aprovado',
    });

    const savedPagamento = await this.pagamentosRepository.save(pagamento);

    // Update conta
    conta.valorPago = Number(conta.valorPago) + createPagamentoDto.valor;

    if (conta.valorPago >= Number(conta.valorTotal)) {
      conta.status = 'paga';
    } else if (conta.valorPago > 0) {
      conta.status = 'parcial';
    }

    await this.contasRepository.save(conta);

    return savedPagamento;
  }

  async findAllPagamentos(contaId?: string): Promise<Pagamento[]> {
    const where: any = {};

    if (contaId) {
      where.contaId = contaId;
    }

    return this.pagamentosRepository.find({
      where,
      relations: ['conta', 'conta.pet', 'conta.tutor', 'responsavel'],
      order: { dataPagamento: 'DESC' },
    });
  }

  async findOnePagamento(id: string): Promise<Pagamento> {
    const pagamento = await this.pagamentosRepository.findOne({
      where: { id },
      relations: ['conta', 'conta.pet', 'conta.tutor', 'responsavel'],
    });

    if (!pagamento) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return pagamento;
  }

  async cancelarPagamento(id: string): Promise<Pagamento> {
    const pagamento = await this.findOnePagamento(id);

    if (pagamento.status === 'cancelado') {
      throw new BadRequestException('Pagamento já está cancelado');
    }

    // Update conta
    const conta = await this.findOneConta(pagamento.contaId);
    conta.valorPago = Number(conta.valorPago) - Number(pagamento.valor);

    if (conta.valorPago === 0) {
      conta.status = 'aberta';
    } else if (conta.valorPago < Number(conta.valorTotal)) {
      conta.status = 'parcial';
    }

    await this.contasRepository.save(conta);

    // Cancel payment
    pagamento.status = 'cancelado';
    return this.pagamentosRepository.save(pagamento);
  }
}
