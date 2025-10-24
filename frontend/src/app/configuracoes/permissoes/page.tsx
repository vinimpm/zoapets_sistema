'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  rolesService,
  type CreateRoleDto,
  type UpdateRoleDto,
  type Permission,
  type RoleWithPermissions,
} from '@/services/roles.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PermissoesPage() {
  const queryClient = useQueryClient();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithPermissions | null>(null);
  const [formData, setFormData] = useState<CreateRoleDto>({
    nome: '',
    descricao: '',
    permissionIds: [],
  });

  // Queries
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.findAll(),
  });

  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesService.findAllPermissions(),
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: CreateRoleDto | UpdateRoleDto) =>
      editingRole ? rolesService.update(editingRole.id, data) : rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(editingRole ? 'Role atualizada!' : 'Role criada!');
      handleCloseRoleDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deletada!');
      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar role');
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      rolesService.assignPermissions(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permissões atualizadas!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissões');
    },
  });

  const handleOpenRoleDialog = (role?: RoleWithPermissions) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nome: role.nome,
        descricao: role.descricao || '',
        permissionIds: role.permissions.map((p) => p.id),
      });
    } else {
      setEditingRole(null);
      setFormData({
        nome: '',
        descricao: '',
        permissionIds: [],
      });
    }
    setIsRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleTogglePermission = (roleId: string, permissionId: string, hasPermission: boolean) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const currentPermissionIds = role.permissions.map((p) => p.id);
    const newPermissionIds = hasPermission
      ? currentPermissionIds.filter((id) => id !== permissionId)
      : [...currentPermissionIds, permissionId];

    assignPermissionsMutation.mutate({ roleId, permissionIds: newPermissionIds });
  };

  // Agrupar permissões por recurso
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.recurso]) {
      acc[permission.recurso] = [];
    }
    acc[permission.recurso].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const isLoading = isLoadingRoles || isLoadingPermissions;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Permissões (RBAC)</h1>
        <p className="text-muted-foreground">Gerencie roles e suas permissões</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
        </TabsList>

        {/* Tab de Roles */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Roles</CardTitle>
                <Button onClick={() => handleOpenRoleDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : roles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma role encontrada</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Permissões</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.nome}</TableCell>
                        <TableCell>{role.descricao || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {role.permissions.length > 0 ? (
                              role.permissions.slice(0, 3).map((permission) => (
                                <Badge key={permission.id} variant="outline" className="text-xs">
                                  {permission.recurso}:{permission.acao}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Nenhuma permissão
                              </span>
                            )}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeletingRole(role);
                                setIsDeleteDialogOpen(true);
                              }}
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
        </TabsContent>

        {/* Tab de Matriz de Permissões */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões</CardTitle>
              <CardDescription>
                Clique nas células para atribuir/remover permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionsByResource).map(([recurso, perms]) => (
                    <div key={recurso} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 capitalize">{recurso}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium w-48">Ação</th>
                              {roles.map((role) => (
                                <th key={role.id} className="text-center p-2 font-medium w-32">
                                  {role.nome}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {perms.map((permission) => (
                              <tr key={permission.id} className="border-b">
                                <td className="p-2 w-48">{permission.acao}</td>
                                {roles.map((role) => {
                                  const hasPermission = role.permissions.some(
                                    (p) => p.id === permission.id
                                  );
                                  return (
                                    <td key={role.id} className="text-center p-2 w-32">
                                      <button
                                        className={`p-2 rounded-full transition-colors ${
                                          hasPermission
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                        onClick={() =>
                                          handleTogglePermission(
                                            role.id,
                                            permission.id,
                                            hasPermission
                                          )
                                        }
                                        title={
                                          hasPermission ? 'Remover permissão' : 'Atribuir permissão'
                                        }
                                      >
                                        <CheckCircle className="h-5 w-5" />
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Criar/Editar Role */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Editar Role' : 'Nova Role'}</DialogTitle>
            <DialogDescription>Preencha os dados da role</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseRoleDialog}>
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
              Tem certeza que deseja deletar a role <strong>{deletingRole?.nome}</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingRole(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
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
