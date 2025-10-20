import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { PublicApi } from '../../common/decorators/public-api.decorator';
import { PetsService } from '../pets/pets.service';
import { TutoresService } from '../tutores/tutores.service';
import { InternacoesService } from '../internacoes/internacoes.service';
import { AgendamentosService } from '../agendamentos/agendamentos.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { CreatePetDto, UpdatePetDto } from '../pets/dto';
import { CreateTutorDto, UpdateTutorDto } from '../tutores/dto';
import { CreateInternacaoDto, UpdateInternacaoDto, AltaDto } from '../internacoes/dto';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from '../agendamentos/dto';
import { CreatePagamentoDto } from '../financeiro/dto';

/**
 * Public API Controller
 *
 * Endpoints públicos que podem ser acessados com API Key
 * Requer autenticação via X-API-Key header
 */
@Controller('public')
@UseGuards(ApiKeyGuard)
@PublicApi()
export class PublicApiController {
  constructor(
    private readonly petsService: PetsService,
    private readonly tutoresService: TutoresService,
    private readonly internacoesService: InternacoesService,
    private readonly agendamentosService: AgendamentosService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  // ===== PETS =====

  @Get('pets')
  async getPets(@Query('search') search?: string, @Query('tutorId') tutorId?: string) {
    return this.petsService.findAll(search, tutorId);
  }

  @Get('pets/:id')
  async getPet(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Get('pets/microchip/:microchip')
  async getPetByMicrochip(@Param('microchip') microchip: string) {
    return this.petsService.findByMicrochip(microchip);
  }

  @Post('pets')
  async createPet(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Patch('pets/:id')
  async updatePet(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  // ===== TUTORES =====

  @Get('tutores')
  async getTutores(@Query('search') search?: string) {
    return this.tutoresService.findAll(search);
  }

  @Get('tutores/:id')
  async getTutor(@Param('id') id: string) {
    return this.tutoresService.findOne(id);
  }

  @Get('tutores/cpf/:cpf')
  async getTutorByCpf(@Param('cpf') cpf: string) {
    return this.tutoresService.findByCpf(cpf);
  }

  @Post('tutores')
  async createTutor(@Body() createTutorDto: CreateTutorDto) {
    return this.tutoresService.create(createTutorDto);
  }

  @Patch('tutores/:id')
  async updateTutor(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutoresService.update(id, updateTutorDto);
  }

  // ===== INTERNAÇÕES =====

  @Get('internacoes')
  async getInternacoes(
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string,
  ) {
    return this.internacoesService.findAll(status, prioridade);
  }

  @Get('internacoes/active')
  async getInternacoesAtivas() {
    return this.internacoesService.findActive();
  }

  @Get('internacoes/ocupacao-leitos')
  async getOcupacaoLeitos() {
    return this.internacoesService.getOcupacaoLeitos();
  }

  @Get('internacoes/:id')
  async getInternacao(@Param('id') id: string) {
    return this.internacoesService.findOne(id);
  }

  @Get('internacoes/pet/:petId')
  async getInternacoesByPet(@Param('petId') petId: string) {
    return this.internacoesService.findByPet(petId);
  }

  @Post('internacoes')
  async createInternacao(@Body() createInternacaoDto: CreateInternacaoDto) {
    return this.internacoesService.create(createInternacaoDto);
  }

  @Patch('internacoes/:id')
  async updateInternacao(@Param('id') id: string, @Body() updateInternacaoDto: UpdateInternacaoDto) {
    return this.internacoesService.update(id, updateInternacaoDto);
  }

  @Patch('internacoes/:id/alta')
  async darAlta(@Param('id') id: string, @Body() altaDto: AltaDto) {
    return this.internacoesService.darAlta(id, altaDto);
  }

  // ===== AGENDAMENTOS =====

  @Get('agendamentos')
  async getAgendamentos(
    @Query('data') data?: string,
    @Query('veterinarioId') veterinarioId?: string,
    @Query('status') status?: string,
  ) {
    return this.agendamentosService.findAll({
      data: data ? new Date(data) : undefined,
      veterinarioId,
      status,
    });
  }

  @Get('agendamentos/periodo')
  async getAgendamentosPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
    @Query('veterinarioId') veterinarioId?: string,
  ) {
    return this.agendamentosService.findByPeriodo(
      new Date(inicio),
      new Date(fim),
      veterinarioId,
    );
  }

  @Get('agendamentos/:id')
  async getAgendamento(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Post('agendamentos')
  async createAgendamento(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Patch('agendamentos/:id')
  async updateAgendamento(@Param('id') id: string, @Body() updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Patch('agendamentos/:id/confirmar')
  async confirmarAgendamento(@Param('id') id: string) {
    return this.agendamentosService.confirmar(id);
  }

  @Patch('agendamentos/:id/cancelar')
  async cancelarAgendamento(@Param('id') id: string, @Body('motivo') motivo?: string) {
    return this.agendamentosService.cancelar(id, motivo);
  }

  // ===== FINANCEIRO =====

  @Get('financeiro/contas')
  async getContas(@Query('status') status?: string) {
    return this.financeiroService.findAllContas(status);
  }

  @Get('financeiro/contas/:id')
  async getConta(@Param('id') id: string) {
    return this.financeiroService.findConta(id);
  }

  @Post('financeiro/contas/:id/pagamentos')
  async createPagamento(
    @Param('id') contaId: string,
    @Body() createPagamentoDto: CreatePagamentoDto,
  ) {
    return this.financeiroService.createPagamento(contaId, createPagamentoDto);
  }

  // Health check
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      api: 'Zoa Pets Public API',
      version: '2.0.0', // Upgraded with write operations
      features: ['read', 'write'],
    };
  }
}
