'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeiroService } from '@/services/financeiro.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function RelatoriosFinanceirosPage() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // Atualizar datas baseado no período selecionado
  const handlePeriodoChange = (value: string) => {
    setPeriodo(value);
    const hoje = new Date();

    switch (value) {
      case 'hoje':
        setDataInicio(format(hoje, 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'ultimos_7_dias':
        setDataInicio(format(subDays(hoje, 7), 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'ultimos_30_dias':
        setDataInicio(format(subDays(hoje, 30), 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'mes_atual':
        setDataInicio(format(startOfMonth(hoje), 'yyyy-MM-dd'));
        setDataFim(format(endOfMonth(hoje), 'yyyy-MM-dd'));
        break;
      case 'ano_atual':
        setDataInicio(format(startOfYear(hoje), 'yyyy-MM-dd'));
        setDataFim(format(endOfYear(hoje), 'yyyy-MM-dd'));
        break;
      case 'personalizado':
        // Mantém as datas atuais para personalização
        break;
    }
  };

  // Query para resumo financeiro
  const { data: resumo, isLoading: isLoadingResumo } = useQuery({
    queryKey: ['financeiro-resumo', dataInicio, dataFim],
    queryFn: () => financeiroService.getResumo(dataInicio, dataFim),
  });

  // Query para contas
  const { data: contas = [], isLoading: isLoadingContas } = useQuery({
    queryKey: ['financeiro-contas'],
    queryFn: () => financeiroService.findAllContas(),
  });

  // Query para pagamentos
  const { data: pagamentos = [], isLoading: isLoadingPagamentos } = useQuery({
    queryKey: ['financeiro-pagamentos'],
    queryFn: () => financeiroService.findAllPagamentos(),
  });

  // Calcular métricas adicionais
  const taxaRecebimento = resumo
    ? ((resumo.totalRecebido / resumo.totalReceber) * 100).toFixed(1)
    : '0';

  const saldoPendente = resumo ? resumo.totalReceber - resumo.totalRecebido : 0;

  // Dados para gráfico de barras (Status das Contas)
  const statusData = resumo
    ? [
        { name: 'Pagas', value: resumo.contasPagas, color: '#10b981' },
        { name: 'Abertas', value: resumo.contasAbertas, color: '#f59e0b' },
        { name: 'Vencidas', value: resumo.contasVencidas, color: '#ef4444' },
      ]
    : [];

  // Dados para gráfico de pizza (Formas de Pagamento)
  const formasPagamento = pagamentos.reduce((acc, p) => {
    const forma = p.formaPagamento;
    acc[forma] = (acc[forma] || 0) + p.valor;
    return acc;
  }, {} as Record<string, number>);

  const formasPagamentoData = Object.entries(formasPagamento).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  const isLoading = isLoadingResumo || isLoadingContas || isLoadingPagamentos;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <p className="text-muted-foreground">Análise detalhada das finanças do hospital</p>
      </div>

      {/* Filtros de Período */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={handlePeriodoChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ultimos_7_dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="ultimos_30_dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="mes_atual">Mês Atual</SelectItem>
                  <SelectItem value="ano_atual">Ano Atual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPeriodo('personalizado');
                }}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodo('personalizado');
                }}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={isLoading}>
                <Calendar className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Carregando relatórios...</div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {resumo?.totalReceber.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumo?.contasAbertas || 0} contas abertas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Total Recebido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {resumo?.totalRecebido.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumo?.contasPagas || 0} contas pagas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Saldo Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {saldoPendente.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">A receber</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Contas Vencidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {resumo?.contasVencidas || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Recebimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-3xl font-bold">{taxaRecebimento}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${' '}
                  {contas.length > 0
                    ? (contas.reduce((sum, c) => sum + c.valorTotal, 0) / contas.length).toFixed(
                        2
                      )
                    : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor médio por conta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagamentos.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Pagamentos registrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Barras - Status das Contas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Contas</CardTitle>
                <CardDescription>Distribuição por status de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Formas de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>Distribuição por tipo de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                {formasPagamentoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={formasPagamentoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formasPagamentoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum pagamento registrado no período
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Top Contas */}
          <Card>
            <CardHeader>
              <CardTitle>Maiores Contas (Top 10)</CardTitle>
              <CardDescription>Contas com maior valor no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contas
                  .sort((a, b) => b.valorTotal - a.valorTotal)
                  .slice(0, 10)
                  .map((conta, index) => (
                    <div
                      key={conta.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{conta.tutor.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {conta.numeroConta} • {conta.pet?.nome || 'Sem pet'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {conta.valorTotal.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Pago: R$ {conta.valorPago.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                {contas.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma conta encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
