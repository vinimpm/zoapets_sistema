import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescricao } from '../../common/entities/prescricao.entity';
import { PrescricaoItem } from '../../common/entities/prescricao-item.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';
import { Medicamento } from '../../common/entities/medicamento.entity';
import { Administracao } from '../../common/entities/administracao.entity';
import { CreatePrescricaoDto, UpdatePrescricaoDto } from './dto';

@Injectable()
export class PrescricoesService {
  constructor(
    @InjectRepository(Prescricao)
    private prescricoesRepository: Repository<Prescricao>,
    @InjectRepository(PrescricaoItem)
    private prescricaoItensRepository: Repository<PrescricaoItem>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Medicamento)
    private medicamentosRepository: Repository<Medicamento>,
    @InjectRepository(Administracao)
    private administracoesRepository: Repository<Administracao>,
  ) {}

  async create(createPrescricaoDto: CreatePrescricaoDto): Promise<Prescricao> {
    // Verify pet exists
    const pet = await this.petsRepository.findOne({
      where: { id: createPrescricaoDto.petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${createPrescricaoDto.petId} não encontrado`);
    }

    // Verify veterinarian exists
    const veterinario = await this.usersRepository.findOne({
      where: { id: createPrescricaoDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinário com ID ${createPrescricaoDto.veterinarioId} não encontrado`);
    }

    // Create prescription
    const prescricao = this.prescricoesRepository.create({
      petId: createPrescricaoDto.petId,
      veterinarioId: createPrescricaoDto.veterinarioId,
      internacaoId: createPrescricaoDto.internacaoId,
      dataPrescricao: new Date(createPrescricaoDto.dataPrescricao),
      dataValidade: new Date(createPrescricaoDto.dataValidade),
      status: 'ativa',
      observacoes: createPrescricaoDto.observacoes,
    });

    const savedPrescricao = await this.prescricoesRepository.save(prescricao);

    // Create prescription items and schedule administrations
    for (const itemDto of createPrescricaoDto.itens) {
      const medicamento = await this.medicamentosRepository.findOne({
        where: { id: itemDto.medicamentoId },
      });

      if (!medicamento) {
        throw new NotFoundException(`Medicamento com ID ${itemDto.medicamentoId} não encontrado`);
      }

      const item = this.prescricaoItensRepository.create({
        prescricaoId: savedPrescricao.id,
        medicamentoId: itemDto.medicamentoId,
        dose: itemDto.dose,
        viaAdministracao: itemDto.viaAdministracao,
        frequencia: itemDto.frequencia,
        duracaoDias: itemDto.duracaoDias,
        horarios: itemDto.horarios,
        instrucoes: itemDto.instrucoes,
        ativo: true,
      });

      const savedItem = await this.prescricaoItensRepository.save(item);

      // Schedule administrations
      await this.scheduleAdministracoes(savedItem, new Date(createPrescricaoDto.dataPrescricao));
    }

    return this.findOne(savedPrescricao.id);
  }

  private async scheduleAdministracoes(item: PrescricaoItem, dataInicio: Date): Promise<void> {
    const administracoes: Administracao[] = [];

    for (let dia = 0; dia < item.duracaoDias; dia++) {
      for (const horario of item.horarios) {
        const [hora, minuto] = horario.split(':').map(Number);
        const dataHoraPrevista = new Date(dataInicio);
        dataHoraPrevista.setDate(dataInicio.getDate() + dia);
        dataHoraPrevista.setHours(hora, minuto, 0, 0);

        const administracao = this.administracoesRepository.create({
          prescricaoItemId: item.id,
          dataHoraPrevista,
          status: 'pendente',
        });

        administracoes.push(administracao);
      }
    }

    await this.administracoesRepository.save(administracoes);
  }

  async findAll(status?: string, petId?: string): Promise<Prescricao[]> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (petId) {
      where.petId = petId;
    }

    return this.prescricoesRepository.find({
      where,
      relations: ['pet', 'veterinario', 'itens', 'itens.medicamento', 'internacao'],
      order: { dataPrescricao: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Prescricao> {
    const prescricao = await this.prescricoesRepository.findOne({
      where: { id },
      relations: ['pet', 'veterinario', 'itens', 'itens.medicamento', 'itens.administracoes', 'internacao'],
    });

    if (!prescricao) {
      throw new NotFoundException(`Prescrição com ID ${id} não encontrada`);
    }

    return prescricao;
  }

  async findByPet(petId: string): Promise<Prescricao[]> {
    return this.prescricoesRepository.find({
      where: { petId },
      relations: ['veterinario', 'itens', 'itens.medicamento'],
      order: { dataPrescricao: 'DESC' },
    });
  }

  async findByInternacao(internacaoId: string): Promise<Prescricao[]> {
    return this.prescricoesRepository.find({
      where: { internacaoId },
      relations: ['pet', 'veterinario', 'itens', 'itens.medicamento'],
      order: { dataPrescricao: 'DESC' },
    });
  }

  async update(id: string, updatePrescricaoDto: UpdatePrescricaoDto): Promise<Prescricao> {
    const prescricao = await this.findOne(id);

    Object.assign(prescricao, updatePrescricaoDto);
    await this.prescricoesRepository.save(prescricao);

    return this.findOne(id);
  }

  async suspender(id: string): Promise<Prescricao> {
    const prescricao = await this.findOne(id);
    prescricao.status = 'suspensa';

    // Cancel all pending administrations
    await this.administracoesRepository.update(
      {
        prescricaoItem: { prescricaoId: id },
        status: 'pendente'
      },
      { status: 'nao_realizado', motivoNaoRealizado: 'Prescrição suspensa' }
    );

    return this.prescricoesRepository.save(prescricao);
  }

  async reativar(id: string): Promise<Prescricao> {
    const prescricao = await this.findOne(id);
    prescricao.status = 'ativa';
    return this.prescricoesRepository.save(prescricao);
  }

  async remove(id: string): Promise<void> {
    const prescricao = await this.findOne(id);
    await this.prescricoesRepository.remove(prescricao);
  }
}
