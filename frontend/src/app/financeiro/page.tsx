'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService, type Conta, type CreateContaDto, type CreatePagamentoDto } from '@/services/financeiro.service';
import { tutoresService } from '@/services/tutores.service';
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
import { Plus, DollarSign, AlertTriangle, TrendingUp, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FinanceiroPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isContaDialogOpen, setIsContaDialogOpen] = useState(false);
  const [isPagamentoDialogOpen, setIsPagamentoDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [contaFormData, setContaFormData] = useState<CreateContaDto>({
    tutorId: '',
    valorTotal: 0,
    descricao: '',
    dataVencimento: '',
    observacoes: '',
  });
  const [pagamentoFormData, setPagamentoFormData] = useState<CreatePagamentoDto>({
    valor: 0,
    formaPagamento: '',
    observacoes: '',
  });

  // Query para listar contas
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas', statusFilter],
    queryFn: () => financeiroService.findAllContas(statusFilter),
  });

  // Query para resumo financeiro
  const { data: resumo } = useQuery({
    queryKey: ['resumo-financeiro'],
    queryFn: () => financeiroService.getResumo(),
  });

  // Query para contas vencidas
  const { data: contasVencidas = [] } = useQuery({
    queryKey: ['contas-vencidas'],
    queryFn: () => financeiroService.findContasVencidas(),
  });

  // Query para tutores (select)
  const { data: tutores = [] } = useQuery({
    queryKey: ['tutores'],
    queryFn: () => tutoresService.findAll(),
  });

  // Query para pets (select)
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsService.findAll(),
  });

  // Mutation para criar conta
  const createContaMutation = useMutation({
    mutationFn: (data: CreateContaDto) => financeiroService.createConta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      queryClient.invalidateQueries({ queryKey: ['resumo-financeiro'] });
      toast.success('Conta criada!');
      setIsContaDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    },
  });

  // Mutation para registrar pagamento
  const createPagamentoMutation = useMutation({
    mutationFn: ({ contaId, data }: { contaId: string; data: CreatePagamentoDto }) =>
      financeiroService.createPagamento(contaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      queryClient.invalidateQueries({ queryKey: ['resumo-financeiro'] });
      queryClient.invalidateQueries({ queryKey: ['contas-vencidas'] });
      toast.success('Pagamento registrado!');
      setIsPagamentoDialogOpen(false);
      setSelectedConta(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    },
  });

  const handleOpenContaDialog = () => {
    setContaFormData({
      tutorId: '',
      valorTotal: 0,
      descricao: '',
      dataVencimento: '',
      observacoes: '',
    });
    setIsContaDialogOpen(true);
  };

  const handleOpenPagamentoDialog = (conta: Conta) => {
    setSelectedConta(conta);
    const valorRestante = conta.valorTotal - conta.valorPago;
    setPagamentoFormData({
      valor: valorRestante,
      formaPagamento: '',
      observacoes: '',
    });
    setIsPagamentoDialogOpen(true);
  };

  const handleSubmitConta = (e: React.FormEvent) => {
    e.preventDefault();
    createContaMutation.mutate(contaFormData);
  };

  const handleSubmitPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConta) {
      createPagamentoMutation.mutate({
        contaId: selectedConta.id,
        data: pagamentoFormData,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      aberta: 'warning',
      parcial: 'info',
      paga: 'success',
    } as const;
    const labels = {
      aberta: 'Aberta',
      parcial: 'Parcial',
      paga: 'Paga',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
      <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie contas a receber e pagamentos</p>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{formatCurrency(resumo.totalReceber)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{formatCurrency(resumo.totalRecebido)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contas Abertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{resumo.contasAbertas}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{resumo.contasVencidas}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerta de Contas Vencidas */}
      {contasVencidas.length > 0 && (
        <Card className="mb-4 border-red-500">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">
                Atenção: {contasVencidas.length} conta(s) vencida(s)!
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contas a Receber</CardTitle>
            <Button onClick={handleOpenContaDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="aberta">Abertas</SelectItem>
                <SelectItem value="parcial">Parciais</SelectItem>
                <SelectItem value="paga">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : contas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Conta</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => {
                  const valorRestante = conta.valorTotal - conta.valorPago;
                  const isVencida = conta.dataVencimento && new Date(conta.dataVencimento) < new Date() && conta.status !== 'paga';

                  return (
                    <TableRow key={conta.id} className={isVencida ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{conta.numeroConta}</TableCell>
                      <TableCell>{conta.tutor.nome}</TableCell>
                      <TableCell>{conta.pet?.nome || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{conta.descricao || '-'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(conta.valorTotal)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-green-600">{formatCurrency(conta.valorPago)}</span>
                          {valorRestante > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Restante: {formatCurrency(valorRestante)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {conta.dataVencimento
                          ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(conta.status)}</TableCell>
                      <TableCell className="text-right">
                        {conta.status !== 'paga' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenPagamentoDialog(conta)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Receber
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Conta */}
      <Dialog open={isContaDialogOpen} onOpenChange={setIsContaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
            <DialogDescription>
              Registre uma nova conta a receber
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitConta}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tutorId">Tutor *</Label>
                  <Select
                    value={contaFormData.tutorId}
                    onValueChange={(value) => setContaFormData({ ...contaFormData, tutorId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutores.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="petId">Pet (opcional)</Label>
                  <Select
                    value={contaFormData.petId}
                    onValueChange={(value) => setContaFormData({ ...contaFormData, petId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorTotal">Valor Total *</Label>
                  <Input
                    id="valorTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={contaFormData.valorTotal}
                    onChange={(e) => setContaFormData({ ...contaFormData, valorTotal: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataVencimento">Data Vencimento</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={contaFormData.dataVencimento}
                    onChange={(e) => setContaFormData({ ...contaFormData, dataVencimento: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={contaFormData.descricao}
                  onChange={(e) => setContaFormData({ ...contaFormData, descricao: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={contaFormData.observacoes}
                  onChange={(e) => setContaFormData({ ...contaFormData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createContaMutation.isPending}>
                {createContaMutation.isPending ? 'Criando...' : 'Criar Conta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Registrar Pagamento */}
      <Dialog open={isPagamentoDialogOpen} onOpenChange={setIsPagamentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Conta: {selectedConta?.numeroConta} - {selectedConta?.tutor.nome}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPagamento}>
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span>Valor Total:</span>
                  <span className="font-medium">{formatCurrency(selectedConta?.valorTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor Pago:</span>
                  <span className="text-green-600">{formatCurrency(selectedConta?.valorPago || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t">
                  <span>Valor Restante:</span>
                  <span className="text-orange-600">
                    {formatCurrency((selectedConta?.valorTotal || 0) - (selectedConta?.valorPago || 0))}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="valor">Valor do Pagamento *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pagamentoFormData.valor}
                  onChange={(e) => setPagamentoFormData({ ...pagamentoFormData, valor: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select
                  value={pagamentoFormData.formaPagamento}
                  onValueChange={(value) => setPagamentoFormData({ ...pagamentoFormData, formaPagamento: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={pagamentoFormData.observacoes}
                  onChange={(e) => setPagamentoFormData({ ...pagamentoFormData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPagamentoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPagamentoMutation.isPending}>
                {createPagamentoMutation.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
  );
}
