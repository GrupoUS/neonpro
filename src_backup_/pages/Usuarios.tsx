import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, UserCog } from 'lucide-react';
import { UserForm } from '@/components/users/UserForm';
import { UserList } from '@/components/users/UserList';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/auth/useAuth';
import { UserProfile, CreateUserProfileData, UpdateUserProfileData, UserRole } from '@/types/user';
import { toast } from 'sonner';

export const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    currentUserProfile,
    createUser,
    updateUser,
    deleteUser,
    reactivateUser,
    changeUserRole,
    fetchUsers
  } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const isCurrentUserAdmin = currentUserProfile?.role === 'admin';

  const handleCreateUser = async (data: CreateUserProfileData): Promise<boolean> => {
    setFormLoading(true);
    try {
      const success = await createUser(data);
      if (success) {
        toast.success('Usuário criado com sucesso!');
        setIsFormOpen(false);
        return true;
      } else {
        toast.error('Erro ao criar usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro inesperado ao criar usuário');
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserProfileData): Promise<boolean> => {
    if (!editingUser) return false;
    
    setFormLoading(true);
    try {
      const success = await updateUser(editingUser.id, data);
      if (success) {
        toast.success('Usuário atualizado com sucesso!');
        setIsFormOpen(false);
        setEditingUser(null);
        return true;
      } else {
        toast.error('Erro ao atualizar usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro inesperado ao atualizar usuário');
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (data: CreateUserProfileData | UpdateUserProfileData): Promise<boolean> => {
    if (editingUser) {
      return handleUpdateUser(data as UpdateUserProfileData);
    } else {
      return handleCreateUser(data as CreateUserProfileData);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string): Promise<boolean> => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        toast.success('Usuário desativado com sucesso!');
        return true;
      } else {
        toast.error('Erro ao desativar usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast.error('Erro inesperado ao desativar usuário');
      return false;
    }
  };

  const handleReactivate = async (userId: string): Promise<boolean> => {
    try {
      const success = await reactivateUser(userId);
      if (success) {
        toast.success('Usuário reativado com sucesso!');
        return true;
      } else {
        toast.error('Erro ao reativar usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      toast.error('Erro inesperado ao reativar usuário');
      return false;
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      const success = await changeUserRole(userId, newRole);
      if (success) {
        toast.success('Função do usuário alterada com sucesso!');
        return true;
      } else {
        toast.error('Erro ao alterar função do usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao alterar função do usuário:', error);
      toast.error('Erro inesperado ao alterar função do usuário');
      return false;
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  // Verificar se usuário tem permissão para acessar a página
  if (!currentUserProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Carregando perfil...</h3>
          <p className="text-muted-foreground">Aguarde enquanto verificamos suas permissões</p>
        </div>
      </div>
    );
  }

  // Apenas admins podem criar novos usuários
  const canCreateUsers = isCurrentUserAdmin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acesso ao sistema
          </p>
        </div>

        {canCreateUsers && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                loading={formLoading}
                isCurrentUserAdmin={isCurrentUserAdmin}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de Usuários */}
      <UserList
        users={users}
        loading={loading}
        currentUserProfile={currentUserProfile}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
        onChangeRole={handleChangeRole}
        onRefresh={fetchUsers}
        isCurrentUserAdmin={isCurrentUserAdmin}
      />

      {/* Informações adicionais para usuários não-admin */}
      {!isCurrentUserAdmin && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Acesso Limitado
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Você pode visualizar usuários e editar seu próprio perfil. 
                Para gerenciar outros usuários, entre em contato com um administrador.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
