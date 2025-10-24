'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultasService, type Consulta } from '@/services/consultas.service';
import { useRouter } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConsultasPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Query para consultas
  const { data: consultas = [], isLoading } = useQuery({
    queryKey: ['consultas', statusFilter],
    queryFn: () => consultasService.findAll({
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => consultasService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      toast.success('Consulta removida!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover consulta');
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      em_atendimento: 'warning',
      concluida: 'success',
      gerou_internacao: 'info',
    } as const;
    const labels = {
      em_atendimento: 'Em Atendimento',
      concluida: 'Concluída',
      gerou_internacao: 'Gerou Internação',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const labels = {
      ambulatorial: 'Ambulatorial',
      emergencia: 'Emergência',
      retorno: 'Retorno',
    } as const;
    return <Badge variant="outline">
      {labels[tipo as keyof typeof labels] || tipo}
    </Badge>;
  };

  const filteredConsultas = consultas.filter((consulta) => {
    const matchesSearch =
      consulta.pet.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.tutor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.veterinario.nome.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Consultas</h1>
        <p className="text-muted-foreground">Gerenciamento de consultas ambulatoriais</p>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => router.push('/consultas/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por paciente, tutor ou veterinário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="gerou_internacao">Gerou Internação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredConsultas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma consulta encontrada</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Queixa Principal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultas.map((consulta) => (
                  <TableRow key={consulta.id}>
                    <TableCell>
                      {format(new Date(consulta.dataAtendimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{consulta.pet.nome}</div>
                        <div className="text-sm text-muted-foreground">{consulta.pet.especie}</div>
                      </div>
                    </TableCell>
                    <TableCell>{consulta.tutor.nome}</TableCell>
                    <TableCell>{consulta.veterinario.nome}</TableCell>
                    <TableCell>{getTipoBadge(consulta.tipo)}</TableCell>
                    <TableCell className="max-w-xs truncate">{consulta.queixaPrincipal}</TableCell>
                    <TableCell>{getStatusBadge(consulta.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/consultas/${consulta.id}`)}
                        >
                          <Eye className="h-4 w-4" />
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
    </div>
  );
}
