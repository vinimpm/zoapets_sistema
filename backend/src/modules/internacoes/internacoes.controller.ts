import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InternacoesService } from './internacoes.service';
import { CreateInternacaoDto, UpdateInternacaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('internacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternacoesController {
  constructor(private readonly internacoesService: InternacoesService) {}

  @Post()
  @Roles('Veterinário', 'Administrador', 'Gerente')
  create(@Body() createInternacaoDto: CreateInternacaoDto) {
    return this.internacoesService.create(createInternacaoDto);
  }

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string,
  ) {
    return this.internacoesService.findAll(status, prioridade);
  }

  @Get('active')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findActive() {
    return this.internacoesService.findActive();
  }

  @Get('critical')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findCritical() {
    return this.internacoesService.findCritical();
  }

  @Get('ocupacao-leitos')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  getOcupacaoLeitos() {
    return this.internacoesService.getOcupacaoLeitos();
  }

  @Get('pet/:petId')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByPet(@Param('petId') petId: string) {
    return this.internacoesService.findByPet(petId);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.internacoesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateInternacaoDto: UpdateInternacaoDto) {
    return this.internacoesService.update(id, updateInternacaoDto);
  }

  @Patch(':id/alta')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  darAlta(@Param('id') id: string, @Body('observacoes') observacoes?: string) {
    return this.internacoesService.darAlta(id, observacoes);
  }

  @Patch(':id/obito')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  registrarObito(@Param('id') id: string, @Body('observacoes') observacoes?: string) {
    return this.internacoesService.registrarObito(id, observacoes);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.internacoesService.remove(id);
  }
}
