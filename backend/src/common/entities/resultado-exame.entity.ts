import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exame } from './exame.entity';
import { Pet } from './pet.entity';
import { Internacao } from './internacao.entity';
import { User } from './user.entity';

@Entity('resultados_exames')
export class ResultadoExame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Exame)
  @JoinColumn({ name: 'exame_id' })
  exame: Exame;

  @Column({ name: 'exame_id' })
  exameId: string;

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
  @JoinColumn({ name: 'veterinario_solicitante_id' })
  veterinarioSolicitante: User;

  @Column({ name: 'veterinario_solicitante_id' })
  veterinarioSolicitanteId: string;

  @Column({ name: 'data_solicitacao', type: 'timestamp' })
  dataSolicitacao: Date;

  @Column({ name: 'data_resultado', type: 'timestamp', nullable: true })
  dataResultado: Date;

  @Column()
  status: string; // solicitado, coletado, em_analise, concluido, cancelado

  @Column({ type: 'jsonb', nullable: true })
  valores: any; // { "hemoglobina": "14.5", "leucocitos": "8000", ... }

  @Column({ type: 'text', nullable: true })
  interpretacao: string;

  @Column({ type: 'text', array: true, nullable: true })
  arquivos: string[]; // URLs dos arquivos anexados

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
