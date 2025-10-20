import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { Internacao } from './internacao.entity';
import { PrescricaoItem } from './prescricao-item.entity';

@Entity('prescricoes')
export class Prescricao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Internacao, { nullable: true })
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id', nullable: true })
  internacaoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @Column({ name: 'veterinario_id' })
  veterinarioId: string;

  @Column({ name: 'data_prescricao', type: 'timestamp' })
  dataPrescricao: Date;

  @Column({ name: 'data_validade', type: 'timestamp' })
  dataValidade: Date;

  @Column()
  status: string; // ativa, suspensa, concluida, cancelada

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => PrescricaoItem, item => item.prescricao)
  itens: PrescricaoItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
