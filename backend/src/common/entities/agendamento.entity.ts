import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { Procedimento } from './procedimento.entity';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @Column({ name: 'veterinario_id' })
  veterinarioId: string;

  @ManyToOne(() => Procedimento, { nullable: true })
  @JoinColumn({ name: 'procedimento_id' })
  procedimento: Procedimento;

  @Column({ name: 'procedimento_id', nullable: true })
  procedimentoId: string;

  @Column({ name: 'data_hora_inicio', type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ name: 'data_hora_fim', type: 'timestamp' })
  dataHoraFim: Date;

  @Column()
  tipo: string; // consulta, cirurgia, retorno, vacinacao

  @Column()
  status: string; // agendado, confirmado, em_atendimento, concluido, cancelado, falta

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'confirmado_em', type: 'timestamp', nullable: true })
  confirmadoEm: Date;

  @Column({ name: 'lembrete_enviado', default: false })
  lembreteEnviado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
