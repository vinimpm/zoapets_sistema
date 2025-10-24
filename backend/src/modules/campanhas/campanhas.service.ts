import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Campanha } from '@/common/entities/campanha.entity';
import { CreateCampanhaDto, UpdateCampanhaDto } from './dto';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(Campanha)
    private campanhaRepository: Repository<Campanha>,
  ) {}

  async create(createDto: CreateCampanhaDto): Promise<Campanha> {
    const campanha = this.campanhaRepository.create({
      ...createDto,
      status: createDto.status || 'rascunho',
      totalEnvios: 0,
    });

    return this.campanhaRepository.save(campanha);
  }

  async findAll(status?: string, canal?: string): Promise<Campanha[]> {
    const query = this.campanhaRepository.createQueryBuilder('campanha');

    if (status) {
      query.andWhere('campanha.status = :status', { status });
    }

    if (canal) {
      query.andWhere('campanha.canal = :canal', { canal });
    }

    query.orderBy('campanha.dataInicio', 'DESC');

    return query.getMany();
  }

  async findActive(): Promise<Campanha[]> {
    const now = new Date();

    return this.campanhaRepository.find({
      where: {
        status: 'agendada',
      },
      order: { dataInicio: 'ASC' },
    });
  }

  async findById(id: string): Promise<Campanha> {
    const campanha = await this.campanhaRepository.findOne({ where: { id } });

    if (!campanha) {
      throw new NotFoundException(`Campanha ${id} não encontrada`);
    }

    return campanha;
  }

  async update(id: string, updateDto: UpdateCampanhaDto): Promise<Campanha> {
    const campanha = await this.findById(id);

    Object.assign(campanha, updateDto);
    return this.campanhaRepository.save(campanha);
  }

  async delete(id: string): Promise<void> {
    const campanha = await this.findById(id);
    await this.campanhaRepository.remove(campanha);
  }

  async updateStatus(id: string, status: string): Promise<Campanha> {
    const campanha = await this.findById(id);
    campanha.status = status;
    return this.campanhaRepository.save(campanha);
  }

  async incrementEnvios(id: string, quantidade: number = 1): Promise<void> {
    const campanha = await this.findById(id);
    campanha.totalEnvios += quantidade;
    await this.campanhaRepository.save(campanha);
  }
}
