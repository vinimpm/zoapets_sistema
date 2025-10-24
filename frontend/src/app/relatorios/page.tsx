'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  BedDouble,
  Package,
  Calendar,
  TestTube,
  Syringe,
  FileText,
  ArrowRight,
  Download,
  TrendingUp,
} from 'lucide-react';

interface ReportCard {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

const reports: ReportCard[] = [
  {
    title: 'Relatórios Financeiros',
    description: 'Análise completa de contas, pagamentos, receitas e despesas',
    icon: DollarSign,
    href: '/financeiro/relatorios',
    color: 'text-green-500',
  },
  {
    title: 'Relatório de Internações',
    description: 'Estatísticas de internações, ocupação de leitos e tempo médio',
    icon: BedDouble,
    href: '/internacoes',
    color: 'text-blue-500',
  },
  {
    title: 'Relatório de Estoque',
    description: 'Movimentações, estoque baixo e histórico de medicamentos',
    icon: Package,
    href: '/estoque/movimentacoes',
    color: 'text-orange-500',
  },
  {
    title: 'Relatório de Agendamentos',
    description: 'Análise de consultas agendadas, cancelamentos e no-shows',
    icon: Calendar,
    href: '/agendamentos',
    color: 'text-purple-500',
  },
  {
    title: 'Relatório de Exames',
    description: 'Exames solicitados, resultados pendentes e tempo de processamento',
    icon: TestTube,
    href: '/exames',
    color: 'text-pink-500',
  },
  {
    title: 'Relatório de Medicações (RAM)',
    description: 'Administrações pendentes, atrasadas e histórico de medicações',
    icon: Syringe,
    href: '/ram',
    color: 'text-red-500',
  },
];

export default function RelatoriosPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Centro de Relatórios</h1>
        <p className="text-muted-foreground">
          Acesse relatórios detalhados de todas as áreas do sistema
        </p>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(report.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${report.color}`} />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Acessar Relatório
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de Relatórios Personalizados */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios Personalizados</CardTitle>
              <CardDescription>
                Crie relatórios customizados com filtros específicos
              </CardDescription>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Relatório por Período</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span>Relatório por Tutor</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Download className="h-5 w-5" />
              <span>Exportar Dados</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Internações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">3 críticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contas Abertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.430,00</div>
            <p className="text-xs text-muted-foreground mt-1">8 contas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medicações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">2 atrasadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exames Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">3 em análise</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
