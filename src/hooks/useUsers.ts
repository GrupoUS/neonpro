
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { UserProfile, CreateUserProfileData, UpdateUserProfileData } from '../types/profile';
import { userService } from '../services/userService';
import { userHelpers } from '../utils/userHelpers';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  // Carregar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.fetchUsers();
      setUsers(data);
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
      const data = await userService.fetchUserProfile(user.id);
      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  // Criar novo usuário
  const createUser = async (userData: CreateUserProfileData): Promise<boolean> => {
    try {
      await userService.createUser(userData);
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
      await userService.updateUser(id, userData);
      
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
      await userService.deleteUser(id);
      
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
      await userService.reactivateUser(id);
      
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
      await userService.changeUserRole(id, newRole);
      
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
    // Expor as funções helper
    getActiveUsers: () => userHelpers.getActiveUsers(users),
    getUsersByRole: (role: string) => userHelpers.getUsersByRole(users, role),
    getTotalUsersByRole: () => userHelpers.getTotalUsersByRole(users),
    isCurrentUserAdmin: () => userHelpers.isCurrentUserAdmin(currentUserProfile),
    canManageUsers: () => userHelpers.canManageUsers(currentUserProfile)
  };
};

// Re-export types for convenience
export type { UserProfile, CreateUserProfileData, UpdateUserProfileData };
