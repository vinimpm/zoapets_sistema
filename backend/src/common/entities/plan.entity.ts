import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanSlug {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

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

  @Column({ name: 'preco_anual', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precoAnual: number;

  // Limites
  @Column({ name: 'max_users', type: 'integer' })
  maxUsers: number;

  @Column({ name: 'max_pets', type: 'integer', nullable: true })
  maxPets: number | null; // null = ilimitado

  @Column({ name: 'max_consultas_mes', type: 'integer', nullable: true })
  maxConsultasMes: number | null;

  // Funcionalidades
  @Column({ name: 'tem_internacoes', default: false })
  temInternacoes: boolean;

  @Column({ name: 'tem_ram', default: false })
  temRam: boolean;

  @Column({ name: 'tem_exames', default: false })
  temExames: boolean;

  @Column({ name: 'tem_estoque', default: false })
  temEstoque: boolean;

  @Column({ name: 'tem_relatorios_avancados', default: false })
  temRelatoriosAvancados: boolean;

  @Column({ name: 'tem_whatsapp', default: false })
  temWhatsapp: boolean;

  @Column({ name: 'tem_api', default: false })
  temApi: boolean;

  @Column({ name: 'tem_personalizacoes', default: false })
  temPersonalizacoes: boolean;

  // Suporte
  @Column({ name: 'nivel_suporte', default: 'email' })
  nivelSuporte: string; // email, prioritario, dedicado, 24x7

  @Column({ name: 'tempo_resposta_suporte', nullable: true })
  tempoRespostaSuporte: string; // 48h, 24h, 12h, imediato

  // Features extras em JSON
  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: false })
  popular: boolean;

  @Column({ name: 'trial_days', type: 'integer', default: 14 })
  trialDays: number;

  @Column({ name: 'ordem_exibicao', type: 'integer', default: 0 })
  ordemExibicao: number;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
