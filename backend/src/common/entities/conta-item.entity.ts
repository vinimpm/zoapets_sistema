import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conta } from './conta.entity';

@Entity('conta_itens')
export class ContaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conta, conta => conta.itens)
  @JoinColumn({ name: 'conta_id' })
  conta: Conta;

  @Column({ name: 'conta_id' })
  contaId: string;

  @Column()
  tipo: string; // procedimento, medicamento, diaria, exame, etc

  @Column({ name: 'item_referencia_id', nullable: true })
  itemReferenciaId: string; // ID do procedimento, medicamento, etc

  @Column()
  descricao: string;

  @Column({ type: 'integer', default: 1 })
  quantidade: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 10, scale: 2 })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'date' })
  data: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
