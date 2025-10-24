'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, AlertCircle, Syringe, Clock, Calendar, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  // Dashboard with charts and stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: internacoesChart = [] } = useQuery({
    queryKey: ['dashboard-internacoes-chart'],
    queryFn: () => dashboardService.getInternacoesChart(),
  });

  const { data: financeiroChart = [] } = useQuery({
    queryKey: ['dashboard-financeiro-chart'],
    queryFn: () => dashboardService.getFinanceiroChart(),
  });

  const taxaConfirmacao = stats?.agendamentosHoje
    ? ((stats.agendamentosConfirmados / stats.agendamentosHoje) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema hospitalar veterinário</p>
        </div>

        {/* Cards de Estatísticas - 4 cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Internações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats?.internacoesAtivas || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pacientes Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{stats?.pacientesCriticos || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{stats?.administracoesPendentes || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Medicações Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{stats?.medicacoesAtrasadas || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos - 2 gráficos grandes lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Internações */}
          <Card>
            <CardHeader>
              <CardTitle>Internações - Últimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={internacoesChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="entradas"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Entradas"
                  />
                  <Area
                    type="monotone"
                    dataKey="saidas"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Saídas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Financeiro - Últimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financeiroChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Despesa"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Agendamentos - 3 cards na parte inferior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agendamentos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats?.agendamentosHoje || 0}</span>
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
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats?.agendamentosConfirmados || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{taxaConfirmacao}%</span>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
