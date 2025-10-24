'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { checklistsService, ChecklistItem, CreateChecklistTemplateDto } from '@/services/checklists.service';

const TIPOS_INTERNACAO = [
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'emergencia', label: 'Emergência' },
  { value: 'observacao', label: 'Observação' },
];

export default function ChecklistsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [viewingTemplate, setViewingTemplate] = useState<any>(null);
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const [formData, setFormData] = useState<CreateChecklistTemplateDto>({
    nome: '',
    tipoInternacao: '',
    descricao: '',
    itens: [],
  });

  const [newItem, setNewItem] = useState<ChecklistItem>({
    descricao: '',
    ordem: 1,
    obrigatorio: false,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['checklist-templates', filterTipo],
    queryFn: () => checklistsService.getTemplates(filterTipo && filterTipo !== 'all' ? filterTipo : undefined),
  });

  const createMutation = useMutation({
    mutationFn: checklistsService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template criado',
        description: 'Template de checklist criado com sucesso',
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar template',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      checklistsService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template atualizado',
        description: 'Template atualizado com sucesso',
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar template',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: checklistsService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template excluído com sucesso',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir template',
        variant: 'destructive',
      });
    },
  });

  const handleOpenDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        nome: template.nome,
        tipoInternacao: template.tipoInternacao || '',
        descricao: template.descricao || '',
        itens: template.itens || [],
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        nome: '',
        tipoInternacao: '',
        descricao: '',
        itens: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      nome: '',
      tipoInternacao: '',
      descricao: '',
      itens: [],
    });
    setNewItem({
      descricao: '',
      ordem: 1,
      obrigatorio: false,
    });
  };

  const handleAddItem = () => {
    if (!newItem.descricao) {
      toast({
        title: 'Erro',
        description: 'Digite a descrição do item',
        variant: 'destructive',
      });
      return;
    }

    const maxOrdem = formData.itens.length > 0
      ? Math.max(...formData.itens.map(i => i.ordem))
      : 0;

    setFormData({
      ...formData,
      itens: [
        ...formData.itens,
        { ...newItem, ordem: maxOrdem + 1 },
      ],
    });

    setNewItem({
      descricao: '',
      ordem: 1,
      obrigatorio: false,
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!formData.nome || formData.itens.length === 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleView = (template: any) => {
    setViewingTemplate(template);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Templates de Checklist"
        description="Gerencie templates de checklist para internações"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Templates de Checklist' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        }
      />

      <div className="mb-6">
        <Label>Filtrar por tipo</Label>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIPOS_INTERNACAO.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template: any) => (
          <Card key={template.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{template.nome}</h3>
                  {template.tipoInternacao && (
                    <Badge variant="outline" className="mt-2">
                      {TIPOS_INTERNACAO.find(t => t.value === template.tipoInternacao)?.label}
                    </Badge>
                  )}
                </div>
                <Badge variant={template.ativo ? 'default' : 'secondary'}>
                  {template.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {template.descricao && (
                <p className="text-sm text-muted-foreground mb-4">
                  {template.descricao}
                </p>
              )}

              <div className="text-sm text-muted-foreground mb-4">
                {template.itens?.length || 0} itens
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Edite as informações do template'
                : 'Crie um novo template de checklist'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tipoInternacao">Tipo de Internação</Label>
              <Select
                value={formData.tipoInternacao || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipoInternacao: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (genérico)</SelectItem>
                  {TIPOS_INTERNACAO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-base">Itens do Checklist *</Label>

              <div className="mt-4 space-y-2">
                {formData.itens.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <span className="font-mono text-sm w-8">{item.ordem}</span>
                    <span className="flex-1">{item.descricao}</span>
                    {item.obrigatorio && (
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 border rounded space-y-3">
                <Label>Adicionar Item</Label>
                <Input
                  placeholder="Descrição do item"
                  value={newItem.descricao}
                  onChange={(e) =>
                    setNewItem({ ...newItem, descricao: e.target.value })
                  }
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="obrigatorio"
                    checked={newItem.obrigatorio}
                    onCheckedChange={(checked) =>
                      setNewItem({ ...newItem, obrigatorio: checked as boolean })
                    }
                  />
                  <Label htmlFor="obrigatorio">Item obrigatório</Label>
                </div>
                <Button onClick={handleAddItem} type="button" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingTemplate?.nome}</DialogTitle>
            <DialogDescription>
              {viewingTemplate?.tipoInternacao && (
                <Badge variant="outline" className="mt-2">
                  {TIPOS_INTERNACAO.find(t => t.value === viewingTemplate.tipoInternacao)?.label}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingTemplate?.descricao && (
            <p className="text-sm text-muted-foreground mb-4">
              {viewingTemplate.descricao}
            </p>
          )}

          <div className="space-y-2">
            <Label className="text-base">Itens ({viewingTemplate?.itens?.length || 0})</Label>
            {viewingTemplate?.itens?.map((item: ChecklistItem, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="font-mono text-sm w-8">{item.ordem}</span>
                <span className="flex-1">{item.descricao}</span>
                {item.obrigatorio && (
                  <Badge variant="outline" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
