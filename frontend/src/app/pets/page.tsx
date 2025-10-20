'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsService, type Pet, type CreatePetDto } from '@/services/pets.service';
import { tutoresService } from '@/services/tutores.service';
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
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PetsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<CreatePetDto>({
    nome: '',
    especie: '',
    raca: '',
    sexo: '',
    cor: '',
    dataNascimento: '',
    microchip: '',
    castrado: false,
    pesoKg: undefined,
    observacoes: '',
    tutorId: '',
  });

  // Query para listar pets
  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['pets', search],
    queryFn: () => petsService.findAll(search),
  });

  // Query para listar tutores (para o select)
  const { data: tutores = [] } = useQuery({
    queryKey: ['tutores'],
    queryFn: () => tutoresService.findAll(),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreatePetDto) =>
      editingPet
        ? petsService.update(editingPet.id, data)
        : petsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success(editingPet ? 'Pet atualizado!' : 'Pet criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar pet');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => petsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Pet removido!');
      setIsDeleteDialogOpen(false);
      setDeletingPet(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover pet');
    },
  });

  const handleOpenDialog = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca || '',
        sexo: pet.sexo || '',
        cor: pet.cor || '',
        dataNascimento: pet.dataNascimento || '',
        microchip: pet.microchip || '',
        castrado: pet.castrado,
        pesoKg: pet.pesoKg,
        observacoes: pet.observacoes || '',
        tutorId: pet.tutorId,
      });
    } else {
      setEditingPet(null);
      setFormData({
        nome: '',
        especie: '',
        raca: '',
        sexo: '',
        cor: '',
        dataNascimento: '',
        microchip: '',
        castrado: false,
        pesoKg: undefined,
        observacoes: '',
        tutorId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPet(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (pet: Pet) => {
    setDeletingPet(pet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPet) {
      deleteMutation.mutate(deletingPet.id);
    }
  };

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return '-';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diff = hoje.getTime() - nascimento.getTime();
    const anos = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const meses = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

    if (anos > 0) {
      return `${anos} ano(s)${meses > 0 ? ` e ${meses} mês(es)` : ''}`;
    }
    return `${meses} mês(es)`;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pets</h1>
        <p className="text-muted-foreground">Gerencie os pacientes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pets</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pet
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou microchip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : pets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pet encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie/Raça</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Microchip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell className="font-medium">{pet.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{pet.especie}</span>
                        {pet.raca && (
                          <span className="text-sm text-muted-foreground">{pet.raca}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pet.sexo || '-'}</TableCell>
                    <TableCell className="text-sm">{calcularIdade(pet.dataNascimento)}</TableCell>
                    <TableCell>
                      {pet.tutor && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{pet.tutor.nome}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {pet.microchip ? (
                        <code className="text-xs bg-muted px-1 rounded">{pet.microchip}</code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={pet.ativo ? 'success' : 'destructive'}>
                          {pet.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {pet.castrado && <Badge variant="secondary">Castrado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(pet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(pet)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPet ? 'Editar Pet' : 'Novo Pet'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do pet
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tutorId">Tutor *</Label>
                  <Select
                    value={formData.tutorId}
                    onValueChange={(value) => setFormData({ ...formData, tutorId: value })}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select
                    value={formData.especie}
                    onValueChange={(value) => setFormData({ ...formData, especie: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cachorro">Cachorro</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Ave">Ave</SelectItem>
                      <SelectItem value="Roedor">Roedor</SelectItem>
                      <SelectItem value="Réptil">Réptil</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    value={formData.raca}
                    onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pesoKg">Peso (kg)</Label>
                  <Input
                    id="pesoKg"
                    type="number"
                    step="0.01"
                    value={formData.pesoKg || ''}
                    onChange={(e) => setFormData({ ...formData, pesoKg: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="microchip">Microchip</Label>
                  <Input
                    id="microchip"
                    value={formData.microchip}
                    onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="castrado"
                  checked={formData.castrado}
                  onChange={(e) => setFormData({ ...formData, castrado: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="castrado" className="cursor-pointer">
                  Pet castrado
                </Label>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o pet <strong>{deletingPet?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
