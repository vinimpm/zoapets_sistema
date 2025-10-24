import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Internacao } from './internacao.entity';
import { ChecklistTemplate } from './checklist-template.entity';
import { User } from './user.entity';

@Entity('checklist_executions')
export class ChecklistExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Internacao)
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id' })
  internacaoId: string;

  @ManyToOne(() => ChecklistTemplate)
  @JoinColumn({ name: 'template_id' })
  template: ChecklistTemplate;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ name: 'item_descricao' })
  itemDescricao: string;

  @Column({ default: false })
  concluido: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'executado_por_id' })
  executadoPor: User;

  @Column({ name: 'executado_por_id', nullable: true })
  executadoPorId: string;

  @CreateDateColumn({ name: 'data_execucao', nullable: true })
  dataExecucao: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;
}
