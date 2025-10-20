import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('tutores')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_completo' })
  nomeCompleto: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  rg: string;

  @Column()
  email: string;

  @Column({ name: 'telefone_principal' })
  telefonePrincipal: string;

  @Column({ name: 'telefone_secundario', nullable: true })
  telefoneSecundario: string;

  @Column({ name: 'endereco_completo', type: 'jsonb', nullable: true })
  enderecoCompleto: any;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ nullable: true })
  profissao: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => Pet, pet => pet.tutor)
  pets: Pet[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
