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

  const [petSearch, setPetSearch] = useState('');
  const [showPetSuggestions, setShowPetSuggestions] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState('');

  const [tutorSearch, setTutorSearch] = useState('');
  const [showTutorSuggestions, setShowTutorSuggestions] = useState(false);
  const [selectedTutorName, setSelectedTutorName] = useState('');

  const [veterinarioSearch, setVeterinarioSearch] = useState('');
  const [showVeterinarioSuggestions, setShowVeterinarioSuggestions] = useState(false);
  const [selectedVeterinarioName, setSelectedVeterinarioName] = useState('');

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
    queryKey: ['pets', petSearch],
    queryFn: () => petsService.findAll(petSearch),
    enabled: showPetSuggestions || petSearch.length > 0,
  });

  const { data: tutores = [] } = useQuery({
    queryKey: ['tutores', tutorSearch],
    queryFn: () => tutoresService.findAll(tutorSearch),
    enabled: showTutorSuggestions || tutorSearch.length > 0,
  });

  const { data: veterinarios = [] } = useQuery({
    queryKey: ['users-veterinarios', veterinarioSearch],
    queryFn: () => usersService.findAll(veterinarioSearch),
    enabled: showVeterinarioSuggestions || veterinarioSearch.length > 0,
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

  const handleSelectPet = (pet: any) => {
    setFormData({
      ...formData,
      petId: pet.id,
      tutorId: pet.tutorId || '',
    });
    setSelectedPetName(`${pet.nome} (${pet.especie})`);
    setPetSearch('');
    setShowPetSuggestions(false);

    // Auto-select tutor
    if (pet.tutor) {
      setSelectedTutorName(pet.tutor.nomeCompleto);
    }
  };

  const handleSelectTutor = (tutor: any) => {
    setFormData({ ...formData, tutorId: tutor.id });
    setSelectedTutorName(tutor.nomeCompleto);
    setTutorSearch('');
    setShowTutorSuggestions(false);
  };

  const handleSelectVeterinario = (vet: any) => {
    setFormData({ ...formData, veterinarioId: vet.id });
    setSelectedVeterinarioName(vet.nome);
    setVeterinarioSearch('');
    setShowVeterinarioSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.petId || !formData.tutorId || !formData.queixaPrincipal) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate(formData);
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
              <div className="relative space-y-2">
                <Label htmlFor="petSearch">Paciente *</Label>
                <Input
                  id="petSearch"
                  placeholder={selectedPetName || "Digite para buscar o pet..."}
                  value={petSearch}
                  onChange={(e) => {
                    setPetSearch(e.target.value);
                    setShowPetSuggestions(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, petId: '' });
                      setSelectedPetName('');
                    }
                  }}
                  onFocus={() => setShowPetSuggestions(true)}
                  className={selectedPetName ? 'font-medium' : ''}
                />
                <input type="hidden" value={formData.petId} required />
                {showPetSuggestions && petSearch.length > 0 && pets.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {pets.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSelectPet(pet)}
                      >
                        <div className="font-medium">{pet.nome} ({pet.especie})</div>
                        {pet.tutor && (
                          <div className="text-sm text-gray-500">
                            Tutor: {pet.tutor.nomeCompleto}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {selectedPetName && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ {selectedPetName}
                  </div>
                )}
              </div>

              <div className="relative space-y-2">
                <Label htmlFor="tutorSearch">Tutor *</Label>
                <Input
                  id="tutorSearch"
                  placeholder={selectedTutorName || "Digite para buscar o tutor..."}
                  value={tutorSearch}
                  onChange={(e) => {
                    setTutorSearch(e.target.value);
                    setShowTutorSuggestions(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, tutorId: '' });
                      setSelectedTutorName('');
                    }
                  }}
                  onFocus={() => setShowTutorSuggestions(true)}
                  className={selectedTutorName ? 'font-medium' : ''}
                />
                <input type="hidden" value={formData.tutorId} required />
                {showTutorSuggestions && tutorSearch.length > 0 && tutores.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {tutores.map((tutor) => (
                      <button
                        key={tutor.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSelectTutor(tutor)}
                      >
                        <div className="font-medium">{tutor.nomeCompleto}</div>
                        <div className="text-sm text-gray-500">
                          CPF: {tutor.cpf} {tutor.telefonePrincipal && `• ${tutor.telefonePrincipal}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedTutorName && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ {selectedTutorName}
                  </div>
                )}
              </div>

              <div className="relative space-y-2">
                <Label htmlFor="veterinarioSearch">Veterinário *</Label>
                <Input
                  id="veterinarioSearch"
                  placeholder={selectedVeterinarioName || "Digite para buscar o veterinário..."}
                  value={veterinarioSearch}
                  onChange={(e) => {
                    setVeterinarioSearch(e.target.value);
                    setShowVeterinarioSuggestions(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, veterinarioId: '' });
                      setSelectedVeterinarioName('');
                    }
                  }}
                  onFocus={() => setShowVeterinarioSuggestions(true)}
                  className={selectedVeterinarioName ? 'font-medium' : ''}
                />
                <input type="hidden" value={formData.veterinarioId} required />
                {showVeterinarioSuggestions && veterinarioSearch.length > 0 && veterinarios.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {veterinarios.map((vet) => (
                      <button
                        key={vet.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSelectVeterinario(vet)}
                      >
                        <div className="font-medium">{vet.nome}</div>
                        <div className="text-sm text-gray-500">
                          Email: {vet.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedVeterinarioName && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ {selectedVeterinarioName}
                  </div>
                )}
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
