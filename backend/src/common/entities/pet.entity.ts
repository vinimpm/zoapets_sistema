import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tutor } from './tutor.entity';
import { Internacao } from './internacao.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tutor, tutor => tutor.pets)
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

  @Column({ name: 'tutor_id' })
  tutorId: string;

  @Column()
  nome: string;

  @Column()
  especie: string;

  @Column({ nullable: true })
  raca: string;

  @Column()
  sexo: string;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ name: 'peso_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  pesoKg: number;

  @Column({ nullable: true })
  cor: string;

  @Column({ nullable: true })
  castrado: boolean;

  @Column({ unique: true, nullable: true })
  microchip: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Internacao, internacao => internacao.pet)
  internacoes: Internacao[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
