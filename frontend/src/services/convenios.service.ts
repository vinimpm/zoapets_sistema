import apiClient from '@/lib/api-client';

export interface Convenio {
  id: string;
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  percentualRepasse: number;
  prazoPagamento: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConvenioDto {
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  percentualRepasse: number;
  prazoPagamento: number;
}

export const conveniosService = {
  async create(data: CreateConvenioDto): Promise<Convenio> {
    const response = await apiClient.post('/convenios', data);
    return response.data;
  },

  async findAll(ativo?: boolean): Promise<Convenio[]> {
    const params = ativo !== undefined ? { ativo: ativo.toString() } : {};
    const response = await apiClient.get('/convenios', { params });
    return response.data;
  },

  async findActive(): Promise<Convenio[]> {
    const response = await apiClient.get('/convenios/active');
    return response.data;
  },

  async findById(id: string): Promise<Convenio> {
    const response = await apiClient.get(`/convenios/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateConvenioDto>): Promise<Convenio> {
    const response = await apiClient.put(`/convenios/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/convenios/${id}`);
  },
};
