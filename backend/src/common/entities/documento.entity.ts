import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';
import { Internacao } from './internacao.entity';
import { User } from './user.entity';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  tipo: string; // prontuario, exame, receita, atestado, termo_consentimento, laudo

  @Column({ name: 'arquivo_url' })
  arquivoUrl: string;

  @Column({ name: 'arquivo_nome' })
  arquivoNome: string;

  @Column({ name: 'arquivo_tamanho', type: 'bigint' })
  arquivoTamanho: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id', nullable: true })
  petId: string;

  @ManyToOne(() => Internacao, { nullable: true })
  @JoinColumn({ name: 'internacao_id' })
  internacao: Internacao;

  @Column({ name: 'internacao_id', nullable: true })
  internacaoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
