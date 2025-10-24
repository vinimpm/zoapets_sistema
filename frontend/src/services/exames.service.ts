import apiClient from '@/lib/api-client';

// Catálogo de Exames
export interface ExameCatalogo {
  id: string;
  nome: string;
  categoria: string;
  metodologia?: string;
  tempoResultado?: string;
  valorReferencia?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Resultado de Exame
export interface ExameResultado {
  id: string;
  exameId: string;
  internacaoId?: string;
  petId?: string;
  veterinarioSolicitante: {
    id: string;
    nomeCompleto: string;
  };
  pet: {
    id: string;
    nome: string;
    especie: string;
  };
  exame: ExameCatalogo;
  dataSolicitacao: string;
  dataColeta?: string;
  dataResultado?: string;
  status: 'solicitado' | 'coletado' | 'em_analise' | 'concluido' | 'cancelado';
  resultado?: string;
  observacoes?: string;
  arquivos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExameResultadoDto {
  exameId: string;
  petId?: string;
  internacaoId?: string;
  dataSolicitacao?: string;
  observacoes?: string;
}

export interface UpdateExameResultadoDto extends Partial<CreateExameResultadoDto> {
  dataColeta?: string;
  dataResultado?: string;
  resultado?: string;
  status?: 'solicitado' | 'coletado' | 'em_analise' | 'concluido' | 'cancelado';
}

export interface RegistrarResultadoDto {
  resultado: string;
  observacoes?: string;
}

class ExamesService {
  // Catálogo de Exames
  async findCatalogo(): Promise<ExameCatalogo[]> {
    const { data } = await apiClient.get('/exames/catalogo');
    return data;
  }

  async findCatalogoById(id: string): Promise<ExameCatalogo> {
    const { data } = await apiClient.get(`/exames/catalogo/${id}`);
    return data;
  }

  // Resultados de Exames
  async findResultados(filters?: { status?: string; petId?: string; internacaoId?: string }): Promise<ExameResultado[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.petId) params.append('petId', filters.petId);
    if (filters?.internacaoId) params.append('internacaoId', filters.internacaoId);

    const queryString = params.toString();
    const { data } = await apiClient.get(`/exames/resultados${queryString ? `?${queryString}` : ''}`);
    return data;
  }

  async findResultadoById(id: string): Promise<ExameResultado> {
    const { data } = await apiClient.get(`/exames/resultados/${id}`);
    return data;
  }

  async createResultado(createDto: CreateExameResultadoDto): Promise<ExameResultado> {
    const { data } = await apiClient.post('/exames/resultados', createDto);
    return data;
  }

  async updateResultado(id: string, updateDto: UpdateExameResultadoDto): Promise<ExameResultado> {
    const { data } = await apiClient.patch(`/exames/resultados/${id}`, updateDto);
    return data;
  }

  async registrarResultado(id: string, registrarDto: RegistrarResultadoDto): Promise<ExameResultado> {
    const { data } = await apiClient.patch(`/exames/resultados/${id}/registrar`, registrarDto);
    return data;
  }

  async cancelar(id: string): Promise<ExameResultado> {
    const { data } = await apiClient.patch(`/exames/resultados/${id}/cancelar`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/exames/resultados/${id}`);
  }
}

export const examesService = new ExamesService();
