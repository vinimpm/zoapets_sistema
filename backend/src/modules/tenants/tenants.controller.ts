import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { TenantProvisioningService, ProvisionTenantDto } from './tenant-provisioning.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly provisioningService: TenantProvisioningService) {}

  /**
   * Lista todos os schemas/tenants existentes no banco
   * Endpoint público para diagnóstico
   */
  @Get('list-schemas')
  @Public()
  async listSchemas() {
    return await this.provisioningService.listAllSchemas();
  }

  /**
   * Endpoint administrativo para provisionar um novo tenant
   * Apenas super-admins devem ter acesso a este endpoint
   */
  @Post('provision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  async provisionTenant(@Body() dto: ProvisionTenantDto) {
    await this.provisioningService.provisionNewTenant(dto);
    return {
      message: 'Tenant provisionado com sucesso',
      tenantSlug: dto.tenantSlug,
    };
  }

  /**
   * Verifica se um tenant existe
   */
  @Get('exists/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async checkTenantExists(@Param('slug') slug: string) {
    const exists = await this.provisioningService.tenantExists(slug);
    return {
      slug,
      exists,
    };
  }
}
