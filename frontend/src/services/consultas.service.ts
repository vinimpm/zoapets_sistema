import apiClient from '@/lib/api-client';
import type { Internacao } from './internacoes.service';

export interface Consulta {
  id: string;
  petId: string;
  tutorId: string;
  veterinarioId: string;
  agendamentoId?: string;
  tipo: 'ambulatorial' | 'emergencia' | 'retorno';
  dataAtendimento: string;

  // Anamnese
  queixaPrincipal: string;
  historico?: string;

  // Exame Físico
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  tpc?: string;
  mucosas?: string;
  hidratacao?: string;
  ausculta?: string;
  palpacao?: string;
  exameFisicoObs?: string;

  // Diagnóstico e Conduta
  diagnostico?: string;
  conduta?: string;
  orientacoes?: string;

  // Status e Controle
  status: 'em_atendimento' | 'concluida' | 'gerou_internacao';
  internacaoId?: string;
  custoTotal?: number;

  // Relations
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
  };
  tutor: {
    id: string;
    nome: string;
    telefone?: string;
    celular?: string;
  };
  veterinario: {
    id: string;
    nome: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultaDto {
  petId: string;
  tutorId: string;
  veterinarioId: string;
  agendamentoId?: string;
  tipo: 'ambulatorial' | 'emergencia' | 'retorno';
  dataAtendimento: string;

  // Anamnese
  queixaPrincipal: string;
  historico?: string;

  // Exame Físico
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  tpc?: string;
  mucosas?: string;
  hidratacao?: string;
  ausculta?: string;
  palpacao?: string;
  exameFisicoObs?: string;

  // Diagnóstico e Conduta
  diagnostico?: string;
  conduta?: string;
  orientacoes?: string;

  // Status
  status: 'em_atendimento' | 'concluida' | 'gerou_internacao';
  internacaoId?: string;
  custoTotal?: number;
}

export interface UpdateConsultaDto extends Partial<CreateConsultaDto> {}

export interface GerarInternacaoDto {
  motivo: string;
  tipo: string; // 'clinica' | 'cirurgica' | 'urgencia'
  prioridade: string; // 'baixa' | 'media' | 'alta' | 'critica'
  leito?: string;
  isolamento?: boolean;
  diagnosticoInicial?: string;
  observacoes?: string;
  medicoResponsavelId?: string;
}

class ConsultasService {
  async findAll(filters?: {
    data?: Date;
    veterinarioId?: string;
    status?: string;
    petId?: string;
  }): Promise<Consulta[]> {
    const params = new URLSearchParams();
    if (filters?.data) params.append('data', filters.data.toISOString());
    if (filters?.veterinarioId) params.append('veterinarioId', filters.veterinarioId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.petId) params.append('petId', filters.petId);

    const { data } = await apiClient.get(`/consultas?${params.toString()}`);
    return data;
  }

  async findOne(id: string): Promise<Consulta> {
    const { data } = await apiClient.get(`/consultas/${id}`);
    return data;
  }

  async findByPet(petId: string): Promise<Consulta[]> {
    const { data } = await apiClient.get(`/consultas/pet/${petId}`);
    return data;
  }

  async create(createConsultaDto: CreateConsultaDto): Promise<Consulta> {
    const { data } = await apiClient.post('/consultas', createConsultaDto);
    return data;
  }

  async update(id: string, updateConsultaDto: UpdateConsultaDto): Promise<Consulta> {
    const { data } = await apiClient.patch(`/consultas/${id}`, updateConsultaDto);
    return data;
  }

  async concluir(id: string): Promise<Consulta> {
    const { data } = await apiClient.patch(`/consultas/${id}/concluir`);
    return data;
  }

  async gerarInternacao(id: string, dto: GerarInternacaoDto): Promise<Internacao> {
    const { data } = await apiClient.post(`/consultas/${id}/gerar-internacao`, dto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/consultas/${id}`);
  }
}

export const consultasService = new ConsultasService();
