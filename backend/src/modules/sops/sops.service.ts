import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SOP } from '@/common/entities/sop.entity';
import { CreateSopDto, UpdateSopDto } from './dto';

@Injectable()
export class SopsService {
  constructor(
    @InjectRepository(SOP)
    private sopRepository: Repository<SOP>,
  ) {}

  async create(createDto: CreateSopDto): Promise<SOP> {
    // Check if codigo already exists
    const existing = await this.sopRepository.findOne({
      where: { codigo: createDto.codigo },
    });

    if (existing) {
      throw new BadRequestException('Código SOP já existe');
    }

    const sop = this.sopRepository.create({
      ...createDto,
      versao: createDto.versao || 1,
    });

    return this.sopRepository.save(sop);
  }

  async findAll(categoria?: string, search?: string): Promise<SOP[]> {
    const query = this.sopRepository.createQueryBuilder('sop');

    if (categoria) {
      query.andWhere('sop.categoria = :categoria', { categoria });
    }

    if (search) {
      query.andWhere(
        '(sop.titulo ILIKE :search OR sop.codigo ILIKE :search OR sop.procedimento ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('sop.categoria', 'ASC').addOrderBy('sop.codigo', 'ASC');

    return query.getMany();
  }

  async findActive(): Promise<SOP[]> {
    return this.sopRepository.find({
      where: { ativo: true },
      order: {
        categoria: 'ASC',
        codigo: 'ASC',
      },
    });
  }

  async findByCategory(categoria: string): Promise<SOP[]> {
    return this.sopRepository.find({
      where: { categoria, ativo: true },
      order: { codigo: 'ASC' },
    });
  }

  async findById(id: string): Promise<SOP> {
    const sop = await this.sopRepository.findOne({ where: { id } });

    if (!sop) {
      throw new NotFoundException(`SOP ${id} não encontrado`);
    }

    return sop;
  }

  async findByCodigo(codigo: string): Promise<SOP> {
    const sop = await this.sopRepository.findOne({ where: { codigo } });

    if (!sop) {
      throw new NotFoundException(`SOP com código ${codigo} não encontrado`);
    }

    return sop;
  }

  async update(id: string, updateDto: UpdateSopDto): Promise<SOP> {
    const sop = await this.findById(id);

    // If codigo is being changed, check for uniqueness
    if (updateDto.codigo && updateDto.codigo !== sop.codigo) {
      const existing = await this.sopRepository.findOne({
        where: { codigo: updateDto.codigo },
      });

      if (existing) {
        throw new BadRequestException('Código SOP já existe');
      }
    }

    // If procedimento is being updated, increment version
    if (updateDto.procedimento && updateDto.procedimento !== sop.procedimento) {
      updateDto.versao = sop.versao + 1;
    }

    Object.assign(sop, updateDto);
    return this.sopRepository.save(sop);
  }

  async delete(id: string): Promise<void> {
    const sop = await this.findById(id);

    // Just mark as inactive instead of deleting
    sop.ativo = false;
    await this.sopRepository.save(sop);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.sopRepository
      .createQueryBuilder('sop')
      .select('DISTINCT sop.categoria', 'categoria')
      .where('sop.ativo = :ativo', { ativo: true })
      .getRawMany();

    return result.map(r => r.categoria);
  }
}
