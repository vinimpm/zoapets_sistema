'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  movimentacoesEstoqueService,
  type CreateMovimentacaoDto,
} from '@/services/movimentacoes-estoque.service';
import { medicamentosService } from '@/services/medicamentos.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, ArrowUpCircle, ArrowDownCircle, Package, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MovimentacoesEstoquePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [tipoFilter, setTipoFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMovimentacaoDto>({
    medicamentoId: '',
    tipo: 'entrada',
    quantidade: 1,
    motivo: '',
    responsavelId: user?.id || '',
    observacoes: '',
  });

  // Query para listar movimentações
  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ['movimentacoes-estoque', tipoFilter],
    queryFn: () =>
      movimentacoesEstoqueService.findAll(tipoFilter !== 'all' ? tipoFilter : undefined),
  });

  // Query para resumo
  const { data: resumo } = useQuery({
    queryKey: ['movimentacoes-resumo'],
    queryFn: () => movimentacoesEstoqueService.getResumo(),
  });

  // Query para medicamentos
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => medicamentosService.findAll(),
  });

  // Mutation para criar movimentação
  const createMutation = useMutation({
    mutationFn: (data: CreateMovimentacaoDto) => movimentacoesEstoqueService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      toast.success('Movimentação registrada com sucesso!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar movimentação');
    },
  });

  const handleOpenDialog = () => {
    setFormData({
      medicamentoId: '',
      tipo: 'entrada',
      quantidade: 1,
      motivo: '',
      responsavelId: user?.id || '',
      observacoes: '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Preparar dados para o gráfico
  const chartData = movimentacoes
    .slice(0, 10)
    .reverse()
    .map((mov) => ({
      data: format(new Date(mov.dataHora), 'dd/MM'),
      Entradas: mov.tipo === 'entrada' ? mov.quantidade : 0,
      Saídas: mov.tipo === 'saida' ? mov.quantidade : 0,
    }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
        <p className="text-muted-foreground">
          Gerencie entradas e saídas de medicamentos do estoque
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resumo?.totalEntradas || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {resumo?.quantidadeEntradas || 0} movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{resumo?.totalSaidas || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {resumo?.quantidadeSaidas || 0} movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo?.saldo || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Entradas - Saídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo?.totalMovimentacoes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">No período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Últimas 10 Movimentações</CardTitle>
          <CardDescription>Visualização de entradas e saídas recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entradas" fill="#10b981" />
                <Bar dataKey="Saídas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma movimentação registrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Movimentações</CardTitle>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes.map((movimentacao) => (
                  <TableRow key={movimentacao.id}>
                    <TableCell>
                      {format(new Date(movimentacao.dataHora), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{movimentacao.medicamento.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {movimentacao.medicamento.principioAtivo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {movimentacao.tipo === 'entrada' ? (
                        <Badge variant="success" className="gap-1">
                          <ArrowUpCircle className="h-3 w-3" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <ArrowDownCircle className="h-3 w-3" />
                          Saída
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{movimentacao.quantidade}</TableCell>
                    <TableCell>{movimentacao.motivo}</TableCell>
                    <TableCell>{movimentacao.responsavel.nomeCompleto}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {movimentacao.observacoes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Nova Movimentação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            <DialogDescription>Registre uma entrada ou saída de medicamento</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medicamentoId">Medicamento *</Label>
                  <Select
                    value={formData.medicamentoId}
                    onValueChange={(value) => setFormData({ ...formData, medicamentoId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o medicamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicamentos.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.nome} - Estoque: {med.estoqueAtual}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'entrada' | 'saida') =>
                      setFormData({ ...formData, tipo: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidade: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ex: Compra, Uso em cirurgia, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  placeholder="Informações adicionais sobre a movimentação"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Registrando...' : 'Registrar Movimentação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
