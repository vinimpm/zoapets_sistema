'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  examesService,
  type ExameResultado,
  type CreateExameResultadoDto,
  type RegistrarResultadoDto,
} from '@/services/exames.service';
import { petsService } from '@/services/pets.service';
import { internacoesService } from '@/services/internacoes.service';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TestTube, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';

export default function ExamesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSolicitarDialogOpen, setIsSolicitarDialogOpen] = useState(false);
  const [isRegistrarDialogOpen, setIsRegistrarDialogOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<ExameResultado | null>(null);
  const [solicitarFormData, setSolicitarFormData] = useState<CreateExameResultadoDto>({
    exameId: '',
    petId: '',
    internacaoId: '',
    observacoes: '',
  });
  const [registrarFormData, setRegistrarFormData] = useState<RegistrarResultadoDto>({
    resultado: '',
    observacoes: '',
  });

  // Query para catálogo de exames
  const { data: catalogo = [] } = useQuery({
    queryKey: ['exames-catalogo'],
    queryFn: () => examesService.findCatalogo(),
  });

  // Query para resultados de exames
  const { data: resultados = [], isLoading } = useQuery({
    queryKey: ['exames-resultados', statusFilter],
    queryFn: () =>
      examesService.findResultados(statusFilter !== 'all' ? { status: statusFilter } : undefined),
  });

  // Query para pets (select)
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsService.findAll(),
  });

  // Query para internações ativas (select)
  const { data: internacoes = [] } = useQuery({
    queryKey: ['internacoes-ativas'],
    queryFn: () => internacoesService.findActive(),
  });

  // Mutation para solicitar exame
  const solicitarMutation = useMutation({
    mutationFn: (data: CreateExameResultadoDto) => examesService.createResultado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames-resultados'] });
      toast.success('Exame solicitado com sucesso!');
      handleCloseSolicitarDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao solicitar exame');
    },
  });

  // Mutation para registrar resultado
  const registrarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistrarResultadoDto }) =>
      examesService.registrarResultado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames-resultados'] });
      toast.success('Resultado registrado!');
      handleCloseRegistrarDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar resultado');
    },
  });

  // Mutation para cancelar
  const cancelarMutation = useMutation({
    mutationFn: (id: string) => examesService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exames-resultados'] });
      toast.success('Exame cancelado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar');
    },
  });

  const handleOpenSolicitarDialog = () => {
    setSolicitarFormData({
      exameId: '',
      petId: '',
      internacaoId: '',
      observacoes: '',
    });
    setIsSolicitarDialogOpen(true);
  };

  const handleCloseSolicitarDialog = () => {
    setIsSolicitarDialogOpen(false);
  };

  const handleOpenRegistrarDialog = (exame: ExameResultado) => {
    setSelectedExame(exame);
    setRegistrarFormData({
      resultado: '',
      observacoes: '',
    });
    setIsRegistrarDialogOpen(true);
  };

  const handleCloseRegistrarDialog = () => {
    setIsRegistrarDialogOpen(false);
    setSelectedExame(null);
  };

  const handleSolicitar = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarMutation.mutate(solicitarFormData);
  };

  const handleRegistrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExame) {
      registrarMutation.mutate({ id: selectedExame.id, data: registrarFormData });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      solicitado: 'secondary',
      coletado: 'info',
      em_analise: 'warning',
      concluido: 'success',
      cancelado: 'destructive',
    } as const;
    const labels = {
      solicitado: 'Solicitado',
      coletado: 'Coletado',
      em_analise: 'Em Análise',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return '-';
    }
  };

  const filteredResultados =
    statusFilter !== 'all' ? resultados.filter((r) => r.status === statusFilter) : resultados;

  // Contadores por status
  const statusCounts = {
    solicitado: resultados.filter((r) => r.status === 'solicitado').length,
    coletado: resultados.filter((r) => r.status === 'coletado').length,
    em_analise: resultados.filter((r) => r.status === 'em_analise').length,
    concluido: resultados.filter((r) => r.status === 'concluido').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Exames</h1>
        <p className="text-muted-foreground">Gerencie solicitações e resultados de exames</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">{statusCounts.solicitado}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coletados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{statusCounts.coletado}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{statusCounts.em_analise}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{statusCounts.concluido}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resultados" className="w-full">
        <TabsList>
          <TabsTrigger value="resultados">Solicitações e Resultados</TabsTrigger>
          <TabsTrigger value="catalogo">Catálogo de Exames</TabsTrigger>
        </TabsList>

        {/* Tab de Resultados */}
        <TabsContent value="resultados">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exames Solicitados</CardTitle>
                <Button onClick={handleOpenSolicitarDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Exame
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="solicitado">Solicitados</SelectItem>
                    <SelectItem value="coletado">Coletados</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : filteredResultados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum exame encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Exame</TableHead>
                      <TableHead>Data Solicitação</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResultados.map((resultado) => (
                      <TableRow key={resultado.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{resultado.pet.nome}</span>
                            <span className="text-sm text-muted-foreground">
                              {resultado.pet.especie}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{resultado.exame.nome}</TableCell>
                        <TableCell>{formatDate(resultado.dataSolicitacao)}</TableCell>
                        <TableCell>{resultado.veterinarioSolicitante.nomeCompleto}</TableCell>
                        <TableCell>{getStatusBadge(resultado.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(resultado.status === 'solicitado' ||
                              resultado.status === 'coletado' ||
                              resultado.status === 'em_analise') && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenRegistrarDialog(resultado)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Registrar
                              </Button>
                            )}
                            {resultado.status !== 'cancelado' &&
                              resultado.status !== 'concluido' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelarMutation.mutate(resultado.id)}
                                  title="Cancelar"
                                >
                                  <XCircle className="h-4 w-4" />
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
        </TabsContent>

        {/* Tab de Catálogo */}
        <TabsContent value="catalogo">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Exames Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {catalogo.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum exame cadastrado no catálogo
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogo.map((exame) => (
                    <Card key={exame.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TestTube className="h-5 w-5 text-primary" />
                          {exame.nome}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {exame.categoria && (
                            <div>
                              <span className="font-medium">Categoria:</span> {exame.categoria}
                            </div>
                          )}
                          {exame.metodologia && (
                            <div>
                              <span className="font-medium">Metodologia:</span> {exame.metodologia}
                            </div>
                          )}
                          {exame.tempoResultado && (
                            <div>
                              <span className="font-medium">Tempo:</span> {exame.tempoResultado}
                            </div>
                          )}
                          {exame.valorReferencia && (
                            <div>
                              <span className="font-medium">Valor Ref.:</span>{' '}
                              {exame.valorReferencia}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Solicitar Exame */}
      <Dialog open={isSolicitarDialogOpen} onOpenChange={setIsSolicitarDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Solicitar Exame</DialogTitle>
            <DialogDescription>Preencha os dados para solicitar um novo exame</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSolicitar}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petId">Pet *</Label>
                  <Select
                    value={solicitarFormData.petId}
                    onValueChange={(value) => setSolicitarFormData({ ...solicitarFormData, petId: value })}
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
                  <Label htmlFor="internacaoId">Internação (opcional)</Label>
                  <Select
                    value={solicitarFormData.internacaoId}
                    onValueChange={(value) =>
                      setSolicitarFormData({ ...solicitarFormData, internacaoId: value })
                    }
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
              </div>

              <div>
                <Label htmlFor="exameId">Exame *</Label>
                <Select
                  value={solicitarFormData.exameId}
                  onValueChange={(value) => setSolicitarFormData({ ...solicitarFormData, exameId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o exame" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogo
                      .filter((e) => e.ativo)
                      .map((exame) => (
                        <SelectItem key={exame.id} value={exame.id}>
                          {exame.nome} - {exame.categoria}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={solicitarFormData.observacoes}
                  onChange={(e) =>
                    setSolicitarFormData({ ...solicitarFormData, observacoes: e.target.value })
                  }
                  rows={3}
                  placeholder="Informações adicionais sobre a solicitação"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseSolicitarDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={solicitarMutation.isPending}>
                {solicitarMutation.isPending ? 'Solicitando...' : 'Solicitar Exame'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Registrar Resultado */}
      <Dialog open={isRegistrarDialogOpen} onOpenChange={setIsRegistrarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Resultado</DialogTitle>
            <DialogDescription>
              {selectedExame && (
                <>
                  Exame: {selectedExame.exame.nome} - Pet: {selectedExame.pet.nome}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegistrar}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="resultado">Resultado do Exame *</Label>
                <Textarea
                  id="resultado"
                  value={registrarFormData.resultado}
                  onChange={(e) =>
                    setRegistrarFormData({ ...registrarFormData, resultado: e.target.value })
                  }
                  rows={6}
                  placeholder="Descreva os resultados do exame..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  value={registrarFormData.observacoes}
                  onChange={(e) =>
                    setRegistrarFormData({ ...registrarFormData, observacoes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseRegistrarDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={registrarMutation.isPending}>
                {registrarMutation.isPending ? 'Registrando...' : 'Confirmar Resultado'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
