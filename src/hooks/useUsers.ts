
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Interface baseada na estrutura real da tabela profiles
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateUserProfileData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  senha: string; // Para criar novo usuário
}

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
}

// Função para converter da estrutura do banco para a interface do componente
const convertToUserProfile = (profile: ProfileRow): UserProfile => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  avatar_url: profile.avatar_url,
  role: profile.role,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  // Carregar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      const convertedData = (data || []).map(convertToUserProfile);
      setUsers(convertedData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar perfil do usuário atual
  const fetchCurrentUserProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        return;
      }

      const convertedData = convertToUserProfile(data);
      setCurrentUserProfile(convertedData);
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
            name: userData.name,
            role: userData.role || 'user'
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
      if (userData.phone || userData.role) {
        const updateData: ProfileUpdate = {
          phone: userData.phone,
          role: userData.role || 'user'
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', authData.user.id);

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
      const updateData: ProfileUpdate = {
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        avatar_url: userData.avatar_url,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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

  // Deletar usuário (soft delete através do role)
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Marcar como inativo alterando o role
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'inactive' })
        .eq('id', id);

      if (error) {
        console.error('Erro ao desativar usuário:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: 'inactive' } : u
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
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', id);

      if (error) {
        console.error('Erro ao reativar usuário:', error);
        return false;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: 'user' } : u
      ));

      return true;
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      return false;
    }
  };

  // Alterar role do usuário
  const changeUserRole = async (id: string, newRole: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
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
  const getActiveUsers = () => users.filter(user => user.role !== 'inactive');
  const getUsersByRole = (role: string) => users.filter(user => user.role === role);
  const getTotalUsersByRole = () => {
    const active = getActiveUsers();
    return {
      admin: active.filter(u => u.role === 'admin').length,
      user: active.filter(u => u.role === 'user').length,
      moderator: active.filter(u => u.role === 'moderator').length,
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
  }, [user]);

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
