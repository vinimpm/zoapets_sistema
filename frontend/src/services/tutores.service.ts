import apiClient from '@/lib/api-client';

export interface Tutor {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  pets?: Array<{
    id: string;
    nome: string;
    especie: string;
  }>;
}

export interface CreateTutorDto {
  nome: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
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
