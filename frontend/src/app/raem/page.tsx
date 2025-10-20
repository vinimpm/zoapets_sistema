'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { administracoesService, type Administracao, type RegistrarAdministracaoDto } from '@/services/administracoes.service';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function RaemPage() {
  const queryClient = useQueryClient();
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [isNaoRealizarOpen, setIsNaoRealizarOpen] = useState(false);
  const [selectedAdm, setSelectedAdm] = useState<Administracao | null>(null);
  const [registrarData, setRegistrarData] = useState<RegistrarAdministracaoDto>({
    doseAdministrada: '',
    viaAdministracao: '',
    observacoes: '',
  });
  const [naoRealizarData, setNaoRealizarData] = useState({ motivo: '', observacoes: '' });

  // Query para administrações pendentes
  const { data: pendentes = [], isLoading: loadingPendentes } = useQuery({
    queryKey: ['administracoes-pendentes'],
    queryFn: () => administracoesService.findPendentes(),
  });

  // Query para administrações atrasadas
  const { data: atrasadas = [] } = useQuery({
    queryKey: ['administracoes-atrasadas'],
    queryFn: () => administracoesService.findAtrasadas(),
  });

  // Query para próximas administrações (2h)
  const { data: proximas = [] } = useQuery({
    queryKey: ['administracoes-proximas'],
    queryFn: () => administracoesService.findProximas(2),
  });

  // Query para resumo
  const { data: resumo } = useQuery({
    queryKey: ['administracoes-resumo'],
    queryFn: () => administracoesService.getResumo(),
  });

  // Mutation para registrar administração
  const registrarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistrarAdministracaoDto }) =>
      administracoesService.registrar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administracoes-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['administracoes-atrasadas'] });
      queryClient.invalidateQueries({ queryKey: ['administracoes-proximas'] });
      queryClient.invalidateQueries({ queryKey: ['administracoes-resumo'] });
      toast.success('Administração registrada!');
      setIsRegistrarOpen(false);
      setSelectedAdm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar');
    },
  });

  // Mutation para não realizar
  const naoRealizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      administracoesService.naoRealizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administracoes-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['administracoes-atrasadas'] });
      queryClient.invalidateQueries({ queryKey: ['administracoes-resumo'] });
      toast.success('Registrado como não realizado');
      setIsNaoRealizarOpen(false);
      setSelectedAdm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar');
    },
  });

  const handleOpenRegistrar = (adm: Administracao) => {
    setSelectedAdm(adm);
    setRegistrarData({
      doseAdministrada: adm.prescricao?.dose || '',
      viaAdministracao: adm.prescricao?.viaAdministracao || '',
      observacoes: '',
    });
    setIsRegistrarOpen(true);
  };

  const handleOpenNaoRealizar = (adm: Administracao) => {
    setSelectedAdm(adm);
    setNaoRealizarData({ motivo: '', observacoes: '' });
    setIsNaoRealizarOpen(true);
  };

  const handleRegistrar = () => {
    if (selectedAdm) {
      registrarMutation.mutate({ id: selectedAdm.id, data: registrarData });
    }
  };

  const handleNaoRealizar = () => {
    if (selectedAdm) {
      naoRealizarMutation.mutate({ id: selectedAdm.id, data: naoRealizarData });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'warning',
      realizada: 'success',
      atrasada: 'destructive',
      nao_realizada: 'secondary',
    } as const;
    const labels = {
      pendente: 'Pendente',
      realizada: 'Realizada',
      atrasada: 'Atrasada',
      nao_realizada: 'Não Realizada',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return date;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">RAEM - Administração de Medicamentos</h1>
        <p className="text-muted-foreground">
          Registro e Administração Eletrônica de Medicamentos
        </p>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{resumo.total}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{resumo.pendentes}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{resumo.atrasadas}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{resumo.realizadas}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Adesão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{resumo.taxaAdesao.toFixed(1)}%</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Atrasadas */}
      {atrasadas.length > 0 && (
        <Card className="mb-4 border-red-500">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">
                ATENÇÃO: {atrasadas.length} administração(ões) atrasada(s)!
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Administrações Pendentes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Administrações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPendentes ? (
            <div className="text-center py-8">Carregando...</div>
          ) : pendentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma administração pendente
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Via</TableHead>
                  <TableHead>Horário Agendado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendentes.map((adm) => (
                  <TableRow key={adm.id} className={adm.status === 'atrasada' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">
                      {adm.prescricao?.internacao?.pet.nome || '-'}
                    </TableCell>
                    <TableCell>
                      {adm.prescricao?.medicamento.nome || '-'}
                    </TableCell>
                    <TableCell>{adm.prescricao?.dose || '-'}</TableCell>
                    <TableCell>{adm.prescricao?.viaAdministracao || '-'}</TableCell>
                    <TableCell>{formatDateTime(adm.dataHoraAgendada)}</TableCell>
                    <TableCell>{getStatusBadge(adm.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenRegistrar(adm)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Registrar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenNaoRealizar(adm)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Não Realizado
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Próximas Administrações (2h) */}
      {proximas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Administrações (2 horas)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximas.map((adm) => (
                  <TableRow key={adm.id}>
                    <TableCell>{adm.prescricao?.internacao?.pet.nome || '-'}</TableCell>
                    <TableCell>{adm.prescricao?.medicamento.nome || '-'}</TableCell>
                    <TableCell>{adm.prescricao?.dose || '-'}</TableCell>
                    <TableCell>{formatDateTime(adm.dataHoraAgendada)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Registrar Administração */}
      <Dialog open={isRegistrarOpen} onOpenChange={setIsRegistrarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Administração</DialogTitle>
            <DialogDescription>
              {selectedAdm?.prescricao?.medicamento.nome} - {selectedAdm?.prescricao?.internacao?.pet.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Horário Agendado</Label>
              <Input
                value={selectedAdm ? formatDateTime(selectedAdm.dataHoraAgendada) : ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="doseAdministrada">Dose Administrada *</Label>
              <Input
                id="doseAdministrada"
                value={registrarData.doseAdministrada}
                onChange={(e) => setRegistrarData({ ...registrarData, doseAdministrada: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="viaAdministracao">Via de Administração *</Label>
              <Input
                id="viaAdministracao"
                value={registrarData.viaAdministracao}
                onChange={(e) => setRegistrarData({ ...registrarData, viaAdministracao: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={registrarData.observacoes}
                onChange={(e) => setRegistrarData({ ...registrarData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrar} disabled={registrarMutation.isPending}>
              {registrarMutation.isPending ? 'Registrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Não Realizar */}
      <Dialog open={isNaoRealizarOpen} onOpenChange={setIsNaoRealizarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administração Não Realizada</DialogTitle>
            <DialogDescription>
              Registre o motivo da não realização
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="motivo">Motivo *</Label>
              <Textarea
                id="motivo"
                value={naoRealizarData.motivo}
                onChange={(e) => setNaoRealizarData({ ...naoRealizarData, motivo: e.target.value })}
                placeholder="Descreva o motivo (recusa do paciente, vômito, etc.)"
                rows={2}
                required
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={naoRealizarData.observacoes}
                onChange={(e) => setNaoRealizarData({ ...naoRealizarData, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNaoRealizarOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleNaoRealizar}
              disabled={naoRealizarMutation.isPending}
            >
              {naoRealizarMutation.isPending ? 'Registrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
