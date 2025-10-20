import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TutoresService } from './tutores.service';
import { CreateTutorDto, UpdateTutorDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('tutores')
@UseGuards(JwtAuthGuard)
export class TutoresController {
  constructor(private readonly tutoresService: TutoresService) {}

  @Post()
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutoresService.create(createTutorDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.tutoresService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutoresService.findOne(id);
  }

  @Get('cpf/:cpf')
  findByCpf(@Param('cpf') cpf: string) {
    return this.tutoresService.findByCpf(cpf);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutoresService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tutoresService.remove(id);
  }
}
