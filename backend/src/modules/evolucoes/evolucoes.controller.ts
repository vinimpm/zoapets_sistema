import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EvolucoesService } from './evolucoes.service';
import { CreateEvolucaoDto, UpdateEvolucaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('evolucoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvolucoesController {
  constructor(private readonly evolucoesService: EvolucoesService) {}

  @Post()
  @Roles('Veterinário', 'Administrador', 'Gerente')
  create(@Body() createEvolucaoDto: CreateEvolucaoDto) {
    return this.evolucoesService.create(createEvolucaoDto);
  }

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(@Query('internacaoId') internacaoId?: string) {
    return this.evolucoesService.findAll(internacaoId);
  }

  @Get('internacao/:internacaoId')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByInternacao(@Param('internacaoId') internacaoId: string) {
    return this.evolucoesService.findByInternacao(internacaoId);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.evolucoesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateEvolucaoDto: UpdateEvolucaoDto) {
    return this.evolucoesService.update(id, updateEvolucaoDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.evolucoesService.remove(id);
  }
}
