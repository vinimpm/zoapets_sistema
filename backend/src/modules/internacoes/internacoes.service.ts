import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Internacao } from '../../common/entities/internacao.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';
import { CreateInternacaoDto, UpdateInternacaoDto } from './dto';

@Injectable()
export class InternacoesService {
  constructor(
    @InjectRepository(Internacao)
    private internacoesRepository: Repository<Internacao>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createInternacaoDto: CreateInternacaoDto): Promise<Internacao> {
    // Verify pet exists
    const pet = await this.petsRepository.findOne({
      where: { id: createInternacaoDto.petId },
      relations: ['tutor'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${createInternacaoDto.petId} não encontrado`);
    }

    // Verify veterinarian exists
    const medico = await this.usersRepository.findOne({
      where: { id: createInternacaoDto.medicoResponsavelId },
    });

    if (!medico) {
      throw new NotFoundException(`Médico com ID ${createInternacaoDto.medicoResponsavelId} não encontrado`);
    }

    const internacao = this.internacoesRepository.create({
      ...createInternacaoDto,
      pet,
      medicoResponsavel: medico,
    });

    return this.internacoesRepository.save(internacao);
  }

  async findAll(status?: string, prioridade?: string): Promise<Internacao[]> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (prioridade) {
      where.prioridade = prioridade;
    }

    return this.internacoesRepository.find({
      where,
      relations: ['pet', 'pet.tutor', 'medicoResponsavel'],
      order: { dataEntrada: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Internacao> {
    const internacao = await this.internacoesRepository.findOne({
      where: { id },
      relations: ['pet', 'pet.tutor', 'medicoResponsavel'],
    });

    if (!internacao) {
      throw new NotFoundException(`Internação com ID ${id} não encontrada`);
    }

    return internacao;
  }

  async findByPet(petId: string): Promise<Internacao[]> {
    return this.internacoesRepository.find({
      where: { petId },
      relations: ['medicoResponsavel'],
      order: { dataEntrada: 'DESC' },
    });
  }

  async findActive(): Promise<Internacao[]> {
    return this.internacoesRepository.find({
      where: [
        { status: 'aguardando' },
        { status: 'em_andamento' },
      ],
      relations: ['pet', 'pet.tutor', 'medicoResponsavel'],
      order: { prioridade: 'DESC', dataEntrada: 'ASC' },
    });
  }

  async findCritical(): Promise<Internacao[]> {
    return this.internacoesRepository.find({
      where: {
        prioridade: 'critica',
        status: 'em_andamento',
      },
      relations: ['pet', 'pet.tutor', 'medicoResponsavel'],
      order: { dataEntrada: 'ASC' },
    });
  }

  async update(id: string, updateInternacaoDto: UpdateInternacaoDto): Promise<Internacao> {
    const internacao = await this.findOne(id);

    // Verify medico if being changed
    if (updateInternacaoDto.medicoResponsavelId &&
        updateInternacaoDto.medicoResponsavelId !== internacao.medicoResponsavelId) {
      const medico = await this.usersRepository.findOne({
        where: { id: updateInternacaoDto.medicoResponsavelId },
      });

      if (!medico) {
        throw new NotFoundException(`Médico com ID ${updateInternacaoDto.medicoResponsavelId} não encontrado`);
      }
    }

    Object.assign(internacao, updateInternacaoDto);
    return this.internacoesRepository.save(internacao);
  }

  async darAlta(id: string, observacoes?: string): Promise<Internacao> {
    const internacao = await this.findOne(id);

    if (internacao.status === 'alta' || internacao.status === 'obito') {
      throw new BadRequestException('Internação já foi finalizada');
    }

    internacao.status = 'alta';
    internacao.dataAlta = new Date();

    if (observacoes) {
      internacao.observacoes = internacao.observacoes
        ? `${internacao.observacoes}\n\nAlta: ${observacoes}`
        : `Alta: ${observacoes}`;
    }

    return this.internacoesRepository.save(internacao);
  }

  async registrarObito(id: string, observacoes?: string): Promise<Internacao> {
    const internacao = await this.findOne(id);

    if (internacao.status === 'alta' || internacao.status === 'obito') {
      throw new BadRequestException('Internação já foi finalizada');
    }

    internacao.status = 'obito';
    internacao.dataAlta = new Date();

    if (observacoes) {
      internacao.observacoes = internacao.observacoes
        ? `${internacao.observacoes}\n\nÓbito: ${observacoes}`
        : `Óbito: ${observacoes}`;
    }

    return this.internacoesRepository.save(internacao);
  }

  async remove(id: string): Promise<void> {
    const internacao = await this.findOne(id);
    await this.internacoesRepository.remove(internacao);
  }

  async getOcupacaoLeitos(): Promise<any> {
    const total = await this.internacoesRepository.count({
      where: [
        { status: 'aguardando' },
        { status: 'em_andamento' },
      ],
    });

    const criticos = await this.internacoesRepository.count({
      where: {
        prioridade: 'critica',
        status: 'em_andamento',
      },
    });

    const isolamento = await this.internacoesRepository.count({
      where: {
        isolamento: true,
        status: 'em_andamento',
      },
    });

    return {
      total,
      criticos,
      isolamento,
      disponiveis: 50 - total, // Assumindo 50 leitos totais
    };
  }
}
