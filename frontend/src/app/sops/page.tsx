'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Search, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { sopsService, CreateSopDto } from '@/services/sops.service';

const CATEGORIAS = [
  { value: 'higienizacao', label: 'Higienização' },
  { value: 'coleta', label: 'Coleta de Amostras' },
  { value: 'descarte', label: 'Descarte de Materiais' },
  { value: 'cirurgia', label: 'Procedimentos Cirúrgicos' },
  { value: 'medicacao', label: 'Administração de Medicação' },
  { value: 'emergencia', label: 'Emergência' },
];

export default function SopsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<any>(null);
  const [viewingSop, setViewingSop] = useState<any>(null);
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateSopDto>({
    titulo: '',
    codigo: '',
    categoria: '',
    procedimento: '',
    materiais: '',
    versao: 1,
  });

  const { data: sops, isLoading } = useQuery({
    queryKey: ['sops', filterCategoria, searchTerm],
    queryFn: () => sopsService.findAll(
      filterCategoria && filterCategoria !== 'all' ? filterCategoria : undefined,
      searchTerm || undefined
    ),
  });

  const createMutation = useMutation({
    mutationFn: sopsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      toast({
        title: 'SOP criado',
        description: 'Procedimento operacional padrão criado com sucesso',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao criar SOP',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sopsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      toast({
        title: 'SOP atualizado',
        description: 'SOP atualizado com sucesso',
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar SOP',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sopsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      toast({
        title: 'SOP excluído',
        description: 'SOP marcado como inativo',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir SOP',
        variant: 'destructive',
      });
    },
  });

  const handleOpenDialog = (sop?: any) => {
    if (sop) {
      setEditingSop(sop);
      setFormData({
        titulo: sop.titulo,
        codigo: sop.codigo,
        categoria: sop.categoria,
        procedimento: sop.procedimento,
        materiais: sop.materiais || '',
        versao: sop.versao,
      });
    } else {
      setEditingSop(null);
      setFormData({
        titulo: '',
        codigo: '',
        categoria: '',
        procedimento: '',
        materiais: '',
        versao: 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSop(null);
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.codigo || !formData.categoria || !formData.procedimento) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (editingSop) {
      updateMutation.mutate({
        id: editingSop.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleView = (sop: any) => {
    setViewingSop(sop);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja desativar este SOP?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoriaLabel = (value: string) => {
    return CATEGORIAS.find(c => c.value === value)?.label || value;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="SOPs - Procedimentos Operacionais Padrão"
        description="Gerencie procedimentos padronizados da clínica"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'SOPs' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo SOP
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar por título, código ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Filtrar por categoria</Label>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sops?.map((sop: any) => (
          <Card key={sop.id} className={!sop.ativo ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{sop.titulo}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{sop.codigo}</Badge>
                    <Badge>{getCategoriaLabel(sop.categoria)}</Badge>
                  </div>
                </div>
                <Badge variant={sop.ativo ? 'default' : 'secondary'}>
                  v{sop.versao}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {sop.procedimento}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(sop)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(sop)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(sop.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sops?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum SOP encontrado</p>
            <p className="text-sm mt-2">
              Crie seu primeiro procedimento operacional padrão
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSop ? 'Editar SOP' : 'Novo SOP'}
            </DialogTitle>
            <DialogDescription>
              {editingSop
                ? 'Edite as informações do procedimento operacional padrão'
                : 'Crie um novo procedimento operacional padrão'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: SOP-HIG-001"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Higienização de Materiais Cirúrgicos"
              />
            </div>

            <div>
              <Label htmlFor="procedimento">Procedimento *</Label>
              <Textarea
                id="procedimento"
                value={formData.procedimento}
                onChange={(e) =>
                  setFormData({ ...formData, procedimento: e.target.value })
                }
                placeholder="Descreva o passo a passo do procedimento..."
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="materiais">Materiais Necessários</Label>
              <Textarea
                id="materiais"
                value={formData.materiais}
                onChange={(e) => setFormData({ ...formData, materiais: e.target.value })}
                placeholder="Liste os materiais necessários..."
                rows={4}
              />
            </div>

            {editingSop && (
              <div className="text-sm text-muted-foreground">
                Versão atual: {editingSop.versao}
                {formData.procedimento !== editingSop.procedimento && (
                  <span className="text-orange-600 ml-2">
                    (Nova versão será criada ao salvar)
                  </span>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingSop ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingSop?.titulo}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{viewingSop?.codigo}</Badge>
                <Badge>{getCategoriaLabel(viewingSop?.categoria)}</Badge>
                <Badge variant="secondary">Versão {viewingSop?.versao}</Badge>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Procedimento</h3>
              <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                {viewingSop?.procedimento}
              </div>
            </div>

            {viewingSop?.materiais && (
              <div>
                <h3 className="font-semibold mb-2">Materiais Necessários</h3>
                <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                  {viewingSop.materiais}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
