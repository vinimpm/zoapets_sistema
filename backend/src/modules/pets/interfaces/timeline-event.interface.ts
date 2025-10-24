export enum TimelineEventType {
  AGENDAMENTO = 'agendamento',
  CONSULTA = 'consulta',
  INTERNACAO = 'internacao',
  VACINACAO = 'vacinacao',
  PRESCRICAO = 'prescricao',
  PROCEDIMENTO = 'procedimento',
  EXAME = 'exame',
  EVOLUCAO = 'evolucao',
  ADMINISTRACAO = 'administracao',
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  title: string;
  description: string;
  veterinario?: {
    id: string;
    nome: string;
  };
  icon: string;
  color: string;
  status?: string;
  isFuture?: boolean;
  details: any;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  total: number;
  page: number;
  pageSize: number;
  appliedFilters: {
    types?: TimelineEventType[];
    dateFrom?: Date;
    dateTo?: Date;
  };
}
