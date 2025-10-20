import apiClient from '@/lib/api-client';

export interface Conta {
  id: string;
  tutorId: string;
  petId?: string;
  internacaoId?: string;
  numeroConta: string;
  descricao?: string;
  valorTotal: number;
  valorPago: number;
  status: 'aberta' | 'parcial' | 'paga';
  dataVencimento?: string;
  dataEmissao: string;
  observacoes?: string;
  tutor: {
    id: string;
    nome: string;
    telefone?: string;
  };
  pet?: {
    id: string;
    nome: string;
  };
  internacao?: {
    id: string;
  };
  pagamentos?: Pagamento[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagamento {
  id: string;
  contaId: string;
  usuarioId: string;
  valor: number;
  formaPagamento: string;
  dataPagamento: string;
  comprovante?: string;
  observacoes?: string;
  usuario?: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContaDto {
  tutorId: string;
  petId?: string;
  internacaoId?: string;
  descricao?: string;
  valorTotal: number;
  dataVencimento?: string;
  observacoes?: string;
}

export interface UpdateContaDto extends Partial<CreateContaDto> {}

export interface CreatePagamentoDto {
  valor: number;
  formaPagamento: string;
  dataPagamento?: string;
  comprovante?: string;
  observacoes?: string;
}

export interface ResumoFinanceiro {
  totalReceber: number;
  totalRecebido: number;
  contasAbertas: number;
  contasVencidas: number;
  contasPagas: number;
}

class FinanceiroService {
  // Contas
  async findAllContas(status?: string): Promise<Conta[]> {
    const params = status ? `?status=${status}` : '';
    const { data } = await apiClient.get(`/financeiro/contas${params}`);
    return data;
  }

  async findContasVencidas(): Promise<Conta[]> {
    const { data } = await apiClient.get('/financeiro/contas/vencidas');
    return data;
  }

  async findConta(id: string): Promise<Conta> {
    const { data } = await apiClient.get(`/financeiro/contas/${id}`);
    return data;
  }

  async createConta(createContaDto: CreateContaDto): Promise<Conta> {
    const { data } = await apiClient.post('/financeiro/contas', createContaDto);
    return data;
  }

  async updateConta(id: string, updateContaDto: UpdateContaDto): Promise<Conta> {
    const { data } = await apiClient.patch(`/financeiro/contas/${id}`, updateContaDto);
    return data;
  }

  async removeConta(id: string): Promise<void> {
    await apiClient.delete(`/financeiro/contas/${id}`);
  }

  // Pagamentos
  async createPagamento(contaId: string, createPagamentoDto: CreatePagamentoDto): Promise<Pagamento> {
    const { data } = await apiClient.post(`/financeiro/contas/${contaId}/pagamentos`, createPagamentoDto);
    return data;
  }

  async findPagamentosByConta(contaId: string): Promise<Pagamento[]> {
    const { data } = await apiClient.get(`/financeiro/contas/${contaId}/pagamentos`);
    return data;
  }

  // Resumo
  async getResumo(dataInicio?: string, dataFim?: string): Promise<ResumoFinanceiro> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const { data } = await apiClient.get(`/financeiro/resumo?${params.toString()}`);
    return data;
  }
}

export const financeiroService = new FinanceiroService();
