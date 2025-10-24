import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from '@/common/entities/checklist-template.entity';
import { ChecklistItem } from '@/common/entities/checklist-item.entity';
import { ChecklistExecution } from '@/common/entities/checklist-execution.entity';
import { CreateChecklistTemplateDto, UpdateChecklistTemplateDto, ExecuteChecklistItemDto } from './dto';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private checklistTemplateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistItem)
    private checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(ChecklistExecution)
    private checklistExecutionRepository: Repository<ChecklistExecution>,
  ) {}

  // Templates
  async createTemplate(createDto: CreateChecklistTemplateDto): Promise<ChecklistTemplate> {
    const template = this.checklistTemplateRepository.create({
      nome: createDto.nome,
      tipoInternacao: createDto.tipoInternacao,
      descricao: createDto.descricao,
    });

    const savedTemplate = await this.checklistTemplateRepository.save(template);

    if (createDto.itens && createDto.itens.length > 0) {
      const items = createDto.itens.map(item =>
        this.checklistItemRepository.create({
          templateId: savedTemplate.id,
          descricao: item.descricao,
          ordem: item.ordem,
          obrigatorio: item.obrigatorio,
        }),
      );
      await this.checklistItemRepository.save(items);
    }

    return this.findTemplateById(savedTemplate.id);
  }

  async findAllTemplates(tipoInternacao?: string): Promise<ChecklistTemplate[]> {
    const query = this.checklistTemplateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.itens', 'itens')
      .where('template.ativo = :ativo', { ativo: true })
      .orderBy('template.nome', 'ASC')
      .addOrderBy('itens.ordem', 'ASC');

    if (tipoInternacao) {
      query.andWhere('(template.tipoInternacao = :tipo OR template.tipoInternacao IS NULL)', {
        tipo: tipoInternacao,
      });
    }

    return query.getMany();
  }

  async findTemplateById(id: string): Promise<ChecklistTemplate> {
    const template = await this.checklistTemplateRepository.findOne({
      where: { id },
      relations: ['itens'],
      order: {
        itens: {
          ordem: 'ASC',
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template de checklist ${id} não encontrado`);
    }

    return template;
  }

  async updateTemplate(id: string, updateDto: UpdateChecklistTemplateDto): Promise<ChecklistTemplate> {
    const template = await this.findTemplateById(id);

    Object.assign(template, updateDto);
    await this.checklistTemplateRepository.save(template);

    if (updateDto.itens) {
      // Remove old items and create new ones
      await this.checklistItemRepository.delete({ templateId: id });

      const items = updateDto.itens.map(item =>
        this.checklistItemRepository.create({
          templateId: id,
          descricao: item.descricao,
          ordem: item.ordem,
          obrigatorio: item.obrigatorio,
        }),
      );
      await this.checklistItemRepository.save(items);
    }

    return this.findTemplateById(id);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findTemplateById(id);

    // Check if template is being used
    const executions = await this.checklistExecutionRepository.count({
      where: { templateId: id },
    });

    if (executions > 0) {
      // Just mark as inactive instead of deleting
      template.ativo = false;
      await this.checklistTemplateRepository.save(template);
    } else {
      // Safe to delete
      await this.checklistItemRepository.delete({ templateId: id });
      await this.checklistTemplateRepository.remove(template);
    }
  }

  // Executions
  async initializeChecklistForInternacao(internacaoId: string, templateId: string): Promise<ChecklistExecution[]> {
    const template = await this.findTemplateById(templateId);

    if (!template.itens || template.itens.length === 0) {
      throw new BadRequestException('Template não possui itens');
    }

    // Check if already initialized
    const existing = await this.checklistExecutionRepository.count({
      where: { internacaoId, templateId },
    });

    if (existing > 0) {
      throw new BadRequestException('Checklist já inicializado para esta internação');
    }

    const executions = template.itens.map(item =>
      this.checklistExecutionRepository.create({
        internacaoId,
        templateId,
        itemDescricao: item.descricao,
        concluido: false,
      }),
    );

    return this.checklistExecutionRepository.save(executions);
  }

  async getChecklistByInternacao(internacaoId: string): Promise<ChecklistExecution[]> {
    return this.checklistExecutionRepository.find({
      where: { internacaoId },
      relations: ['template', 'executadoPor'],
      order: { dataExecucao: 'DESC' },
    });
  }

  async executeChecklistItem(
    id: string,
    userId: string,
    executeDto: ExecuteChecklistItemDto,
  ): Promise<ChecklistExecution> {
    const execution = await this.checklistExecutionRepository.findOne({
      where: { id: executeDto.executionId },
    });

    if (!execution) {
      throw new NotFoundException('Item de checklist não encontrado');
    }

    execution.concluido = executeDto.concluido;
    execution.observacoes = executeDto.observacoes;
    execution.executadoPorId = userId;
    execution.dataExecucao = new Date();

    return this.checklistExecutionRepository.save(execution);
  }

  async getChecklistProgress(internacaoId: string): Promise<{
    total: number;
    concluidos: number;
    percentual: number;
  }> {
    const executions = await this.checklistExecutionRepository.find({
      where: { internacaoId },
    });

    const total = executions.length;
    const concluidos = executions.filter(e => e.concluido).length;
    const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { total, concluidos, percentual };
  }
}
