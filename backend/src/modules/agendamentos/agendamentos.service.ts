import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Agendamento } from '../../common/entities/agendamento.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';
import { Procedimento } from '../../common/entities/procedimento.entity';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private agendamentosRepository: Repository<Agendamento>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Procedimento)
    private procedimentosRepository: Repository<Procedimento>,
  ) {}

  async create(createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
    // Verify pet exists
    const pet = await this.petsRepository.findOne({
      where: { id: createAgendamentoDto.petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${createAgendamentoDto.petId} não encontrado`);
    }

    // Verify veterinarian exists
    const veterinario = await this.usersRepository.findOne({
      where: { id: createAgendamentoDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinário com ID ${createAgendamentoDto.veterinarioId} não encontrado`);
    }

    // Check for conflicts
    const dataInicio = new Date(createAgendamentoDto.dataHoraInicio);
    const dataFim = new Date(createAgendamentoDto.dataHoraFim);

    const conflitos = await this.agendamentosRepository
      .createQueryBuilder('agendamento')
      .where('agendamento.veterinarioId = :veterinarioId', { veterinarioId: createAgendamentoDto.veterinarioId })
      .andWhere('agendamento.status NOT IN (:...status)', { status: ['cancelado', 'falta'] })
      .andWhere(
        '(agendamento.dataHoraInicio < :dataFim AND agendamento.dataHoraFim > :dataInicio)',
        { dataInicio, dataFim }
      )
      .getCount();

    if (conflitos > 0) {
      throw new BadRequestException('Horário já ocupado para este veterinário');
    }

    const agendamento = this.agendamentosRepository.create({
      ...createAgendamentoDto,
      dataHoraInicio: dataInicio,
      dataHoraFim: dataFim,
    });

    return this.agendamentosRepository.save(agendamento);
  }

  async findAll(params?: { data?: Date; veterinarioId?: string; status?: string }): Promise<Agendamento[]> {
    const where: any = {};

    if (params?.veterinarioId) {
      where.veterinarioId = params.veterinarioId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.data) {
      const inicio = new Date(params.data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(params.data);
      fim.setHours(23, 59, 59, 999);
      where.dataHoraInicio = Between(inicio, fim);
    }

    return this.agendamentosRepository.find({
      where,
      relations: ['pet', 'pet.tutor', 'veterinario', 'procedimento'],
      order: { dataHoraInicio: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Agendamento> {
    const agendamento = await this.agendamentosRepository.findOne({
      where: { id },
      relations: ['pet', 'pet.tutor', 'veterinario', 'procedimento'],
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return agendamento;
  }

  async findByPeriodo(inicio: Date, fim: Date, veterinarioId?: string): Promise<Agendamento[]> {
    const queryBuilder = this.agendamentosRepository
      .createQueryBuilder('agendamento')
      .leftJoinAndSelect('agendamento.pet', 'pet')
      .leftJoinAndSelect('pet.tutor', 'tutor')
      .leftJoinAndSelect('agendamento.veterinario', 'veterinario')
      .leftJoinAndSelect('agendamento.procedimento', 'procedimento')
      .where('agendamento.dataHoraInicio BETWEEN :inicio AND :fim', { inicio, fim });

    if (veterinarioId) {
      queryBuilder.andWhere('agendamento.veterinarioId = :veterinarioId', { veterinarioId });
    }

    return queryBuilder
      .orderBy('agendamento.dataHoraInicio', 'ASC')
      .getMany();
  }

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto): Promise<Agendamento> {
    const agendamento = await this.findOne(id);

    const updateData: any = { ...updateAgendamentoDto };

    if (updateAgendamentoDto.dataHoraInicio) {
      updateData.dataHoraInicio = new Date(updateAgendamentoDto.dataHoraInicio);
    }

    if (updateAgendamentoDto.dataHoraFim) {
      updateData.dataHoraFim = new Date(updateAgendamentoDto.dataHoraFim);
    }

    Object.assign(agendamento, updateData);
    return this.agendamentosRepository.save(agendamento);
  }

  async confirmar(id: string): Promise<Agendamento> {
    const agendamento = await this.findOne(id);
    agendamento.status = 'confirmado';
    agendamento.confirmadoEm = new Date();
    return this.agendamentosRepository.save(agendamento);
  }

  async cancelar(id: string): Promise<Agendamento> {
    const agendamento = await this.findOne(id);
    agendamento.status = 'cancelado';
    return this.agendamentosRepository.save(agendamento);
  }

  async marcarFalta(id: string): Promise<Agendamento> {
    const agendamento = await this.findOne(id);
    agendamento.status = 'falta';
    return this.agendamentosRepository.save(agendamento);
  }

  async remove(id: string): Promise<void> {
    const agendamento = await this.findOne(id);
    await this.agendamentosRepository.remove(agendamento);
  }
}
