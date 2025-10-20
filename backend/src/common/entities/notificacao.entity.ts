import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('notificacoes')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  tipo: string; // medicacao_atrasada, exame_pronto, alta_prevista, pagamento_vencido

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  mensagem: string;

  @Column({ type: 'jsonb', nullable: true })
  dados: any; // { internacaoId: '...', petNome: '...' }

  @Column({ default: false })
  lida: boolean;

  @Column({ name: 'lida_em', type: 'timestamp', nullable: true })
  lidaEm: Date;

  @Column({ nullable: true })
  url: string;

  @Column({ default: 'info' })
  prioridade: string; // info, warning, error, success

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
