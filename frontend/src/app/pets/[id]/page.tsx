'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { petsService } from '@/services/pets.service';
import { internacoesService } from '@/services/internacoes.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Activity, FileText, Syringe, User, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PetProfilePage() {
  const params = useParams();
  const petId = params.id as string;

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => petsService.findOne(petId),
  });

  const { data: internacoes = [] } = useQuery({
    queryKey: ['pet-internacoes', petId],
    queryFn: () => internacoesService.findByPet(petId),
    enabled: !!petId,
  });

  if (isLoading) {
    return <div className="p-8"><div className="text-center py-12">Carregando...</div></div>;
  }

  if (!pet) {
    return <div className="p-8"><div className="text-center py-12">Pet não encontrado</div></div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title={pet.nome}
        description={`${pet.especie} • ${pet.raca || 'SRD'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pets', href: '/pets' },
          { label: pet.nome },
        ]}
        showBackButton
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Espécie:</strong> {pet.especie}</div>
            <div><strong>Raça:</strong> {pet.raca || 'SRD'}</div>
            <div><strong>Sexo:</strong> {pet.sexo}</div>
            <div><strong>Idade:</strong> {pet.idade} anos</div>
            <div><strong>Peso:</strong> {pet.peso} kg</div>
            {pet.microchip && <div><strong>Microchip:</strong> {pet.microchip}</div>}
            <div>
              <Badge variant={pet.ativo ? 'success' : 'secondary'}>
                {pet.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Nome:</strong> {pet.tutor.nome}</div>
            {pet.tutor.telefone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {pet.tutor.telefone}
              </div>
            )}
            {pet.tutor.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {pet.tutor.email}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Internações:</strong> {internacoes.length}</div>
            <div><strong>Última visita:</strong> {internacoes.length > 0 ? format(new Date(internacoes[0].dataEntrada), 'dd/MM/yyyy') : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline"><Activity className="h-4 w-4 mr-2" />Timeline</TabsTrigger>
          <TabsTrigger value="internacoes"><Calendar className="h-4 w-4 mr-2" />Internações</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Médica</CardTitle>
            </CardHeader>
            <CardContent>
              {internacoes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum histórico médico registrado</p>
              ) : (
                <div className="space-y-4">
                  {internacoes.map((internacao) => (
                    <div key={internacao.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{internacao.motivo}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(internacao.dataEntrada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                        <Badge>{internacao.status}</Badge>
                      </div>
                      {internacao.diagnostico && (
                        <p className="text-sm mt-2">{internacao.diagnostico}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Internações</CardTitle>
            </CardHeader>
            <CardContent>
              {internacoes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma internação registrada</p>
              ) : (
                <div className="space-y-3">
                  {internacoes.map((internacao) => (
                    <Card key={internacao.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{internacao.motivo}</div>
                            <div className="text-sm text-muted-foreground">
                              Entrada: {format(new Date(internacao.dataEntrada), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <Badge>{internacao.status}</Badge>
                        </div>
                        {internacao.diagnostico && (
                          <p className="text-sm text-muted-foreground">{internacao.diagnostico}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
