'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { checklistsService } from '@/services/checklists.service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistExecutionProps {
  internacaoId: string;
  tipoInternacao?: string;
}

export function ChecklistExecution({ internacaoId, tipoInternacao }: ChecklistExecutionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [executingItem, setExecutingItem] = useState<any>(null);
  const [observacoes, setObservacoes] = useState('');

  const { data: templates } = useQuery({
    queryKey: ['checklist-templates', tipoInternacao],
    queryFn: () => checklistsService.getTemplates(tipoInternacao),
  });

  const { data: executions, isLoading } = useQuery({
    queryKey: ['checklist-executions', internacaoId],
    queryFn: () => checklistsService.getChecklistByInternacao(internacaoId),
  });

  const { data: progress } = useQuery({
    queryKey: ['checklist-progress', internacaoId],
    queryFn: () => checklistsService.getChecklistProgress(internacaoId),
  });

  const initMutation = useMutation({
    mutationFn: ({ templateId }: { templateId: string }) =>
      checklistsService.initializeChecklist(internacaoId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-executions', internacaoId] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress', internacaoId] });
      toast({
        title: 'Checklist inicializado',
        description: 'Checklist inicializado com sucesso',
      });
      setInitDialogOpen(false);
      setSelectedTemplateId('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao inicializar checklist',
        variant: 'destructive',
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      checklistsService.executeChecklistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-executions', internacaoId] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress', internacaoId] });
      toast({
        title: 'Item atualizado',
        description: 'Item do checklist atualizado com sucesso',
      });
      setExecutingItem(null);
      setObservacoes('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item',
        variant: 'destructive',
      });
    },
  });

  const handleInitialize = () => {
    if (!selectedTemplateId) {
      toast({
        title: 'Erro',
        description: 'Selecione um template',
        variant: 'destructive',
      });
      return;
    }

    initMutation.mutate({ templateId: selectedTemplateId });
  };

  const handleToggleItem = (execution: any) => {
    setExecutingItem(execution);
    setObservacoes(execution.observacoes || '');
  };

  const handleExecute = (concluido: boolean) => {
    if (!executingItem) return;

    executeMutation.mutate({
      id: executingItem.id,
      data: {
        executionId: executingItem.id,
        concluido,
        observacoes: observacoes || undefined,
      },
    });
  };

  if (isLoading) {
    return <div>Carregando checklist...</div>;
  }

  const hasExecutions = executions && executions.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Checklist</CardTitle>
            {progress && progress.total > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{progress.concluidos} de {progress.total} concluídos</span>
                  <Badge variant={progress.percentual === 100 ? 'default' : 'secondary'}>
                    {progress.percentual}%
                  </Badge>
                </div>
                <Progress value={progress.percentual} className="h-2" />
              </div>
            )}
          </div>
          {!hasExecutions && (
            <Button onClick={() => setInitDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Inicializar Checklist
            </Button>
          )}
        </div>
      </CardHeader>

      {hasExecutions && (
        <CardContent>
          <div className="space-y-2">
            {executions?.map((execution: any) => (
              <div
                key={execution.id}
                className={`flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                  execution.concluido ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleToggleItem(execution)}
              >
                {execution.concluido ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <p className={execution.concluido ? 'line-through text-muted-foreground' : ''}>
                    {execution.itemDescricao}
                  </p>
                  {execution.concluido && execution.dataExecucao && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Concluído{' '}
                      {formatDistanceToNow(new Date(execution.dataExecucao), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {execution.executadoPor &&
                        ` por ${execution.executadoPor.nome}`}
                    </p>
                  )}
                  {execution.observacoes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{execution.observacoes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {!hasExecutions && (
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum checklist inicializado para esta internação.</p>
            <p className="text-sm mt-2">
              Clique em "Inicializar Checklist" para começar.
            </p>
          </div>
        </CardContent>
      )}

      {/* Initialize Dialog */}
      <Dialog open={initDialogOpen} onOpenChange={setInitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inicializar Checklist</DialogTitle>
            <DialogDescription>
              Selecione um template de checklist para esta internação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nome}
                      {template.tipoInternacao && ` (${template.tipoInternacao})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInitialize}>Inicializar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Item Dialog */}
      <Dialog open={!!executingItem} onOpenChange={() => setExecutingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Item</DialogTitle>
            <DialogDescription>{executingItem?.itemDescricao}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações opcionais..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Circle className="h-4 w-4" />
              <span>Não concluído</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Concluído</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleExecute(false)}
              disabled={executeMutation.isPending}
            >
              Marcar como Não Concluído
            </Button>
            <Button
              onClick={() => handleExecute(true)}
              disabled={executeMutation.isPending}
            >
              Marcar como Concluído
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
