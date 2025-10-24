import apiClient from '@/lib/api-client';

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
  fabricante?: string;
  lote?: string;
  dataValidade?: string;
  unidade: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  precoCusto: number;
  precoVenda: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProdutoDto {
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
  fabricante?: string;
  lote?: string;
  dataValidade?: string;
  unidade: string;
  estoqueMinimo?: number;
  estoqueAtual?: number;
  precoCusto: number;
  precoVenda: number;
  ativo?: boolean;
}

export interface UpdateProdutoDto {
  codigo?: string;
  nome?: string;
  categoria?: string;
  descricao?: string;
  fabricante?: string;
  lote?: string;
  dataValidade?: string;
  unidade?: string;
  estoqueMinimo?: number;
  estoqueAtual?: number;
  precoCusto?: number;
  precoVenda?: number;
  ativo?: boolean;
}

class ProdutosService {
  async findAll(categoria?: string, ativo?: boolean, search?: string): Promise<Produto[]> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (ativo !== undefined) params.append('ativo', String(ativo));
    if (search) params.append('search', search);

    const { data } = await apiClient.get(`/produtos?${params.toString()}`);
    return data;
  }

  async findOne(id: string): Promise<Produto> {
    const { data } = await apiClient.get(`/produtos/${id}`);
    return data;
  }

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const { data } = await apiClient.post('/produtos', createProdutoDto);
    return data;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const { data } = await apiClient.patch(`/produtos/${id}`, updateProdutoDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/produtos/${id}`);
  }

  async updateEstoque(id: string, quantidade: number): Promise<Produto> {
    const { data } = await apiClient.patch(`/produtos/${id}/estoque`, { quantidade });
    return data;
  }

  async getCategorias(): Promise<string[]> {
    const { data } = await apiClient.get('/produtos/categorias');
    return data;
  }

  async getEstoqueBaixo(): Promise<Produto[]> {
    const { data } = await apiClient.get('/produtos/estoque-baixo');
    return data;
  }

  async getProdutosVencendo(dias: number = 30): Promise<Produto[]> {
    const { data } = await apiClient.get(`/produtos/vencendo?dias=${dias}`);
    return data;
  }
}

export const produtosService = new ProdutosService();
