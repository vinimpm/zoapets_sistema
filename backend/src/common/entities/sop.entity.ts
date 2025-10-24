import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sops')
export class SOP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  codigo: string;

  @Column()
  categoria: string; // higienizacao, coleta, descarte, cirurgia

  @Column({ type: 'text' })
  procedimento: string;

  @Column({ type: 'text', nullable: true })
  materiais: string;

  @Column({ type: 'integer', default: 1 })
  versao: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
