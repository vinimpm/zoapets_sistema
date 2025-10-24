'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { conveniosService, CreateConvenioDto } from '@/services/convenios.service';

export default function ConveniosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<any>(null);

  const [formData, setFormData] = useState<CreateConvenioDto>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    percentualRepasse: 85,
    prazoPagamento: 30,
  });

  const { data: convenios, isLoading } = useQuery({
    queryKey: ['convenios'],
    queryFn: () => conveniosService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: conveniosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast({ title: 'Convênio cadastrado', description: 'Convênio cadastrado com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.response?.data?.message || 'Erro ao cadastrar convênio', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => conveniosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast({ title: 'Convênio atualizado', description: 'Convênio atualizado com sucesso' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao atualizar convênio', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: conveniosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast({ title: 'Convênio desativado', description: 'Convênio desativado com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao desativar convênio', variant: 'destructive' });
    },
  });

  const handleOpenDialog = (convenio?: any) => {
    if (convenio) {
      setEditingConvenio(convenio);
      setFormData({
        nome: convenio.nome,
        cnpj: convenio.cnpj,
        telefone: convenio.telefone || '',
        email: convenio.email || '',
        percentualRepasse: convenio.percentualRepasse,
        prazoPagamento: convenio.prazoPagamento,
      });
    } else {
      setEditingConvenio(null);
      setFormData({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        percentualRepasse: 85,
        prazoPagamento: 30,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConvenio(null);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.cnpj) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingConvenio) {
      updateMutation.mutate({ id: editingConvenio.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja desativar este convênio?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Convênios / Planos de Saúde Pet"
        description="Gestão de convênios e planos de saúde para pets"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Convênios' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Convênio
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {convenios?.map((convenio: any) => (
          <Card key={convenio.id} className={!convenio.ativo ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {convenio.nome}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{convenio.cnpj}</Badge>
                    <Badge variant={convenio.ativo ? 'default' : 'secondary'}>
                      {convenio.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                {convenio.telefone && (
                  <div><span className="text-muted-foreground">Telefone:</span> {convenio.telefone}</div>
                )}
                {convenio.email && (
                  <div><span className="text-muted-foreground">Email:</span> {convenio.email}</div>
                )}
                <div><span className="text-muted-foreground">Repasse:</span> {convenio.percentualRepasse}%</div>
                <div><span className="text-muted-foreground">Prazo:</span> {convenio.prazoPagamento} dias</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(convenio)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(convenio.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {convenios?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum convênio cadastrado</p>
            <p className="text-sm mt-2">Cadastre seu primeiro convênio/plano de saúde</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConvenio ? 'Editar Convênio' : 'Novo Convênio'}</DialogTitle>
            <DialogDescription>
              {editingConvenio ? 'Edite as informações do convênio' : 'Cadastre um novo convênio/plano de saúde'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="percentualRepasse">Percentual de Repasse (%)</Label>
                <Input
                  id="percentualRepasse"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentualRepasse}
                  onChange={(e) => setFormData({ ...formData, percentualRepasse: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="prazoPagamento">Prazo de Pagamento (dias)</Label>
                <Input
                  id="prazoPagamento"
                  type="number"
                  min="0"
                  value={formData.prazoPagamento}
                  onChange={(e) => setFormData({ ...formData, prazoPagamento: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingConvenio ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
