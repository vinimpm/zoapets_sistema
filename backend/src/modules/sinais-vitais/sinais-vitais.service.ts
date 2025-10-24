import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SinaisVitais } from '../../common/entities/sinais-vitais.entity';
import { Internacao } from '../../common/entities/internacao.entity';
import { User } from '../../common/entities/user.entity';
import { CreateSinaisVitaisDto, UpdateSinaisVitaisDto } from './dto';

@Injectable()
export class SinaisVitaisService {
  constructor(
    @InjectRepository(SinaisVitais)
    private sinaisVitaisRepository: Repository<SinaisVitais>,
    @InjectRepository(Internacao)
    private internacoesRepository: Repository<Internacao>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createSinaisVitaisDto: CreateSinaisVitaisDto): Promise<SinaisVitais> {
    // Verify internacao exists
    const internacao = await this.internacoesRepository.findOne({
      where: { id: createSinaisVitaisDto.internacaoId },
    });

    if (!internacao) {
      throw new NotFoundException(`Internação com ID ${createSinaisVitaisDto.internacaoId} não encontrada`);
    }

    // Verify responsible user exists
    const responsavel = await this.usersRepository.findOne({
      where: { id: createSinaisVitaisDto.responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException(`Usuário com ID ${createSinaisVitaisDto.responsavelId} não encontrado`);
    }

    const sinaisVitais = this.sinaisVitaisRepository.create({
      ...createSinaisVitaisDto,
      dataHora: new Date(createSinaisVitaisDto.dataHora),
    });

    return this.sinaisVitaisRepository.save(sinaisVitais);
  }

  async findAll(internacaoId?: string): Promise<SinaisVitais[]> {
    const where: any = {};

    if (internacaoId) {
      where.internacaoId = internacaoId;
    }

    return this.sinaisVitaisRepository.find({
      where,
      relations: ['internacao', 'internacao.pet', 'responsavel'],
      order: { dataHora: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SinaisVitais> {
    const sinaisVitais = await this.sinaisVitaisRepository.findOne({
      where: { id },
      relations: ['internacao', 'internacao.pet', 'responsavel'],
    });

    if (!sinaisVitais) {
      throw new NotFoundException(`Sinais vitais com ID ${id} não encontrados`);
    }

    return sinaisVitais;
  }

  async findByInternacao(internacaoId: string, periodo?: { inicio: Date; fim: Date }): Promise<SinaisVitais[]> {
    const where: any = { internacaoId };

    if (periodo) {
      where.dataHora = Between(periodo.inicio, periodo.fim);
    }

    return this.sinaisVitaisRepository.find({
      where,
      relations: ['responsavel'],
      order: { dataHora: 'ASC' },
    });
  }

  async getUltimo(internacaoId: string): Promise<SinaisVitais | null> {
    return this.sinaisVitaisRepository.findOne({
      where: { internacaoId },
      relations: ['responsavel'],
      order: { dataHora: 'DESC' },
    });
  }

  async update(id: string, updateSinaisVitaisDto: UpdateSinaisVitaisDto): Promise<SinaisVitais> {
    const sinaisVitais = await this.findOne(id);

    const updateData: any = { ...updateSinaisVitaisDto };

    if (updateSinaisVitaisDto.dataHora) {
      updateData.dataHora = new Date(updateSinaisVitaisDto.dataHora);
    }

    Object.assign(sinaisVitais, updateData);
    return this.sinaisVitaisRepository.save(sinaisVitais);
  }

  async remove(id: string): Promise<void> {
    const sinaisVitais = await this.findOne(id);
    await this.sinaisVitaisRepository.remove(sinaisVitais);
  }
}
