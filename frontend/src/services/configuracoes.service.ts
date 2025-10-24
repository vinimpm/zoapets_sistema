import apiClient from '@/lib/api-client';

export interface Configuracao {
  id: string;
  nomeClinica: string;
  logoUrl?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  horarioAtendimento?: string;
  cnpj?: string;
  siteUrl?: string;
  whatsapp?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  notificacoesEmail: boolean;
  notificacoesSms: boolean;
  notificacoesWhatsapp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfiguracaoDto {
  nomeClinica?: string;
  logoUrl?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  horarioAtendimento?: string;
  cnpj?: string;
  siteUrl?: string;
  whatsapp?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  notificacoesEmail?: boolean;
  notificacoesSms?: boolean;
  notificacoesWhatsapp?: boolean;
}

class ConfiguracoesService {
  async get(): Promise<Configuracao> {
    const { data } = await apiClient.get('/configuracoes');
    return data;
  }

  async update(updateConfiguracaoDto: UpdateConfiguracaoDto): Promise<Configuracao> {
    const { data } = await apiClient.patch('/configuracoes', updateConfiguracaoDto);
    return data;
  }
}

export const configuracoesService = new ConfiguracoesService();
