import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Procedimento } from './procedimento.entity';
import { Internacao } from './internacao.entity';
import { Pet } from './pet.entity';
import { User } from './user.entity';

@Entity('procedimentos_realizados')
export class ProcedimentoRealizado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Procedimento)
  @JoinColumn({ name: 'procedimento_id' })
  procedimento: Procedimento;

  @Column({ name: 'procedimento_id' })
  procedimentoId: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Internacao, { nullable: true })
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id', nullable: true })
  internacaoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_responsavel_id' })
  veterinarioResponsavel: User;

  @Column({ name: 'veterinario_responsavel_id' })
  veterinarioResponsavelId: string;

  @Column({ name: 'data_hora_inicio', type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ name: 'data_hora_fim', type: 'timestamp', nullable: true })
  dataHoraFim: Date;

  @Column()
  status: string; // agendado, em_andamento, concluido, cancelado

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valor: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
