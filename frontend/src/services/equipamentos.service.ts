import apiClient from '@/lib/api-client';

export interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  fabricante?: string;
  numeroSerie?: string;
  dataAquisicao?: string;
  proximaCalibracao?: string;
  proximaManutencao?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipamentoDto {
  nome: string;
  tipo: string;
  fabricante?: string;
  numeroSerie?: string;
  dataAquisicao?: string;
  proximaCalibracao?: string;
  proximaManutencao?: string;
  status?: string;
}

export const equipamentosService = {
  async create(data: CreateEquipamentoDto): Promise<Equipamento> {
    const response = await apiClient.post('/equipamentos', data);
    return response.data;
  },

  async findAll(tipo?: string, status?: string): Promise<Equipamento[]> {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (status) params.append('status', status);

    const response = await apiClient.get(`/equipamentos?${params.toString()}`);
    return response.data;
  },

  async findNeedingMaintenance(): Promise<Equipamento[]> {
    const response = await apiClient.get('/equipamentos/needing-maintenance');
    return response.data;
  },

  async findById(id: string): Promise<Equipamento> {
    const response = await apiClient.get(`/equipamentos/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEquipamentoDto>): Promise<Equipamento> {
    const response = await apiClient.put(`/equipamentos/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/equipamentos/${id}`);
  },
};
