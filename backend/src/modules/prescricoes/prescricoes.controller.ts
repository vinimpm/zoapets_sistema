import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PrescricoesService } from './prescricoes.service';
import { CreatePrescricaoDto, UpdatePrescricaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('prescricoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescricoesController {
  constructor(private readonly prescricoesService: PrescricoesService) {}

  @Post()
  @Roles('Veterinário', 'Administrador', 'Gerente')
  create(@Body() createPrescricaoDto: CreatePrescricaoDto) {
    return this.prescricoesService.create(createPrescricaoDto);
  }

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('status') status?: string,
    @Query('petId') petId?: string,
  ) {
    return this.prescricoesService.findAll(status, petId);
  }

  @Get('pet/:petId')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByPet(@Param('petId') petId: string) {
    return this.prescricoesService.findByPet(petId);
  }

  @Get('internacao/:internacaoId')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByInternacao(@Param('internacaoId') internacaoId: string) {
    return this.prescricoesService.findByInternacao(internacaoId);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.prescricoesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updatePrescricaoDto: UpdatePrescricaoDto) {
    return this.prescricoesService.update(id, updatePrescricaoDto);
  }

  @Patch(':id/suspender')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  suspender(@Param('id') id: string) {
    return this.prescricoesService.suspender(id);
  }

  @Patch(':id/reativar')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  reativar(@Param('id') id: string) {
    return this.prescricoesService.reativar(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.prescricoesService.remove(id);
  }
}
