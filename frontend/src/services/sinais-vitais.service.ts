import apiClient from '@/lib/api-client';

export interface SinalVital {
  id: string;
  internacaoId: string;
  veterinarioId: string;
  veterinario: {
    id: string;
    nomeCompleto: string;
  };
  dataHora: string;
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  pressaoArterialSistolica?: number;
  pressaoArterialDiastolica?: number;
  saturacaoOxigenio?: number;
  peso?: number;
  glicemia?: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSinalVitalDto {
  internacaoId: string;
  veterinarioId: string;
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  pressaoArterialSistolica?: number;
  pressaoArterialDiastolica?: number;
  saturacaoOxigenio?: number;
  peso?: number;
  glicemia?: number;
  observacoes?: string;
}

export interface UpdateSinalVitalDto extends Partial<Omit<CreateSinalVitalDto, 'internacaoId' | 'veterinarioId'>> {}

class SinaisVitaisService {
  async findAll(): Promise<SinalVital[]> {
    const { data } = await apiClient.get('/sinais-vitais');
    return data;
  }

  async findByInternacao(internacaoId: string): Promise<SinalVital[]> {
    const { data } = await apiClient.get(`/sinais-vitais/internacao/${internacaoId}`);
    return data;
  }

  async findUltimo(internacaoId: string): Promise<SinalVital> {
    const { data } = await apiClient.get(`/sinais-vitais/internacao/${internacaoId}/ultimo`);
    return data;
  }

  async findOne(id: string): Promise<SinalVital> {
    const { data } = await apiClient.get(`/sinais-vitais/${id}`);
    return data;
  }

  async create(createSinalVitalDto: CreateSinalVitalDto): Promise<SinalVital> {
    const { data } = await apiClient.post('/sinais-vitais', createSinalVitalDto);
    return data;
  }

  async update(id: string, updateSinalVitalDto: UpdateSinalVitalDto): Promise<SinalVital> {
    const { data } = await apiClient.patch(`/sinais-vitais/${id}`, updateSinalVitalDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sinais-vitais/${id}`);
  }
}

export const sinaisVitaisService = new SinaisVitaisService();
