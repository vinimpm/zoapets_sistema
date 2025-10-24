'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultasService, type UpdateConsultaDto, type GerarInternacaoDto } from '@/services/consultas.service';
import { prescricoesService, type CreatePrescricaoDto, type PrescricaoItem } from '@/services/prescricoes.service';
import { medicamentosService } from '@/services/medicamentos.service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, CheckCircle, Plus, Pill, Trash2, Hospital } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';

export default function ConsultaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const consultaId = params.id as string;
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<UpdateConsultaDto>({});
  const [isPrescricaoDialogOpen, setIsPrescricaoDialogOpen] = useState(false);
  const [isInternacaoDialogOpen, setIsInternacaoDialogOpen] = useState(false);
  const [prescricaoFormData, setPrescricaoFormData] = useState<Partial<CreatePrescricaoDto>>({
    tipo: 'ambulatorial',
    veterinarioId: user?.id || '',
    dataPrescricao: new Date().toISOString(),
    dataValidade: addDays(new Date(), 30).toISOString(),
    observacoes: '',
    itens: [],
  });
  const [internacaoFormData, setInternacaoFormData] = useState<GerarInternacaoDto>({
    motivo: '',
    tipo: 'clinica',
    prioridade: 'media',
    leito: '',
    isolamento: false,
    diagnosticoInicial: '',
    observacoes: '',
    medicoResponsavelId: user?.id || '',
  });
  const [currentItem, setCurrentItem] = useState<Partial<PrescricaoItem>>({
    medicamentoId: '',
    dose: '',
    viaAdministracao: 'oral',
    frequencia: '',
    duracaoDias: 7,
    horarios: [],
    instrucoes: '',
  });

  // Consulta Query
  const { data: consulta, isLoading } = useQuery({
    queryKey: ['consulta', consultaId],
    queryFn: () => consultasService.findOne(consultaId),
    enabled: !!consultaId,
  });

  // Prescrições Query
  const { data: prescricoes = [] } = useQuery({
    queryKey: ['prescricoes-consulta', consultaId],
    queryFn: () => prescricoesService.findByConsulta(consultaId),
    enabled: !!consultaId,
  });

  // Medicamentos Query
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => medicamentosService.findAll(),
  });

  // Update Consulta Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateConsultaDto) => consultasService.update(consultaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consulta', consultaId] });
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      toast.success('Consulta atualizada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar');
    },
  });

  // Concluir Mutation
  const concluirMutation = useMutation({
    mutationFn: () => consultasService.concluir(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consulta', consultaId] });
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      toast.success('Consulta concluída!');
      router.push('/consultas');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao concluir');
    },
  });

  // Gerar Internação Mutation
  const gerarInternacaoMutation = useMutation({
    mutationFn: (data: GerarInternacaoDto) => consultasService.gerarInternacao(consultaId, data),
    onSuccess: (internacao) => {
      queryClient.invalidateQueries({ queryKey: ['consulta', consultaId] });
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      queryClient.invalidateQueries({ queryKey: ['internacoes'] });
      toast.success('Internação gerada com sucesso!');
      setIsInternacaoDialogOpen(false);
      router.push(`/internacoes/${internacao.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar internação');
    },
  });

  // Criar Prescrição Mutation
  const createPrescricaoMutation = useMutation({
    mutationFn: (data: CreatePrescricaoDto) => prescricoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescricoes-consulta', consultaId] });
      toast.success('Prescrição criada com sucesso!');
      setIsPrescricaoDialogOpen(false);
      setPrescricaoFormData({
        tipo: 'ambulatorial',
        veterinarioId: user?.id || '',
        dataPrescricao: new Date().toISOString(),
        dataValidade: addDays(new Date(), 30).toISOString(),
        observacoes: '',
        itens: [],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar prescrição');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleConcluir = () => {
    if (confirm('Deseja concluir esta consulta? Esta ação não pode ser desfeita.')) {
      concluirMutation.mutate();
    }
  };

  const handleOpenInternacaoDialog = () => {
    // Pre-fill diagnostico inicial with consulta diagnostico
    if (consulta?.diagnostico) {
      setInternacaoFormData((prev) => ({
        ...prev,
        diagnosticoInicial: consulta.diagnostico,
      }));
    }
    setIsInternacaoDialogOpen(true);
  };

  const handleGerarInternacao = () => {
    if (!internacaoFormData.motivo) {
      toast.error('Motivo da internação é obrigatório');
      return;
    }
    gerarInternacaoMutation.mutate(internacaoFormData);
  };

  // Prescription handlers
  const handleAddItem = () => {
    if (!currentItem.medicamentoId || !currentItem.dose || !currentItem.frequencia) {
      toast.error('Preencha todos os campos obrigatórios do item');
      return;
    }
    if (currentItem.horarios && currentItem.horarios.length === 0) {
      toast.error('Adicione pelo menos um horário');
      return;
    }

    const newItem: PrescricaoItem = {
      medicamentoId: currentItem.medicamentoId!,
      dose: currentItem.dose!,
      viaAdministracao: currentItem.viaAdministracao!,
      frequencia: currentItem.frequencia!,
      duracaoDias: currentItem.duracaoDias!,
      horarios: currentItem.horarios!,
      instrucoes: currentItem.instrucoes,
    };

    setPrescricaoFormData({
      ...prescricaoFormData,
      itens: [...(prescricaoFormData.itens || []), newItem],
    });

    setCurrentItem({
      medicamentoId: '',
      dose: '',
      viaAdministracao: 'oral',
      frequencia: '',
      duracaoDias: 7,
      horarios: [],
      instrucoes: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    setPrescricaoFormData({
      ...prescricaoFormData,
      itens: prescricaoFormData.itens?.filter((_, i) => i !== index),
    });
  };

  const handleAddHorario = (horario: string) => {
    if (!horario) return;
    setCurrentItem({
      ...currentItem,
      horarios: [...(currentItem.horarios || []), horario],
    });
  };

  const handleRemoveHorario = (index: number) => {
    setCurrentItem({
      ...currentItem,
      horarios: currentItem.horarios?.filter((_, i) => i !== index),
    });
  };

  const handleCreatePrescricao = () => {
    if (!consulta) return;

    if (!prescricaoFormData.itens || prescricaoFormData.itens.length === 0) {
      toast.error('Adicione pelo menos um medicamento');
      return;
    }

    const data: CreatePrescricaoDto = {
      petId: consulta.petId,
      tipo: 'ambulatorial',
      consultaId: consultaId,
      veterinarioId: user?.id || '',
      dataPrescricao: prescricaoFormData.dataPrescricao!,
      dataValidade: prescricaoFormData.dataValidade!,
      observacoes: prescricaoFormData.observacoes,
      itens: prescricaoFormData.itens,
    };

    createPrescricaoMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!consulta) {
    return <div className="text-center py-8">Consulta não encontrada</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      em_atendimento: 'warning',
      concluida: 'success',
      gerou_internacao: 'info',
    } as const;
    const labels = {
      em_atendimento: 'Em Atendimento',
      concluida: 'Concluída',
      gerou_internacao: 'Gerou Internação',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Consulta - {consulta.pet.nome}</h1>
            <p className="text-muted-foreground">
              {format(new Date(consulta.dataAtendimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
        {getStatusBadge(consulta.status)}
      </div>

      {/* Info do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Paciente</Label>
              <p className="font-medium">{consulta.pet.nome} - {consulta.pet.especie}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tutor</Label>
              <p className="font-medium">{consulta.tutor.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Veterinário</Label>
              <p className="font-medium">{consulta.veterinario.nome}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anamnese */}
      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Queixa Principal</Label>
            <p className="text-sm">{consulta.queixaPrincipal}</p>
          </div>
          {consulta.historico && (
            <div className="space-y-2">
              <Label>Histórico</Label>
              <p className="text-sm">{consulta.historico}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exame Físico */}
      <Card>
        <CardHeader>
          <CardTitle>Exame Físico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperatura">Temperatura (°C)</Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                placeholder="38.5"
                defaultValue={consulta.temperatura}
                onChange={(e) => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequenciaCardiaca">Freq. Cardíaca (bpm)</Label>
              <Input
                id="frequenciaCardiaca"
                type="number"
                placeholder="120"
                defaultValue={consulta.frequenciaCardiaca}
                onChange={(e) => setFormData({ ...formData, frequenciaCardiaca: parseInt(e.target.value) })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequenciaRespiratoria">Freq. Respiratória (rpm)</Label>
              <Input
                id="frequenciaRespiratoria"
                type="number"
                placeholder="30"
                defaultValue={consulta.frequenciaRespiratoria}
                onChange={(e) => setFormData({ ...formData, frequenciaRespiratoria: parseInt(e.target.value) })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpc">TPC</Label>
              <Input
                id="tpc"
                placeholder="< 2 segundos"
                defaultValue={consulta.tpc}
                onChange={(e) => setFormData({ ...formData, tpc: e.target.value })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mucosas">Mucosas</Label>
              <Input
                id="mucosas"
                placeholder="Rosadas"
                defaultValue={consulta.mucosas}
                onChange={(e) => setFormData({ ...formData, mucosas: e.target.value })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hidratacao">Hidratação</Label>
              <Input
                id="hidratacao"
                placeholder="Hidratado"
                defaultValue={consulta.hidratacao}
                onChange={(e) => setFormData({ ...formData, hidratacao: e.target.value })}
                disabled={consulta.status === 'concluida'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ausculta">Ausculta</Label>
            <Textarea
              id="ausculta"
              placeholder="Descreva os achados da ausculta..."
              defaultValue={consulta.ausculta}
              onChange={(e) => setFormData({ ...formData, ausculta: e.target.value })}
              rows={3}
              disabled={consulta.status === 'concluida'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="palpacao">Palpação</Label>
            <Textarea
              id="palpacao"
              placeholder="Descreva os achados da palpação..."
              defaultValue={consulta.palpacao}
              onChange={(e) => setFormData({ ...formData, palpacao: e.target.value })}
              rows={3}
              disabled={consulta.status === 'concluida'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exameFisicoObs">Observações do Exame Físico</Label>
            <Textarea
              id="exameFisicoObs"
              placeholder="Outras observações..."
              defaultValue={consulta.exameFisicoObs}
              onChange={(e) => setFormData({ ...formData, exameFisicoObs: e.target.value })}
              rows={3}
              disabled={consulta.status === 'concluida'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico e Conduta */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico e Conduta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Textarea
              id="diagnostico"
              placeholder="Descreva o diagnóstico..."
              defaultValue={consulta.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              rows={4}
              disabled={consulta.status === 'concluida'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conduta">Conduta</Label>
            <Textarea
              id="conduta"
              placeholder="Descreva a conduta terapêutica..."
              defaultValue={consulta.conduta}
              onChange={(e) => setFormData({ ...formData, conduta: e.target.value })}
              rows={4}
              disabled={consulta.status === 'concluida'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orientacoes">Orientações ao Tutor</Label>
            <Textarea
              id="orientacoes"
              placeholder="Orientações para o tutor..."
              defaultValue={consulta.orientacoes}
              onChange={(e) => setFormData({ ...formData, orientacoes: e.target.value })}
              rows={4}
              disabled={consulta.status === 'concluida'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prescrições */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescrições Médicas
          </CardTitle>
          {consulta.status === 'em_atendimento' && (
            <Button onClick={() => setIsPrescricaoDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {prescricoes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma prescrição registrada para esta consulta
            </p>
          ) : (
            <div className="space-y-4">
              {prescricoes.map((prescricao) => (
                <div key={prescricao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Prescrição - {format(new Date(prescricao.dataPrescricao), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Válida até: {format(new Date(prescricao.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant={prescricao.status === 'ativa' ? 'success' : 'default'}>
                      {prescricao.status}
                    </Badge>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Dose</TableHead>
                        <TableHead>Via</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Duração</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescricao.itens.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.medicamento?.nome || item.medicamentoId}
                          </TableCell>
                          <TableCell>{item.dose}</TableCell>
                          <TableCell>{item.viaAdministracao}</TableCell>
                          <TableCell>{item.frequencia}</TableCell>
                          <TableCell>{item.duracaoDias} dias</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {prescricao.observacoes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm"><strong>Observações:</strong> {prescricao.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Nova Prescrição */}
      <Dialog open={isPrescricaoDialogOpen} onOpenChange={setIsPrescricaoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Prescrição Ambulatorial</DialogTitle>
            <DialogDescription>
              Crie uma prescrição médica para o tutor administrar em casa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Validade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da Prescrição</Label>
                <Input
                  type="date"
                  value={prescricaoFormData.dataPrescricao?.split('T')[0] || ''}
                  onChange={(e) => setPrescricaoFormData({
                    ...prescricaoFormData,
                    dataPrescricao: new Date(e.target.value).toISOString(),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Válida Até</Label>
                <Input
                  type="date"
                  value={prescricaoFormData.dataValidade?.split('T')[0] || ''}
                  onChange={(e) => setPrescricaoFormData({
                    ...prescricaoFormData,
                    dataValidade: new Date(e.target.value).toISOString(),
                  })}
                />
              </div>
            </div>

            {/* Adicionar Medicamento */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Adicionar Medicamento</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                          {med.nome} - {med.principioAtivo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dose *</Label>
                  <Input
                    placeholder="Ex: 1 comprimido, 5ml"
                    value={currentItem.dose}
                    onChange={(e) => setCurrentItem({ ...currentItem, dose: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Via de Administração *</Label>
                  <Select
                    value={currentItem.viaAdministracao}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, viaAdministracao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="intravenosa">Intravenosa</SelectItem>
                      <SelectItem value="intramuscular">Intramuscular</SelectItem>
                      <SelectItem value="subcutanea">Subcutânea</SelectItem>
                      <SelectItem value="topica">Tópica</SelectItem>
                      <SelectItem value="oftalmica">Oftálmica</SelectItem>
                      <SelectItem value="otica">Ótica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequência *</Label>
                  <Input
                    placeholder="Ex: A cada 12 horas, 3x ao dia"
                    value={currentItem.frequencia}
                    onChange={(e) => setCurrentItem({ ...currentItem, frequencia: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duração (dias) *</Label>
                  <Input
                    type="number"
                    value={currentItem.duracaoDias}
                    onChange={(e) => setCurrentItem({ ...currentItem, duracaoDias: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Adicionar Horário *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      id="horario-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget as HTMLInputElement;
                          handleAddHorario(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('horario-input') as HTMLInputElement;
                        handleAddHorario(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentItem.horarios && currentItem.horarios.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {currentItem.horarios.map((h, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                          {h}
                          <button
                            type="button"
                            onClick={() => handleRemoveHorario(i)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instruções</Label>
                <Textarea
                  placeholder="Instruções adicionais para administração..."
                  value={currentItem.instrucoes}
                  onChange={(e) => setCurrentItem({ ...currentItem, instrucoes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar à Prescrição
              </Button>
            </div>

            {/* Lista de Itens Adicionados */}
            {prescricaoFormData.itens && prescricaoFormData.itens.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Medicamentos na Prescrição ({prescricaoFormData.itens.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Via</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescricaoFormData.itens.map((item, idx) => {
                      const med = medicamentos.find((m) => m.id === item.medicamentoId);
                      return (
                        <TableRow key={idx}>
                          <TableCell>{med?.nome || item.medicamentoId}</TableCell>
                          <TableCell>{item.dose}</TableCell>
                          <TableCell>{item.viaAdministracao}</TableCell>
                          <TableCell>{item.frequencia}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Observações Gerais */}
            <div className="space-y-2">
              <Label>Observações Gerais</Label>
              <Textarea
                placeholder="Observações sobre a prescrição..."
                value={prescricaoFormData.observacoes}
                onChange={(e) => setPrescricaoFormData({ ...prescricaoFormData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrescricaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePrescricao}
              disabled={createPrescricaoMutation.isPending || !prescricaoFormData.itens || prescricaoFormData.itens.length === 0}
            >
              {createPrescricaoMutation.isPending ? 'Criando...' : 'Criar Prescrição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Gerar Internação */}
      <Dialog open={isInternacaoDialogOpen} onOpenChange={setIsInternacaoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Internação</DialogTitle>
            <DialogDescription>
              Crie uma internação hospitalar a partir desta consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Internação *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Descreva o motivo da internação..."
                  value={internacaoFormData.motivo}
                  onChange={(e) => setInternacaoFormData({ ...internacaoFormData, motivo: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico Inicial</Label>
                <Textarea
                  id="diagnostico"
                  placeholder="Diagnóstico inicial..."
                  value={internacaoFormData.diagnosticoInicial}
                  onChange={(e) => setInternacaoFormData({ ...internacaoFormData, diagnosticoInicial: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Internação *</Label>
                <Select
                  value={internacaoFormData.tipo}
                  onValueChange={(value) => setInternacaoFormData({ ...internacaoFormData, tipo: value })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="cirurgica">Cirúrgica</SelectItem>
                    <SelectItem value="urgencia">Urgência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select
                  value={internacaoFormData.prioridade}
                  onValueChange={(value) => setInternacaoFormData({ ...internacaoFormData, prioridade: value })}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leito">Leito</Label>
                <Input
                  id="leito"
                  placeholder="Ex: L-101"
                  value={internacaoFormData.leito}
                  onChange={(e) => setInternacaoFormData({ ...internacaoFormData, leito: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isolamento"
                  checked={internacaoFormData.isolamento}
                  onChange={(e) => setInternacaoFormData({ ...internacaoFormData, isolamento: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isolamento" className="cursor-pointer">
                  Requer Isolamento
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais..."
                value={internacaoFormData.observacoes}
                onChange={(e) => setInternacaoFormData({ ...internacaoFormData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInternacaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGerarInternacao}
              disabled={gerarInternacaoMutation.isPending || !internacaoFormData.motivo}
            >
              {gerarInternacaoMutation.isPending ? 'Gerando...' : 'Gerar Internação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      {consulta.status === 'em_atendimento' && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button onClick={handleOpenInternacaoDialog} variant="secondary">
            <Hospital className="h-4 w-4 mr-2" />
            Gerar Internação
          </Button>
          <Button onClick={handleConcluir} disabled={concluirMutation.isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {concluirMutation.isPending ? 'Concluindo...' : 'Concluir Consulta'}
          </Button>
        </div>
      )}

      {consulta.status === 'concluida' && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      )}
    </div>
  );
}
