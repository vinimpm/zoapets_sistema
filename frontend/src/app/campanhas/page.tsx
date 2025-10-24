'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Send, Calendar, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { campanhasService, CreateCampanhaDto } from '@/services/campanhas.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CANAIS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '📱' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

const STATUS = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-gray-500' },
  { value: 'agendada', label: 'Agendada', color: 'bg-blue-500' },
  { value: 'enviada', label: 'Enviada', color: 'bg-green-500' },
  { value: 'concluida', label: 'Concluída', color: 'bg-purple-500' },
];

export default function CampanhasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCanal, setFilterCanal] = useState('all');

  const [formData, setFormData] = useState<CreateCampanhaDto>({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    canal: 'email',
    mensagem: '',
    status: 'rascunho',
  });

  const { data: campanhas, isLoading } = useQuery({
    queryKey: ['campanhas', filterStatus, filterCanal],
    queryFn: () => campanhasService.findAll(
      filterStatus && filterStatus !== 'all' ? filterStatus : undefined,
      filterCanal && filterCanal !== 'all' ? filterCanal : undefined
    ),
  });

  const createMutation = useMutation({
    mutationFn: campanhasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({ title: 'Campanha criada', description: 'Campanha criada com sucesso' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao criar campanha', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => campanhasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({ title: 'Campanha atualizada', description: 'Campanha atualizada com sucesso' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao atualizar campanha', variant: 'destructive' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => campanhasService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({ title: 'Status atualizado', description: 'Status da campanha atualizado' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: campanhasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({ title: 'Campanha excluída', description: 'Campanha excluída com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao excluir campanha', variant: 'destructive' });
    },
  });

  const handleOpenDialog = (campanha?: any) => {
    if (campanha) {
      setEditingCampanha(campanha);
      setFormData({
        nome: campanha.nome,
        descricao: campanha.descricao,
        dataInicio: campanha.dataInicio?.split('T')[0] || '',
        dataFim: campanha.dataFim?.split('T')[0] || '',
        canal: campanha.canal,
        mensagem: campanha.mensagem,
        status: campanha.status,
      });
    } else {
      setEditingCampanha(null);
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        canal: 'email',
        mensagem: '',
        status: 'rascunho',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCampanha(null);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.dataInicio || !formData.dataFim || !formData.mensagem) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingCampanha) {
      updateMutation.mutate({ id: editingCampanha.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusInfo = (value: string) => STATUS.find(s => s.value === value) || STATUS[0];
  const getCanalInfo = (value: string) => CANAIS.find(c => c.value === value) || CANAIS[0];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Campanhas de Marketing"
        description="Gestão de campanhas de comunicação com clientes"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campanhas' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        <div>
          <Label>Filtrar por canal</Label>
          <Select value={filterCanal} onValueChange={setFilterCanal}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os canais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              {CANAIS.map((canal) => (
                <SelectItem key={canal.value} value={canal.value}>{canal.icon} {canal.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campanhas?.map((campanha: any) => {
          const statusInfo = getStatusInfo(campanha.status);
          const canalInfo = getCanalInfo(campanha.canal);
          return (
            <Card key={campanha.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{canalInfo.icon} {canalInfo.label}</Badge>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <p className="text-muted-foreground line-clamp-2">{campanha.descricao}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(campanha.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(campanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span>{campanha.totalEnvios} envios</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(campanha)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {campanha.status === 'rascunho' && (
                    <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ id: campanha.id, status: 'agendada' })}>
                      <Send className="h-4 w-4 mr-1" />
                      Agendar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(campanha.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campanhas?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma campanha criada</p>
            <p className="text-sm mt-2">Crie sua primeira campanha de marketing</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCampanha ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
            <DialogDescription>
              {editingCampanha ? 'Edite as informações da campanha' : 'Crie uma nova campanha de marketing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Campanha *</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data Início *</Label>
                <Input id="dataInicio" type="date" value={formData.dataInicio} onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="dataFim">Data Fim *</Label>
                <Input id="dataFim" type="date" value={formData.dataFim} onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="canal">Canal *</Label>
                <Select value={formData.canal} onValueChange={(value) => setFormData({ ...formData, canal: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANAIS.map((canal) => (
                      <SelectItem key={canal.value} value={canal.value}>{canal.icon} {canal.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="mensagem">Mensagem *</Label>
              <Textarea id="mensagem" value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} rows={6} placeholder="Digite a mensagem que será enviada..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingCampanha ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
