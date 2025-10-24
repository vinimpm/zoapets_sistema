import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Equipamento } from '@/common/entities/equipamento.entity';
import { CreateEquipamentoDto, UpdateEquipamentoDto } from './dto';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private equipamentoRepository: Repository<Equipamento>,
  ) {}

  async create(createDto: CreateEquipamentoDto): Promise<Equipamento> {
    const equipamento = this.equipamentoRepository.create(createDto);
    return this.equipamentoRepository.save(equipamento);
  }

  async findAll(tipo?: string, status?: string): Promise<Equipamento[]> {
    const query = this.equipamentoRepository.createQueryBuilder('equipamento');

    if (tipo) {
      query.andWhere('equipamento.tipo = :tipo', { tipo });
    }

    if (status) {
      query.andWhere('equipamento.status = :status', { status });
    }

    query.orderBy('equipamento.nome', 'ASC');

    return query.getMany();
  }

  async findById(id: string): Promise<Equipamento> {
    const equipamento = await this.equipamentoRepository.findOne({ where: { id } });

    if (!equipamento) {
      throw new NotFoundException(`Equipamento ${id} não encontrado`);
    }

    return equipamento;
  }

  async findNeedingMaintenance(): Promise<Equipamento[]> {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    return this.equipamentoRepository.find({
      where: [
        { proximaManutencao: LessThan(next30Days) },
        { proximaCalibracao: LessThan(next30Days) },
      ],
      order: { proximaManutencao: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdateEquipamentoDto): Promise<Equipamento> {
    const equipamento = await this.findById(id);
    Object.assign(equipamento, updateDto);
    return this.equipamentoRepository.save(equipamento);
  }

  async delete(id: string): Promise<void> {
    const equipamento = await this.findById(id);
    await this.equipamentoRepository.remove(equipamento);
  }
}
