import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date' })
  dataFim: Date;

  @Column({ name: 'canal' })
  canal: string; // email, sms, whatsapp

  @Column({ type: 'text' })
  mensagem: string;

  @Column({ default: 'rascunho' })
  status: string; // rascunho, agendada, enviada, concluida

  @Column({ name: 'total_envios', type: 'integer', default: 0 })
  totalEnvios: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
