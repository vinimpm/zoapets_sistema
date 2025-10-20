import apiClient from '@/lib/api-client';

export interface PrescricaoItem {
  medicamentoId: string;
  medicamento?: {
    id: string;
    nome: string;
  };
  dose: string;
  viaAdministracao: string;
  frequencia: string;
  observacoes?: string;
}

export interface Prescricao {
  id: string;
  internacaoId: string;
  veterinarioId: string;
  dataInicio: string;
  dataFim?: string;
  status: 'ativa' | 'suspensa' | 'concluida';
  observacoes?: string;
  itens: PrescricaoItem[];
  internacao?: {
    id: string;
    pet: {
      id: string;
      nome: string;
    };
  };
  veterinario?: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescricaoDto {
  internacaoId: string;
  veterinarioId: string;
  dataInicio?: string;
  dataFim?: string;
  observacoes?: string;
  itens: PrescricaoItem[];
}

export interface UpdatePrescricaoDto extends Partial<Omit<CreatePrescricaoDto, 'itens'>> {}

class PrescricoesService {
  async findAll(status?: string, petId?: string): Promise<Prescricao[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (petId) params.append('petId', petId);

    const { data } = await apiClient.get(`/prescricoes?${params.toString()}`);
    return data;
  }

  async findByPet(petId: string): Promise<Prescricao[]> {
    const { data } = await apiClient.get(`/prescricoes/pet/${petId}`);
    return data;
  }

  async findByInternacao(internacaoId: string): Promise<Prescricao[]> {
    const { data } = await apiClient.get(`/prescricoes/internacao/${internacaoId}`);
    return data;
  }

  async findOne(id: string): Promise<Prescricao> {
    const { data } = await apiClient.get(`/prescricoes/${id}`);
    return data;
  }

  async create(createPrescricaoDto: CreatePrescricaoDto): Promise<Prescricao> {
    const { data } = await apiClient.post('/prescricoes', createPrescricaoDto);
    return data;
  }

  async update(id: string, updatePrescricaoDto: UpdatePrescricaoDto): Promise<Prescricao> {
    const { data } = await apiClient.patch(`/prescricoes/${id}`, updatePrescricaoDto);
    return data;
  }

  async suspender(id: string): Promise<Prescricao> {
    const { data } = await apiClient.patch(`/prescricoes/${id}/suspender`);
    return data;
  }

  async reativar(id: string): Promise<Prescricao> {
    const { data } = await apiClient.patch(`/prescricoes/${id}/reativar`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/prescricoes/${id}`);
  }
}

export const prescricoesService = new PrescricoesService();
