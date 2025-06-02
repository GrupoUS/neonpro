
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { toast } from 'sonner';

export const useAuthOperations = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, avatar_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (userId: string, userData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userData.full_name || userData.name || 'Usuário',
          email: userData.email
        });

      if (error) {
        console.error('Erro ao criar perfil:', error);
        // Don't throw error here as the profile creation is handled by trigger
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      // Don't throw error here as the profile creation is handled by trigger
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name,
            name: full_name
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.session) {
        toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.');
      } else if (data.session) {
        toast.success('Cadastro realizado com sucesso!');
      }
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error.message);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      if (error.message.includes('email')) {
        errorMessage = 'Este e-mail já está em uso.';
      } else if (error.message.includes('Password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este e-mail já está cadastrado.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha inválidos.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Confirme seu e-mail antes de fazer login.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao fazer login com Google:', error.message);
      toast.error('Erro ao fazer login com Google. Tente novamente.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      toast.error('Erro ao fazer logout. Tente novamente.');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      
      if (error) throw error;
      
      toast.success('E-mail para redefinição de senha enviado!');
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error.message);
      toast.error('Erro ao solicitar redefinição de senha. Tente novamente.');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error.message);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
      throw error;
    }
  };

  return {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    fetchProfile,
    createProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile
  };
};
