'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internacoesService, type Internacao } from '@/services/internacoes.service';
import {
  evolucoesService,
  type Evolucao,
  type CreateEvolucaoDto,
} from '@/services/evolucoes.service';
import {
  sinaisVitaisService,
  type SinalVital,
  type CreateSinalVitalDto,
} from '@/services/sinais-vitais.service';
import {
  prescricoesService,
  type Prescricao,
} from '@/services/prescricoes.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Plus,
  FileText,
  Activity,
  Calendar,
  User,
  Heart,
  Thermometer,
  Wind,
  Pill,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InternacaoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const internacaoId = params.id as string;

  const [isEvolucaoDialogOpen, setIsEvolucaoDialogOpen] = useState(false);
  const [isSinalDialogOpen, setIsSinalDialogOpen] = useState(false);
  const [evolucaoFormData, setEvolucaoFormData] = useState<CreateEvolucaoDto>({
    internacaoId,
    veterinarioId: user?.id || '',
    relato: '',
    exameClinico: '',
    condutaClinica: '',
    observacoes: '',
  });
  const [sinalFormData, setSinalFormData] = useState<CreateSinalVitalDto>({
    internacaoId,
    veterinarioId: user?.id || '',
    temperatura: undefined,
    frequenciaCardiaca: undefined,
    frequenciaRespiratoria: undefined,
    pressaoArterialSistolica: undefined,
    pressaoArterialDiastolica: undefined,
    saturacaoOxigenio: undefined,
    peso: undefined,
    glicemia: undefined,
    observacoes: '',
  });

  // Query para dados da internação
  const { data: internacao, isLoading: loadingInternacao } = useQuery({
    queryKey: ['internacao', internacaoId],
    queryFn: () => internacoesService.findOne(internacaoId),
    enabled: !!internacaoId,
  });

  // Query para evoluções
  const { data: evolucoes = [], isLoading: loadingEvolucoes } = useQuery({
    queryKey: ['evolucoes', internacaoId],
    queryFn: () => evolucoesService.findByInternacao(internacaoId),
    enabled: !!internacaoId,
  });

  // Query para sinais vitais
  const { data: sinaisVitais = [], isLoading: loadingSinais } = useQuery({
    queryKey: ['sinais-vitais', internacaoId],
    queryFn: () => sinaisVitaisService.findByInternacao(internacaoId),
    enabled: !!internacaoId,
  });

  // Query para prescrições
  const { data: prescricoes = [], isLoading: loadingPrescricoes } = useQuery({
    queryKey: ['prescricoes-internacao', internacaoId],
    queryFn: () => prescricoesService.findByInternacao(internacaoId),
    enabled: !!internacaoId,
  });

  // Query para último sinal vital
  const { data: ultimoSinal } = useQuery({
    queryKey: ['ultimo-sinal', internacaoId],
    queryFn: () => sinaisVitaisService.findUltimo(internacaoId),
    enabled: !!internacaoId,
  });

  // Mutation para criar evolução
  const createEvolucaoMutation = useMutation({
    mutationFn: (data: CreateEvolucaoDto) => evolucoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes', internacaoId] });
      toast.success('Evolução registrada!');
      handleCloseEvolucaoDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar evolução');
    },
  });

  // Mutation para criar sinal vital
  const createSinalMutation = useMutation({
    mutationFn: (data: CreateSinalVitalDto) => sinaisVitaisService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinais-vitais', internacaoId] });
      queryClient.invalidateQueries({ queryKey: ['ultimo-sinal', internacaoId] });
      toast.success('Sinais vitais registrados!');
      handleCloseSinalDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar sinais vitais');
    },
  });

  const handleOpenEvolucaoDialog = () => {
    setEvolucaoFormData({
      internacaoId,
      veterinarioId: user?.id || '',
      relato: '',
      exameClinico: '',
      condutaClinica: '',
      observacoes: '',
    });
    setIsEvolucaoDialogOpen(true);
  };

  const handleCloseEvolucaoDialog = () => {
    setIsEvolucaoDialogOpen(false);
  };

  const handleOpenSinalDialog = () => {
    setSinalFormData({
      internacaoId,
      veterinarioId: user?.id || '',
      temperatura: undefined,
      frequenciaCardiaca: undefined,
      frequenciaRespiratoria: undefined,
      pressaoArterialSistolica: undefined,
      pressaoArterialDiastolica: undefined,
      saturacaoOxigenio: undefined,
      peso: undefined,
      glicemia: undefined,
      observacoes: '',
    });
    setIsSinalDialogOpen(true);
  };

  const handleCloseSinalDialog = () => {
    setIsSinalDialogOpen(false);
  };

  const handleSubmitEvolucao = (e: React.FormEvent) => {
    e.preventDefault();
    createEvolucaoMutation.mutate(evolucaoFormData);
  };

  const handleSubmitSinal = (e: React.FormEvent) => {
    e.preventDefault();
    createSinalMutation.mutate(sinalFormData);
  };

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return date;
    }
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

  // Preparar dados para gráfico
  const chartData = sinaisVitais.slice(-10).map((sinal) => ({
    data: format(new Date(sinal.dataHora), 'dd/MM HH:mm'),
    'Temp (°C)': sinal.temperatura,
    'FC (bpm)': sinal.frequenciaCardiaca,
    'FR (mrpm)': sinal.frequenciaRespiratoria,
  }));

  if (loadingInternacao) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Carregando dados da internação...</div>
      </div>
    );
  }

  if (!internacao) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Internação não encontrada</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title={`${internacao.pet.nome} - ${internacao.pet.especie}`}
        description="Acompanhe a evolução clínica e sinais vitais"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Internações', href: '/internacoes' },
          { label: internacao.pet.nome },
        ]}
        showBackButton
      />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{internacao.pet.tutor.nome}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Tutor: {internacao.pet.tutor.nome}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Entrada: {format(new Date(internacao.dataEntrada), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(internacao.status)}
                {getPrioridadeBadge(internacao.prioridade)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Leito</Label>
                <p className="font-medium">{internacao.leito || 'Não definido'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Motivo</Label>
                <p className="font-medium">{internacao.motivo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Veterinário Responsável</Label>
                <p className="font-medium">{internacao.veterinario.nomeCompleto}</p>
              </div>
            </div>
            {internacao.diagnostico && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Diagnóstico</Label>
                <p className="font-medium">{internacao.diagnostico}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimos Sinais Vitais Card */}
      {ultimoSinal && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Últimos Sinais Vitais
            </CardTitle>
            <CardDescription>{formatDateTime(ultimoSinal.dataHora)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ultimoSinal.temperatura && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Temperatura</Label>
                    <p className="font-bold">{ultimoSinal.temperatura}°C</p>
                  </div>
                </div>
              )}
              {ultimoSinal.frequenciaCardiaca && (
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <Label className="text-xs text-muted-foreground">FC</Label>
                    <p className="font-bold">{ultimoSinal.frequenciaCardiaca} bpm</p>
                  </div>
                </div>
              )}
              {ultimoSinal.frequenciaRespiratoria && (
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label className="text-xs text-muted-foreground">FR</Label>
                    <p className="font-bold">{ultimoSinal.frequenciaRespiratoria} mrpm</p>
                  </div>
                </div>
              )}
              {ultimoSinal.saturacaoOxigenio && (
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <Label className="text-xs text-muted-foreground">SpO2</Label>
                    <p className="font-bold">{ultimoSinal.saturacaoOxigenio}%</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="evolucoes" className="w-full">
        <TabsList>
          <TabsTrigger value="evolucoes">Evoluções Clínicas</TabsTrigger>
          <TabsTrigger value="sinais">Sinais Vitais</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
        </TabsList>

        {/* Tab de Evoluções */}
        <TabsContent value="evolucoes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline de Evoluções</CardTitle>
                <Button onClick={handleOpenEvolucaoDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Evolução
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEvolucoes ? (
                <div className="text-center py-8">Carregando...</div>
              ) : evolucoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma evolução registrada ainda
                </div>
              ) : (
                <div className="space-y-6">
                  {evolucoes.map((evolucao, index) => (
                    <div key={evolucao.id} className="relative pl-6 pb-6 border-l-2 border-primary last:pb-0">
                      <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-semibold">{formatDateTime(evolucao.dataHora)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Por: {evolucao.veterinario.nomeCompleto}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground">RELATO</Label>
                          <p className="text-sm whitespace-pre-wrap">{evolucao.relato}</p>
                        </div>
                        {evolucao.exameClinico && (
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">EXAME CLÍNICO</Label>
                            <p className="text-sm whitespace-pre-wrap">{evolucao.exameClinico}</p>
                          </div>
                        )}
                        {evolucao.condutaClinica && (
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">CONDUTA CLÍNICA</Label>
                            <p className="text-sm whitespace-pre-wrap">{evolucao.condutaClinica}</p>
                          </div>
                        )}
                        {evolucao.observacoes && (
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">OBSERVAÇÕES</Label>
                            <p className="text-sm whitespace-pre-wrap">{evolucao.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Sinais Vitais */}
        <TabsContent value="sinais">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monitoramento de Sinais Vitais</CardTitle>
                <Button onClick={handleOpenSinalDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Sinais
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSinais ? (
                <div className="text-center py-8">Carregando...</div>
              ) : sinaisVitais.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum sinal vital registrado ainda
                </div>
              ) : (
                <>
                  {/* Gráfico */}
                  {chartData.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4">Evolução dos Sinais (últimos 10 registros)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="data" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Temp (°C)" stroke="#ef4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="FC (bpm)" stroke="#f59e0b" strokeWidth={2} />
                          <Line type="monotone" dataKey="FR (mrpm)" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Tabela de Registros */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Histórico de Registros</h3>
                    {sinaisVitais.map((sinal) => (
                      <Card key={sinal.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{formatDateTime(sinal.dataHora)}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {sinal.veterinario.nomeCompleto}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            {sinal.temperatura && (
                              <div>
                                <span className="text-muted-foreground">Temp:</span> {sinal.temperatura}°C
                              </div>
                            )}
                            {sinal.frequenciaCardiaca && (
                              <div>
                                <span className="text-muted-foreground">FC:</span> {sinal.frequenciaCardiaca} bpm
                              </div>
                            )}
                            {sinal.frequenciaRespiratoria && (
                              <div>
                                <span className="text-muted-foreground">FR:</span> {sinal.frequenciaRespiratoria} mrpm
                              </div>
                            )}
                            {sinal.saturacaoOxigenio && (
                              <div>
                                <span className="text-muted-foreground">SpO2:</span> {sinal.saturacaoOxigenio}%
                              </div>
                            )}
                            {sinal.peso && (
                              <div>
                                <span className="text-muted-foreground">Peso:</span> {sinal.peso} kg
                              </div>
                            )}
                            {sinal.glicemia && (
                              <div>
                                <span className="text-muted-foreground">Glicemia:</span> {sinal.glicemia} mg/dL
                              </div>
                            )}
                            {sinal.pressaoArterialSistolica && sinal.pressaoArterialDiastolica && (
                              <div>
                                <span className="text-muted-foreground">PA:</span>{' '}
                                {sinal.pressaoArterialSistolica}/{sinal.pressaoArterialDiastolica} mmHg
                              </div>
                            )}
                          </div>
                          {sinal.observacoes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Obs:</span> {sinal.observacoes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Prescrições */}
        <TabsContent value="prescricoes">
          <Card>
            <CardHeader>
              <CardTitle>Prescrições Médicas</CardTitle>
              <CardDescription>Histórico de prescrições médicas para esta internação</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPrescricoes ? (
                <div className="text-center py-8">Carregando...</div>
              ) : prescricoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma prescrição registrada ainda
                </div>
              ) : (
                <div className="space-y-6">
                  {prescricoes.map((prescricao) => (
                    <div key={prescricao.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold mb-1">
                            Prescrição #{prescricao.id.slice(0, 8)}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>Tipo:</strong>{' '}
                              <Badge variant={prescricao.tipo === 'hospitalar' ? 'default' : 'secondary'}>
                                {prescricao.tipo === 'hospitalar' ? 'Hospitalar' : 'Ambulatorial'}
                              </Badge>
                            </div>
                            <div>
                              <strong>Data:</strong>{' '}
                              {format(new Date(prescricao.dataPrescricao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                            {prescricao.veterinario && (
                              <div>
                                <strong>Veterinário:</strong> {prescricao.veterinario.nome}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {prescricao.observacoes && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            <strong>Observações:</strong> {prescricao.observacoes}
                          </p>
                        </div>
                      )}

                      {/* Tabela de Medicamentos */}
                      {prescricao.itens && prescricao.itens.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Medicamentos Prescritos:</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Medicamento</TableHead>
                                <TableHead>Dose</TableHead>
                                <TableHead>Via</TableHead>
                                <TableHead>Frequência</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Horários</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {prescricao.itens.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Pill className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {item.medicamento?.nome || 'N/A'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.dose}</TableCell>
                                  <TableCell>{item.viaAdministracao}</TableCell>
                                  <TableCell>{item.frequencia}</TableCell>
                                  <TableCell>{item.duracaoDias} dias</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                      {item.horarios && item.horarios.length > 0 ? (
                                        item.horarios.map((horario, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {horario}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Nova Evolução */}
      <Dialog open={isEvolucaoDialogOpen} onOpenChange={setIsEvolucaoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Evolução Clínica</DialogTitle>
            <DialogDescription>Registre a evolução do paciente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEvolucao}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="relato">Relato do Caso *</Label>
                <Textarea
                  id="relato"
                  value={evolucaoFormData.relato}
                  onChange={(e) => setEvolucaoFormData({ ...evolucaoFormData, relato: e.target.value })}
                  rows={4}
                  required
                  placeholder="Descreva o estado atual do paciente, sintomas, comportamento..."
                />
              </div>

              <div>
                <Label htmlFor="exameClinico">Exame Clínico</Label>
                <Textarea
                  id="exameClinico"
                  value={evolucaoFormData.exameClinico}
                  onChange={(e) => setEvolucaoFormData({ ...evolucaoFormData, exameClinico: e.target.value })}
                  rows={3}
                  placeholder="Achados do exame físico..."
                />
              </div>

              <div>
                <Label htmlFor="condutaClinica">Conduta Clínica</Label>
                <Textarea
                  id="condutaClinica"
                  value={evolucaoFormData.condutaClinica}
                  onChange={(e) => setEvolucaoFormData({ ...evolucaoFormData, condutaClinica: e.target.value })}
                  rows={3}
                  placeholder="Tratamento, ajustes, procedimentos realizados..."
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  value={evolucaoFormData.observacoes}
                  onChange={(e) => setEvolucaoFormData({ ...evolucaoFormData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseEvolucaoDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEvolucaoMutation.isPending}>
                {createEvolucaoMutation.isPending ? 'Registrando...' : 'Registrar Evolução'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Novos Sinais Vitais */}
      <Dialog open={isSinalDialogOpen} onOpenChange={setIsSinalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Sinais Vitais</DialogTitle>
            <DialogDescription>Preencha os sinais vitais aferidos</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSinal}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperatura">Temperatura (°C)</Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    value={sinalFormData.temperatura || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        temperatura: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 38.5"
                  />
                </div>
                <div>
                  <Label htmlFor="frequenciaCardiaca">Frequência Cardíaca (bpm)</Label>
                  <Input
                    id="frequenciaCardiaca"
                    type="number"
                    value={sinalFormData.frequenciaCardiaca || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        frequenciaCardiaca: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequenciaRespiratoria">Frequência Respiratória (mrpm)</Label>
                  <Input
                    id="frequenciaRespiratoria"
                    type="number"
                    value={sinalFormData.frequenciaRespiratoria || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        frequenciaRespiratoria: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 30"
                  />
                </div>
                <div>
                  <Label htmlFor="saturacaoOxigenio">Saturação O2 (%)</Label>
                  <Input
                    id="saturacaoOxigenio"
                    type="number"
                    step="0.1"
                    value={sinalFormData.saturacaoOxigenio || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        saturacaoOxigenio: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 98"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pressaoSistolica">Pressão Sistólica (mmHg)</Label>
                  <Input
                    id="pressaoSistolica"
                    type="number"
                    value={sinalFormData.pressaoArterialSistolica || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        pressaoArterialSistolica: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 120"
                  />
                </div>
                <div>
                  <Label htmlFor="pressaoDiastolica">Pressão Diastólica (mmHg)</Label>
                  <Input
                    id="pressaoDiastolica"
                    type="number"
                    value={sinalFormData.pressaoArterialDiastolica || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        pressaoArterialDiastolica: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={sinalFormData.peso || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        peso: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 15.5"
                  />
                </div>
                <div>
                  <Label htmlFor="glicemia">Glicemia (mg/dL)</Label>
                  <Input
                    id="glicemia"
                    type="number"
                    value={sinalFormData.glicemia || ''}
                    onChange={(e) =>
                      setSinalFormData({
                        ...sinalFormData,
                        glicemia: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 95"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={sinalFormData.observacoes}
                  onChange={(e) => setSinalFormData({ ...sinalFormData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseSinalDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createSinalMutation.isPending}>
                {createSinalMutation.isPending ? 'Registrando...' : 'Registrar Sinais'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
