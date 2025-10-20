import apiClient from '@/lib/api-client';

export interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  sexo?: string;
  cor?: string;
  dataNascimento?: string;
  microchip?: string;
  castrado: boolean;
  pesoKg?: number;
  observacoes?: string;
  tutorId: string;
  tutor?: {
    id: string;
    nome: string;
    telefone?: string;
    celular?: string;
  };
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetDto {
  nome: string;
  especie: string;
  raca?: string;
  sexo?: string;
  cor?: string;
  dataNascimento?: string;
  microchip?: string;
  castrado?: boolean;
  pesoKg?: number;
  observacoes?: string;
  tutorId: string;
}

export interface UpdatePetDto extends Partial<CreatePetDto> {}

class PetsService {
  async findAll(search?: string, tutorId?: string): Promise<Pet[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tutorId) params.append('tutorId', tutorId);

    const { data } = await apiClient.get(`/pets?${params.toString()}`);
    return data;
  }

  async findOne(id: string): Promise<Pet> {
    const { data } = await apiClient.get(`/pets/${id}`);
    return data;
  }

  async findByMicrochip(microchip: string): Promise<Pet> {
    const { data } = await apiClient.get(`/pets/microchip/${microchip}`);
    return data;
  }

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const { data } = await apiClient.post('/pets', createPetDto);
    return data;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const { data } = await apiClient.patch(`/pets/${id}`, updatePetDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/pets/${id}`);
  }

  async activate(id: string): Promise<Pet> {
    const { data } = await apiClient.patch(`/pets/${id}/activate`);
    return data;
  }

  async deactivate(id: string): Promise<Pet> {
    const { data } = await apiClient.patch(`/pets/${id}/deactivate`);
    return data;
  }
}

export const petsService = new PetsService();
