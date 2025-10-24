'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultasService, type CreateConsultaDto } from '@/services/consultas.service';
import { petsService } from '@/services/pets.service';
import { tutoresService } from '@/services/tutores.service';
import { usersService } from '@/services/users.service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export default function NovaConsultaPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<CreateConsultaDto>({
    petId: '',
    tutorId: '',
    veterinarioId: user?.id || '',
    tipo: 'ambulatorial',
    dataAtendimento: new Date().toISOString().slice(0, 16),
    queixaPrincipal: '',
    status: 'em_atendimento',
  });

  // Queries
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsService.findAll(),
  });

  const { data: tutores = [] } = useQuery({
    queryKey: ['tutores'],
    queryFn: () => tutoresService.findAll(),
  });

  const { data: veterinarios = [] } = useQuery({
    queryKey: ['users-veterinarios'],
    queryFn: () => usersService.findAll(),
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateConsultaDto) => consultasService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      toast.success('Consulta criada com sucesso!');
      router.push(`/consultas/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar consulta');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.petId || !formData.tutorId || !formData.queixaPrincipal) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate(formData);
  };

  const handlePetChange = (petId: string) => {
    const selectedPet = pets.find(p => p.id === petId);
    setFormData({
      ...formData,
      petId,
      tutorId: selectedPet?.tutorId || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Consulta</h1>
          <p className="text-muted-foreground">Iniciar novo atendimento ambulatorial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Paciente *</Label>
                <Select value={formData.petId} onValueChange={handlePetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.nome} - {pet.especie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutorId">Tutor *</Label>
                <Select value={formData.tutorId} onValueChange={(value) => setFormData({ ...formData, tutorId: value })}>
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

              <div className="space-y-2">
                <Label htmlFor="veterinarioId">Veterinário *</Label>
                <Select value={formData.veterinarioId} onValueChange={(value) => setFormData({ ...formData, veterinarioId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o veterinário" />
                  </SelectTrigger>
                  <SelectContent>
                    {veterinarios.map((vet) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        {vet.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Consulta *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambulatorial">Ambulatorial</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAtendimento">Data/Hora do Atendimento *</Label>
                <Input
                  id="dataAtendimento"
                  type="datetime-local"
                  value={formData.dataAtendimento}
                  onChange={(e) => setFormData({ ...formData, dataAtendimento: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anamnese */}
        <Card>
          <CardHeader>
            <CardTitle>Anamnese</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="queixaPrincipal">Queixa Principal *</Label>
              <Textarea
                id="queixaPrincipal"
                value={formData.queixaPrincipal}
                onChange={(e) => setFormData({ ...formData, queixaPrincipal: e.target.value })}
                placeholder="Descreva o motivo da consulta..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historico">Histórico</Label>
              <Textarea
                id="historico"
                value={formData.historico || ''}
                onChange={(e) => setFormData({ ...formData, historico: e.target.value })}
                placeholder="Histórico clínico do paciente..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'Salvando...' : 'Salvar e Continuar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
