import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExamesService } from './exames.service';
import { CreateResultadoExameDto, UpdateResultadoExameDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('exames')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamesController {
  constructor(private readonly examesService: ExamesService) {}

  // Catálogo de Exames
  @Get('catalogo')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAllExames() {
    return this.examesService.findAllExames();
  }

  @Get('catalogo/:id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOneExame(@Param('id') id: string) {
    return this.examesService.findOneExame(id);
  }

  // Resultados de Exames
  @Post('resultados')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  createResultado(@Body() createDto: CreateResultadoExameDto) {
    return this.examesService.createResultado(createDto);
  }

  @Get('resultados')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAllResultados(
    @Query('petId') petId?: string,
    @Query('internacaoId') internacaoId?: string,
    @Query('status') status?: string,
  ) {
    return this.examesService.findAllResultados({ petId, internacaoId, status });
  }

  @Get('resultados/:id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOneResultado(@Param('id') id: string) {
    return this.examesService.findOneResultado(id);
  }

  @Patch('resultados/:id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  updateResultado(@Param('id') id: string, @Body() updateDto: UpdateResultadoExameDto) {
    return this.examesService.updateResultado(id, updateDto);
  }

  @Patch('resultados/:id/registrar')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  registrarResultado(
    @Param('id') id: string,
    @Body('valores') valores: any,
    @Body('interpretacao') interpretacao?: string,
  ) {
    return this.examesService.registrarResultado(id, valores, interpretacao);
  }

  @Patch('resultados/:id/cancelar')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  cancelarExame(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.examesService.cancelarExame(id, motivo);
  }

  @Delete('resultados/:id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeResultado(@Param('id') id: string) {
    return this.examesService.removeResultado(id);
  }
}
