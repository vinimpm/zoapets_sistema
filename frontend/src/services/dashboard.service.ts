import api from '@/lib/api-client';

export interface DashboardStats {
  internacoesAtivas: number;
  pacientesCriticos: number;
  administracoesPendentes: number;
  medicacoesAtrasadas: number;
  agendamentosHoje: number;
  agendamentosConfirmados: number;
}

export interface RecentActivity {
  id: string;
  tipo: 'internacao' | 'agendamento';
  descricao: string;
  data: string;
  status: string;
  prioridade?: string;
}

export interface RecentActivities {
  internacoes: RecentActivity[];
  agendamentos: RecentActivity[];
}

export interface ChartData {
  data: string;
  [key: string]: number | string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getRecentActivities(): Promise<RecentActivities> {
    const response = await api.get<RecentActivities>('/dashboard/recent-activities');
    return response.data;
  },

  async getInternacoesChart(): Promise<ChartData[]> {
    const response = await api.get<ChartData[]>('/dashboard/charts/internacoes');
    return response.data;
  },

  async getFinanceiroChart(): Promise<ChartData[]> {
    const response = await api.get<ChartData[]>('/dashboard/charts/financeiro');
    return response.data;
  },
};
