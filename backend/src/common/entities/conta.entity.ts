import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';
import { Tutor } from './tutor.entity';
import { Internacao } from './internacao.entity';
import { ContaItem } from './conta-item.entity';
import { Pagamento } from './pagamento.entity';

@Entity('contas')
export class Conta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_conta', unique: true })
  numeroConta: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

  @Column({ name: 'tutor_id' })
  tutorId: string;

  @ManyToOne(() => Internacao, { nullable: true })
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id', nullable: true })
  internacaoId: string;

  @Column({ name: 'data_emissao', type: 'timestamp' })
  dataEmissao: Date;

  @Column({ name: 'data_vencimento', type: 'date' })
  dataVencimento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  desconto: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ name: 'valor_pago', type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorPago: number;

  @Column()
  status: string; // aberta, parcial, paga, vencida, cancelada

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => ContaItem, item => item.conta)
  itens: ContaItem[];

  @OneToMany(() => Pagamento, pagamento => pagamento.conta)
  pagamentos: Pagamento[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
