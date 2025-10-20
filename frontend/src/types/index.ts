export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf?: string;
  crmv?: string;
  telefone?: string;
  avatarUrl?: string;
  cargo?: string;
  ativo: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Tutor {
  id: string;
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  email: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  enderecoCompleto?: any;
  dataNascimento?: string;
  profissao?: string;
  observacoes?: string;
  pets?: Pet[];
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  tutorId: string;
  tutor?: Tutor;
  nome: string;
  especie: string;
  raca?: string;
  sexo: string;
  dataNascimento?: string;
  pesoKg?: number;
  corPelagem?: string;
  castrado?: boolean;
  microchip?: string;
  fotoUrl?: string;
  alergias?: string[];
  doencasPrevias?: string[];
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Internacao {
  id: string;
  petId: string;
  pet?: Pet;
  medicoResponsavelId: string;
  medicoResponsavel?: User;
  dataEntrada: string;
  dataAlta?: string;
  motivo: string;
  diagnosticoInicial?: string;
  tipo: 'clinica' | 'cirurgica' | 'urgencia';
  status: 'aguardando' | 'em_andamento' | 'alta' | 'obito';
  leito?: string;
  isolamento: boolean;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  custoTotal?: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescricao {
  id: string;
  petId: string;
  pet?: Pet;
  internacaoId?: string;
  veterinarioId: string;
  veterinario?: User;
  dataPrescricao: string;
  dataValidade: string;
  status: 'ativa' | 'suspensa' | 'concluida' | 'cancelada';
  observacoes?: string;
  itens?: PrescricaoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescricaoItem {
  id: string;
  prescricaoId: string;
  medicamentoId: string;
  medicamento?: Medicamento;
  dose: string;
  viaAdministracao: string;
  frequencia: string;
  duracaoDias: number;
  horarios: string[];
  ativo: boolean;
  instrucoes?: string;
  administracoes?: Administracao[];
}

export interface Administracao {
  id: string;
  prescricaoItemId: string;
  prescricaoItem?: PrescricaoItem;
  dataHoraPrevista: string;
  dataHoraRealizada?: string;
  status: 'pendente' | 'realizado' | 'atrasado' | 'nao_realizado';
  responsavelId?: string;
  responsavel?: User;
  observacoes?: string;
  motivoNaoRealizado?: string;
  createdAt: string;
}

export interface Medicamento {
  id: string;
  nome: string;
  principioAtivo: string;
  fabricante: string;
  concentracao?: string;
  formaFarmaceutica: string;
  tipo: string;
  usoControlado: boolean;
  registroAnvisa?: string;
  indicacoes?: string[];
  contraindicacoes?: string[];
  posologia?: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  preco: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  internacoesAtivas: number;
  pacientesCriticos: number;
  administracoesPendentes: number;
  administracoesAtrasadas: number;
  ocupacaoLeitos: {
    total: number;
    criticos: number;
    isolamento: number;
    disponiveis: number;
  };
}
