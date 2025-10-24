import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evolucao } from '../../common/entities/evolucao.entity';
import { Internacao } from '../../common/entities/internacao.entity';
import { User } from '../../common/entities/user.entity';
import { CreateEvolucaoDto, UpdateEvolucaoDto } from './dto';

@Injectable()
export class EvolucoesService {
  constructor(
    @InjectRepository(Evolucao)
    private evolucoesRepository: Repository<Evolucao>,
    @InjectRepository(Internacao)
    private internacoesRepository: Repository<Internacao>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEvolucaoDto: CreateEvolucaoDto): Promise<Evolucao> {
    // Verify internacao exists
    const internacao = await this.internacoesRepository.findOne({
      where: { id: createEvolucaoDto.internacaoId },
    });

    if (!internacao) {
      throw new NotFoundException(`Internação com ID ${createEvolucaoDto.internacaoId} não encontrada`);
    }

    // Verify veterinarian exists
    const veterinario = await this.usersRepository.findOne({
      where: { id: createEvolucaoDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinário com ID ${createEvolucaoDto.veterinarioId} não encontrado`);
    }

    const evolucao = this.evolucoesRepository.create({
      ...createEvolucaoDto,
      dataHora: new Date(createEvolucaoDto.dataHora),
    });

    return this.evolucoesRepository.save(evolucao);
  }

  async findAll(internacaoId?: string): Promise<Evolucao[]> {
    const where: any = {};

    if (internacaoId) {
      where.internacaoId = internacaoId;
    }

    return this.evolucoesRepository.find({
      where,
      relations: ['internacao', 'internacao.pet', 'veterinario'],
      order: { dataHora: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Evolucao> {
    const evolucao = await this.evolucoesRepository.findOne({
      where: { id },
      relations: ['internacao', 'internacao.pet', 'veterinario'],
    });

    if (!evolucao) {
      throw new NotFoundException(`Evolução com ID ${id} não encontrada`);
    }

    return evolucao;
  }

  async findByInternacao(internacaoId: string): Promise<Evolucao[]> {
    return this.evolucoesRepository.find({
      where: { internacaoId },
      relations: ['veterinario'],
      order: { dataHora: 'DESC' },
    });
  }

  async update(id: string, updateEvolucaoDto: UpdateEvolucaoDto): Promise<Evolucao> {
    const evolucao = await this.findOne(id);

    const updateData: any = { ...updateEvolucaoDto };

    if (updateEvolucaoDto.dataHora) {
      updateData.dataHora = new Date(updateEvolucaoDto.dataHora);
    }

    Object.assign(evolucao, updateData);
    return this.evolucoesRepository.save(evolucao);
  }

  async remove(id: string): Promise<void> {
    const evolucao = await this.findOne(id);
    await this.evolucoesRepository.remove(evolucao);
  }
}
