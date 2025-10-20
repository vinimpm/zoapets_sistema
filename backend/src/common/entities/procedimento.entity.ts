import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('procedimentos')
export class Procedimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nome: string;

  @Column()
  categoria: string; // cirurgia, exame, consulta, vacinacao, etc

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ name: 'duracao_estimada_min', type: 'integer', nullable: true })
  duracaoEstimadaMin: number;

  @Column({ name: 'requer_anestesia', default: false })
  requerAnestesia: boolean;

  @Column({ name: 'requer_internacao', default: false })
  requerInternacao: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
