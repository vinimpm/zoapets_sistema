import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreatePagamentoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('financeiro')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  // Contas
  @Get('contas')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  findAllContas(
    @Query('status') status?: string,
    @Query('tutorId') tutorId?: string,
  ) {
    return this.financeiroService.findAllContas({ status, tutorId });
  }

  @Get('contas/vencidas')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  getContasVencidas() {
    return this.financeiroService.getContasVencidas();
  }

  @Get('contas/:id')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  findOneConta(@Param('id') id: string) {
    return this.financeiroService.findOneConta(id);
  }

  @Get('resumo')
  @Roles('Administrador', 'Gerente')
  getResumoFinanceiro(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return this.financeiroService.getResumoFinanceiro(new Date(inicio), new Date(fim));
  }

  // Pagamentos
  @Post('pagamentos')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  createPagamento(@Body() createPagamentoDto: CreatePagamentoDto) {
    return this.financeiroService.createPagamento(createPagamentoDto);
  }

  @Get('pagamentos')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  findAllPagamentos(@Query('contaId') contaId?: string) {
    return this.financeiroService.findAllPagamentos(contaId);
  }

  @Get('pagamentos/:id')
  @Roles('Recepcionista', 'Administrador', 'Gerente')
  findOnePagamento(@Param('id') id: string) {
    return this.financeiroService.findOnePagamento(id);
  }

  @Patch('pagamentos/:id/cancelar')
  @Roles('Administrador', 'Gerente')
  cancelarPagamento(@Param('id') id: string) {
    return this.financeiroService.cancelarPagamento(id);
  }
}
