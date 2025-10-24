import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Turno } from './turno.entity';

@Entity('escalas')
export class Escala {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'funcionario_id' })
  funcionario: User;

  @Column({ name: 'funcionario_id' })
  funcionarioId: string;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ name: 'turno_id' })
  turnoId: string;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'varchar', length: 50, default: 'agendado' })
  status: string; // agendado, confirmado, falta, substituido

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'criado_por_id', nullable: true })
  criadoPorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'criado_por_id' })
  criadoPor: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
