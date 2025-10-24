import apiClient from '@/lib/api-client';

export interface Agendamento {
  id: string;
  petId: string;
  veterinarioId: string;
  tipo: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'falta';
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

export interface CreateAgendamentoDto {
  petId: string;
  veterinarioId: string;
  tipo: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  observacoes?: string;
}

export interface UpdateAgendamentoDto extends Partial<CreateAgendamentoDto> {}

class AgendamentosService {
  async findAll(filters?: {
    data?: Date;
    veterinarioId?: string;
    status?: string;
  }): Promise<Agendamento[]> {
    const params = new URLSearchParams();
    if (filters?.data) params.append('data', filters.data.toISOString());
    if (filters?.veterinarioId) params.append('veterinarioId', filters.veterinarioId);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const { data } = await apiClient.get(`/agendamentos?${params.toString()}`);
    return data;
  }

  async findByPeriodo(inicio: Date, fim: Date, veterinarioId?: string): Promise<Agendamento[]> {
    const params = new URLSearchParams();
    params.append('inicio', inicio.toISOString());
    params.append('fim', fim.toISOString());
    if (veterinarioId) params.append('veterinarioId', veterinarioId);

    const { data } = await apiClient.get(`/agendamentos/periodo?${params.toString()}`);
    return data;
  }

  async findOne(id: string): Promise<Agendamento> {
    const { data } = await apiClient.get(`/agendamentos/${id}`);
    return data;
  }

  async create(createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
    const { data } = await apiClient.post('/agendamentos', createAgendamentoDto);
    return data;
  }

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto): Promise<Agendamento> {
    const { data } = await apiClient.patch(`/agendamentos/${id}`, updateAgendamentoDto);
    return data;
  }

  async confirmar(id: string): Promise<Agendamento> {
    const { data } = await apiClient.patch(`/agendamentos/${id}/confirmar`);
    return data;
  }

  async cancelar(id: string, motivo?: string): Promise<Agendamento> {
    const { data } = await apiClient.patch(`/agendamentos/${id}/cancelar`, { motivo });
    return data;
  }

  async marcarFalta(id: string): Promise<Agendamento> {
    const { data } = await apiClient.patch(`/agendamentos/${id}/falta`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/agendamentos/${id}`);
  }
}

export const agendamentosService = new AgendamentosService();
