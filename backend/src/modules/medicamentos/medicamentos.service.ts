import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThan } from 'typeorm';
import { Medicamento } from '../../common/entities/medicamento.entity';
import { CreateMedicamentoDto, UpdateMedicamentoDto } from './dto';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectRepository(Medicamento)
    private medicamentosRepository: Repository<Medicamento>,
  ) {}

  async create(createMedicamentoDto: CreateMedicamentoDto): Promise<Medicamento> {
    const medicamento = this.medicamentosRepository.create(createMedicamentoDto);
    return this.medicamentosRepository.save(medicamento);
  }

  async findAll(search?: string, usoControlado?: boolean): Promise<Medicamento[]> {
    const where: any = {};

    if (usoControlado !== undefined) {
      where.usoControlado = usoControlado;
    }

    if (search) {
      return this.medicamentosRepository.find({
        where: [
          { ...where, nome: ILike(`%${search}%`) },
          { ...where, principioAtivo: ILike(`%${search}%`) },
        ],
        order: { nome: 'ASC' },
      });
    }

    return this.medicamentosRepository.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Medicamento> {
    const medicamento = await this.medicamentosRepository.findOne({
      where: { id },
    });

    if (!medicamento) {
      throw new NotFoundException(`Medicamento com ID ${id} não encontrado`);
    }

    return medicamento;
  }

  async findEstoqueBaixo(): Promise<Medicamento[]> {
    return this.medicamentosRepository
      .createQueryBuilder('medicamento')
      .where('medicamento.estoqueAtual <= medicamento.estoqueMinimo')
      .andWhere('medicamento.ativo = :ativo', { ativo: true })
      .orderBy('medicamento.estoqueAtual', 'ASC')
      .getMany();
  }

  async update(id: string, updateMedicamentoDto: UpdateMedicamentoDto): Promise<Medicamento> {
    const medicamento = await this.findOne(id);

    Object.assign(medicamento, updateMedicamentoDto);
    return this.medicamentosRepository.save(medicamento);
  }

  async ajustarEstoque(id: string, quantidade: number, tipo: 'adicionar' | 'remover'): Promise<Medicamento> {
    const medicamento = await this.findOne(id);

    if (tipo === 'adicionar') {
      medicamento.estoqueAtual += quantidade;
    } else {
      if (medicamento.estoqueAtual < quantidade) {
        throw new ConflictException('Quantidade em estoque insuficiente');
      }
      medicamento.estoqueAtual -= quantidade;
    }

    return this.medicamentosRepository.save(medicamento);
  }

  async deactivate(id: string): Promise<Medicamento> {
    const medicamento = await this.findOne(id);
    medicamento.ativo = false;
    return this.medicamentosRepository.save(medicamento);
  }

  async activate(id: string): Promise<Medicamento> {
    const medicamento = await this.findOne(id);
    medicamento.ativo = true;
    return this.medicamentosRepository.save(medicamento);
  }

  async remove(id: string): Promise<void> {
    const medicamento = await this.findOne(id);
    await this.medicamentosRepository.remove(medicamento);
  }
}
