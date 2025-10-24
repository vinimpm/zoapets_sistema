import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Consulta } from '../../common/entities/consulta.entity';
import { Pet } from '../../common/entities/pet.entity';
import { Tutor } from '../../common/entities/tutor.entity';
import { User } from '../../common/entities/user.entity';
import { Internacao } from '../../common/entities/internacao.entity';
import { CreateConsultaDto, UpdateConsultaDto, GerarInternacaoDto } from './dto';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(Tutor)
    private tutoresRepository: Repository<Tutor>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Internacao)
    private internacoesRepository: Repository<Internacao>,
  ) {}

  async create(createConsultaDto: CreateConsultaDto): Promise<Consulta> {
    // Verify pet exists
    const pet = await this.petsRepository.findOne({
      where: { id: createConsultaDto.petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${createConsultaDto.petId} não encontrado`);
    }

    // Verify tutor exists
    const tutor = await this.tutoresRepository.findOne({
      where: { id: createConsultaDto.tutorId },
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${createConsultaDto.tutorId} não encontrado`);
    }

    // Verify veterinarian exists
    const veterinario = await this.usersRepository.findOne({
      where: { id: createConsultaDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinário com ID ${createConsultaDto.veterinarioId} não encontrado`);
    }

    const consulta = this.consultasRepository.create(createConsultaDto);
    return await this.consultasRepository.save(consulta);
  }

  async findAll(filters?: {
    data?: Date;
    veterinarioId?: string;
    status?: string;
    petId?: string;
  }): Promise<Consulta[]> {
    const where: FindOptionsWhere<Consulta> = {};

    if (filters?.veterinarioId) {
      where.veterinarioId = filters.veterinarioId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.petId) {
      where.petId = filters.petId;
    }

    const consultas = await this.consultasRepository.find({
      where,
      relations: ['pet', 'tutor', 'veterinario'],
      order: { dataAtendimento: 'DESC' },
    });

    return consultas;
  }

  async findOne(id: string): Promise<Consulta> {
    const consulta = await this.consultasRepository.findOne({
      where: { id },
      relations: ['pet', 'tutor', 'veterinario'],
    });

    if (!consulta) {
      throw new NotFoundException(`Consulta com ID ${id} não encontrada`);
    }

    return consulta;
  }

  async findByPet(petId: string): Promise<Consulta[]> {
    return await this.consultasRepository.find({
      where: { petId },
      relations: ['veterinario'],
      order: { dataAtendimento: 'DESC' },
    });
  }

  async update(id: string, updateConsultaDto: UpdateConsultaDto): Promise<Consulta> {
    const consulta = await this.findOne(id);

    Object.assign(consulta, updateConsultaDto);

    return await this.consultasRepository.save(consulta);
  }

  async concluir(id: string): Promise<Consulta> {
    const consulta = await this.findOne(id);

    consulta.status = 'concluida';

    return await this.consultasRepository.save(consulta);
  }

  async gerarInternacao(id: string, dto: GerarInternacaoDto): Promise<Internacao> {
    const consulta = await this.findOne(id);

    // Validar se a consulta já não gerou internação
    if (consulta.status === 'gerou_internacao' && consulta.internacaoId) {
      throw new NotFoundException('Esta consulta já gerou uma internação');
    }

    // Usar o médico da consulta ou o informado no DTO
    const medicoResponsavelId = dto.medicoResponsavelId || consulta.veterinarioId;

    // Usar o diagnóstico da consulta se não houver diagnosticoInicial no DTO
    const diagnosticoInicial = dto.diagnosticoInicial || consulta.diagnostico;

    // Criar a internação
    const internacao = this.internacoesRepository.create({
      petId: consulta.petId,
      medicoResponsavelId,
      dataEntrada: new Date(),
      motivo: dto.motivo,
      diagnosticoInicial,
      tipo: dto.tipo,
      status: 'em_andamento',
      prioridade: dto.prioridade,
      leito: dto.leito,
      isolamento: dto.isolamento || false,
      observacoes: dto.observacoes,
    });

    const internacaoSalva = await this.internacoesRepository.save(internacao);

    // Atualizar a consulta
    consulta.status = 'gerou_internacao';
    consulta.internacaoId = internacaoSalva.id;
    await this.consultasRepository.save(consulta);

    return internacaoSalva;
  }

  async remove(id: string): Promise<void> {
    const consulta = await this.findOne(id);
    await this.consultasRepository.remove(consulta);
  }
}
