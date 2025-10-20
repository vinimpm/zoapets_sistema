import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tenants', { schema: 'public' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'schema_name', unique: true })
  schemaName: string;

  @Column({ name: 'razao_social', nullable: true })
  razaoSocial: string;

  @Column({ unique: true, nullable: true })
  cnpj: string;

  @Column({ type: 'jsonb', nullable: true })
  configuracoes: any;

  @Column()
  status: string; // trial, active, suspended, cancelled

  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'max_users', type: 'integer', default: 5 })
  maxUsers: number;

  @Column({ name: 'max_pets', type: 'integer', default: 100 })
  maxPets: number;

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // ['internacoes', 'estoque', 'financeiro', ...]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
