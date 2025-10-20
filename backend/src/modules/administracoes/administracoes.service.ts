import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Administracao } from '../../common/entities/administracao.entity';
import { PrescricaoItem } from '../../common/entities/prescricao-item.entity';
import { User } from '../../common/entities/user.entity';
import { RegistrarAdministracaoDto, NaoRealizarAdministracaoDto } from './dto';

@Injectable()
export class AdministracoesService {
  constructor(
    @InjectRepository(Administracao)
    private administracoesRepository: Repository<Administracao>,
    @InjectRepository(PrescricaoItem)
    private prescricaoItensRepository: Repository<PrescricaoItem>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(status?: string, internacaoId?: string): Promise<Administracao[]> {
    const queryBuilder = this.administracoesRepository
      .createQueryBuilder('administracao')
      .leftJoinAndSelect('administracao.prescricaoItem', 'prescricaoItem')
      .leftJoinAndSelect('prescricaoItem.medicamento', 'medicamento')
      .leftJoinAndSelect('prescricaoItem.prescricao', 'prescricao')
      .leftJoinAndSelect('prescricao.pet', 'pet')
      .leftJoinAndSelect('prescricao.internacao', 'internacao')
      .leftJoinAndSelect('administracao.responsavel', 'responsavel');

    if (status) {
      queryBuilder.andWhere('administracao.status = :status', { status });
    }

    if (internacaoId) {
      queryBuilder.andWhere('prescricao.internacaoId = :internacaoId', { internacaoId });
    }

    return queryBuilder
      .orderBy('administracao.dataHoraPrevista', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Administracao> {
    const administracao = await this.administracoesRepository.findOne({
      where: { id },
      relations: [
        'prescricaoItem',
        'prescricaoItem.medicamento',
        'prescricaoItem.prescricao',
        'prescricaoItem.prescricao.pet',
        'prescricaoItem.prescricao.internacao',
        'responsavel',
      ],
    });

    if (!administracao) {
      throw new NotFoundException(`Administração com ID ${id} não encontrada`);
    }

    return administracao;
  }

  async findPendentes(): Promise<Administracao[]> {
    return this.administracoesRepository.find({
      where: { status: 'pendente' },
      relations: [
        'prescricaoItem',
        'prescricaoItem.medicamento',
        'prescricaoItem.prescricao',
        'prescricaoItem.prescricao.pet',
        'prescricaoItem.prescricao.internacao',
      ],
      order: { dataHoraPrevista: 'ASC' },
    });
  }

  async findAtrasadas(): Promise<Administracao[]> {
    const now = new Date();

    return this.administracoesRepository.find({
      where: {
        status: 'pendente',
        dataHoraPrevista: LessThan(now),
      },
      relations: [
        'prescricaoItem',
        'prescricaoItem.medicamento',
        'prescricaoItem.prescricao',
        'prescricaoItem.prescricao.pet',
        'prescricaoItem.prescricao.internacao',
      ],
      order: { dataHoraPrevista: 'ASC' },
    });
  }

  async findProximas(horas: number = 2): Promise<Administracao[]> {
    const now = new Date();
    const future = new Date(now.getTime() + horas * 60 * 60 * 1000);

    return this.administracoesRepository.find({
      where: {
        status: 'pendente',
        dataHoraPrevista: Between(now, future),
      },
      relations: [
        'prescricaoItem',
        'prescricaoItem.medicamento',
        'prescricaoItem.prescricao',
        'prescricaoItem.prescricao.pet',
        'prescricaoItem.prescricao.internacao',
      ],
      order: { dataHoraPrevista: 'ASC' },
    });
  }

  async registrar(id: string, dto: RegistrarAdministracaoDto): Promise<Administracao> {
    const administracao = await this.findOne(id);

    if (administracao.status !== 'pendente' && administracao.status !== 'atrasado') {
      throw new BadRequestException('Esta administração já foi finalizada');
    }

    // Verify responsible user exists
    const responsavel = await this.usersRepository.findOne({
      where: { id: dto.responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException(`Usuário com ID ${dto.responsavelId} não encontrado`);
    }

    administracao.status = 'realizado';
    administracao.dataHoraRealizada = new Date(dto.dataHoraRealizada);
    administracao.responsavelId = dto.responsavelId;
    administracao.observacoes = dto.observacoes;

    return this.administracoesRepository.save(administracao);
  }

  async naoRealizar(id: string, dto: NaoRealizarAdministracaoDto): Promise<Administracao> {
    const administracao = await this.findOne(id);

    if (administracao.status !== 'pendente' && administracao.status !== 'atrasado') {
      throw new BadRequestException('Esta administração já foi finalizada');
    }

    // Verify responsible user exists
    const responsavel = await this.usersRepository.findOne({
      where: { id: dto.responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException(`Usuário com ID ${dto.responsavelId} não encontrado`);
    }

    administracao.status = 'nao_realizado';
    administracao.motivoNaoRealizado = dto.motivoNaoRealizado;
    administracao.responsavelId = dto.responsavelId;

    return this.administracoesRepository.save(administracao);
  }

  async updateStatusAtrasadas(): Promise<number> {
    const now = new Date();

    const result = await this.administracoesRepository.update(
      {
        status: 'pendente',
        dataHoraPrevista: LessThan(now),
      },
      { status: 'atrasado' }
    );

    return result.affected || 0;
  }

  async getResumo(internacaoId?: string): Promise<any> {
    const queryBuilder = this.administracoesRepository.createQueryBuilder('administracao');

    if (internacaoId) {
      queryBuilder
        .leftJoin('administracao.prescricaoItem', 'prescricaoItem')
        .leftJoin('prescricaoItem.prescricao', 'prescricao')
        .where('prescricao.internacaoId = :internacaoId', { internacaoId });
    }

    const total = await queryBuilder.getCount();

    const pendentes = await queryBuilder.clone()
      .andWhere('administracao.status = :status', { status: 'pendente' })
      .getCount();

    const atrasadas = await queryBuilder.clone()
      .andWhere('administracao.status = :status', { status: 'atrasado' })
      .getCount();

    const realizadas = await queryBuilder.clone()
      .andWhere('administracao.status = :status', { status: 'realizado' })
      .getCount();

    const naoRealizadas = await queryBuilder.clone()
      .andWhere('administracao.status = :status', { status: 'nao_realizado' })
      .getCount();

    return {
      total,
      pendentes,
      atrasadas,
      realizadas,
      naoRealizadas,
      taxaAdesao: total > 0 ? ((realizadas / (realizadas + naoRealizadas)) * 100).toFixed(2) : 0,
    };
  }
}
