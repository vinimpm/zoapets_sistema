import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { Tutor } from './tutor.entity';

@Entity('consultas')
export class Consulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @Column({ name: 'veterinario_id' })
  veterinarioId: string;

  @Column({ name: 'agendamento_id', nullable: true })
  agendamentoId: string;

  @Column()
  tipo: string; // ambulatorial, emergencia, retorno

  @Column({ name: 'data_atendimento', type: 'timestamp' })
  dataAtendimento: Date;

  // Anamnese
  @Column({ name: 'queixa_principal', type: 'text' })
  queixaPrincipal: string;

  @Column({ type: 'text', nullable: true })
  historico: string;

  // Exame Físico
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatura: number;

  @Column({ name: 'frequencia_cardiaca', nullable: true })
  frequenciaCardiaca: number;

  @Column({ name: 'frequencia_respiratoria', nullable: true })
  frequenciaRespiratoria: number;

  @Column({ nullable: true })
  tpc: string; // <2s, >2s

  @Column({ nullable: true })
  mucosas: string; // rosadas, pálidas, cianóticas, ictéricas

  @Column({ nullable: true })
  hidratacao: string; // normal, desidratado leve, moderado, grave

  @Column({ type: 'text', nullable: true })
  ausculta: string;

  @Column({ type: 'text', nullable: true })
  palpacao: string;

  @Column({ name: 'exame_fisico_obs', type: 'text', nullable: true })
  exameFisicoObs: string;

  // Diagnóstico e Conduta
  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  conduta: string;

  @Column({ type: 'text', nullable: true })
  orientacoes: string;

  // Status e Controle
  @Column()
  status: string; // em_atendimento, concluida, gerou_internacao

  @Column({ name: 'internacao_id', nullable: true })
  internacaoId: string;

  @Column({ name: 'custo_total', type: 'decimal', precision: 10, scale: 2, nullable: true })
  custoTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
