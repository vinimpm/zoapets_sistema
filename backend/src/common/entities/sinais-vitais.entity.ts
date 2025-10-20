import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Internacao } from './internacao.entity';
import { User } from './user.entity';

@Entity('sinais_vitais')
export class SinaisVitais {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Internacao)
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id' })
  internacaoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;

  @Column({ name: 'responsavel_id' })
  responsavelId: string;

  @Column({ name: 'data_hora', type: 'timestamp' })
  dataHora: Date;

  @Column({ name: 'temperatura_c', type: 'decimal', precision: 4, scale: 2, nullable: true })
  temperaturaC: number;

  @Column({ name: 'frequencia_cardiaca', type: 'integer', nullable: true })
  frequenciaCardiaca: number;

  @Column({ name: 'frequencia_respiratoria', type: 'integer', nullable: true })
  frequenciaRespiratoria: number;

  @Column({ name: 'pressao_arterial_sistolica', type: 'integer', nullable: true })
  pressaoArterialSistolica: number;

  @Column({ name: 'pressao_arterial_diastolica', type: 'integer', nullable: true })
  pressaoArterialDiastolica: number;

  @Column({ name: 'spo2', type: 'decimal', precision: 5, scale: 2, nullable: true })
  spo2: number;

  @Column({ name: 'peso_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  pesoKg: number;

  @Column({ name: 'glicemia', type: 'integer', nullable: true })
  glicemia: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
