import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/roles.guard';
import { Roles } from '@/core/auth/roles.decorator';
import { SopsService } from './sops.service';
import { CreateSopDto, UpdateSopDto } from './dto';

@Controller('sops')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SopsController {
  constructor(private readonly sopsService: SopsService) {}

  @Post()
  @Roles('admin', 'veterinario')
  create(@Body() createDto: CreateSopDto) {
    return this.sopsService.create(createDto);
  }

  @Get()
  @Roles('admin', 'veterinario', 'auxiliar')
  findAll(@Query('categoria') categoria?: string, @Query('search') search?: string) {
    return this.sopsService.findAll(categoria, search);
  }

  @Get('active')
  @Roles('admin', 'veterinario', 'auxiliar')
  findActive() {
    return this.sopsService.findActive();
  }

  @Get('categories')
  @Roles('admin', 'veterinario', 'auxiliar')
  getCategories() {
    return this.sopsService.getCategories();
  }

  @Get('category/:categoria')
  @Roles('admin', 'veterinario', 'auxiliar')
  findByCategory(@Param('categoria') categoria: string) {
    return this.sopsService.findByCategory(categoria);
  }

  @Get('codigo/:codigo')
  @Roles('admin', 'veterinario', 'auxiliar')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.sopsService.findByCodigo(codigo);
  }

  @Get(':id')
  @Roles('admin', 'veterinario', 'auxiliar')
  findById(@Param('id') id: string) {
    return this.sopsService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'veterinario')
  update(@Param('id') id: string, @Body() updateDto: UpdateSopDto) {
    return this.sopsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.sopsService.delete(id);
  }
}
