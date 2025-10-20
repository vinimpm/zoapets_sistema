import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('medicamentos')
export class Medicamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ name: 'principio_ativo' })
  principioAtivo: string;

  @Column()
  fabricante: string;

  @Column({ nullable: true })
  concentracao: string;

  @Column({ name: 'forma_farmaceutica' })
  formaFarmaceutica: string; // comprimido, injetavel, suspensao, etc

  @Column()
  tipo: string; // uso_interno, uso_externo, injetavel

  @Column({ name: 'uso_controlado', default: false })
  usoControlado: boolean;

  @Column({ name: 'registro_anvisa', nullable: true })
  registroAnvisa: string;

  @Column({ type: 'text', array: true, nullable: true })
  indicacoes: string[];

  @Column({ type: 'text', array: true, nullable: true })
  contraindicacoes: string[];

  @Column({ type: 'text', nullable: true })
  posologia: string;

  @Column({ name: 'estoque_minimo', type: 'integer', default: 0 })
  estoqueMinimo: number;

  @Column({ name: 'estoque_atual', type: 'integer', default: 0 })
  estoqueAtual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
