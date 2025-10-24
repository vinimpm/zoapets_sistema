import apiClient from '@/lib/api-client';

export interface Turno {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
  duracao: number;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Escala {
  id: string;
  funcionarioId: string;
  turnoId: string;
  data: string;
  status: string;
  observacoes?: string;
  funcionario: {
    id: string;
    nomeCompleto: string;
    email: string;
    cargo?: string;
  };
  turno: Turno;
  criadoPor?: {
    id: string;
    nomeCompleto: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTurnoDto {
  nome: string;
  horaInicio: string;
  horaFim: string;
  duracao: number;
  descricao?: string;
  ativo?: boolean;
}

export interface CreateEscalaDto {
  funcionarioId: string;
  turnoId: string;
  data: string;
  status?: string;
  observacoes?: string;
}

class EscalasService {
  // Turnos
  async findAllTurnos(): Promise<Turno[]> {
    const { data } = await apiClient.get('/escalas/turnos');
    return data;
  }

  async findOneTurno(id: string): Promise<Turno> {
    const { data } = await apiClient.get(`/escalas/turnos/${id}`);
    return data;
  }

  async createTurno(createTurnoDto: CreateTurnoDto): Promise<Turno> {
    const { data } = await apiClient.post('/escalas/turnos', createTurnoDto);
    return data;
  }

  async updateTurno(id: string, updateTurnoDto: Partial<CreateTurnoDto>): Promise<Turno> {
    const { data } = await apiClient.patch(`/escalas/turnos/${id}`, updateTurnoDto);
    return data;
  }

  async removeTurno(id: string): Promise<void> {
    await apiClient.delete(`/escalas/turnos/${id}`);
  }

  // Escalas
  async findAllEscalas(params?: {
    funcionarioId?: string;
    turnoId?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }): Promise<Escala[]> {
    const queryParams = new URLSearchParams();
    if (params?.funcionarioId) queryParams.append('funcionarioId', params.funcionarioId);
    if (params?.turnoId) queryParams.append('turnoId', params.turnoId);
    if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params?.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params?.status) queryParams.append('status', params.status);

    const { data } = await apiClient.get(`/escalas?${queryParams.toString()}`);
    return data;
  }

  async getEscalasPorSemana(dataInicio: string): Promise<any> {
    const { data } = await apiClient.get(`/escalas/semana?dataInicio=${dataInicio}`);
    return data;
  }

  async findOneEscala(id: string): Promise<Escala> {
    const { data } = await apiClient.get(`/escalas/${id}`);
    return data;
  }

  async createEscala(createEscalaDto: CreateEscalaDto): Promise<Escala> {
    const { data } = await apiClient.post('/escalas', createEscalaDto);
    return data;
  }

  async updateEscala(id: string, updateEscalaDto: Partial<CreateEscalaDto>): Promise<Escala> {
    const { data } = await apiClient.patch(`/escalas/${id}`, updateEscalaDto);
    return data;
  }

  async removeEscala(id: string): Promise<void> {
    await apiClient.delete(`/escalas/${id}`);
  }
}

export const escalasService = new EscalasService();
