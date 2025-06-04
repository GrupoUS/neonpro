import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  UserX, 
  UserCheck, 
  Shield, 
  Phone, 
  Mail,
  UserPlus,
  Filter,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole, getRoleLabel, getRoleColor } from '@/types/user';

interface UserListProps {
  users: UserProfile[];
  loading: boolean;
  currentUserProfile: UserProfile | null;
  onEdit: (user: UserProfile) => void;
  onDelete: (userId: string) => Promise<boolean>;
  onReactivate: (userId: string) => Promise<boolean>;
  onChangeRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  onRefresh: () => void;
  isCurrentUserAdmin: boolean;
}

export const UserList = ({
  users,
  loading,
  currentUserProfile,
  onEdit,
  onDelete,
  onReactivate,
  onChangeRole,
  onRefresh,
  isCurrentUserAdmin
}: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    // Filtro de pesquisa
    const matchesSearch = searchTerm === '' || 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telefone && user.telefone.includes(searchTerm));

    // Filtro de status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.ativo) ||
      (statusFilter === 'inactive' && !user.ativo);

    // Filtro de role
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAction = async (action: () => Promise<boolean>, userId: string) => {
    setActionLoading(userId);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: UserProfile) => {
    if (user.ativo) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ativo</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Inativo</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    return (
      <Badge variant="outline" className={getRoleColor(role)}>
        {getRoleLabel(role)}
      </Badge>
    );
  };

  const canEditUser = (user: UserProfile) => {
    // Admin pode editar qualquer um
    if (isCurrentUserAdmin) return true;
    
    // Usuário pode editar apenas seu próprio perfil
    return currentUserProfile?.id === user.id;
  };

  const canDeleteUser = (user: UserProfile) => {
    // Apenas admin pode desativar usuários
    if (!isCurrentUserAdmin) return false;
    
    // Admin não pode desativar a si mesmo
    return currentUserProfile?.id !== user.id;
  };

  const canChangeRole = (user: UserProfile) => {
    // Apenas admin pode alterar roles
    if (!isCurrentUserAdmin) return false;
    
    // Admin não pode alterar o próprio role
    return currentUserProfile?.id !== user.id;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando usuários...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Usuários do Sistema</span>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Gerencie usuários, roles e permissões
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={roleFilter} onValueChange={(value: 'all' | UserRole) => setRoleFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="secretaria">Secretária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Informações Adicionais</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {users.length === 0 ? 'Nenhum usuário encontrado' : 'Nenhum usuário corresponde aos filtros aplicados'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.nome}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        {currentUserProfile?.id === user.id && (
                          <Badge variant="outline" className="w-fit mt-1 text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {user.telefone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.telefone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>

                    <TableCell>
                      {user.role === 'medico' && (
                        <div className="flex flex-col space-y-1 text-sm">
                          {user.especialidade && (
                            <span>Especialidade: {user.especialidade}</span>
                          )}
                          {user.crm && (
                            <span>CRM: {user.crm}</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={actionLoading === user.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {canEditUser(user) && (
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}

                          {canChangeRole(user) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Alterar Função</DropdownMenuLabel>
                              {(['admin', 'medico', 'secretaria'] as UserRole[])
                                .filter(role => role !== user.role)
                                .map(role => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => handleAction(() => onChangeRole(user.id, role), user.id)}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    {getRoleLabel(role)}
                                  </DropdownMenuItem>
                                ))
                              }
                            </>
                          )}

                          {canDeleteUser(user) && (
                            <>
                              <DropdownMenuSeparator />
                              {user.ativo ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Desativar
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja desativar o usuário <strong>{user.nome}</strong>? 
                                        O usuário não conseguirá mais acessar o sistema.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleAction(() => onDelete(user.id), user.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Desativar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleAction(() => onReactivate(user.id), user.id)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-muted/50 rounded p-3">
            <div className="font-medium">Total</div>
            <div className="text-lg font-bold">{filteredUsers.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded p-3">
            <div className="font-medium text-green-700 dark:text-green-300">Ativos</div>
            <div className="text-lg font-bold text-green-800 dark:text-green-200">
              {filteredUsers.filter(u => u.ativo).length}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3">
            <div className="font-medium text-blue-700 dark:text-blue-300">Médicos</div>
            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {filteredUsers.filter(u => u.role === 'medico' && u.ativo).length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded p-3">
            <div className="font-medium text-red-700 dark:text-red-300">Admins</div>
            <div className="text-lg font-bold text-red-800 dark:text-red-200">
              {filteredUsers.filter(u => u.role === 'admin' && u.ativo).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
