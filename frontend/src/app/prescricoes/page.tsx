'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescricoesService, type Prescricao, type CreatePrescricaoDto, type PrescricaoItem } from '@/services/prescricoes.service';
import { internacoesService } from '@/services/internacoes.service';
import { medicamentosService } from '@/services/medicamentos.service';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pill, PauseCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export default function PrescricoesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePrescricaoDto>({
    internacaoId: '',
    veterinarioId: user?.id || '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    observacoes: '',
    itens: [],
  });
  const [currentItem, setCurrentItem] = useState<PrescricaoItem>({
    medicamentoId: '',
    dose: '',
    viaAdministracao: '',
    frequencia: '',
    observacoes: '',
  });

  // Query para listar prescrições
  const { data: prescricoes = [], isLoading } = useQuery({
    queryKey: ['prescricoes', statusFilter],
    queryFn: () => prescricoesService.findAll(statusFilter),
  });

  // Query para internações ativas (para o select)
  const { data: internacoes = [] } = useQuery({
    queryKey: ['internacoes-ativas'],
    queryFn: () => internacoesService.findActive(),
  });

  // Query para medicamentos (para o select)
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => medicamentosService.findAll(),
  });

  // Mutation para criar prescrição
  const createMutation = useMutation({
    mutationFn: (data: CreatePrescricaoDto) => prescricoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescricoes'] });
      toast.success('Prescrição criada! Administrações agendadas automaticamente.');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar prescrição');
    },
  });

  // Mutation para suspender
  const suspenderMutation = useMutation({
    mutationFn: (id: string) => prescricoesService.suspender(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescricoes'] });
      toast.success('Prescrição suspensa');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao suspender');
    },
  });

  // Mutation para reativar
  const reativarMutation = useMutation({
    mutationFn: (id: string) => prescricoesService.reativar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescricoes'] });
      toast.success('Prescrição reativada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reativar');
    },
  });

  const handleOpenDialog = () => {
    setFormData({
      internacaoId: '',
      veterinarioId: user?.id || '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      observacoes: '',
      itens: [],
    });
    setCurrentItem({
      medicamentoId: '',
      dose: '',
      viaAdministracao: '',
      frequencia: '',
      observacoes: '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddItem = () => {
    if (!currentItem.medicamentoId || !currentItem.dose || !currentItem.viaAdministracao || !currentItem.frequencia) {
      toast.error('Preencha todos os campos obrigatórios do medicamento');
      return;
    }

    setFormData({
      ...formData,
      itens: [...formData.itens, currentItem],
    });

    setCurrentItem({
      medicamentoId: '',
      dose: '',
      viaAdministracao: '',
      frequencia: '',
      observacoes: '',
    });

    toast.success('Medicamento adicionado');
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.itens.length === 0) {
      toast.error('Adicione pelo menos um medicamento à prescrição');
      return;
    }

    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: 'success',
      suspensa: 'warning',
      concluida: 'secondary',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getMedicamentoNome = (id: string) => {
    const med = medicamentos.find(m => m.id === id);
    return med?.nome || id;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prescrições</h1>
        <p className="text-muted-foreground">Gerencie as prescrições médicas e medicamentos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Prescrições</CardTitle>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="suspensa">Suspensas</SelectItem>
                <SelectItem value="concluida">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : prescricoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma prescrição encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Medicamentos</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescricoes.map((prescricao) => (
                  <TableRow key={prescricao.id}>
                    <TableCell className="font-medium">
                      {prescricao.internacao?.pet.nome || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {prescricao.itens.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-sm">
                            <Pill className="h-3 w-3" />
                            <span>{item.medicamento?.nome || 'Medicamento'}</span>
                          </div>
                        ))}
                        {prescricao.itens.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{prescricao.itens.length - 2} mais
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(prescricao.dataInicio).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {prescricao.dataFim
                        ? new Date(prescricao.dataFim).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(prescricao.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {prescricao.status === 'ativa' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => suspenderMutation.mutate(prescricao.id)}
                            title="Suspender"
                          >
                            <PauseCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {prescricao.status === 'suspensa' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reativarMutation.mutate(prescricao.id)}
                            title="Reativar"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Prescrição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Prescrição</DialogTitle>
            <DialogDescription>
              As administrações serão agendadas automaticamente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Dados da Prescrição */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="internacaoId">Internação *</Label>
                  <Select
                    value={formData.internacaoId}
                    onValueChange={(value) => setFormData({ ...formData, internacaoId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a internação" />
                    </SelectTrigger>
                    <SelectContent>
                      {internacoes.map((int) => (
                        <SelectItem key={int.id} value={int.id}>
                          {int.pet.nome} - Leito {int.leito || 'N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dataInicio">Data Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Adicionar Medicamentos */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Adicionar Medicamentos</h3>

                <div className="grid gap-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Medicamento *</Label>
                      <Select
                        value={currentItem.medicamentoId}
                        onValueChange={(value) => setCurrentItem({ ...currentItem, medicamentoId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o medicamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicamentos.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dose *</Label>
                      <Input
                        value={currentItem.dose}
                        onChange={(e) => setCurrentItem({ ...currentItem, dose: e.target.value })}
                        placeholder="Ex: 10mg, 2ml"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Via de Administração *</Label>
                      <Select
                        value={currentItem.viaAdministracao}
                        onValueChange={(value) => setCurrentItem({ ...currentItem, viaAdministracao: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral">Oral</SelectItem>
                          <SelectItem value="Intravenosa">Intravenosa (IV)</SelectItem>
                          <SelectItem value="Intramuscular">Intramuscular (IM)</SelectItem>
                          <SelectItem value="Subcutânea">Subcutânea (SC)</SelectItem>
                          <SelectItem value="Tópica">Tópica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Frequência *</Label>
                      <Input
                        value={currentItem.frequencia}
                        onChange={(e) => setCurrentItem({ ...currentItem, frequencia: e.target.value })}
                        placeholder="Ex: 8/8h, 12/12h, 1x/dia"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={currentItem.observacoes}
                      onChange={(e) => setCurrentItem({ ...currentItem, observacoes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button type="button" variant="secondary" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Medicamento
                  </Button>
                </div>

                {/* Lista de Medicamentos Adicionados */}
                {formData.itens.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Medicamentos Adicionados ({formData.itens.length})</h4>
                    <div className="space-y-2">
                      {formData.itens.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{getMedicamentoNome(item.medicamentoId)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.dose} • {item.viaAdministracao} • {item.frequencia}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || formData.itens.length === 0}>
                {createMutation.isPending ? 'Criando...' : 'Criar Prescrição'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
