import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  @Roles('Recepcionista', 'Veterinário', 'Administrador', 'Gerente')
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Get()
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('data') data?: string,
    @Query('veterinarioId') veterinarioId?: string,
    @Query('status') status?: string,
  ) {
    return this.agendamentosService.findAll({
      data: data ? new Date(data) : undefined,
      veterinarioId,
      status,
    });
  }

  @Get('periodo')
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
    @Query('veterinarioId') veterinarioId?: string,
  ) {
    return this.agendamentosService.findByPeriodo(new Date(inicio), new Date(fim), veterinarioId);
  }

  @Get(':id')
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Recepcionista', 'Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Patch(':id/confirmar')
  @Roles('Recepcionista', 'Veterinário', 'Administrador', 'Gerente')
  confirmar(@Param('id') id: string) {
    return this.agendamentosService.confirmar(id);
  }

  @Patch(':id/cancelar')
  @Roles('Recepcionista', 'Veterinário', 'Administrador', 'Gerente')
  cancelar(@Param('id') id: string) {
    return this.agendamentosService.cancelar(id);
  }

  @Patch(':id/falta')
  @Roles('Recepcionista', 'Veterinário', 'Administrador', 'Gerente')
  marcarFalta(@Param('id') id: string) {
    return this.agendamentosService.marcarFalta(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(id);
  }
}
