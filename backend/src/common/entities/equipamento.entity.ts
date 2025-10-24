import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  tipo: string; // autoclave, raio-x, ultrassom, etc

  @Column({ nullable: true })
  fabricante: string;

  @Column({ name: 'numero_serie', nullable: true })
  numeroSerie: string;

  @Column({ name: 'data_aquisicao', type: 'date', nullable: true })
  dataAquisicao: Date;

  @Column({ name: 'proxima_calibracao', type: 'date', nullable: true })
  proximaCalibracao: Date;

  @Column({ name: 'proxima_manutencao', type: 'date', nullable: true })
  proximaManutencao: Date;

  @Column({ default: 'operacional' })
  status: string; // operacional, manutencao, inativo

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
