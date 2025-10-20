import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Internacao } from './internacao.entity';
import { User } from './user.entity';

@Entity('evolucoes')
export class Evolucao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Internacao)
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id' })
  internacaoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @Column({ name: 'veterinario_id' })
  veterinarioId: string;

  @Column({ name: 'data_hora', type: 'timestamp' })
  dataHora: Date;

  @Column({ type: 'text' })
  relato: string;

  @Column({ name: 'estado_geral', nullable: true })
  estadoGeral: string; // excelente, bom, regular, ruim, critico

  @Column({ nullable: true })
  alimentacao: string; // normal, reduzida, nao_se_alimentou

  @Column({ nullable: true })
  hidratacao: string; // normal, desidratado_leve, desidratado_moderado, desidratado_grave

  @Column({ nullable: true })
  consciencia: string; // alerta, letargico, estuporoso, comatoso

  @Column({ nullable: true })
  deambulacao: string; // normal, claudicante, decubito

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
