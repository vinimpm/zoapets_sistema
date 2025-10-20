import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PrescricaoItem } from './prescricao-item.entity';
import { User } from './user.entity';

@Entity('administracoes')
export class Administracao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PrescricaoItem, item => item.administracoes)
  @JoinColumn({ name: 'prescricao_item_id' })
  prescricaoItem: PrescricaoItem;

  @Column({ name: 'prescricao_item_id' })
  prescricaoItemId: string;

  @Column({ name: 'data_hora_prevista', type: 'timestamp' })
  dataHoraPrevista: Date;

  @Column({ name: 'data_hora_realizada', type: 'timestamp', nullable: true })
  dataHoraRealizada: Date;

  @Column()
  status: string; // pendente, realizado, atrasado, nao_realizado

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'motivo_nao_realizado', nullable: true })
  motivoNaoRealizado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
