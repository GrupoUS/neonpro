// hooks/use-profile-sync.ts
// VIBECODE V1.0 - Professional OAuth Profile Synchronization Hook
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-22

'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from '@/contexts/auth-context';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  professional_title?: string;
  medical_license?: string;
  department?: string;
  phone?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'staff' | 'professional';
  google_provider_id?: string;
  google_picture?: string;
  google_verified_email: boolean;
  profile_sync_status: 'pending' | 'synced' | 'conflict' | 'error';
  google_sync_enabled: boolean;
  last_google_sync?: string;
  created_at: string;
  updated_at: string;
  data_consent_given: boolean;
  data_consent_date?: string;
}

export interface ProfileSyncStatus {
  user_id: string;
  sync_status: string;
  google_sync_enabled: boolean;
  last_sync?: string;
  google_verified: boolean;
  has_conflicts: boolean;
}

export interface UseProfileSyncReturn {
  profile: Profile | null;
  syncStatus: ProfileSyncStatus | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Methods
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  syncWithGoogle: () => Promise<boolean>;
  resolveConflict: (resolutionData: Record<string, any>) => Promise<boolean>;
  toggleGoogleSync: (enabled: boolean) => Promise<boolean>;
}

export function useProfileSync(): UseProfileSyncReturn {
  const { user, session, getValidSession } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [syncStatus, setSyncStatus] = useState<ProfileSyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setError(`Erro ao carregar perfil: ${error.message}`);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data.email);
      setError(null);
      return data as Profile;
    } catch (err) {
      console.error('❌ Unexpected error fetching profile:', err);
      setError('Erro inesperado ao carregar perfil');
      return null;
    }
  }, [user?.id, supabase]);

  // Fetch profile sync status
  const fetchSyncStatus =
    useCallback(async (): Promise<ProfileSyncStatus | null> => {
      if (!user?.id) return null;

      try {
        const { data, error } = await supabase.rpc('get_profile_sync_status', {
          user_id: user.id,
        });

        if (error) {
          console.error('❌ Error fetching sync status:', error);
          return null;
        }

        return data as ProfileSyncStatus;
      } catch (err) {
        console.error('❌ Unexpected error fetching sync status:', err);
        return null;
      }
    }, [user?.id, supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, statusData] = await Promise.all([
        fetchProfile(),
        fetchSyncStatus(),
      ]);

      setProfile(profileData);
      setSyncStatus(statusData);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, fetchSyncStatus]);

  // Update profile data
  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<boolean> => {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }

      setIsUpdating(true);
      setError(null);

      try {
        // Get valid session for critical operation
        const { session: validSession, error: sessionError } =
          await getValidSession();

        if (sessionError || !validSession) {
          setError('Sessão inválida. Faça login novamente.');
          return false;
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error('❌ Error updating profile:', error);
          setError(`Erro ao atualizar perfil: ${error.message}`);
          return false;
        }

        // Refresh profile after update
        await refreshProfile();

        toast.success('Perfil atualizado com sucesso!');
        console.log('✅ Profile updated successfully');
        return true;
      } catch (err) {
        console.error('❌ Unexpected error updating profile:', err);
        setError('Erro inesperado ao atualizar perfil');
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [user?.id, getValidSession, supabase, refreshProfile]
  );

  // Sync profile with Google data
  const syncWithGoogle = useCallback(async (): Promise<boolean> => {
    if (!(user?.id && session)) {
      setError('Usuário não autenticado');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.log('🔄 Syncing profile with Google data...');

      // Call the sync function with current user metadata
      const { error } = await supabase.rpc('sync_google_profile_data', {
        user_id: user.id,
        raw_user_metadata: user.user_metadata || {},
      });

      if (error) {
        console.error('❌ Error syncing with Google:', error);
        setError(`Erro na sincronização: ${error.message}`);
        return false;
      }

      // Refresh profile after sync
      await refreshProfile();

      toast.success('Perfil sincronizado com Google!');
      console.log('✅ Profile synced with Google successfully');
      return true;
    } catch (err) {
      console.error('❌ Unexpected error syncing with Google:', err);
      setError('Erro inesperado na sincronização');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user, session, supabase, refreshProfile]);

  // Resolve profile conflicts
  const resolveConflict = useCallback(
    async (resolutionData: Record<string, any>): Promise<boolean> => {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }

      setIsUpdating(true);
      setError(null);

      try {
        console.log('🔧 Resolving profile conflict...');

        const { error } = await supabase.rpc('resolve_profile_conflict', {
          user_id: user.id,
          resolution_data: resolutionData,
          keep_google_data: true,
        });

        if (error) {
          console.error('❌ Error resolving conflict:', error);
          setError(`Erro ao resolver conflito: ${error.message}`);
          return false;
        }

        // Refresh profile after resolution
        await refreshProfile();

        toast.success('Conflito resolvido com sucesso!');
        console.log('✅ Profile conflict resolved successfully');
        return true;
      } catch (err) {
        console.error('❌ Unexpected error resolving conflict:', err);
        setError('Erro inesperado ao resolver conflito');
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [user?.id, supabase, refreshProfile]
  );

  // Toggle Google sync
  const toggleGoogleSync = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }

      return await updateProfile({ google_sync_enabled: enabled });
    },
    [user?.id, updateProfile]
  );

  // Load profile on mount and user change
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
      setSyncStatus(null);
      setIsLoading(false);
    }
  }, [user?.id, refreshProfile]);

  // Setup real-time subscription for profile changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time profile subscription');

    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('📡 Profile changed:', payload);

          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as Profile);
            toast.info('Perfil atualizado automaticamente');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up profile subscription');
      subscription.unsubscribe();
    };
  }, [user?.id, supabase]);

  return {
    profile,
    syncStatus,
    isLoading,
    isUpdating,
    error,
    refreshProfile,
    updateProfile,
    syncWithGoogle,
    resolveConflict,
    toggleGoogleSync,
  };
}
