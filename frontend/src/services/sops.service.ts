import apiClient from '@/lib/api-client';

export interface SOP {
  id: string;
  titulo: string;
  codigo: string;
  categoria: string;
  procedimento: string;
  materiais?: string;
  versao: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSopDto {
  titulo: string;
  codigo: string;
  categoria: string;
  procedimento: string;
  materiais?: string;
  versao?: number;
}

export interface UpdateSopDto extends Partial<CreateSopDto> {
  ativo?: boolean;
}

export const sopsService = {
  async create(data: CreateSopDto): Promise<SOP> {
    const response = await apiClient.post('/sops', data);
    return response.data;
  },

  async findAll(categoria?: string, search?: string): Promise<SOP[]> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (search) params.append('search', search);

    const response = await apiClient.get(`/sops?${params.toString()}`);
    return response.data;
  },

  async findActive(): Promise<SOP[]> {
    const response = await apiClient.get('/sops/active');
    return response.data;
  },

  async findById(id: string): Promise<SOP> {
    const response = await apiClient.get(`/sops/${id}`);
    return response.data;
  },

  async findByCodigo(codigo: string): Promise<SOP> {
    const response = await apiClient.get(`/sops/codigo/${codigo}`);
    return response.data;
  },

  async findByCategory(categoria: string): Promise<SOP[]> {
    const response = await apiClient.get(`/sops/category/${categoria}`);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/sops/categories');
    return response.data;
  },

  async update(id: string, data: UpdateSopDto): Promise<SOP> {
    const response = await apiClient.put(`/sops/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/sops/${id}`);
  },
};
