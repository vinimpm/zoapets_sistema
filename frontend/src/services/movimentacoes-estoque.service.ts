import apiClient from '@/lib/api-client';

export interface MovimentacaoEstoque {
  id: string;
  medicamentoId: string;
  medicamento: {
    id: string;
    nome: string;
    principioAtivo: string;
  };
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  responsavelId: string;
  responsavel: {
    id: string;
    nomeCompleto: string;
  };
  dataHora: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovimentacaoDto {
  medicamentoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  responsavelId: string;
  observacoes?: string;
}

export interface ResumoMovimentacoes {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  quantidadeEntradas: number;
  quantidadeSaidas: number;
  totalMovimentacoes: number;
}

class MovimentacoesEstoqueService {
  async findAll(tipo?: string, medicamentoId?: string): Promise<MovimentacaoEstoque[]> {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (medicamentoId) params.append('medicamentoId', medicamentoId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { data } = await apiClient.get(`/movimentacoes-estoque${queryString}`);
    return data;
  }

  async findOne(id: string): Promise<MovimentacaoEstoque> {
    const { data } = await apiClient.get(`/movimentacoes-estoque/${id}`);
    return data;
  }

  async findByMedicamento(medicamentoId: string): Promise<MovimentacaoEstoque[]> {
    const { data } = await apiClient.get(`/movimentacoes-estoque/medicamento/${medicamentoId}`);
    return data;
  }

  async findByPeriodo(dataInicio: string, dataFim: string): Promise<MovimentacaoEstoque[]> {
    const { data } = await apiClient.get('/movimentacoes-estoque/periodo', {
      params: { dataInicio, dataFim },
    });
    return data;
  }

  async create(createMovimentacaoDto: CreateMovimentacaoDto): Promise<MovimentacaoEstoque> {
    const { data } = await apiClient.post('/movimentacoes-estoque', createMovimentacaoDto);
    return data;
  }

  async getResumo(dataInicio?: string, dataFim?: string): Promise<ResumoMovimentacoes> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { data } = await apiClient.get(`/movimentacoes-estoque/resumo${queryString}`);
    return data;
  }
}

export const movimentacoesEstoqueService = new MovimentacoesEstoqueService();
