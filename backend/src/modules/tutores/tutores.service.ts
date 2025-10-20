import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tutor } from '../../common/entities/tutor.entity';
import { CreateTutorDto, UpdateTutorDto } from './dto';

@Injectable()
export class TutoresService {
  constructor(
    @InjectRepository(Tutor)
    private tutoresRepository: Repository<Tutor>,
  ) {}

  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    // Check if CPF already exists
    const existingTutor = await this.tutoresRepository.findOne({
      where: { cpf: createTutorDto.cpf },
    });

    if (existingTutor) {
      throw new ConflictException('CPF já está cadastrado');
    }

    const tutor = this.tutoresRepository.create(createTutorDto);
    return this.tutoresRepository.save(tutor);
  }

  async findAll(search?: string): Promise<Tutor[]> {
    if (search) {
      return this.tutoresRepository.find({
        where: [
          { nomeCompleto: ILike(`%${search}%`) },
          { cpf: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ],
        relations: ['pets'],
        order: { nomeCompleto: 'ASC' },
      });
    }

    return this.tutoresRepository.find({
      relations: ['pets'],
      order: { nomeCompleto: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tutor> {
    const tutor = await this.tutoresRepository.findOne({
      where: { id },
      relations: ['pets'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${id} não encontrado`);
    }

    return tutor;
  }

  async findByCpf(cpf: string): Promise<Tutor> {
    const tutor = await this.tutoresRepository.findOne({
      where: { cpf },
      relations: ['pets'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com CPF ${cpf} não encontrado`);
    }

    return tutor;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto): Promise<Tutor> {
    const tutor = await this.findOne(id);

    // Check if CPF is being changed and is already in use
    if (updateTutorDto.cpf && updateTutorDto.cpf !== tutor.cpf) {
      const existingTutor = await this.tutoresRepository.findOne({
        where: { cpf: updateTutorDto.cpf },
      });

      if (existingTutor) {
        throw new ConflictException('CPF já está cadastrado');
      }
    }

    Object.assign(tutor, updateTutorDto);
    return this.tutoresRepository.save(tutor);
  }

  async remove(id: string): Promise<void> {
    const tutor = await this.findOne(id);
    await this.tutoresRepository.remove(tutor);
  }
}
