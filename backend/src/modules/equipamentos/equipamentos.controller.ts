import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/roles.guard';
import { Roles } from '@/core/auth/roles.decorator';
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto, UpdateEquipamentoDto } from './dto';

@Controller('equipamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @Roles('admin')
  create(@Body() createDto: CreateEquipamentoDto) {
    return this.equipamentosService.create(createDto);
  }

  @Get()
  @Roles('admin', 'veterinario', 'auxiliar')
  findAll(@Query('tipo') tipo?: string, @Query('status') status?: string) {
    return this.equipamentosService.findAll(tipo, status);
  }

  @Get('needing-maintenance')
  @Roles('admin', 'veterinario')
  findNeedingMaintenance() {
    return this.equipamentosService.findNeedingMaintenance();
  }

  @Get(':id')
  @Roles('admin', 'veterinario', 'auxiliar')
  findById(@Param('id') id: string) {
    return this.equipamentosService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateEquipamentoDto) {
    return this.equipamentosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.equipamentosService.delete(id);
  }
}
