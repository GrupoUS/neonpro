import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, CreateUserProfileData, UpdateUserProfileData, UserRole } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Carregar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar perfil do usuário atual
  const fetchCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        return;
      }

      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  // Criar novo usuário
  const createUser = async (userData: CreateUserProfileData): Promise<boolean> => {
    try {
      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
        options: {
          data: {
            nome: userData.nome,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        return false;
      }

      if (!authData.user) {
        console.error('Usuário não criado');
        return false;
      }

      // 2. O trigger no banco automaticamente criará o perfil
      // Mas vamos aguardar um pouco para garantir que foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Atualizar dados adicionais se necessário
      if (userData.telefone || userData.especialidade || userData.crm) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            telefone: userData.telefone,
            especialidade: userData.especialidade,
            crm: userData.crm
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
        }
      }

      // Recarregar lista
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  };

  // Atualizar usuário
  const updateUser = async (id: string, userData: UpdateUserProfileData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(userData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  };

  // Deletar usuário
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Primeiro obter o user_id para deletar do auth
      const user = users.find(u => u.id === id);
      if (!user) return false;

      // Desativar usuário em vez de deletar (soft delete)
      const { error } = await supabase
        .from('user_profiles')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao desativar usuário:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, ativo: false } : u
      ));

      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  };

  // Reativar usuário
  const reactivateUser = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ativo: true })
        .eq('id', id);

      if (error) {
        console.error('Erro ao reativar usuário:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, ativo: true } : u
      ));

      return true;
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      return false;
    }
  };

  // Alterar role do usuário (apenas admins)
  const changeUserRole = async (id: string, newRole: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) {
        console.error('Erro ao alterar role:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: newRole } : u
      ));

      return true;
    } catch (error) {
      console.error('Erro ao alterar role:', error);
      return false;
    }
  };

  // Filtros e estatísticas
  const getActiveUsers = () => users.filter(user => user.ativo);
  const getUsersByRole = (role: UserRole) => users.filter(user => user.role === role && user.ativo);
  const getTotalUsersByRole = () => {
    const active = getActiveUsers();
    return {
      admin: active.filter(u => u.role === 'admin').length,
      medico: active.filter(u => u.role === 'medico').length,
      secretaria: active.filter(u => u.role === 'secretaria').length,
      total: active.length
    };
  };

  // Verificar se usuário atual é admin
  const isCurrentUserAdmin = () => currentUserProfile?.role === 'admin';

  // Verificar se usuário atual pode gerenciar outros usuários
  const canManageUsers = () => isCurrentUserAdmin();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserProfile();
  }, []);

  return {
    users,
    loading,
    currentUserProfile,
    fetchUsers,
    fetchCurrentUserProfile,
    createUser,
    updateUser,
    deleteUser,
    reactivateUser,
    changeUserRole,
    getActiveUsers,
    getUsersByRole,
    getTotalUsersByRole,
    isCurrentUserAdmin,
    canManageUsers
  };
};
