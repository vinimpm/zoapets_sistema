import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  create(@CurrentUser() user: any, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(user.id, createApiKeyDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  findAll(@CurrentUser() user: any) {
    // Admins can see all, others only their own
    const userId = user.roles.some((r: any) => r.nome === 'Administrador') ? undefined : user.id;
    return this.apiKeysService.findAll(userId);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Get(':id/stats')
  @Roles('Administrador', 'Gerente')
  getUsageStats(@Param('id') id: string) {
    return this.apiKeysService.getUsageStats(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
    return this.apiKeysService.update(id, updateApiKeyDto);
  }

  @Patch(':id/revoke')
  @Roles('Administrador', 'Gerente')
  revoke(@Param('id') id: string) {
    return this.apiKeysService.revoke(id);
  }

  @Patch(':id/activate')
  @Roles('Administrador', 'Gerente')
  activate(@Param('id') id: string) {
    return this.apiKeysService.activate(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.apiKeysService.remove(id);
  }
}
