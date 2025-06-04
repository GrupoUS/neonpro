
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
      // TODO: As tabelas de configurações existem no banco mas não estão no schema TypeScript atual
      // Por enquanto, vamos usar configurações padrão até que o schema seja atualizado
      console.log('Settings tables exist in database but are not in current TypeScript schema');
      
      // Configurações padrão para notificações
      const defaultNotificationSettings: NotificationSettings = {
        id: user.id,
        user_id: user.id,
        email_appointments: true,
        email_reminders: true,
        email_marketing: false,
        sms_appointments: false,
        sms_reminders: false,
        push_notifications: true,
        reminder_hours_before: 24,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Configurações padrão para segurança
      const defaultSecuritySettings: SecuritySettings = {
        id: user.id,
        user_id: user.id,
        two_factor_enabled: false,
        login_notifications: true,
        session_timeout_minutes: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Configurações padrão para aparência
      const defaultAppearanceSettings: AppearanceSettings = {
        id: user.id,
        user_id: user.id,
        theme: 'dark',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        sidebar_collapsed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setNotificationSettings(defaultNotificationSettings);
      setSecuritySettings(defaultSecuritySettings);
      setAppearanceSettings(defaultAppearanceSettings);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      // TODO: Implementar quando as tabelas estiverem no schema TypeScript
      console.log('Update notification settings - schema não atualizado', updates);
      
      // Por enquanto, apenas atualizar o estado local
      setNotificationSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      toast.error('Erro ao salvar configurações de notificação');
    }
  };

  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    if (!user) return;

    try {
      // TODO: Implementar quando as tabelas estiverem no schema TypeScript
      console.log('Update security settings - schema não atualizado', updates);
      
      // Por enquanto, apenas atualizar o estado local
      setSecuritySettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Configurações de segurança atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações de segurança:', error);
      toast.error('Erro ao salvar configurações de segurança');
    }
  };

  const updateAppearanceSettings = async (updates: Partial<AppearanceSettings>) => {
    if (!user) return;

    try {
      // TODO: Implementar quando as tabelas estiverem no schema TypeScript
      console.log('Update appearance settings - schema não atualizado', updates);
      
      // Por enquanto, apenas atualizar o estado local
      setAppearanceSettings(prev => prev ? { ...prev, ...updates } : null);
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
