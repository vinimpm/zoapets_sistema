import apiClient from '@/lib/api-client';
import { User } from '@/types';

export interface CreateUserDto {
  nomeCompleto: string;
  email: string;
  senha: string;
  cpf?: string;
  crmv?: string;
  telefone?: string;
  cargo?: string;
  ativo?: boolean;
  roleIds?: string[];
}

export interface UpdateUserDto {
  nomeCompleto?: string;
  email?: string;
  senha?: string;
  cpf?: string;
  crmv?: string;
  telefone?: string;
  cargo?: string;
  ativo?: boolean;
  roleIds?: string[];
}

class UsersService {
  async findAll(): Promise<User[]> {
    const { data } = await apiClient.get('/users');
    return data;
  }

  async findOne(id: string): Promise<User> {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { data } = await apiClient.post('/users', createUserDto);
    return data;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { data } = await apiClient.patch(`/users/${id}`, updateUserDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async activate(id: string): Promise<User> {
    const { data } = await apiClient.patch(`/users/${id}/activate`);
    return data;
  }

  async deactivate(id: string): Promise<User> {
    const { data } = await apiClient.patch(`/users/${id}/deactivate`);
    return data;
  }
}

export const usersService = new UsersService();
