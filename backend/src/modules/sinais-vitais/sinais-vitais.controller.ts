import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SinaisVitaisService } from './sinais-vitais.service';
import { CreateSinaisVitaisDto, UpdateSinaisVitaisDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('sinais-vitais')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SinaisVitaisController {
  constructor(private readonly sinaisVitaisService: SinaisVitaisService) {}

  @Post()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  create(@Body() createSinaisVitaisDto: CreateSinaisVitaisDto) {
    return this.sinaisVitaisService.create(createSinaisVitaisDto);
  }

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(@Query('internacaoId') internacaoId?: string) {
    return this.sinaisVitaisService.findAll(internacaoId);
  }

  @Get('internacao/:internacaoId')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByInternacao(
    @Param('internacaoId') internacaoId: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    const periodo = inicio && fim ? { inicio: new Date(inicio), fim: new Date(fim) } : undefined;
    return this.sinaisVitaisService.findByInternacao(internacaoId, periodo);
  }

  @Get('internacao/:internacaoId/ultimo')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  getUltimo(@Param('internacaoId') internacaoId: string) {
    return this.sinaisVitaisService.getUltimo(internacaoId);
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.sinaisVitaisService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateSinaisVitaisDto: UpdateSinaisVitaisDto) {
    return this.sinaisVitaisService.update(id, updateSinaisVitaisDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sinaisVitaisService.remove(id);
  }
}
