import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Produto } from '../../common/entities/produto.entity';
import { CreateProdutoDto, UpdateProdutoDto } from './dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    // Verificar se já existe produto com o mesmo código
    const existingProduto = await this.produtoRepository.findOne({
      where: { codigo: createProdutoDto.codigo },
    });

    if (existingProduto) {
      throw new BadRequestException('Já existe um produto com este código');
    }

    const produto = this.produtoRepository.create(createProdutoDto);
    return await this.produtoRepository.save(produto);
  }

  async findAll(
    categoria?: string,
    ativo?: boolean,
    search?: string,
  ): Promise<Produto[]> {
    const query = this.produtoRepository.createQueryBuilder('produto');

    if (categoria) {
      query.andWhere('produto.categoria = :categoria', { categoria });
    }

    if (ativo !== undefined) {
      query.andWhere('produto.ativo = :ativo', { ativo });
    }

    if (search) {
      query.andWhere(
        '(produto.nome ILIKE :search OR produto.codigo ILIKE :search OR produto.descricao ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('produto.nome', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { id },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async findByCodigo(codigo: string): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { codigo },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.findOne(id);

    // Se estiver alterando o código, verificar se não existe outro produto com o mesmo código
    if (updateProdutoDto.codigo && updateProdutoDto.codigo !== produto.codigo) {
      const existingProduto = await this.produtoRepository.findOne({
        where: { codigo: updateProdutoDto.codigo },
      });

      if (existingProduto) {
        throw new BadRequestException('Já existe um produto com este código');
      }
    }

    Object.assign(produto, updateProdutoDto);
    return await this.produtoRepository.save(produto);
  }

  async remove(id: string): Promise<void> {
    const produto = await this.findOne(id);
    await this.produtoRepository.remove(produto);
  }

  async updateEstoque(id: string, quantidade: number): Promise<Produto> {
    const produto = await this.findOne(id);
    produto.estoqueAtual += quantidade;

    if (produto.estoqueAtual < 0) {
      throw new BadRequestException('Estoque insuficiente');
    }

    return await this.produtoRepository.save(produto);
  }

  async getEstoqueBaixo(): Promise<Produto[]> {
    return await this.produtoRepository
      .createQueryBuilder('produto')
      .where('produto.estoqueAtual <= produto.estoqueMinimo')
      .andWhere('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.nome', 'ASC')
      .getMany();
  }

  async getProdutosVencendo(dias: number = 30): Promise<Produto[]> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);

    return await this.produtoRepository
      .createQueryBuilder('produto')
      .where('produto.dataValidade IS NOT NULL')
      .andWhere('produto.dataValidade <= :dataLimite', { dataLimite })
      .andWhere('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.dataValidade', 'ASC')
      .getMany();
  }

  async getCategorias(): Promise<string[]> {
    const result = await this.produtoRepository
      .createQueryBuilder('produto')
      .select('DISTINCT produto.categoria', 'categoria')
      .orderBy('produto.categoria', 'ASC')
      .getRawMany();

    return result.map((r) => r.categoria);
  }
}
