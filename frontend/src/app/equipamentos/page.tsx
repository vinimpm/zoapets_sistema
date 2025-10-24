'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Wrench, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { equipamentosService, CreateEquipamentoDto } from '@/services/equipamentos.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPOS_EQUIPAMENTO = [
  { value: 'autoclave', label: 'Autoclave' },
  { value: 'raio-x', label: 'Raio-X' },
  { value: 'ultrassom', label: 'Ultrassom' },
  { value: 'monitor', label: 'Monitor Multiparamétrico' },
  { value: 'anestesia', label: 'Aparelho de Anestesia' },
  { value: 'ventilador', label: 'Ventilador' },
  { value: 'bomba-infusao', label: 'Bomba de Infusão' },
  { value: 'eletrocardio', label: 'Eletrocardiógrafo' },
  { value: 'outro', label: 'Outro' },
];

const STATUS = [
  { value: 'operacional', label: 'Operacional', color: 'bg-green-500' },
  { value: 'manutencao', label: 'Em Manutenção', color: 'bg-yellow-500' },
  { value: 'inativo', label: 'Inativo', color: 'bg-red-500' },
];

export default function EquipamentosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<any>(null);
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState<CreateEquipamentoDto>({
    nome: '',
    tipo: '',
    fabricante: '',
    numeroSerie: '',
    dataAquisicao: '',
    proximaCalibracao: '',
    proximaManutencao: '',
    status: 'operacional',
  });

  const { data: equipamentos, isLoading } = useQuery({
    queryKey: ['equipamentos', filterTipo, filterStatus],
    queryFn: () => equipamentosService.findAll(
      filterTipo && filterTipo !== 'all' ? filterTipo : undefined,
      filterStatus && filterStatus !== 'all' ? filterStatus : undefined
    ),
  });

  const { data: needingMaintenance } = useQuery({
    queryKey: ['equipamentos-maintenance'],
    queryFn: equipamentosService.findNeedingMaintenance,
  });

  const createMutation = useMutation({
    mutationFn: equipamentosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast({ title: 'Equipamento cadastrado', description: 'Equipamento cadastrado com sucesso' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao cadastrar equipamento', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => equipamentosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast({ title: 'Equipamento atualizado', description: 'Equipamento atualizado com sucesso' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao atualizar equipamento', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: equipamentosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast({ title: 'Equipamento excluído', description: 'Equipamento excluído com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao excluir equipamento', variant: 'destructive' });
    },
  });

  const handleOpenDialog = (equipamento?: any) => {
    if (equipamento) {
      setEditingEquipamento(equipamento);
      setFormData({
        nome: equipamento.nome,
        tipo: equipamento.tipo,
        fabricante: equipamento.fabricante || '',
        numeroSerie: equipamento.numeroSerie || '',
        dataAquisicao: equipamento.dataAquisicao || '',
        proximaCalibracao: equipamento.proximaCalibracao || '',
        proximaManutencao: equipamento.proximaManutencao || '',
        status: equipamento.status,
      });
    } else {
      setEditingEquipamento(null);
      setFormData({
        nome: '',
        tipo: '',
        fabricante: '',
        numeroSerie: '',
        dataAquisicao: '',
        proximaCalibracao: '',
        proximaManutencao: '',
        status: 'operacional',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEquipamento(null);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.tipo) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingEquipamento) {
      updateMutation.mutate({ id: editingEquipamento.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoLabel = (value: string) => TIPOS_EQUIPAMENTO.find(t => t.value === value)?.label || value;
  const getStatusInfo = (value: string) => STATUS.find(s => s.value === value) || STATUS[0];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Equipamentos"
        description="Gestão de equipamentos médicos e manutenção"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Equipamentos' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Button>
        }
      />

      {needingMaintenance && needingMaintenance.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needingMaintenance.map((equip: any) => (
                <div key={equip.id} className="flex items-center justify-between text-sm">
                  <span>{equip.nome}</span>
                  <Badge variant="outline" className="text-orange-700">
                    Manutenção em {equip.proximaManutencao && format(new Date(equip.proximaManutencao), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Filtrar por tipo</Label>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {TIPOS_EQUIPAMENTO.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Filtrar por status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentos?.map((equipamento: any) => {
          const statusInfo = getStatusInfo(equipamento.status);
          return (
            <Card key={equipamento.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{equipamento.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{getTipoLabel(equipamento.tipo)}</Badge>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  {equipamento.fabricante && (
                    <div><span className="text-muted-foreground">Fabricante:</span> {equipamento.fabricante}</div>
                  )}
                  {equipamento.numeroSerie && (
                    <div><span className="text-muted-foreground">Série:</span> {equipamento.numeroSerie}</div>
                  )}
                  {equipamento.proximaManutencao && (
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Próxima manutenção:</span>
                      <span>{format(new Date(equipamento.proximaManutencao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(equipamento)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(equipamento.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEquipamento ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
            <DialogDescription>
              {editingEquipamento ? 'Edite as informações do equipamento' : 'Cadastre um novo equipamento'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_EQUIPAMENTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabricante">Fabricante</Label>
                <Input id="fabricante" value={formData.fabricante} onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="numeroSerie">Número de Série</Label>
                <Input id="numeroSerie" value={formData.numeroSerie} onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                <Input id="dataAquisicao" type="date" value={formData.dataAquisicao} onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="proximaCalibracao">Próxima Calibração</Label>
                <Input id="proximaCalibracao" type="date" value={formData.proximaCalibracao} onChange={(e) => setFormData({ ...formData, proximaCalibracao: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="proximaManutencao">Próxima Manutenção</Label>
                <Input id="proximaManutencao" type="date" value={formData.proximaManutencao} onChange={(e) => setFormData({ ...formData, proximaManutencao: e.target.value })} />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingEquipamento ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
