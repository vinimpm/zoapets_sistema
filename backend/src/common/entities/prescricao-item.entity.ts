import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Prescricao } from './prescricao.entity';
import { Medicamento } from './medicamento.entity';
import { Administracao } from './administracao.entity';

@Entity('prescricao_itens')
export class PrescricaoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescricao, prescricao => prescricao.itens)
  @JoinColumn({ name: 'prescricao_id' })
  prescricao: Prescricao;

  @Column({ name: 'prescricao_id' })
  prescricaoId: string;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'medicamento_id' })
  medicamento: Medicamento;

  @Column({ name: 'medicamento_id' })
  medicamentoId: string;

  @Column()
  dose: string;

  @Column({ name: 'via_administracao' })
  viaAdministracao: string; // oral, intravenosa, intramuscular, subcutanea, topica

  @Column()
  frequencia: string; // ex: "8/8h", "12/12h", "1x ao dia"

  @Column({ name: 'duracao_dias', type: 'integer' })
  duracaoDias: number;

  @Column({ name: 'horarios', type: 'jsonb' })
  horarios: string[]; // ["08:00", "16:00", "00:00"]

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'text', nullable: true })
  instrucoes: string;

  @OneToMany(() => Administracao, administracao => administracao.prescricaoItem)
  administracoes: Administracao[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
