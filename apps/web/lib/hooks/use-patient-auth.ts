'use client';

import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/app/utils/supabase/client';

type Patient = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  cpf_hash: string;
  birth_date: string;
  gender: 'M' | 'F' | 'NB';
  avatar_url?: string;
  consent_status: 'granted' | 'pending' | 'revoked';
  consent_date?: string;
  emergency_contact: string;
  emergency_contact_name: string;
  created_at: string;
  updated_at: string;
};

type PatientAuthContextType = {
  user: User | null;
  patient: Patient | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePatient: (updates: Partial<Patient>) => Promise<void>;
  refreshPatient: () => Promise<void>;
};

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(
  undefined
);

export function PatientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }

        setUser(user);
        if (user) {
          await fetchPatientData(user.id);
        }
      } catch (_error) {
        toast.error('Erro ao carregar dados do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchPatientData(session.user.id);
      } else {
        setPatient(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchPatientData]);

  const fetchPatientData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPatient(data);
    } catch (_error) {}
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setPatient(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (updates: Partial<Patient>) => {
    if (!(user && patient)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatient(data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      throw error;
    }
  };

  const refreshPatient = async () => {
    if (user) {
      await fetchPatientData(user.id);
    }
  };

  const contextValue = {
    user,
    patient,
    isLoading,
    signIn,
    signOut,
    updatePatient,
    refreshPatient,
  };

  return React.createElement(
    PatientAuthContext.Provider,
    { value: contextValue },
    children
  );
}

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};
