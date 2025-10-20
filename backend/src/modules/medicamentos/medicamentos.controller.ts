import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MedicamentosService } from './medicamentos.service';
import { CreateMedicamentoDto, UpdateMedicamentoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('medicamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicamentosController {
  constructor(private readonly medicamentosService: MedicamentosService) {}

  @Post()
  @Roles('Veterinário', 'Administrador', 'Gerente')
  create(@Body() createMedicamentoDto: CreateMedicamentoDto) {
    return this.medicamentosService.create(createMedicamentoDto);
  }

  @Get()
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findAll(
    @Query('search') search?: string,
    @Query('usoControlado') usoControlado?: string,
  ) {
    return this.medicamentosService.findAll(
      search,
      usoControlado === 'true' ? true : usoControlado === 'false' ? false : undefined,
    );
  }

  @Get('estoque-baixo')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findEstoqueBaixo() {
    return this.medicamentosService.findEstoqueBaixo();
  }

  @Get(':id')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string) {
    return this.medicamentosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Veterinário', 'Administrador', 'Gerente')
  update(@Param('id') id: string, @Body() updateMedicamentoDto: UpdateMedicamentoDto) {
    return this.medicamentosService.update(id, updateMedicamentoDto);
  }

  @Patch(':id/estoque')
  @Roles('Veterinário', 'Enfermeiro', 'Administrador', 'Gerente')
  ajustarEstoque(
    @Param('id') id: string,
    @Body('quantidade') quantidade: number,
    @Body('tipo') tipo: 'adicionar' | 'remover',
  ) {
    return this.medicamentosService.ajustarEstoque(id, quantidade, tipo);
  }

  @Patch(':id/deactivate')
  @Roles('Administrador', 'Gerente')
  deactivate(@Param('id') id: string) {
    return this.medicamentosService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('Administrador', 'Gerente')
  activate(@Param('id') id: string) {
    return this.medicamentosService.activate(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.medicamentosService.remove(id);
  }
}
