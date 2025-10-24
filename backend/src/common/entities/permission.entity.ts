import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nome: string;

  @Column({ type: 'varchar', length: 50 })
  recurso: string; // internacoes, financeiro, medicamentos, etc.

  @Column({ type: 'varchar', length: 20 })
  acao: string; // criar, ler, atualizar, deletar

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @Column({ name: 'tenant_slug', type: 'varchar', length: 50 })
  tenantSlug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
