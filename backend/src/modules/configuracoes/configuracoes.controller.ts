import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('configuracoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  @Roles('Administrador', 'Gerente')
  get(@Req() req: any) {
    return this.configuracoesService.get(req.tenantSlug);
  }

  @Patch()
  @Roles('Administrador')
  update(@Body() updateConfiguracaoDto: UpdateConfiguracaoDto, @Req() req: any) {
    return this.configuracoesService.update(updateConfiguracaoDto, req.tenantSlug);
  }
}
