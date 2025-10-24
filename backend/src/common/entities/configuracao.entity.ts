import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('configuracoes')
export class Configuracao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_clinica', type: 'varchar', length: 200 })
  nomeClinica: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ name: 'horario_atendimento', type: 'text', nullable: true })
  horarioAtendimento: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cnpj: string;

  @Column({ name: 'site_url', type: 'varchar', length: 200, nullable: true })
  siteUrl: string;

  @Column({ name: 'whatsapp', type: 'varchar', length: 20, nullable: true })
  whatsapp: string;

  @Column({ name: 'facebook_url', type: 'varchar', length: 200, nullable: true })
  facebookUrl: string;

  @Column({ name: 'instagram_url', type: 'varchar', length: 200, nullable: true })
  instagramUrl: string;

  @Column({ name: 'notificacoes_email', type: 'boolean', default: true })
  notificacoesEmail: boolean;

  @Column({ name: 'notificacoes_sms', type: 'boolean', default: false })
  notificacoesSms: boolean;

  @Column({ name: 'notificacoes_whatsapp', type: 'boolean', default: true })
  notificacoesWhatsapp: boolean;

  @Column({ name: 'tenant_slug', type: 'varchar', length: 50 })
  tenantSlug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
