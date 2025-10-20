import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plans', { schema: 'public' })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'preco_mensal', type: 'decimal', precision: 10, scale: 2 })
  precoMensal: number;

  @Column({ name: 'preco_anual', type: 'decimal', precision: 10, scale: 2 })
  precoAnual: number;

  @Column({ name: 'max_users', type: 'integer' })
  maxUsers: number;

  @Column({ name: 'max_pets', type: 'integer' })
  maxPets: number;

  @Column({ type: 'jsonb' })
  features: string[];

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: false })
  popular: boolean;

  @Column({ name: 'trial_days', type: 'integer', default: 14 })
  trialDays: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
