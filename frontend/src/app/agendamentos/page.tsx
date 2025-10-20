'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@antml/react-query';
import { agendamentosService, type Agendamento, type CreateAgendamentoDto } from '@/services/agendamentos.service';
import { petsService } from '@/services/pets.service';
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
import { Calendar, Plus, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AgendamentosPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAgendamentoDto>({
    petId: '',
    veterinarioId: user?.id || '',
    tipo: '',
    dataHoraInicio: '',
    dataHoraFim: '',
    observacoes: '',
  });

  // Query para agendamentos do período
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos-periodo', startDate, endDate, statusFilter],
    queryFn: () => agendamentosService.findByPeriodo(startDate, endDate),
  });

  // Query para pets (select)
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsService.findAll(),
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: (data: CreateAgendamentoDto) => agendamentosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-periodo'] });
      toast.success('Agendamento criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
    },
  });

  // Mutation para confirmar
  const confirmarMutation = useMutation({
    mutationFn: (id: string) => agendamentosService.confirmar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-periodo'] });
      toast.success('Agendamento confirmado!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao confirmar');
    },
  });

  // Mutation para cancelar
  const cancelarMutation = useMutation({
    mutationFn: (id: string) => agendamentosService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-periodo'] });
      toast.success('Agendamento cancelado!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar');
    },
  });

  const handleOpenDialog = () => {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowAt9 = new Date(tomorrow.setHours(9, 0, 0, 0));
    const tomorrowAt10 = new Date(tomorrow.setHours(10, 0, 0, 0));

    setFormData({
      petId: '',
      veterinarioId: user?.id || '',
      tipo: '',
      dataHoraInicio: format(tomorrowAt9, "yyyy-MM-dd'T'HH:mm"),
      dataHoraFim: format(tomorrowAt10, "yyyy-MM-dd'T'HH:mm"),
      observacoes: '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      agendado: 'secondary',
      confirmado: 'info',
      realizado: 'success',
      cancelado: 'destructive',
      falta: 'warning',
    } as const;
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      realizado: 'Realizado',
      cancelado: 'Cancelado',
      falta: 'Falta',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  const filteredAgendamentos = statusFilter
    ? agendamentos.filter(a => a.status === statusFilter)
    : agendamentos;

  const agendamentosPorDia = filteredAgendamentos.reduce((acc, agendamento) => {
    const dia = format(new Date(agendamento.dataHoraInicio), 'yyyy-MM-dd');
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(agendamento);
    return acc;
  }, {} as Record<string, Agendamento[]>);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <p className="text-muted-foreground">Gerencie a agenda de consultas e procedimentos</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-2xl font-bold">{agendamentos.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {agendamentos.filter(a => a.status === 'confirmado').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {agendamentos.filter(a => a.status === 'realizado').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {agendamentos.filter(a => a.status === 'cancelado').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agenda da Semana</CardTitle>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                ← Semana Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                Próxima Semana →
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="agendado">Agendados</SelectItem>
                <SelectItem value="confirmado">Confirmados</SelectItem>
                <SelectItem value="realizado">Realizados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {format(startDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
            {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredAgendamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(agendamento.dataHoraInicio), "dd/MM/yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(agendamento.dataHoraInicio), "HH:mm")} -{' '}
                          {format(new Date(agendamento.dataHoraFim), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{agendamento.pet.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{agendamento.pet.tutor.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{agendamento.tipo}</TableCell>
                    <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {agendamento.status === 'agendado' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmarMutation.mutate(agendamento.id)}
                              title="Confirmar"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelarMutation.mutate(agendamento.id)}
                              title="Cancelar"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
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

      {/* Dialog de Criar Agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Agende uma consulta ou procedimento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petId">Pet *</Label>
                  <Select
                    value={formData.petId}
                    onValueChange={(value) => setFormData({ ...formData, petId: value })}
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
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Vacinação">Vacinação</SelectItem>
                      <SelectItem value="Exame">Exame</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataHoraInicio">Data/Hora Início *</Label>
                  <Input
                    id="dataHoraInicio"
                    type="datetime-local"
                    value={formData.dataHoraInicio}
                    onChange={(e) => setFormData({ ...formData, dataHoraInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataHoraFim">Data/Hora Fim *</Label>
                  <Input
                    id="dataHoraFim"
                    type="datetime-local"
                    value={formData.dataHoraFim}
                    onChange={(e) => setFormData({ ...formData, dataHoraFim: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
