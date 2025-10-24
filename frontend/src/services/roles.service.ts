import apiClient from '@/lib/api-client';
import { Role } from '@/types';

export interface Permission {
  id: string;
  nome: string;
  recurso: string;
  acao: string;
  descricao?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface CreateRoleDto {
  nome: string;
  descricao?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

class RolesService {
  async findAll(): Promise<RoleWithPermissions[]> {
    const { data } = await apiClient.get('/roles');
    return data;
  }

  async findOne(id: string): Promise<RoleWithPermissions> {
    const { data } = await apiClient.get(`/roles/${id}`);
    return data;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { data } = await apiClient.post('/roles', createRoleDto);
    return data;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { data } = await apiClient.patch(`/roles/${id}`, updateRoleDto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  }

  async findAllPermissions(): Promise<Permission[]> {
    const { data } = await apiClient.get('/roles/permissions');
    return data;
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const { data } = await apiClient.post(`/roles/${roleId}/permissions`, { permissionIds });
    return data;
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const { data } = await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return data;
  }
}

export const rolesService = new RolesService();
