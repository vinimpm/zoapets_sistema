import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AdministracoesService } from './administracoes.service';
import { RegistrarAdministracaoDto, NaoRealizarAdministracaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('administracoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdministracoesController {
  constructor(private readonly administracoesService: AdministracoesService) {}

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('status') status?: string,
    @Query('internacaoId') internacaoId?: string,
  ) {
    return this.administracoesService.findAll(status, internacaoId);
  }

  @Get('pendentes')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findPendentes() {
    return this.administracoesService.findPendentes();
  }

  @Get('atrasadas')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAtrasadas() {
    return this.administracoesService.findAtrasadas();
  }

  @Get('proximas')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findProximas(@Query('horas') horas?: number) {
    return this.administracoesService.findProximas(horas ? Number(horas) : 2);
  }

  @Get('resumo')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  getResumo(@Query('internacaoId') internacaoId?: string) {
    return this.administracoesService.getResumo(internacaoId);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.administracoesService.findOne(id);
  }

  @Patch(':id/registrar')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  registrar(@Param('id') id: string, @Body() dto: RegistrarAdministracaoDto) {
    return this.administracoesService.registrar(id, dto);
  }

  @Patch(':id/nao-realizar')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  naoRealizar(@Param('id') id: string, @Body() dto: NaoRealizarAdministracaoDto) {
    return this.administracoesService.naoRealizar(id, dto);
  }

  @Post('atualizar-atrasadas')
  @Roles('Administrador', 'Gerente')
  updateStatusAtrasadas() {
    return this.administracoesService.updateStatusAtrasadas();
  }
}
