import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PermissionsSeedService } from './permissions-seed.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsSeedService: PermissionsSeedService,
  ) {}

  @Post()
  @Roles('Administrador')
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    return this.rolesService.create(createRoleDto, req.tenantSlug);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  findAll(@Req() req: any) {
    return this.rolesService.findAll(req.tenantSlug);
  }

  @Get('permissions')
  @Roles('Administrador', 'Gerente')
  findAllPermissions(@Req() req: any) {
    return this.rolesService.findAllPermissions(req.tenantSlug);
  }

  @Post('seed-permissions')
  @Roles('Administrador')
  async seedPermissions(@Req() req: any) {
    await this.permissionsSeedService.seedPermissionsForTenant(req.tenantSlug);
    const totalPermissions = this.permissionsSeedService.getTotalPermissionsCount();
    return {
      message: 'Permissões sincronizadas com sucesso',
      tenant: req.tenantSlug,
      totalPermissions,
    };
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.rolesService.findOne(id, req.tenantSlug);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: any) {
    return this.rolesService.update(id, updateRoleDto, req.tenantSlug);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.rolesService.remove(id, req.tenantSlug);
  }

  @Post(':id/permissions')
  @Roles('Administrador')
  assignPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
    @Req() req: any,
  ) {
    return this.rolesService.assignPermissions(id, permissionIds, req.tenantSlug);
  }

  @Delete(':roleId/permissions/:permissionId')
  @Roles('Administrador')
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @Req() req: any,
  ) {
    return this.rolesService.removePermission(roleId, permissionId, req.tenantSlug);
  }
}
