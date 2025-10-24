'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tutoresService, type Tutor, type CreateTutorDto, type EnderecoCompleto } from '@/services/tutores.service';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Plus, Edit, Trash2, Phone, Mail, PawPrint } from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF, maskRG, maskPhone, maskCellPhone, maskCEP, unmask } from '@/lib/masks';

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function TutoresPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [formData, setFormData] = useState<CreateTutorDto>({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    email: '',
    telefonePrincipal: '',
    telefoneSecundario: '',
    enderecoCompleto: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    dataNascimento: '',
    profissao: '',
    observacoes: '',
  });

  // Query para listar tutores
  const { data: tutores = [], isLoading } = useQuery({
    queryKey: ['tutores', search],
    queryFn: () => tutoresService.findAll(search),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreateTutorDto) => {
      // Remove máscaras antes de enviar
      const cleanData = {
        ...data,
        cpf: unmask(data.cpf),
        rg: data.rg ? unmask(data.rg) : undefined,
        telefonePrincipal: unmask(data.telefonePrincipal),
        telefoneSecundario: data.telefoneSecundario ? unmask(data.telefoneSecundario) : undefined,
        enderecoCompleto: data.enderecoCompleto ? {
          ...data.enderecoCompleto,
          cep: unmask(data.enderecoCompleto.cep),
        } : undefined,
      };

      return editingTutor
        ? tutoresService.update(editingTutor.id, cleanData)
        : tutoresService.create(cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      toast.success(editingTutor ? 'Tutor atualizado!' : 'Tutor criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar tutor');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tutoresService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      toast.success('Tutor removido!');
      setIsDeleteDialogOpen(false);
      setDeletingTutor(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover tutor');
    },
  });

  const handleOpenDialog = (tutor?: Tutor) => {
    if (tutor) {
      setEditingTutor(tutor);
      setFormData({
        nomeCompleto: tutor.nomeCompleto,
        cpf: maskCPF(tutor.cpf) || '',
        rg: tutor.rg ? maskRG(tutor.rg) : '',
        email: tutor.email || '',
        telefonePrincipal: tutor.telefonePrincipal ? maskPhone(tutor.telefonePrincipal) : '',
        telefoneSecundario: tutor.telefoneSecundario ? maskCellPhone(tutor.telefoneSecundario) : '',
        enderecoCompleto: tutor.enderecoCompleto || {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
        dataNascimento: tutor.dataNascimento || '',
        profissao: tutor.profissao || '',
        observacoes: tutor.observacoes || '',
      });
    } else {
      setEditingTutor(null);
      setFormData({
        nomeCompleto: '',
        cpf: '',
        rg: '',
        email: '',
        telefonePrincipal: '',
        telefoneSecundario: '',
        enderecoCompleto: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
        dataNascimento: '',
        profissao: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTutor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (tutor: Tutor) => {
    setDeletingTutor(tutor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTutor) {
      deleteMutation.mutate(deletingTutor.id);
    }
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = unmask(cep);
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData({
          ...formData,
          enderecoCompleto: {
            ...formData.enderecoCompleto!,
            cep: maskCEP(cepLimpo),
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          },
        });
        toast.success('CEP encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tutores</h1>
        <p className="text-muted-foreground">Gerencie os tutores dos pacientes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Tutores</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tutor
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : tutores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum tutor encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pets</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutores.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.nomeCompleto}</TableCell>
                    <TableCell>{maskCPF(tutor.cpf) || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {tutor.telefonePrincipal && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {maskPhone(tutor.telefonePrincipal)}
                          </div>
                        )}
                        {tutor.telefoneSecundario && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {maskCellPhone(tutor.telefoneSecundario)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tutor.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {tutor.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {tutor.pets && tutor.pets.length > 0 ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex">
                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                                  <PawPrint className="h-3 w-3 mr-1" />
                                  {tutor.pets.length}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold text-xs mb-2">Pets cadastrados:</p>
                                {tutor.pets.slice(0, 5).map((pet, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <PawPrint className="h-3 w-3 text-primary" />
                                    <span className="font-medium">{pet.nome}</span>
                                    <span className="text-muted-foreground">({pet.especie})</span>
                                  </div>
                                ))}
                                {tutor.pets.length > 5 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{tutor.pets.length - 5} pet(s) não exibido(s)
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(tutor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tutor)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTutor ? 'Editar Tutor' : 'Novo Tutor'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do tutor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                      <Input
                        id="nomeCompleto"
                        value={formData.nomeCompleto}
                        onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={formData.rg}
                        onChange={(e) => setFormData({ ...formData, rg: maskRG(e.target.value) })}
                        placeholder="00.000.000-0"
                        maxLength={12}
                      />
                    </div>
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
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={formData.profissao}
                        onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="telefonePrincipal">Telefone Principal *</Label>
                      <Input
                        id="telefonePrincipal"
                        value={formData.telefonePrincipal}
                        onChange={(e) => setFormData({ ...formData, telefonePrincipal: maskPhone(e.target.value) })}
                        placeholder="(00) 0000-0000"
                        maxLength={14}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefoneSecundario">Celular</Label>
                      <Input
                        id="telefoneSecundario"
                        value={formData.telefoneSecundario}
                        onChange={(e) => setFormData({ ...formData, telefoneSecundario: maskCellPhone(e.target.value) })}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.enderecoCompleto?.cep}
                        onChange={(e) => {
                          const cep = maskCEP(e.target.value);
                          setFormData({
                            ...formData,
                            enderecoCompleto: {
                              ...formData.enderecoCompleto!,
                              cep,
                            },
                          });
                        }}
                        onBlur={(e) => buscarCEP(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        value={formData.enderecoCompleto?.logradouro}
                        onChange={(e) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            logradouro: e.target.value,
                          },
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.enderecoCompleto?.numero}
                        onChange={(e) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            numero: e.target.value,
                          },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={formData.enderecoCompleto?.complemento}
                        onChange={(e) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            complemento: e.target.value,
                          },
                        })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.enderecoCompleto?.bairro}
                        onChange={(e) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            bairro: e.target.value,
                          },
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.enderecoCompleto?.cidade}
                        onChange={(e) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            cidade: e.target.value,
                          },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.enderecoCompleto?.estado}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          enderecoCompleto: {
                            ...formData.enderecoCompleto!,
                            estado: value,
                          },
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
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
              Tem certeza que deseja excluir o tutor <strong>{deletingTutor?.nomeCompleto}</strong>?
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
