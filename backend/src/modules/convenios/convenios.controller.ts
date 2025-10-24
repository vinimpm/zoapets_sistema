import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/roles.guard';
import { Roles } from '@/core/auth/roles.decorator';
import { ConveniosService } from './convenios.service';
import { CreateConvenioDto, UpdateConvenioDto } from './dto';

@Controller('convenios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConveniosController {
  constructor(private readonly conveniosService: ConveniosService) {}

  @Post()
  @Roles('admin')
  create(@Body() createDto: CreateConvenioDto) {
    return this.conveniosService.create(createDto);
  }

  @Get()
  @Roles('admin', 'veterinario', 'auxiliar')
  findAll(@Query('ativo') ativo?: string) {
    const isAtivo = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.conveniosService.findAll(isAtivo);
  }

  @Get('active')
  @Roles('admin', 'veterinario', 'auxiliar')
  findActive() {
    return this.conveniosService.findActive();
  }

  @Get('cnpj/:cnpj')
  @Roles('admin', 'veterinario')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.conveniosService.findByCnpj(cnpj);
  }

  @Get(':id')
  @Roles('admin', 'veterinario', 'auxiliar')
  findById(@Param('id') id: string) {
    return this.conveniosService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateConvenioDto) {
    return this.conveniosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.conveniosService.delete(id);
  }
}
