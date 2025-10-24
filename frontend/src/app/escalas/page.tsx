'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { escalasService, type Escala, type CreateEscalaDto, type Turno } from '@/services/escalas.service';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EscalasPage() {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [funcionarioSearch, setFuncionarioSearch] = useState('');
  const [showFuncionarioSuggestions, setShowFuncionarioSuggestions] = useState(false);
  const [selectedFuncionarioName, setSelectedFuncionarioName] = useState('');
  const [formData, setFormData] = useState<CreateEscalaDto>({
    funcionarioId: '',
    turnoId: '',
    data: '',
    status: 'agendado',
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Queries
  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => escalasService.findAllTurnos(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', funcionarioSearch],
    queryFn: () => usersService.findAll(funcionarioSearch),
    enabled: showFuncionarioSuggestions || funcionarioSearch.length > 0,
  });

  const { data: escalas = [], isLoading } = useQuery({
    queryKey: ['escalas', currentWeekStart],
    queryFn: () => escalasService.findAllEscalas({
      dataInicio: currentWeekStart.toISOString(),
      dataFim: addDays(currentWeekStart, 7).toISOString(),
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateEscalaDto) => escalasService.createEscala(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success('Escala criada!');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar escala');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => escalasService.removeEscala(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success('Escala removida!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover escala');
    },
  });

  const handleSelectFuncionario = (user: any) => {
    setFormData({ ...formData, funcionarioId: user.id });
    setSelectedFuncionarioName(`${user.nomeCompleto} - ${user.cargo || 'N/A'}`);
    setFuncionarioSearch('');
    setShowFuncionarioSuggestions(false);
  };

  const handleOpenDialog = () => {
    setFormData({
      funcionarioId: '',
      turnoId: '',
      data: currentWeekStart.toISOString().split('T')[0],
      status: 'agendado',
    });
    setSelectedFuncionarioName('');
    setFuncionarioSearch('');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.funcionarioId) {
      toast.error('Por favor, selecione um funcionário');
      return;
    }

    if (!formData.turnoId) {
      toast.error('Por favor, selecione um turno');
      return;
    }

    createMutation.mutate(formData);
  };

  const getEscalasForDayAndTurno = (day: Date, turnoId: string): Escala[] => {
    const dayStr = day.toISOString().split('T')[0];
    return escalas.filter(
      (e) => e.data.startsWith(dayStr) && e.turnoId === turnoId
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      agendado: 'default',
      confirmado: 'success',
      falta: 'destructive',
      substituido: 'warning',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Escala de Funcionários"
        description="Gerencie os turnos e escalas da equipe"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Escalas' },
        ]}
        actions={
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Escala
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Semana de {format(currentWeekStart, 'dd/MM', { locale: ptBR })} a{' '}
              {format(addDays(currentWeekStart, 6), 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                Hoje
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando escalas...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted">Turno</th>
                    {weekDays.map((day) => (
                      <th key={day.toISOString()} className="border p-2 bg-muted min-w-[150px]">
                        <div className="text-center">
                          <div className="font-semibold">{format(day, 'EEE', { locale: ptBR })}</div>
                          <div className="text-sm text-muted-foreground">{format(day, 'dd/MM')}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((turno) => (
                    <tr key={turno.id}>
                      <td className="border p-2 bg-muted font-medium">
                        <div>{turno.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {turno.horaInicio.substring(0, 5)} - {turno.horaFim.substring(0, 5)}
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dayEscalas = getEscalasForDayAndTurno(day, turno.id);
                        return (
                          <td key={`${day.toISOString()}-${turno.id}`} className="border p-2 align-top">
                            {dayEscalas.length > 0 ? (
                              <div className="space-y-1">
                                {dayEscalas.map((escala) => (
                                  <div key={escala.id} className="text-sm bg-primary/10 p-2 rounded relative group">
                                    <div className="font-medium">{escala.funcionario.nomeCompleto}</div>
                                    <div className="text-xs">{getStatusBadge(escala.status)}</div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                      onClick={() => {
                                        if (confirm('Remover esta escala?')) {
                                          deleteMutation.mutate(escala.id);
                                        }
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground text-center">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Escala</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Label>Funcionário *</Label>
                <Input
                  placeholder={selectedFuncionarioName || "Digite para buscar o funcionário..."}
                  value={funcionarioSearch}
                  onChange={(e) => {
                    setFuncionarioSearch(e.target.value);
                    setShowFuncionarioSuggestions(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, funcionarioId: '' });
                      setSelectedFuncionarioName('');
                    }
                  }}
                  onFocus={() => setShowFuncionarioSuggestions(true)}
                  className={selectedFuncionarioName ? 'font-medium' : ''}
                />
                <input type="hidden" value={formData.funcionarioId} required />
                {showFuncionarioSuggestions && funcionarioSearch.length > 0 && users.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSelectFuncionario(user)}
                      >
                        <div className="font-medium">{user.nomeCompleto}</div>
                        <div className="text-sm text-gray-500">
                          Cargo: {user.cargo || 'N/A'} • Email: {user.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedFuncionarioName && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ {selectedFuncionarioName}
                  </div>
                )}
              </div>
              <div>
                <Label>Turno *</Label>
                <Select value={formData.turnoId} onValueChange={(v) => setFormData({ ...formData, turnoId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={turno.id}>
                        {turno.nome} ({turno.horaInicio.substring(0, 5)} - {turno.horaFim.substring(0, 5)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
