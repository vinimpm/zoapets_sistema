import apiClient from '@/lib/api-client';

export interface EnderecoCompleto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Tutor {
  id: string;
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  email: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  enderecoCompleto?: EnderecoCompleto;
  dataNascimento?: string;
  profissao?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  pets?: Array<{
    id: string;
    nome: string;
    especie: string;
  }>;
}

export interface CreateTutorDto {
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  email: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  enderecoCompleto?: EnderecoCompleto;
  dataNascimento?: string;
  profissao?: string;
  observacoes?: string;
}

export interface UpdateTutorDto extends Partial<CreateTutorDto> {}

class TutoresService {
  async findAll(search?: string): Promise<Tutor[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const { data } = await apiClient.get(`/tutores${params}`);
    return data;
  }

  async findOne(id: string): Promise<Tutor> {
    const { data } = await apiClient.get(`/tutores/${id}`);
    return data;
  }

  async findByCpf(cpf: string): Promise<Tutor> {
    const { data } = await apiClient.get(`/tutores/cpf/${cpf}`);
    return data;
  }

  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    const { data } = await apiClient.post('/tutores', createTutorDto);
    return data;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto): Promise<Tutor> {
    const { data } = await apiClient.patch(`/tutores/${id}`, updateTutorDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tutores/${id}`);
  }
}

export const tutoresService = new TutoresService();
