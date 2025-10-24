import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EscalasService } from './escalas.service';
import { CreateEscalaDto, UpdateEscalaDto, CreateTurnoDto, UpdateTurnoDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('escalas')
export class EscalasController {
  constructor(private readonly escalasService: EscalasService) {}

  // Turnos
  @Post('turnos')
  @Roles(Role.ADMIN, Role.GERENTE)
  createTurno(@Body() createTurnoDto: CreateTurnoDto) {
    return this.escalasService.createTurno(createTurnoDto);
  }

  @Get('turnos')
  findAllTurnos() {
    return this.escalasService.findAllTurnos();
  }

  @Get('turnos/:id')
  findOneTurno(@Param('id') id: string) {
    return this.escalasService.findOneTurno(id);
  }

  @Patch('turnos/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  updateTurno(@Param('id') id: string, @Body() updateTurnoDto: UpdateTurnoDto) {
    return this.escalasService.updateTurno(id, updateTurnoDto);
  }

  @Delete('turnos/:id')
  @Roles(Role.ADMIN)
  removeTurno(@Param('id') id: string) {
    return this.escalasService.removeTurno(id);
  }

  // Escalas
  @Post()
  @Roles(Role.ADMIN, Role.GERENTE)
  createEscala(@Body() createEscalaDto: CreateEscalaDto, @Request() req: any) {
    return this.escalasService.createEscala(createEscalaDto, req.user.id);
  }

  @Get()
  findAllEscalas(
    @Query('funcionarioId') funcionarioId?: string,
    @Query('turnoId') turnoId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
  ) {
    return this.escalasService.findAllEscalas({
      funcionarioId,
      turnoId,
      dataInicio,
      dataFim,
      status,
    });
  }

  @Get('semana')
  getEscalasPorSemana(@Query('dataInicio') dataInicio: string) {
    return this.escalasService.getEscalasPorSemana(dataInicio);
  }

  @Get(':id')
  findOneEscala(@Param('id') id: string) {
    return this.escalasService.findOneEscala(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  updateEscala(@Param('id') id: string, @Body() updateEscalaDto: UpdateEscalaDto) {
    return this.escalasService.updateEscala(id, updateEscalaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  removeEscala(@Param('id') id: string) {
    return this.escalasService.removeEscala(id);
  }
}
