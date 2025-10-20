import apiClient from '@/lib/api-client';

export interface Internacao {
  id: string;
  petId: string;
  veterinarioId: string;
  dataEntrada: string;
  dataSaida?: string;
  motivo: string;
  diagnostico?: string;
  status: 'ativa' | 'alta' | 'obito';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgencia';
  leito?: string;
  observacoes?: string;
  pet: {
    id: string;
    nome: string;
    especie: string;
    tutor: {
      id: string;
      nome: string;
      telefone?: string;
    };
  };
  veterinario?: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternacaoDto {
  petId: string;
  veterinarioId: string;
  dataEntrada?: string;
  motivo: string;
  diagnostico?: string;
  prioridade?: string;
  leito?: string;
  observacoes?: string;
}

export interface UpdateInternacaoDto extends Partial<CreateInternacaoDto> {}

export interface AltaDto {
  dataSaida: string;
  diagnostico: string;
  observacoes?: string;
}

export interface ObitoDto {
  dataSaida: string;
  observacoes: string;
}

export interface OcupacaoLeitos {
  total: number;
  ocupados: number;
  livres: number;
  taxaOcupacao: number;
  porPrioridade: {
    urgencia: number;
    alta: number;
    media: number;
    baixa: number;
  };
}

class InternacoesService {
  async findAll(status?: string, prioridade?: string): Promise<Internacao[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (prioridade) params.append('prioridade', prioridade);

    const { data } = await apiClient.get(`/internacoes?${params.toString()}`);
    return data;
  }

  async findActive(): Promise<Internacao[]> {
    const { data } = await apiClient.get('/internacoes/active');
    return data;
  }

  async findCritical(): Promise<Internacao[]> {
    const { data } = await apiClient.get('/internacoes/critical');
    return data;
  }

  async getOcupacaoLeitos(): Promise<OcupacaoLeitos> {
    const { data } = await apiClient.get('/internacoes/ocupacao-leitos');
    return data;
  }

  async findByPet(petId: string): Promise<Internacao[]> {
    const { data } = await apiClient.get(`/internacoes/pet/${petId}`);
    return data;
  }

  async findOne(id: string): Promise<Internacao> {
    const { data } = await apiClient.get(`/internacoes/${id}`);
    return data;
  }

  async create(createInternacaoDto: CreateInternacaoDto): Promise<Internacao> {
    const { data } = await apiClient.post('/internacoes', createInternacaoDto);
    return data;
  }

  async update(id: string, updateInternacaoDto: UpdateInternacaoDto): Promise<Internacao> {
    const { data } = await apiClient.patch(`/internacoes/${id}`, updateInternacaoDto);
    return data;
  }

  async darAlta(id: string, altaDto: AltaDto): Promise<Internacao> {
    const { data } = await apiClient.patch(`/internacoes/${id}/alta`, altaDto);
    return data;
  }

  async registrarObito(id: string, obitoDto: ObitoDto): Promise<Internacao> {
    const { data } = await apiClient.patch(`/internacoes/${id}/obito`, obitoDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/internacoes/${id}`);
  }
}

export const internacoesService = new InternacoesService();
