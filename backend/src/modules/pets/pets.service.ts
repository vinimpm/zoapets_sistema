import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Pet } from '../../common/entities/pet.entity';
import { Tutor } from '../../common/entities/tutor.entity';
import { CreatePetDto, UpdatePetDto } from './dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(Tutor)
    private tutoresRepository: Repository<Tutor>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    // Check if tutor exists
    const tutor = await this.tutoresRepository.findOne({
      where: { id: createPetDto.tutorId },
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${createPetDto.tutorId} não encontrado`);
    }

    // Check if microchip is unique
    if (createPetDto.microchip) {
      const existingPet = await this.petsRepository.findOne({
        where: { microchip: createPetDto.microchip },
      });

      if (existingPet) {
        throw new ConflictException('Microchip já está cadastrado');
      }
    }

    const pet = this.petsRepository.create({
      ...createPetDto,
      tutor,
    });

    return this.petsRepository.save(pet);
  }

  async findAll(search?: string, tutorId?: string): Promise<Pet[]> {
    const where: any = {};

    if (tutorId) {
      where.tutorId = tutorId;
    }

    if (search) {
      return this.petsRepository.find({
        where: [
          { ...where, nome: ILike(`%${search}%`) },
          { ...where, microchip: ILike(`%${search}%`) },
        ],
        relations: ['tutor', 'internacoes'],
        order: { nome: 'ASC' },
      });
    }

    return this.petsRepository.find({
      where: tutorId ? { tutorId } : {},
      relations: ['tutor', 'internacoes'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id },
      relations: ['tutor', 'internacoes'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${id} não encontrado`);
    }

    return pet;
  }

  async findByMicrochip(microchip: string): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { microchip },
      relations: ['tutor'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet com microchip ${microchip} não encontrado`);
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);

    // Check if microchip is being changed and is already in use
    if (updatePetDto.microchip && updatePetDto.microchip !== pet.microchip) {
      const existingPet = await this.petsRepository.findOne({
        where: { microchip: updatePetDto.microchip },
      });

      if (existingPet) {
        throw new ConflictException('Microchip já está cadastrado');
      }
    }

    // If tutorId is being changed, verify new tutor exists
    if (updatePetDto.tutorId && updatePetDto.tutorId !== pet.tutorId) {
      const tutor = await this.tutoresRepository.findOne({
        where: { id: updatePetDto.tutorId },
      });

      if (!tutor) {
        throw new NotFoundException(`Tutor com ID ${updatePetDto.tutorId} não encontrado`);
      }
    }

    Object.assign(pet, updatePetDto);
    return this.petsRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const pet = await this.findOne(id);
    await this.petsRepository.remove(pet);
  }

  async deactivate(id: string): Promise<Pet> {
    const pet = await this.findOne(id);
    pet.ativo = false;
    return this.petsRepository.save(pet);
  }

  async activate(id: string): Promise<Pet> {
    const pet = await this.findOne(id);
    pet.ativo = true;
    return this.petsRepository.save(pet);
  }
}
