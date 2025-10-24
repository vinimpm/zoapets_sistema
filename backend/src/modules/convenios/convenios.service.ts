import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convenio } from '@/common/entities/convenio.entity';
import { CreateConvenioDto, UpdateConvenioDto } from './dto';

@Injectable()
export class ConveniosService {
  constructor(
    @InjectRepository(Convenio)
    private convenioRepository: Repository<Convenio>,
  ) {}

  async create(createDto: CreateConvenioDto): Promise<Convenio> {
    const existing = await this.convenioRepository.findOne({
      where: { cnpj: createDto.cnpj },
    });

    if (existing) {
      throw new BadRequestException('CNPJ já cadastrado');
    }

    const convenio = this.convenioRepository.create(createDto);
    return this.convenioRepository.save(convenio);
  }

  async findAll(ativo?: boolean): Promise<Convenio[]> {
    const query = this.convenioRepository.createQueryBuilder('convenio');

    if (ativo !== undefined) {
      query.andWhere('convenio.ativo = :ativo', { ativo });
    }

    query.orderBy('convenio.nome', 'ASC');

    return query.getMany();
  }

  async findActive(): Promise<Convenio[]> {
    return this.convenioRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findById(id: string): Promise<Convenio> {
    const convenio = await this.convenioRepository.findOne({ where: { id } });

    if (!convenio) {
      throw new NotFoundException(`Convênio ${id} não encontrado`);
    }

    return convenio;
  }

  async findByCnpj(cnpj: string): Promise<Convenio> {
    const convenio = await this.convenioRepository.findOne({ where: { cnpj } });

    if (!convenio) {
      throw new NotFoundException(`Convênio com CNPJ ${cnpj} não encontrado`);
    }

    return convenio;
  }

  async update(id: string, updateDto: UpdateConvenioDto): Promise<Convenio> {
    const convenio = await this.findById(id);

    if (updateDto.cnpj && updateDto.cnpj !== convenio.cnpj) {
      const existing = await this.convenioRepository.findOne({
        where: { cnpj: updateDto.cnpj },
      });

      if (existing) {
        throw new BadRequestException('CNPJ já cadastrado');
      }
    }

    Object.assign(convenio, updateDto);
    return this.convenioRepository.save(convenio);
  }

  async delete(id: string): Promise<void> {
    const convenio = await this.findById(id);
    convenio.ativo = false;
    await this.convenioRepository.save(convenio);
  }
}
