import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';
import { CreateMovimentacaoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('movimentacoes-estoque')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimentacoesEstoqueController {
  constructor(private readonly movimentacoesEstoqueService: MovimentacoesEstoqueService) {}

  @Post()
  @Roles('Veterinário', 'Auxiliar', 'Administrador', 'Gerente')
  create(@Body() createMovimentacaoDto: CreateMovimentacaoDto, @Req() req: any) {
    return this.movimentacoesEstoqueService.create(createMovimentacaoDto, req.tenantSlug);
  }

  @Get()
  @Roles('Veterinário', 'Auxiliar', 'Administrador', 'Gerente')
  findAll(
    @Query('tipo') tipo?: string,
    @Query('medicamentoId') medicamentoId?: string,
    @Req() req?: any,
  ) {
    return this.movimentacoesEstoqueService.findAll(req.tenantSlug, tipo, medicamentoId);
  }

  @Get('resumo')
  @Roles('Administrador', 'Gerente')
  getResumo(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Req() req?: any,
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : undefined;
    const fim = dataFim ? new Date(dataFim) : undefined;
    return this.movimentacoesEstoqueService.getResumo(req.tenantSlug, inicio, fim);
  }

  @Get('periodo')
  @Roles('Administrador', 'Gerente')
  findByPeriodo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Req() req: any,
  ) {
    return this.movimentacoesEstoqueService.findByPeriodo(
      req.tenantSlug,
      new Date(dataInicio),
      new Date(dataFim),
    );
  }

  @Get('medicamento/:medicamentoId')
  @Roles('Veterinário', 'Auxiliar', 'Administrador', 'Gerente')
  findByMedicamento(@Param('medicamentoId') medicamentoId: string, @Req() req: any) {
    return this.movimentacoesEstoqueService.findByMedicamento(medicamentoId, req.tenantSlug);
  }

  @Get(':id')
  @Roles('Veterinário', 'Auxiliar', 'Administrador', 'Gerente')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.movimentacoesEstoqueService.findOne(id, req.tenantSlug);
  }
}
