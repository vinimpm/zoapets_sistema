import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nome: string;

  @Column()
  categoria: string; // medicamento, material_cirurgico, alimento, higiene, etc

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ nullable: true })
  fabricante: string;

  @Column({ nullable: true })
  lote: string;

  @Column({ name: 'data_validade', type: 'date', nullable: true })
  dataValidade: Date;

  @Column()
  unidade: string; // unidade, caixa, frasco, kg, ml

  @Column({ name: 'estoque_minimo', type: 'integer', default: 0 })
  estoqueMinimo: number;

  @Column({ name: 'estoque_atual', type: 'integer', default: 0 })
  estoqueAtual: number;

  @Column({ name: 'preco_custo', type: 'decimal', precision: 10, scale: 2 })
  precoCusto: number;

  @Column({ name: 'preco_venda', type: 'decimal', precision: 10, scale: 2 })
  precoVenda: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
