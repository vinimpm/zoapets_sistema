'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produtosService, type Produto, type CreateProdutoDto } from '@/services/produtos.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIAS_PREDEFINIDAS = [
  'medicamento',
  'material_cirurgico',
  'alimento',
  'higiene',
  'servico',
  'exame',
  'procedimento',
  'internacao',
  'consulta',
  'outros',
];

const UNIDADES = [
  'unidade',
  'caixa',
  'frasco',
  'ampola',
  'comprimido',
  'capsula',
  'ml',
  'kg',
  'g',
  'litro',
  'serviço',
];

export default function ProdutosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('all');
  const [ativoFilter, setAtivoFilter] = useState<string>('true');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<CreateProdutoDto>({
    codigo: '',
    nome: '',
    categoria: 'servico',
    descricao: '',
    fabricante: '',
    lote: '',
    unidade: 'unidade',
    estoqueMinimo: 0,
    estoqueAtual: 0,
    precoCusto: 0,
    precoVenda: 0,
    ativo: true,
  });

  // Query para listar produtos
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos', categoriaFilter, ativoFilter, searchTerm],
    queryFn: () => {
      const ativo = ativoFilter === 'all' ? undefined : ativoFilter === 'true';
      const categoria = categoriaFilter === 'all' ? undefined : categoriaFilter;
      return produtosService.findAll(categoria, ativo, searchTerm);
    },
  });

  // Query para estoque baixo
  const { data: estoqueBaixo = [] } = useQuery({
    queryKey: ['produtos-estoque-baixo'],
    queryFn: () => produtosService.getEstoqueBaixo(),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreateProdutoDto) =>
      editingProduto
        ? produtosService.update(editingProduto.id, data)
        : produtosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
      toast.success(editingProduto ? 'Produto atualizado!' : 'Produto criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar produto');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => produtosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto removido!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover produto');
    },
  });

  const handleOpenDialog = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        categoria: produto.categoria,
        descricao: produto.descricao || '',
        fabricante: produto.fabricante || '',
        lote: produto.lote || '',
        unidade: produto.unidade,
        estoqueMinimo: produto.estoqueMinimo,
        estoqueAtual: produto.estoqueAtual,
        precoCusto: produto.precoCusto,
        precoVenda: produto.precoVenda,
        ativo: produto.ativo,
      });
    } else {
      setEditingProduto(null);
      setFormData({
        codigo: '',
        nome: '',
        categoria: 'servico',
        descricao: '',
        fabricante: '',
        lote: '',
        unidade: 'unidade',
        estoqueMinimo: 0,
        estoqueAtual: 0,
        precoCusto: 0,
        precoVenda: 0,
        ativo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Produtos e Serviços"
        description="Gerencie produtos, serviços e preços"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estoque', href: '/medicamentos' },
          { label: 'Produtos & Serviços' },
        ]}
      />

      {/* Alerta de Estoque Baixo */}
      {estoqueBaixo.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-orange-900">Produtos com Estoque Baixo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800">
              {estoqueBaixo.length} produto(s) abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de Produtos e Serviços</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto/Serviço
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIAS_PREDEFINIDAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ativoFilter} onValueChange={setAtivoFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço Custo</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.codigo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{produto.nome}</span>
                        {produto.descricao && (
                          <span className="text-sm text-muted-foreground truncate max-w-xs">
                            {produto.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {produto.categoria.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.unidade}</TableCell>
                    <TableCell>
                      {produto.categoria !== 'servico' ? (
                        <div className="flex flex-col">
                          <span className={produto.estoqueAtual <= produto.estoqueMinimo ? 'text-orange-500 font-bold' : ''}>
                            {produto.estoqueAtual}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Mín: {produto.estoqueMinimo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(produto.precoCusto)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(produto.precoVenda)}
                    </TableCell>
                    <TableCell>
                      {produto.ativo ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(produto)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(produto.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do produto ou serviço
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                    placeholder="Ex: PROD-001"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PREDEFINIDAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome do produto ou serviço"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={2}
                  placeholder="Descrição detalhada (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={formData.fabricante}
                    onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                    placeholder="Nome do fabricante"
                  />
                </div>
                <div>
                  <Label htmlFor="lote">Lote</Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    placeholder="Número do lote"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unidade">Unidade *</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade.charAt(0).toUpperCase() + unidade.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    value={formData.estoqueMinimo}
                    onChange={(e) =>
                      setFormData({ ...formData, estoqueMinimo: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                  <Input
                    id="estoqueAtual"
                    type="number"
                    value={formData.estoqueAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, estoqueAtual: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precoCusto">Preço de Custo (R$) *</Label>
                  <Input
                    id="precoCusto"
                    type="number"
                    step="0.01"
                    value={formData.precoCusto}
                    onChange={(e) =>
                      setFormData({ ...formData, precoCusto: parseFloat(e.target.value) || 0 })
                    }
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="precoVenda">Preço de Venda (R$) *</Label>
                  <Input
                    id="precoVenda"
                    type="number"
                    step="0.01"
                    value={formData.precoVenda}
                    onChange={(e) =>
                      setFormData({ ...formData, precoVenda: parseFloat(e.target.value) || 0 })
                    }
                    required
                    min="0"
                  />
                </div>
              </div>

              {formData.precoVenda > 0 && formData.precoCusto > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Margem de Lucro:</strong>{' '}
                    {(((formData.precoVenda - formData.precoCusto) / formData.precoCusto) * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
