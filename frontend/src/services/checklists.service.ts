import apiClient from '@/lib/api-client';

export interface ChecklistItem {
  id?: string;
  descricao: string;
  ordem: number;
  obrigatorio: boolean;
}

export interface ChecklistTemplate {
  id: string;
  nome: string;
  tipoInternacao?: string;
  descricao?: string;
  itens: ChecklistItem[];
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistExecution {
  id: string;
  internacaoId: string;
  templateId: string;
  itemDescricao: string;
  concluido: boolean;
  executadoPorId?: string;
  executadoPor?: any;
  dataExecucao?: string;
  observacoes?: string;
}

export interface ChecklistProgress {
  total: number;
  concluidos: number;
  percentual: number;
}

export interface CreateChecklistTemplateDto {
  nome: string;
  tipoInternacao?: string;
  descricao?: string;
  itens: ChecklistItem[];
}

export interface UpdateChecklistTemplateDto extends Partial<CreateChecklistTemplateDto> {
  ativo?: boolean;
}

export interface ExecuteChecklistItemDto {
  executionId: string;
  concluido: boolean;
  observacoes?: string;
}

export const checklistsService = {
  // Templates
  async createTemplate(data: CreateChecklistTemplateDto): Promise<ChecklistTemplate> {
    const response = await apiClient.post('/checklists/templates', data);
    return response.data;
  },

  async getTemplates(tipoInternacao?: string): Promise<ChecklistTemplate[]> {
    const params = tipoInternacao ? { tipoInternacao } : {};
    const response = await apiClient.get('/checklists/templates', { params });
    return response.data;
  },

  async getTemplateById(id: string): Promise<ChecklistTemplate> {
    const response = await apiClient.get(`/checklists/templates/${id}`);
    return response.data;
  },

  async updateTemplate(id: string, data: UpdateChecklistTemplateDto): Promise<ChecklistTemplate> {
    const response = await apiClient.put(`/checklists/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/checklists/templates/${id}`);
  },

  // Executions
  async initializeChecklist(internacaoId: string, templateId: string): Promise<ChecklistExecution[]> {
    const response = await apiClient.post(`/checklists/internacoes/${internacaoId}/initialize/${templateId}`);
    return response.data;
  },

  async getChecklistByInternacao(internacaoId: string): Promise<ChecklistExecution[]> {
    const response = await apiClient.get(`/checklists/internacoes/${internacaoId}`);
    return response.data;
  },

  async getChecklistProgress(internacaoId: string): Promise<ChecklistProgress> {
    const response = await apiClient.get(`/checklists/internacoes/${internacaoId}/progress`);
    return response.data;
  },

  async executeChecklistItem(id: string, data: ExecuteChecklistItemDto): Promise<ChecklistExecution> {
    const response = await apiClient.put(`/checklists/executions/${id}`, data);
    return response.data;
  },
};
