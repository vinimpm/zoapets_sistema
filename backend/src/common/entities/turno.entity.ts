import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string; // Manhã, Tarde, Noite, Plantão 24h

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string; // '08:00:00'

  @Column({ name: 'hora_fim', type: 'time' })
  horaFim: string; // '14:00:00'

  @Column({ type: 'integer', default: 6 })
  duracao: number; // Duração em horas

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
