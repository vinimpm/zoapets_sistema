import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/roles.guard';
import { Roles } from '@/core/auth/roles.decorator';
import { CampanhasService } from './campanhas.service';
import { CreateCampanhaDto, UpdateCampanhaDto } from './dto';

@Controller('campanhas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Post()
  @Roles('admin')
  create(@Body() createDto: CreateCampanhaDto) {
    return this.campanhasService.create(createDto);
  }

  @Get()
  @Roles('admin', 'veterinario')
  findAll(@Query('status') status?: string, @Query('canal') canal?: string) {
    return this.campanhasService.findAll(status, canal);
  }

  @Get('active')
  @Roles('admin', 'veterinario')
  findActive() {
    return this.campanhasService.findActive();
  }

  @Get(':id')
  @Roles('admin', 'veterinario')
  findById(@Param('id') id: string) {
    return this.campanhasService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateCampanhaDto) {
    return this.campanhasService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.campanhasService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.campanhasService.delete(id);
  }
}
