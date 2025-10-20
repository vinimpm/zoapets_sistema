import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_flags', { schema: 'public' })
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  chave: string;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'habilitado_global', default: false })
  habilitadoGlobal: boolean;

  @Column({ name: 'tenants_habilitados', type: 'jsonb', nullable: true })
  tenantsHabilitados: string[]; // Array de tenant IDs

  @Column({ type: 'jsonb', nullable: true })
  configuracao: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
