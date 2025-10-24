import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto, UpdateConsultaDto, GerarInternacaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('consultas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  @Roles('Veterinário', 'Administrador', 'Gerente')
  create(@Body() createConsultaDto: CreateConsultaDto) {
    return this.consultasService.create(createConsultaDto);
  }

  @Get()
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('data') data?: string,
    @Query('veterinarioId') veterinarioId?: string,
    @Query('status') status?: string,
    @Query('petId') petId?: string,
  ) {
    return this.consultasService.findAll({
      data: data ? new Date(data) : undefined,
      veterinarioId,
      status,
      petId,
    });
  }

  @Get('pet/:petId')
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findByPet(@Param('petId') petId: string) {
    return this.consultasService.findByPet(petId);
  }

  @Get(':id')
  @Roles('Recepcionista', 'Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.consultasService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateConsultaDto: UpdateConsultaDto) {
    return this.consultasService.update(id, updateConsultaDto);
  }

  @Patch(':id/concluir')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  concluir(@Param('id') id: string) {
    return this.consultasService.concluir(id);
  }

  @Post(':id/gerar-internacao')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  gerarInternacao(
    @Param('id') id: string,
    @Body() gerarInternacaoDto: GerarInternacaoDto,
  ) {
    return this.consultasService.gerarInternacao(id, gerarInternacaoDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.consultasService.remove(id);
  }
}
