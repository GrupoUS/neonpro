
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { NotificationSettings, SecuritySettings, AppearanceSettings } from '@/types/settings';
import { toast } from 'sonner';

export const useSettings = () => {
  const { user } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const [notificationRes, securityRes, appearanceRes] = await Promise.all([
        supabase.from('notification_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('security_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('appearance_settings').select('*').eq('user_id', user.id).single()
      ]);

      if (notificationRes.data) setNotificationSettings(notificationRes.data);
      if (securityRes.data) setSecuritySettings(securityRes.data);
      if (appearanceRes.data) setAppearanceSettings(appearanceRes.data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      setNotificationSettings(data);
      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      toast.error('Erro ao salvar configurações de notificação');
    }
  };

  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      setSecuritySettings(data);
      toast.success('Configurações de segurança atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações de segurança:', error);
      toast.error('Erro ao salvar configurações de segurança');
    }
  };

  const updateAppearanceSettings = async (updates: Partial<AppearanceSettings>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appearance_settings')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      setAppearanceSettings(data);
      toast.success('Configurações de aparência atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações de aparência:', error);
      toast.error('Erro ao salvar configurações de aparência');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    notificationSettings,
    securitySettings,
    appearanceSettings,
    isLoading,
    updateNotificationSettings,
    updateSecuritySettings,
    updateAppearanceSettings,
    refreshSettings: fetchSettings,
  };
};
