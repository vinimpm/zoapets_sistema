'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internacoesService, type Internacao, type CreateInternacaoDto } from '@/services/internacoes.service';
import { petsService } from '@/services/pets.service';
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
import { Search, Plus, Edit, AlertCircle, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export default function InternacoesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [prioridadeFilter, setPrioridadeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInternacao, setEditingInternacao] = useState<Internacao | null>(null);
  const [formData, setFormData] = useState<CreateInternacaoDto>({
    petId: '',
    veterinarioId: user?.id || '',
    motivo: '',
    diagnostico: '',
    prioridade: 'media',
    leito: '',
    observacoes: '',
  });

  // Query para listar internações
  const { data: internacoes = [], isLoading } = useQuery({
    queryKey: ['internacoes', statusFilter, prioridadeFilter],
    queryFn: () => internacoesService.findAll(statusFilter, prioridadeFilter),
  });

  // Query para ocupação de leitos
  const { data: ocupacaoLeitos } = useQuery({
    queryKey: ['ocupacao-leitos'],
    queryFn: () => internacoesService.getOcupacaoLeitos(),
  });

  // Query para listar pets (para o select)
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsService.findAll(),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreateInternacaoDto) =>
      editingInternacao
        ? internacoesService.update(editingInternacao.id, data)
        : internacoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes'] });
      queryClient.invalidateQueries({ queryKey: ['ocupacao-leitos'] });
      toast.success(editingInternacao ? 'Internação atualizada!' : 'Internação criada!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar internação');
    },
  });

  const handleOpenDialog = (internacao?: Internacao) => {
    if (internacao) {
      setEditingInternacao(internacao);
      setFormData({
        petId: internacao.petId,
        veterinarioId: internacao.veterinarioId,
        motivo: internacao.motivo,
        diagnostico: internacao.diagnostico || '',
        prioridade: internacao.prioridade || 'media',
        leito: internacao.leito || '',
        observacoes: internacao.observacoes || '',
      });
    } else {
      setEditingInternacao(null);
      setFormData({
        petId: '',
        veterinarioId: user?.id || '',
        motivo: '',
        diagnostico: '',
        prioridade: 'media',
        leito: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInternacao(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: 'success',
      alta: 'secondary',
      obito: 'destructive',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      urgencia: 'destructive',
      alta: 'warning',
      media: 'info',
      baixa: 'secondary',
    } as const;
    return <Badge variant={variants[prioridade as keyof typeof variants] || 'default'}>{prioridade}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Internações</h1>
        <p className="text-muted-foreground">Gerencie as internações hospitalares</p>
      </div>

      {/* Card de Ocupação de Leitos */}
      {ocupacaoLeitos && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Leitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                <span className="text-2xl font-bold">{ocupacaoLeitos.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leitos Ocupados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{ocupacaoLeitos.ocupados}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leitos Livres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{ocupacaoLeitos.livres}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Ocupação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{ocupacaoLeitos.taxaOcupacao?.toFixed(1) || '0.0'}%</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Internações</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Internação
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="obito">Óbito</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgencia">Urgência</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : internacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma internação encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Leito</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data Entrada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internacoes.map((internacao) => (
                  <TableRow key={internacao.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{internacao.pet.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {internacao.pet.especie}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{internacao.pet.tutor.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">{internacao.motivo}</TableCell>
                    <TableCell>
                      {internacao.leito ? (
                        <Badge variant="outline">{internacao.leito}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getPrioridadeBadge(internacao.prioridade)}</TableCell>
                    <TableCell>
                      {new Date(internacao.dataEntrada).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(internacao.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(internacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInternacao ? 'Editar Internação' : 'Nova Internação'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da internação
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petId">Pet *</Label>
                  <Select
                    value={formData.petId}
                    onValueChange={(value) => setFormData({ ...formData, petId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.nome} ({pet.especie})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leito">Leito</Label>
                  <Input
                    id="leito"
                    value={formData.leito}
                    onChange={(e) => setFormData({ ...formData, leito: e.target.value })}
                    placeholder="Ex: L-01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgencia">Urgência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo da Internação *</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <Textarea
                  id="diagnostico"
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
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
    </div>
  );
}
