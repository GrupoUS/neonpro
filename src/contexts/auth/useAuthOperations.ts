
import { useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from './types';
import { toast } from 'sonner';

export const useAuthOperations = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, []);

  const createProfile = useCallback(async (userId: string, userData: { full_name?: string; name?: string; email: string }) => {
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
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, full_name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name,
            name: full_name
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.session) {
        toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.");
      } else if (data.session) {
        toast.success("Cadastro realizado com sucesso!");
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro no cadastro:', errorMessage);
      
      let userMessage = 'Erro ao criar conta. Tente novamente.';
      if (errorMessage.includes('email')) {
        userMessage = 'Este e-mail já está em uso.';
      } else if (errorMessage.includes('Password')) {
        userMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (errorMessage.includes('User already registered')) {
        userMessage = 'Este e-mail já está cadastrado.';
      }
      
      toast.error(userMessage);
      throw error;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro no login:', errorMessage);
      
      let userMessage = 'Erro ao fazer login. Tente novamente.';
      if (errorMessage.includes('Invalid login credentials')) {
        userMessage = 'E-mail ou senha inválidos.';
      } else if (errorMessage.includes('Email not confirmed')) {
        userMessage = 'Confirme seu e-mail antes de fazer login.';
      }
      
      toast.error(userMessage);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao fazer login com Google:', errorMessage);
      toast.error("Erro ao fazer login com Google. Tente novamente.");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao fazer logout:', errorMessage);
      toast.error("Erro ao fazer logout. Tente novamente.");
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      
      if (error) throw error;
      
      toast.success("E-mail para redefinição de senha enviado!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao solicitar redefinição de senha:', errorMessage);
      toast.error("Erro ao solicitar redefinição de senha. Tente novamente.");
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
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
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao atualizar perfil:', errorMessage);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
      throw error;
    }
  }, [user, profile]);

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
