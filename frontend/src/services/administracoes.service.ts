import apiClient from '@/lib/api-client';

export interface Administracao {
  id: string;
  prescricaoId: string;
  dataHoraAgendada: string;
  dataHoraRealizada?: string;
  usuarioId?: string;
  doseAdministrada?: string;
  viaAdministracao?: string;
  status: 'pendente' | 'realizada' | 'nao_realizada' | 'atrasada';
  observacoes?: string;
  motivo?: string;
  prescricao?: {
    id: string;
    medicamentoId: string;
    medicamento: {
      id: string;
      nome: string;
    };
    dose: string;
    viaAdministracao: string;
    internacao: {
      id: string;
      pet: {
        id: string;
        nome: string;
      };
    };
  };
  usuario?: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarAdministracaoDto {
  doseAdministrada: string;
  viaAdministracao: string;
  observacoes?: string;
}

export interface NaoRealizarAdministracaoDto {
  motivo: string;
  observacoes?: string;
}

export interface ResumoAdministracoes {
  total: number;
  realizadas: number;
  pendentes: number;
  atrasadas: number;
  naoRealizadas: number;
  taxaAdesao: number;
}

class AdministracoesService {
  async findAll(status?: string, internacaoId?: string): Promise<Administracao[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (internacaoId) params.append('internacaoId', internacaoId);

    const { data } = await apiClient.get(`/administracoes?${params.toString()}`);
    return data;
  }

  async findPendentes(): Promise<Administracao[]> {
    const { data } = await apiClient.get('/administracoes/pendentes');
    return data;
  }

  async findAtrasadas(): Promise<Administracao[]> {
    const { data } = await apiClient.get('/administracoes/atrasadas');
    return data;
  }

  async findProximas(horas: number = 2): Promise<Administracao[]> {
    const { data } = await apiClient.get(`/administracoes/proximas?horas=${horas}`);
    return data;
  }

  async getResumo(internacaoId?: string): Promise<ResumoAdministracoes> {
    const params = internacaoId ? `?internacaoId=${internacaoId}` : '';
    const { data } = await apiClient.get(`/administracoes/resumo${params}`);
    return data;
  }

  async findOne(id: string): Promise<Administracao> {
    const { data } = await apiClient.get(`/administracoes/${id}`);
    return data;
  }

  async registrar(id: string, dto: RegistrarAdministracaoDto): Promise<Administracao> {
    const { data } = await apiClient.patch(`/administracoes/${id}/registrar`, dto);
    return data;
  }

  async naoRealizar(id: string, dto: NaoRealizarAdministracaoDto): Promise<Administracao> {
    const { data } = await apiClient.patch(`/administracoes/${id}/nao-realizar`, dto);
    return data;
  }

  async atualizarAtrasadas(): Promise<void> {
    await apiClient.post('/administracoes/atualizar-atrasadas');
  }
}

export const administracoesService = new AdministracoesService();
