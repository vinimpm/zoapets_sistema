import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Produto } from './produto.entity';
import { User } from './user.entity';

@Entity('movimentacoes_estoque')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: string;

  @Column()
  tipo: string; // entrada, saida, ajuste, devolucao

  @Column({ type: 'integer' })
  quantidade: number;

  @Column({ name: 'estoque_anterior', type: 'integer' })
  estoqueAnterior: number;

  @Column({ name: 'estoque_novo', type: 'integer' })
  estoqueNovo: number;

  @Column()
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;

  @Column({ name: 'responsavel_id' })
  responsavelId: string;

  @Column({ name: 'documento_referencia', nullable: true })
  documentoReferencia: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
