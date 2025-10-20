import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';

@Entity('vacinacoes')
export class Vacinacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @Column({ name: 'nome_vacina' })
  nomeVacina: string;

  @Column({ nullable: true })
  fabricante: string;

  @Column({ nullable: true })
  lote: string;

  @Column({ name: 'data_aplicacao', type: 'date' })
  dataAplicacao: Date;

  @Column({ name: 'data_reforco', type: 'date', nullable: true })
  dataReforco: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @Column({ name: 'veterinario_id' })
  veterinarioId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'reacao_adversa', default: false })
  reacaoAdversa: boolean;

  @Column({ name: 'descricao_reacao', type: 'text', nullable: true })
  descricaoReacao: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
