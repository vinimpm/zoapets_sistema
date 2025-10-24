import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';

@Entity('internacoes')
export class Internacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, pet => pet.internacoes)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'medico_responsavel_id' })
  medicoResponsavel: User;

  @Column({ name: 'medico_responsavel_id' })
  medicoResponsavelId: string;

  @Column({ name: 'data_entrada', type: 'timestamp' })
  dataEntrada: Date;

  @Column({ name: 'data_alta', type: 'timestamp', nullable: true })
  dataAlta: Date;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ name: 'diagnostico_inicial', type: 'text', nullable: true })
  diagnosticoInicial: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column()
  tipo: string; // clinica, cirurgica, urgencia

  @Column()
  status: string; // aguardando, em_andamento, alta, obito

  @Column({ nullable: true })
  leito: string;

  @Column({ default: false })
  isolamento: boolean;

  @Column()
  prioridade: string; // baixa, media, alta, critica

  @Column({ name: 'custo_total', type: 'decimal', precision: 10, scale: 2, nullable: true })
  custoTotal: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
