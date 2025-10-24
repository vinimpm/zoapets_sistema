'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type CreateUserDto, type UpdateUserDto } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
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
import { Plus, Edit, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types';

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateUserDto>({
    nomeCompleto: '',
    email: '',
    senha: '',
    cpf: '',
    crmv: '',
    telefone: '',
    cargo: '',
    ativo: true,
    roleIds: [],
  });

  // Query para listar usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.findAll(),
  });

  // Query para listar roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.findAll(),
  });

  // Mutation para criar/editar
  const saveMutation = useMutation({
    mutationFn: (data: CreateUserDto | UpdateUserDto) => {
      const payload = {
        ...data,
        roleIds: selectedRoles,
      };
      return editingUser
        ? usersService.update(editingUser.id, payload as UpdateUserDto)
        : usersService.create(payload as CreateUserDto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário deletado!');
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar usuário');
    },
  });

  // Mutation para ativar/desativar
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersService.deactivate(id) : usersService.activate(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(variables.active ? 'Usuário desativado!' : 'Usuário ativado!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar status do usuário');
    },
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        senha: '',
        cpf: user.cpf || '',
        crmv: user.crmv || '',
        telefone: user.telefone || '',
        cargo: user.cargo || '',
        ativo: user.ativo,
        roleIds: user.roles.map((r) => r.id),
      });
      setSelectedRoles(user.roles.map((r) => r.id));
    } else {
      setEditingUser(null);
      setFormData({
        nomeCompleto: '',
        email: '',
        senha: '',
        cpf: '',
        crmv: '',
        telefone: '',
        cargo: '',
        ativo: true,
        roleIds: [],
      });
      setSelectedRoles([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setSelectedRoles([]);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remove senha do payload se estiver vazia (no caso de edição)
    const payload = { ...formData };
    if (editingUser && !payload.senha) {
      delete payload.senha;
    }

    saveMutation.mutate(payload);
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'ativo') return user.ativo;
    if (statusFilter === 'inativo') return !user.ativo;
    return true;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">Gerencie usuários e suas permissões</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>CRMV</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nomeCompleto}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf || '-'}</TableCell>
                    <TableCell>{user.crmv || '-'}</TableCell>
                    <TableCell>{user.cargo || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {role.nome}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.ativo ? 'success' : 'secondary'}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.ativo ? 'outline' : 'default'}
                          size="sm"
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: user.id, active: user.ativo })
                          }
                          title={user.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {user.ativo ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(user)}
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
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
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">
                    Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Deixe em branco para não alterar' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crmv">CRMV</Label>
                  <Input
                    id="crmv"
                    value={formData.crmv}
                    onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
                    placeholder="Ex: CRMV-SP 12345"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Veterinário, Recepcionista, etc."
                />
              </div>

              <div>
                <Label>Permissões (Roles)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedRoles.includes(role.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                      onClick={() => handleToggleRole(role.id)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleToggleRole(role.id)}
                          className="cursor-pointer"
                        />
                        <div>
                          <div className="font-medium text-sm">{role.nome}</div>
                          {role.descricao && (
                            <div className="text-xs text-muted-foreground">{role.descricao}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="ativo">Status</Label>
                <Select
                  value={formData.ativo ? 'true' : 'false'}
                  onValueChange={(value) => setFormData({ ...formData, ativo: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
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
              Tem certeza que deseja deletar o usuário <strong>{deletingUser?.nomeCompleto}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
