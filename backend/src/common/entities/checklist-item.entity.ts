import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';

@Entity('checklist_itens')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChecklistTemplate, template => template.itens)
  @JoinColumn({ name: 'template_id' })
  template: ChecklistTemplate;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column()
  descricao: string;

  @Column({ type: 'integer' })
  ordem: number;

  @Column({ default: false })
  obrigatorio: boolean;
}
