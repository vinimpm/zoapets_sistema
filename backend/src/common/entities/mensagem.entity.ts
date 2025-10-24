import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('mensagens')
export class Mensagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'remetente_id' })
  remetente: User;

  @Column({ name: 'remetente_id' })
  remetenteId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'destinatario_id' })
  destinatario: User;

  @Column({ name: 'destinatario_id' })
  destinatarioId: string;

  @Column({ type: 'text' })
  conteudo: string;

  @Column({ default: false })
  lida: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
