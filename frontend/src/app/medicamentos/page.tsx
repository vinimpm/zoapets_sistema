'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicamentosService, type Medicamento, type CreateMedicamentoDto } from '@/services/medicamentos.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicamentosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEstoqueDialogOpen, setIsEstoqueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | null>(null);
  const [deletingMedicamento, setDeletingMedicamento] = useState<Medicamento | null>(null);
  const [estoqueData, setEstoqueData] = useState({ quantidade: 0, tipo: 'entrada' as 'entrada' | 'saida', motivo: '' });
  const [formData, setFormData] = useState<CreateMedicamentoDto>({
    nome: '',
    principioAtivo: '',
    tipo: '',
    formaFarmaceutica: '',
    concentracao: '',
    estoqueMinimo: 0,
    estoqueAtual: 0,
    unidadeMedida: '',
    observacoes: '',
  });

  // Query para listar medicamentos
  const { data: medicamentos = [], isLoading } = useQuery({
    queryKey: ['medicamentos', search],
    queryFn: () => medicamentosService.findAll(search),
  });

  // Query para medicamentos com estoque baixo
  const { data: medicamentosEstoqueBaixo = [] } = useQuery({
    queryKey: ['medicamentos-estoque-baixo'],
    queryFn: () => medicamentosService.findEstoqueBaixo(),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreateMedicamentoDto) =>
      editingMedicamento
        ? medicamentosService.update(editingMedicamento.id, data)
        : medicamentosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      toast.success(editingMedicamento ? 'Medicamento atualizado!' : 'Medicamento criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar medicamento');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicamentosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      toast.success('Medicamento removido!');
      setIsDeleteDialogOpen(false);
      setDeletingMedicamento(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover medicamento');
    },
  });

  // Mutation para atualizar estoque
  const estoqueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicamentosService.updateEstoque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      queryClient.invalidateQueries({ queryKey: ['medicamentos-estoque-baixo'] });
      toast.success('Estoque atualizado!');
      setIsEstoqueDialogOpen(false);
      setEditingMedicamento(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar estoque');
    },
  });

  const handleOpenDialog = (medicamento?: Medicamento) => {
    if (medicamento) {
      setEditingMedicamento(medicamento);
      setFormData({
        nome: medicamento.nome,
        principioAtivo: medicamento.principioAtivo || '',
        tipo: medicamento.tipo || '',
        formaFarmaceutica: medicamento.formaFarmaceutica || '',
        concentracao: medicamento.concentracao || '',
        estoqueMinimo: medicamento.estoqueMinimo,
        estoqueAtual: medicamento.estoqueAtual,
        unidadeMedida: medicamento.unidadeMedida || '',
        observacoes: medicamento.observacoes || '',
      });
    } else {
      setEditingMedicamento(null);
      setFormData({
        nome: '',
        principioAtivo: '',
        tipo: '',
        formaFarmaceutica: '',
        concentracao: '',
        estoqueMinimo: 0,
        estoqueAtual: 0,
        unidadeMedida: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMedicamento(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleOpenEstoqueDialog = (medicamento: Medicamento) => {
    setEditingMedicamento(medicamento);
    setEstoqueData({ quantidade: 0, tipo: 'entrada', motivo: '' });
    setIsEstoqueDialogOpen(true);
  };

  const handleUpdateEstoque = () => {
    if (editingMedicamento) {
      estoqueMutation.mutate({
        id: editingMedicamento.id,
        data: estoqueData,
      });
    }
  };

  const handleDelete = (medicamento: Medicamento) => {
    setDeletingMedicamento(medicamento);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingMedicamento) {
      deleteMutation.mutate(deletingMedicamento.id);
    }
  };

  const getEstoqueStatus = (medicamento: Medicamento) => {
    if (medicamento.estoqueAtual === 0) {
      return { variant: 'destructive' as const, label: 'Sem estoque' };
    }
    if (medicamento.estoqueAtual <= medicamento.estoqueMinimo) {
      return { variant: 'warning' as const, label: 'Estoque baixo' };
    }
    return { variant: 'success' as const, label: 'Em estoque' };
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Medicamentos</h1>
        <p className="text-muted-foreground">Gerencie o catálogo e inventário de medicamentos</p>
      </div>

      {/* Alerta de Estoque Baixo */}
      {medicamentosEstoqueBaixo.length > 0 && (
        <Card className="mb-4 border-yellow-500">
          <CardHeader className="bg-yellow-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">
                Atenção: {medicamentosEstoqueBaixo.length} medicamento(s) com estoque baixo ou zerado
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {medicamentosEstoqueBaixo.slice(0, 5).map((med) => (
                <Badge key={med.id} variant="warning">
                  {med.nome}: {med.estoqueAtual}/{med.estoqueMinimo}
                </Badge>
              ))}
              {medicamentosEstoqueBaixo.length > 5 && (
                <Badge variant="secondary">+{medicamentosEstoqueBaixo.length - 5} mais</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Medicamentos</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Medicamento
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou princípio ativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : medicamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum medicamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Princípio Ativo</TableHead>
                  <TableHead>Tipo/Forma</TableHead>
                  <TableHead>Concentração</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicamentos.map((medicamento) => {
                  const status = getEstoqueStatus(medicamento);
                  return (
                    <TableRow key={medicamento.id}>
                      <TableCell className="font-medium">{medicamento.nome}</TableCell>
                      <TableCell>{medicamento.principioAtivo || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          {medicamento.tipo && <span>{medicamento.tipo}</span>}
                          {medicamento.formaFarmaceutica && (
                            <span className="text-muted-foreground">
                              {medicamento.formaFarmaceutica}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medicamento.concentracao || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {medicamento.estoqueAtual} {medicamento.unidadeMedida}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Mín: {medicamento.estoqueMinimo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEstoqueDialog(medicamento)}
                            title="Atualizar estoque"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(medicamento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(medicamento)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMedicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do medicamento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="nome">Nome do Medicamento *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="principioAtivo">Princípio Ativo</Label>
                  <Input
                    id="principioAtivo"
                    value={formData.principioAtivo}
                    onChange={(e) => setFormData({ ...formData, principioAtivo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ex: Antibiótico, Anti-inflamatório"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formaFarmaceutica">Forma Farmacêutica</Label>
                  <Input
                    id="formaFarmaceutica"
                    value={formData.formaFarmaceutica}
                    onChange={(e) => setFormData({ ...formData, formaFarmaceutica: e.target.value })}
                    placeholder="Ex: Comprimido, Injetável"
                  />
                </div>
                <div>
                  <Label htmlFor="concentracao">Concentração</Label>
                  <Input
                    id="concentracao"
                    value={formData.concentracao}
                    onChange={(e) => setFormData({ ...formData, concentracao: e.target.value })}
                    placeholder="Ex: 500mg, 10ml"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                  <Input
                    id="estoqueAtual"
                    type="number"
                    value={formData.estoqueAtual}
                    onChange={(e) => setFormData({ ...formData, estoqueAtual: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    value={formData.estoqueMinimo}
                    onChange={(e) => setFormData({ ...formData, estoqueMinimo: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unidadeMedida">Unidade</Label>
                  <Input
                    id="unidadeMedida"
                    value={formData.unidadeMedida}
                    onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                    placeholder="Ex: un, cx, fr"
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
                />
              </div>
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

      {/* Dialog de Atualizar Estoque */}
      <Dialog open={isEstoqueDialogOpen} onOpenChange={setIsEstoqueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
            <DialogDescription>
              {editingMedicamento?.nome} - Estoque atual: {editingMedicamento?.estoqueAtual}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tipo de Movimentação</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="entrada"
                    checked={estoqueData.tipo === 'entrada'}
                    onChange={(e) => setEstoqueData({ ...estoqueData, tipo: e.target.value as 'entrada' })}
                  />
                  Entrada
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="saida"
                    checked={estoqueData.tipo === 'saida'}
                    onChange={(e) => setEstoqueData({ ...estoqueData, tipo: e.target.value as 'saida' })}
                  />
                  Saída
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={estoqueData.quantidade}
                onChange={(e) => setEstoqueData({ ...estoqueData, quantidade: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                value={estoqueData.motivo}
                onChange={(e) => setEstoqueData({ ...estoqueData, motivo: e.target.value })}
                placeholder="Descreva o motivo da movimentação"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEstoqueDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateEstoque} disabled={estoqueMutation.isPending}>
              {estoqueMutation.isPending ? 'Atualizando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o medicamento <strong>{deletingMedicamento?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
