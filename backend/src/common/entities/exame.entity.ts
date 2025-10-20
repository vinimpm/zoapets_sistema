import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('exames')
export class Exame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nome: string;

  @Column()
  tipo: string; // laboratorial, imagem, anatomopatologico

  @Column({ nullable: true })
  categoria: string; // hemograma, bioquimica, raio-x, ultrassom, etc

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ name: 'prazo_resultado_horas', type: 'integer', nullable: true })
  prazoResultadoHoras: number;

  @Column({ name: 'requer_preparo', default: false })
  requerPreparo: boolean;

  @Column({ name: 'instrucoes_preparo', type: 'text', nullable: true })
  instrucoesPreparo: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
