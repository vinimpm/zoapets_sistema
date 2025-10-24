'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  petsService,
  type TimelineEvent,
  type TimelineFilters,
  TimelineEventType
} from '@/services/pets.service';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Stethoscope,
  BedDouble,
  Syringe,
  Pill,
  Activity,
  FileText,
  TestTube,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Mapa de ícones por tipo de evento
const eventIcons = {
  [TimelineEventType.AGENDAMENTO]: Calendar,
  [TimelineEventType.CONSULTA]: Stethoscope,
  [TimelineEventType.INTERNACAO]: BedDouble,
  [TimelineEventType.VACINACAO]: Syringe,
  [TimelineEventType.PRESCRICAO]: Pill,
  [TimelineEventType.PROCEDIMENTO]: Activity,
  [TimelineEventType.EXAME]: TestTube,
  [TimelineEventType.EVOLUCAO]: FileText,
  [TimelineEventType.ADMINISTRACAO]: Clock,
};

// Mapa de cores por tipo de evento
const eventColors = {
  [TimelineEventType.AGENDAMENTO]: 'bg-blue-500',
  [TimelineEventType.CONSULTA]: 'bg-green-500',
  [TimelineEventType.INTERNACAO]: 'bg-red-500',
  [TimelineEventType.VACINACAO]: 'bg-purple-500',
  [TimelineEventType.PRESCRICAO]: 'bg-orange-500',
  [TimelineEventType.PROCEDIMENTO]: 'bg-pink-500',
  [TimelineEventType.EXAME]: 'bg-yellow-500',
  [TimelineEventType.EVOLUCAO]: 'bg-cyan-500',
  [TimelineEventType.ADMINISTRACAO]: 'bg-indigo-500',
};

// Labels amigáveis para tipos de eventos
const eventLabels = {
  [TimelineEventType.AGENDAMENTO]: 'Agendamento',
  [TimelineEventType.CONSULTA]: 'Consulta',
  [TimelineEventType.INTERNACAO]: 'Internação',
  [TimelineEventType.VACINACAO]: 'Vacinação',
  [TimelineEventType.PRESCRICAO]: 'Prescrição',
  [TimelineEventType.PROCEDIMENTO]: 'Procedimento',
  [TimelineEventType.EXAME]: 'Exame',
  [TimelineEventType.EVOLUCAO]: 'Evolução',
  [TimelineEventType.ADMINISTRACAO]: 'Administração',
};

export default function PetHistoricoPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [filters, setFilters] = useState<TimelineFilters>({
    page: 1,
    pageSize: 20,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Buscar dados do pet
  const { data: pet } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => petsService.findOne(petId),
  });

  // Buscar timeline
  const { data: timeline, isLoading } = useQuery({
    queryKey: ['pet-timeline', petId, filters],
    queryFn: () => petsService.getTimeline(petId, filters),
    enabled: !!petId,
  });

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleTypeFilterChange = (type: TimelineEventType, checked: boolean) => {
    setFilters((prev) => {
      const currentTypes = prev.types || [];
      if (checked) {
        return { ...prev, types: [...currentTypes, type], page: 1 };
      } else {
        return { ...prev, types: currentTypes.filter((t) => t !== type), page: 1 };
      }
    });
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const hasActiveFilters = filters.types && filters.types.length > 0;

  return (
    <div className="p-8">
      <PageHeader
        title={`Histórico - ${pet?.nome || 'Pet'}`}
        description={pet ? `${pet.especie} • ${pet.raca || 'SRD'}` : 'Carregando...'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pets', href: '/pets' },
          { label: pet?.nome || 'Pet', href: `/pets/${petId}` },
          { label: 'Histórico' },
        ]}
        showBackButton
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`space-y-4 ${showFilters ? '' : 'hidden lg:block'}`}>
              <div>
                <h4 className="font-semibold text-sm mb-3">Tipo de Evento</h4>
                <div className="space-y-2">
                  {Object.values(TimelineEventType).map((type) => {
                    const Icon = eventIcons[type];
                    const colorClass = eventColors[type];
                    const isChecked = filters.types?.includes(type) || false;

                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleTypeFilterChange(type, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={type}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <div className={`p-1 rounded ${colorClass} text-white`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          {eventLabels[type]}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              )}

              {timeline && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between mb-1">
                      <span>Total de eventos:</span>
                      <span className="font-semibold">{timeline.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exibindo:</span>
                      <span className="font-semibold">{timeline.events.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Principal */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">Carregando histórico...</div>
              </CardContent>
            </Card>
          ) : timeline && timeline.events.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  {hasActiveFilters
                    ? 'Nenhum evento encontrado com os filtros aplicados'
                    : 'Nenhum evento registrado no histórico deste pet'}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {timeline?.events.map((event, index) => {
                const Icon = eventIcons[event.type];
                const colorClass = eventColors[event.type];
                const isExpanded = expandedEvents.has(event.id);
                const isLast = index === timeline.events.length - 1;

                return (
                  <Card
                    key={event.id}
                    className={`relative ${event.isFuture ? 'border-dashed border-2' : ''}`}
                  >
                    {/* Linha conectora */}
                    {!isLast && (
                      <div className="absolute left-[52px] top-16 bottom-0 w-0.5 bg-border -mb-4" />
                    )}

                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {/* Ícone do evento */}
                        <div className={`flex-shrink-0 p-3 rounded-full ${colorClass} text-white h-fit`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Conteúdo do evento */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {event.isFuture && (
                                <Badge variant="outline">Agendado</Badge>
                              )}
                              {event.status && (
                                <Badge variant="secondary">{event.status}</Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm mb-3">{event.description}</p>

                          {event.veterinario && (
                            <p className="text-sm text-muted-foreground mb-3">
                              Veterinário: <span className="font-medium">{event.veterinario.nome}</span>
                            </p>
                          )}

                          {/* Botão de expandir/recolher */}
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={() => toggleEventExpansion(event.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-center">
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Ocultar detalhes
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Ver detalhes completos
                                  </>
                                )}
                              </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-4">
                              <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 text-sm">Informações Detalhadas</h4>
                                <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                                  {JSON.stringify(event.details, null, 2)}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Paginação */}
              {timeline && timeline.total > timeline.pageSize && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center px-4">
                    Página {timeline.page} de {Math.ceil(timeline.total / timeline.pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    disabled={filters.page! >= Math.ceil(timeline.total / timeline.pageSize)}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
