import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../common/entities/role.entity';
import { Permission } from '../../common/entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto, tenantSlug: string): Promise<Role> {
    // Verificar se a role já existe
    const existing = await this.rolesRepository.findOne({
      where: { nome: createRoleDto.nome, tenantSlug } as any,
    });

    if (existing) {
      throw new ConflictException('Role com este nome já existe');
    }

    const role = this.rolesRepository.create({
      ...createRoleDto,
      tenantSlug,
    } as any) as unknown as Role;

    // Se houver permissões, associar
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionsRepository.findByIds(createRoleDto.permissionIds);
      role.permissions = permissions;
    }

    return this.rolesRepository.save(role);
  }

  async findAll(tenantSlug: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { tenantSlug } as any,
      relations: ['permissions'],
    });
  }

  async findOne(id: string, tenantSlug: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id, tenantSlug } as any,
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, tenantSlug: string): Promise<Role> {
    const role = await this.findOne(id, tenantSlug);

    // Atualizar campos básicos
    if (updateRoleDto.nome) role.nome = updateRoleDto.nome;
    if (updateRoleDto.descricao !== undefined) role.descricao = updateRoleDto.descricao;

    // Atualizar permissões se fornecidas
    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionsRepository.findByIds(updateRoleDto.permissionIds);
      role.permissions = permissions;
    }

    return this.rolesRepository.save(role);
  }

  async remove(id: string, tenantSlug: string): Promise<void> {
    const role = await this.findOne(id, tenantSlug);
    await this.rolesRepository.remove(role);
  }

  // Permissions Management
  async findAllPermissions(tenantSlug: string): Promise<Permission[]> {
    return this.permissionsRepository.find({
      where: { tenantSlug } as any,
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[], tenantSlug: string): Promise<Role> {
    const role = await this.findOne(roleId, tenantSlug);
    const permissions = await this.permissionsRepository.findByIds(permissionIds);

    role.permissions = permissions;
    return this.rolesRepository.save(role);
  }

  async removePermission(roleId: string, permissionId: string, tenantSlug: string): Promise<Role> {
    const role = await this.findOne(roleId, tenantSlug);

    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    return this.rolesRepository.save(role);
  }
}
