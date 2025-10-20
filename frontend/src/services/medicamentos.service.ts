import apiClient from '@/lib/api-client';

export interface Medicamento {
  id: string;
  nome: string;
  principioAtivo?: string;
  tipo?: string;
  formaFarmaceutica?: string;
  concentracao?: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  unidadeMedida?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicamentoDto {
  nome: string;
  principioAtivo?: string;
  tipo?: string;
  formaFarmaceutica?: string;
  concentracao?: string;
  estoqueMinimo?: number;
  estoqueAtual?: number;
  unidadeMedida?: string;
  observacoes?: string;
}

export interface UpdateMedicamentoDto extends Partial<CreateMedicamentoDto> {}

export interface UpdateEstoqueDto {
  quantidade: number;
  tipo: 'entrada' | 'saida';
  motivo?: string;
}

class MedicamentosService {
  async findAll(search?: string): Promise<Medicamento[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const { data } = await apiClient.get(`/medicamentos${params}`);
    return data;
  }

  async findEstoqueBaixo(): Promise<Medicamento[]> {
    const { data } = await apiClient.get('/medicamentos/estoque-baixo');
    return data;
  }

  async findOne(id: string): Promise<Medicamento> {
    const { data } = await apiClient.get(`/medicamentos/${id}`);
    return data;
  }

  async create(createMedicamentoDto: CreateMedicamentoDto): Promise<Medicamento> {
    const { data } = await apiClient.post('/medicamentos', createMedicamentoDto);
    return data;
  }

  async update(id: string, updateMedicamentoDto: UpdateMedicamentoDto): Promise<Medicamento> {
    const { data } = await apiClient.patch(`/medicamentos/${id}`, updateMedicamentoDto);
    return data;
  }

  async updateEstoque(id: string, updateEstoqueDto: UpdateEstoqueDto): Promise<Medicamento> {
    const { data } = await apiClient.patch(`/medicamentos/${id}/estoque`, updateEstoqueDto);
    return data;
  }

  async activate(id: string): Promise<Medicamento> {
    const { data } = await apiClient.patch(`/medicamentos/${id}/activate`);
    return data;
  }

  async deactivate(id: string): Promise<Medicamento> {
    const { data } = await apiClient.patch(`/medicamentos/${id}/deactivate`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/medicamentos/${id}`);
  }
}

export const medicamentosService = new MedicamentosService();
