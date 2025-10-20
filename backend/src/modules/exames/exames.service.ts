import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultadoExame } from '../../common/entities/resultado-exame.entity';
import { Exame } from '../../common/entities/exame.entity';
import { Pet } from '../../common/entities/pet.entity';
import { User } from '../../common/entities/user.entity';
import { CreateResultadoExameDto, UpdateResultadoExameDto } from './dto';

@Injectable()
export class ExamesService {
  constructor(
    @InjectRepository(ResultadoExame)
    private resultadosRepository: Repository<ResultadoExame>,
    @InjectRepository(Exame)
    private examesRepository: Repository<Exame>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createResultado(createDto: CreateResultadoExameDto): Promise<ResultadoExame> {
    // Verify exame exists
    const exame = await this.examesRepository.findOne({
      where: { id: createDto.exameId },
    });

    if (!exame) {
      throw new NotFoundException(`Exame com ID ${createDto.exameId} não encontrado`);
    }

    // Verify pet exists
    const pet = await this.petsRepository.findOne({
      where: { id: createDto.petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet com ID ${createDto.petId} não encontrado`);
    }

    // Verify veterinarian exists
    const veterinario = await this.usersRepository.findOne({
      where: { id: createDto.veterinarioSolicitanteId },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinário com ID ${createDto.veterinarioSolicitanteId} não encontrado`);
    }

    const resultado = this.resultadosRepository.create({
      ...createDto,
      dataSolicitacao: new Date(createDto.dataSolicitacao),
      dataResultado: createDto.dataResultado ? new Date(createDto.dataResultado) : undefined,
    });

    return this.resultadosRepository.save(resultado);
  }

  async findAllResultados(params?: { petId?: string; internacaoId?: string; status?: string }): Promise<ResultadoExame[]> {
    const where: any = {};

    if (params?.petId) {
      where.petId = params.petId;
    }

    if (params?.internacaoId) {
      where.internacaoId = params.internacaoId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    return this.resultadosRepository.find({
      where,
      relations: ['exame', 'pet', 'veterinarioSolicitante', 'internacao'],
      order: { dataSolicitacao: 'DESC' },
    });
  }

  async findOneResultado(id: string): Promise<ResultadoExame> {
    const resultado = await this.resultadosRepository.findOne({
      where: { id },
      relations: ['exame', 'pet', 'pet.tutor', 'veterinarioSolicitante', 'internacao'],
    });

    if (!resultado) {
      throw new NotFoundException(`Resultado de exame com ID ${id} não encontrado`);
    }

    return resultado;
  }

  async updateResultado(id: string, updateDto: UpdateResultadoExameDto): Promise<ResultadoExame> {
    const resultado = await this.findOneResultado(id);

    if (updateDto.dataSolicitacao) {
      updateDto['dataSolicitacao'] = new Date(updateDto.dataSolicitacao);
    }

    if (updateDto.dataResultado) {
      updateDto['dataResultado'] = new Date(updateDto.dataResultado);
    }

    Object.assign(resultado, updateDto);
    return this.resultadosRepository.save(resultado);
  }

  async registrarResultado(id: string, valores: any, interpretacao?: string): Promise<ResultadoExame> {
    const resultado = await this.findOneResultado(id);

    resultado.valores = valores;
    resultado.interpretacao = interpretacao;
    resultado.dataResultado = new Date();
    resultado.status = 'concluido';

    return this.resultadosRepository.save(resultado);
  }

  async cancelarExame(id: string, motivo: string): Promise<ResultadoExame> {
    const resultado = await this.findOneResultado(id);

    resultado.status = 'cancelado';
    resultado.observacoes = resultado.observacoes
      ? `${resultado.observacoes}\n\nCancelado: ${motivo}`
      : `Cancelado: ${motivo}`;

    return this.resultadosRepository.save(resultado);
  }

  async removeResultado(id: string): Promise<void> {
    const resultado = await this.findOneResultado(id);
    await this.resultadosRepository.remove(resultado);
  }

  // Catálogo de Exames
  async findAllExames(): Promise<Exame[]> {
    return this.examesRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOneExame(id: string): Promise<Exame> {
    const exame = await this.examesRepository.findOne({
      where: { id },
    });

    if (!exame) {
      throw new NotFoundException(`Exame com ID ${id} não encontrado`);
    }

    return exame;
  }
}
