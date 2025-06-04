
import { supabase } from '../lib/supabase';
import { ProfileUpdate } from '../types/profile';
import { CreateUserProfileData, UpdateUserProfileData } from '../types/profile';
import { convertToUserProfile } from '../utils/profileConverter';

export const userService = {
  // Carregar todos os usuários
  async fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar usuários:', error);
      throw error;
    }

    return (data || []).map(convertToUserProfile);
  },

  // Carregar perfil do usuário atual
  async fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      throw error;
    }

    return convertToUserProfile(data);
  },

  // Criar novo usuário
  async createUser(userData: CreateUserProfileData) {
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
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Usuário não criado');
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
        throw updateError;
      }
    }

    return true;
  },

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserProfileData) {
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
      throw error;
    }

    return true;
  },

  // Deletar usuário (soft delete através do role)
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'inactive' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }

    return true;
  },

  // Reativar usuário
  async reactivateUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao reativar usuário:', error);
      throw error;
    }

    return true;
  },

  // Alterar role do usuário
  async changeUserRole(id: string, newRole: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      console.error('Erro ao alterar role:', error);
      throw error;
    }

    return true;
  }
};
