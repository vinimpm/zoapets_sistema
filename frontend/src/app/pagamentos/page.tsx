'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService, type Pagamento } from '@/services/financeiro.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, DollarSign, CreditCard, Banknote, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PagamentosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Query para listar pagamentos
  const { data: pagamentos = [], isLoading } = useQuery({
    queryKey: ['pagamentos'],
    queryFn: () => financeiroService.findAllPagamentos(),
  });

  // Mutation para cancelar pagamento
  const cancelMutation = useMutation({
    mutationFn: (id: string) => financeiroService.cancelarPagamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      toast.success('Pagamento cancelado com sucesso!');
      setIsCancelDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setSelectedPagamento(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar pagamento');
    },
  });

  const handleOpenDetails = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenCancelDialog = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setSelectedPagamento(null);
  };

  const getFormaPagamentoIcon = (forma: string) => {
    switch (forma.toLowerCase()) {
      case 'dinheiro':
        return <Banknote className="h-4 w-4" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
    };
    return labels[forma.toLowerCase()] || forma;
  };

  const filteredPagamentos = pagamentos.filter((pagamento) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pagamento.conta?.tutor?.nome.toLowerCase().includes(searchLower) ||
      pagamento.conta?.numeroConta.toLowerCase().includes(searchLower) ||
      pagamento.formaPagamento.toLowerCase().includes(searchLower) ||
      pagamento.transacaoId?.toLowerCase().includes(searchLower)
    );
  });

  // Calcular totais
  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const totalPorForma = pagamentos.reduce((acc, p) => {
    const forma = p.formaPagamento;
    acc[forma] = (acc[forma] || 0) + p.valor;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Histórico de Pagamentos</h1>
        <p className="text-muted-foreground">Visualize todos os pagamentos realizados</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                R$ {totalPago.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pagamentos.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              R$ {pagamentos.length > 0 ? (totalPago / pagamentos.length).toFixed(2) : '0.00'}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.keys(totalPorForma).map((forma) => (
                <Badge key={forma} variant="outline" className="text-xs">
                  {getFormaPagamentoLabel(forma)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pagamentos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredPagamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>
                      {format(new Date(pagamento.dataPagamento), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pagamento.conta?.numeroConta || '-'}</span>
                        {pagamento.conta?.descricao && (
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {pagamento.conta.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pagamento.conta?.tutor?.nome || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormaPagamentoIcon(pagamento.formaPagamento)}
                        <span>{getFormaPagamentoLabel(pagamento.formaPagamento)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        R$ {pagamento.valor.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{pagamento.usuario?.nome || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(pagamento)}
                          title="Ver Detalhes"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenCancelDialog(pagamento)}
                          title="Cancelar Pagamento"
                        >
                          <XCircle className="h-4 w-4" />
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

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>Informações completas do pagamento</DialogDescription>
          </DialogHeader>
          {selectedPagamento && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Pagamento</p>
                  <p className="font-mono text-sm">{selectedPagamento.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data do Pagamento</p>
                  <p>
                    {format(
                      new Date(selectedPagamento.dataPagamento),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número da Conta</p>
                  <p className="font-medium">{selectedPagamento.conta?.numeroConta || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tutor</p>
                  <p>{selectedPagamento.conta?.tutor?.nome || '-'}</p>
                </div>
              </div>

              {selectedPagamento.conta?.pet && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pet</p>
                  <p>{selectedPagamento.conta.pet.nome}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forma de Pagamento</p>
                  <div className="flex items-center gap-2">
                    {getFormaPagamentoIcon(selectedPagamento.formaPagamento)}
                    <p>{getFormaPagamentoLabel(selectedPagamento.formaPagamento)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {selectedPagamento.valor.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedPagamento.parcelas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                  <p>{selectedPagamento.parcelas}x</p>
                </div>
              )}

              {selectedPagamento.transacaoId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Transação</p>
                  <p className="font-mono text-sm">{selectedPagamento.transacaoId}</p>
                </div>
              )}

              {selectedPagamento.observacoes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <p>{selectedPagamento.observacoes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                <p>{selectedPagamento.usuario?.nome || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cancelamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este pagamento de{' '}
              <strong>R$ {selectedPagamento?.valor.toFixed(2)}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCancelDialog}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPagamento && cancelMutation.mutate(selectedPagamento.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
