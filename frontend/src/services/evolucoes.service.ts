import apiClient from '@/lib/api-client';

export interface Evolucao {
  id: string;
  internacaoId: string;
  veterinarioId: string;
  veterinario: {
    id: string;
    nomeCompleto: string;
  };
  dataHora: string;
  relato: string;
  exameClinico?: string;
  condutaClinica?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvolucaoDto {
  internacaoId: string;
  veterinarioId: string;
  relato: string;
  exameClinico?: string;
  condutaClinica?: string;
  observacoes?: string;
}

export interface UpdateEvolucaoDto extends Partial<Omit<CreateEvolucaoDto, 'internacaoId' | 'veterinarioId'>> {}

class EvolucoesService {
  async findAll(): Promise<Evolucao[]> {
    const { data } = await apiClient.get('/evolucoes');
    return data;
  }

  async findByInternacao(internacaoId: string): Promise<Evolucao[]> {
    const { data } = await apiClient.get(`/evolucoes/internacao/${internacaoId}`);
    return data;
  }

  async findOne(id: string): Promise<Evolucao> {
    const { data } = await apiClient.get(`/evolucoes/${id}`);
    return data;
  }

  async create(createEvolucaoDto: CreateEvolucaoDto): Promise<Evolucao> {
    const { data } = await apiClient.post('/evolucoes', createEvolucaoDto);
    return data;
  }

  async update(id: string, updateEvolucaoDto: UpdateEvolucaoDto): Promise<Evolucao> {
    const { data } = await apiClient.patch(`/evolucoes/${id}`, updateEvolucaoDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/evolucoes/${id}`);
  }
}

export const evolucoesService = new EvolucoesService();
