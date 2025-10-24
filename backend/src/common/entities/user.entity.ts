import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome' })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'senha' })
  senhaHash: string;

  @Column({ unique: true, nullable: true })
  cpf: string;

  @Column({ nullable: true })
  crmv: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  cargo: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'ultimo_acesso', type: 'timestamp', nullable: true })
  ultimoAcesso: Date;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash: string | null;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
