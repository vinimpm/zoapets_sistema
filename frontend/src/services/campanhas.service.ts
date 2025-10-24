import apiClient from '@/lib/api-client';

export interface Campanha {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  canal: string;
  mensagem: string;
  status: string;
  totalEnvios: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampanhaDto {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  canal: string;
  mensagem: string;
  status?: string;
}

export const campanhasService = {
  async create(data: CreateCampanhaDto): Promise<Campanha> {
    const response = await apiClient.post('/campanhas', data);
    return response.data;
  },

  async findAll(status?: string, canal?: string): Promise<Campanha[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (canal) params.append('canal', canal);

    const response = await apiClient.get(`/campanhas?${params.toString()}`);
    return response.data;
  },

  async findActive(): Promise<Campanha[]> {
    const response = await apiClient.get('/campanhas/active');
    return response.data;
  },

  async findById(id: string): Promise<Campanha> {
    const response = await apiClient.get(`/campanhas/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCampanhaDto>): Promise<Campanha> {
    const response = await apiClient.put(`/campanhas/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Campanha> {
    const response = await apiClient.patch(`/campanhas/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/campanhas/${id}`);
  },
};
