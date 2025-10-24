import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto, UpdateProdutoDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE)
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Get()
  findAll(
    @Query('categoria') categoria?: string,
    @Query('ativo') ativo?: string,
    @Query('search') search?: string,
  ) {
    const ativoBoolean = ativo !== undefined ? ativo === 'true' : undefined;
    return this.produtosService.findAll(categoria, ativoBoolean, search);
  }

  @Get('categorias')
  getCategorias() {
    return this.produtosService.getCategorias();
  }

  @Get('estoque-baixo')
  getEstoqueBaixo() {
    return this.produtosService.getEstoqueBaixo();
  }

  @Get('vencendo')
  getProdutosVencendo(@Query('dias', ParseIntPipe) dias: number = 30) {
    return this.produtosService.getProdutosVencendo(dias);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ) {
    return this.produtosService.update(id, updateProdutoDto);
  }

  @Patch(':id/estoque')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VETERINARIO, Role.ENFERMEIRO)
  updateEstoque(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantidade', ParseIntPipe) quantidade: number,
  ) {
    return this.produtosService.updateEstoque(id, quantidade);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.remove(id);
  }
}
