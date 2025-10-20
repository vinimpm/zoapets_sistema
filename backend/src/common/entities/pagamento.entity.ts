import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conta } from './conta.entity';
import { User } from './user.entity';

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conta, conta => conta.pagamentos)
  @JoinColumn({ name: 'conta_id' })
  conta: Conta;

  @Column({ name: 'conta_id' })
  contaId: string;

  @Column({ name: 'data_pagamento', type: 'timestamp' })
  dataPagamento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ name: 'forma_pagamento' })
  formaPagamento: string; // dinheiro, cartao_credito, cartao_debito, pix, boleto

  @Column({ nullable: true })
  parcelas: number;

  @Column({ name: 'transacao_id', nullable: true })
  transacaoId: string;

  @Column()
  status: string; // pendente, aprovado, recusado, cancelado

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;

  @Column({ name: 'responsavel_id' })
  responsavelId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
