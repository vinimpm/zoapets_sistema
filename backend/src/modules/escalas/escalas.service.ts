import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Escala } from '../../common/entities/escala.entity';
import { Turno } from '../../common/entities/turno.entity';
import { CreateEscalaDto, UpdateEscalaDto, CreateTurnoDto, UpdateTurnoDto } from './dto';

@Injectable()
export class EscalasService {
  constructor(
    @InjectRepository(Escala)
    private escalasRepository: Repository<Escala>,
    @InjectRepository(Turno)
    private turnosRepository: Repository<Turno>,
  ) {}

  // Turnos
  async createTurno(createTurnoDto: CreateTurnoDto): Promise<Turno> {
    const turno = this.turnosRepository.create(createTurnoDto);
    return await this.turnosRepository.save(turno);
  }

  async findAllTurnos(): Promise<Turno[]> {
    return await this.turnosRepository.find({
      where: { ativo: true },
      order: { horaInicio: 'ASC' },
    });
  }

  async findOneTurno(id: string): Promise<Turno> {
    const turno = await this.turnosRepository.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException('Turno não encontrado');
    }
    return turno;
  }

  async updateTurno(id: string, updateTurnoDto: UpdateTurnoDto): Promise<Turno> {
    const turno = await this.findOneTurno(id);
    Object.assign(turno, updateTurnoDto);
    return await this.turnosRepository.save(turno);
  }

  async removeTurno(id: string): Promise<void> {
    const turno = await this.findOneTurno(id);
    await this.turnosRepository.remove(turno);
  }

  // Escalas
  async createEscala(createEscalaDto: CreateEscalaDto, criadoPorId: string): Promise<Escala> {
    // Verificar se já existe escala para o funcionário nesta data e turno
    const existingEscala = await this.escalasRepository.findOne({
      where: {
        funcionarioId: createEscalaDto.funcionarioId,
        data: new Date(createEscalaDto.data),
        turnoId: createEscalaDto.turnoId,
      },
    });

    if (existingEscala) {
      throw new BadRequestException('Já existe uma escala para este funcionário nesta data e turno');
    }

    const escala = this.escalasRepository.create({
      ...createEscalaDto,
      data: new Date(createEscalaDto.data),
      criadoPorId,
    });

    return await this.escalasRepository.save(escala);
  }

  async findAllEscalas(params?: {
    funcionarioId?: string;
    turnoId?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }): Promise<Escala[]> {
    const query = this.escalasRepository.createQueryBuilder('escala')
      .leftJoinAndSelect('escala.funcionario', 'funcionario')
      .leftJoinAndSelect('escala.turno', 'turno')
      .leftJoinAndSelect('escala.criadoPor', 'criadoPor');

    if (params?.funcionarioId) {
      query.andWhere('escala.funcionarioId = :funcionarioId', { funcionarioId: params.funcionarioId });
    }

    if (params?.turnoId) {
      query.andWhere('escala.turnoId = :turnoId', { turnoId: params.turnoId });
    }

    if (params?.status) {
      query.andWhere('escala.status = :status', { status: params.status });
    }

    if (params?.dataInicio && params?.dataFim) {
      query.andWhere('escala.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: new Date(params.dataInicio),
        dataFim: new Date(params.dataFim),
      });
    }

    query.orderBy('escala.data', 'ASC')
      .addOrderBy('turno.horaInicio', 'ASC');

    return await query.getMany();
  }

  async findOneEscala(id: string): Promise<Escala> {
    const escala = await this.escalasRepository.findOne({
      where: { id },
      relations: ['funcionario', 'turno', 'criadoPor'],
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    return escala;
  }

  async updateEscala(id: string, updateEscalaDto: UpdateEscalaDto): Promise<Escala> {
    const escala = await this.findOneEscala(id);

    if (updateEscalaDto.data) {
      escala.data = new Date(updateEscalaDto.data);
    }

    if (updateEscalaDto.funcionarioId) {
      escala.funcionarioId = updateEscalaDto.funcionarioId;
    }

    if (updateEscalaDto.turnoId) {
      escala.turnoId = updateEscalaDto.turnoId;
    }

    if (updateEscalaDto.status) {
      escala.status = updateEscalaDto.status;
    }

    if (updateEscalaDto.observacoes !== undefined) {
      escala.observacoes = updateEscalaDto.observacoes;
    }

    return await this.escalasRepository.save(escala);
  }

  async removeEscala(id: string): Promise<void> {
    const escala = await this.findOneEscala(id);
    await this.escalasRepository.remove(escala);
  }

  async getEscalasPorSemana(dataInicio: string): Promise<any> {
    const inicio = new Date(dataInicio);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 7);

    const escalas = await this.findAllEscalas({
      dataInicio: inicio.toISOString(),
      dataFim: fim.toISOString(),
    });

    // Agrupar por dia e turno
    const escalasPorDia: any = {};

    escalas.forEach((escala) => {
      const dataKey = escala.data.toISOString().split('T')[0];

      if (!escalasPorDia[dataKey]) {
        escalasPorDia[dataKey] = {};
      }

      if (!escalasPorDia[dataKey][escala.turno.nome]) {
        escalasPorDia[dataKey][escala.turno.nome] = [];
      }

      escalasPorDia[dataKey][escala.turno.nome].push({
        id: escala.id,
        funcionario: escala.funcionario,
        status: escala.status,
        observacoes: escala.observacoes,
      });
    });

    return escalasPorDia;
  }
}
