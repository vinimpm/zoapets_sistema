import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChecklistItem } from './checklist-item.entity';

@Entity('checklist_templates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ name: 'tipo_internacao', nullable: true })
  tipoInternacao: string; // cirurgia, clinica, emergencia

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @OneToMany(() => ChecklistItem, item => item.template)
  itens: ChecklistItem[];

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
