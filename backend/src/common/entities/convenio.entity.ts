import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('convenios')
export class Convenio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'percentual_repasse', type: 'decimal', precision: 5, scale: 2 })
  percentualRepasse: number; // Ex: 85.00 = 85%

  @Column({ name: 'prazo_pagamento', type: 'integer' })
  prazoPagamento: number; // Dias

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
