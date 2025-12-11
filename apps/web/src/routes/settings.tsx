import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, useSubscriptionPrompt } from '@/hooks/useSubscription';
import { getCurrentSession } from '@/integrations/supabase/client';
import {
  fetchDefaultChatModel,
  getHiddenProviders,
  type ProviderKey,
  setHiddenProviders,
  updateDefaultChatModel,
} from '@/services/chat-settings.service';
import {
  fetchClinicSettings,
  fetchTeamStats,
  fetchUserProfile,
  getNotificationPreferences,
  updateClinicName,
  updateClinicTimezone,
  updateNotificationPreferences,
  updateUserLanguage,
  type ClinicSettings,
  type NotificationPreferences,
  type TeamStats,
  type UserProfile,
} from '@/services/settings.service';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
} from '@neonpro/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Bell, Brain, Eye, EyeOff, Globe, Shield, ShieldCheck, Users, Loader2 } from 'lucide-react';
import React from 'react';

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: '/settings' },
      });
    }
    return { session };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const { availableModels, subscriptionInfo } = useSubscription();
  const { shouldShowUpgradePrompt, upgradeUrl } = useSubscriptionPrompt();

  // Settings data state
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [clinicSettings, setClinicSettings] = React.useState<ClinicSettings | null>(null);
  const [teamStats, setTeamStats] = React.useState<TeamStats | null>(null);
  const [loadingSettings, setLoadingSettings] = React.useState(true);

  // Form state
  const [clinicName, setClinicName] = React.useState('');
  const [timezone, setTimezone] = React.useState('America/Sao_Paulo');
  const [language, setLanguage] = React.useState('pt-BR');
  const [notifications, setNotifications] = React.useState<NotificationPreferences>({
    appointment_notifications: true,
    appointment_reminders: true,
    financial_reports: false,
    system_updates: true,
  });

  // Chat settings state
  const [defaultModel, setDefaultModel] = React.useState<string>(() => {
    if (typeof window === 'undefined') return 'gpt-5-mini';
    return localStorage.getItem('neonpro-default-chat-model') || 'gpt-5-mini';
  });
  const [saving, setSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  // Load settings data
  React.useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      setLoadingSettings(true);

      // Fetch user profile
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);

      if (profile) {
        // Set form values from profile
        setLanguage(profile.preferred_language || 'pt-BR');
        setNotifications(getNotificationPreferences(profile.notification_preferences));

        // Fetch clinic settings if user has a clinic
        const clinicId = profile.clinic_id || profile.tenant_id;
        if (clinicId) {
          const clinic = await fetchClinicSettings(clinicId);
          setClinicSettings(clinic);
          if (clinic) {
            setClinicName(clinic.clinic_name || '');
            setTimezone(clinic.timezone || 'America/Sao_Paulo');
          }

          // Fetch team stats
          if (profile.tenant_id) {
            const stats = await fetchTeamStats(profile.tenant_id);
            setTeamStats(stats);
          }
        }
      }

      // Fetch default chat model
      const serverModel = await fetchDefaultChatModel(user.id);
      if (serverModel) {
        setDefaultModel(serverModel);
        try {
          localStorage.setItem('neonpro-default-chat-model', serverModel);
        } catch { }
      }

      setLoadingSettings(false);
    };

    loadSettings();
  }, [user?.id]);

  const handleSelectDefault = async (model: string) => {
    setDefaultModel(model);
    try {
      localStorage.setItem('neonpro-default-chat-model', model);
    } catch { }

    if (!user?.id) return;
    setSaving(true);
    await updateDefaultChatModel(user.id, model);
    setSaving(false);
  };

  // Provider visibility toggles
  const [hiddenProviders, setHidden] = React.useState<ProviderKey[]>(() => getHiddenProviders());
  const toggleProvider = (key: ProviderKey) => {
    const next = hiddenProviders.includes(key)
      ? hiddenProviders.filter(p => p !== key)
      : [...hiddenProviders, key];
    setHidden(next);
    setHiddenProviders(next);
  };

  // Map model -> provider for filtering
  const providerByModel: Record<string, ProviderKey> = {
    'gpt-5-mini': 'openai',
    'gpt-4o-mini': 'openai',
    'o4-mini': 'openai',
    'gemini-2.5-flash': 'google',
    'gemini-1.5-pro': 'google',
    'claude-3-sonnet': 'anthropic',
  };

  const filteredModels = availableModels.filter(m =>
    !hiddenProviders.includes(providerByModel[m.model])
  );

  // Handle notification toggle
  const handleNotificationToggle = async (key: keyof NotificationPreferences) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newNotifications);

    if (user?.id) {
      await updateNotificationPreferences(user.id, newNotifications);
    }
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      // Update language
      await updateUserLanguage(user.id, language);

      // Update clinic settings
      const clinicId = userProfile?.clinic_id || userProfile?.tenant_id;
      if (clinicId) {
        await updateClinicName(clinicId, clinicName);
        await updateClinicTimezone(clinicId, timezone);
      }

      // Update notifications
      await updateNotificationPreferences(user.id, notifications);

      setSaveMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      setSaveMessage('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>Acesso Negado</h2>
          <p className='text-muted-foreground'>
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>Configurações</h1>
          <p className='text-sm text-muted-foreground'>
            Personalize sua experiência no NeonPro
          </p>
        </div>
        <div className='text-sm text-muted-foreground'>
          Plano: {subscriptionInfo.displayStatus}
        </div>
      </div>

      {shouldShowUpgradePrompt && (
        <Alert>
          <AlertTitle>Desbloqueie recursos avançados</AlertTitle>
          <AlertDescription>
            Faça upgrade para o NeonPro Pro e acesse todos os recursos avançados incluindo modelos
            de IA premium.{' '}
            <a
              href={upgradeUrl}
              target='_blank'
              rel='noreferrer'
              className='underline text-primary'
            >
              Fazer upgrade
            </a>
          </AlertDescription>
        </Alert>
      )}

      {saveMessage && (
        <Alert variant={saveMessage.includes('Erro') ? 'destructive' : 'default'}>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Globe className='h-5 w-5' />
              <span>Configurações Gerais</span>
            </CardTitle>
            <CardDescription>
              Configurações básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='clinicName'>Nome da Clínica</Label>
              <Input
                id='clinicName'
                placeholder='Nome da sua clínica'
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='timezone'>Fuso Horário</Label>
              <select
                id='timezone'
                className='w-full p-2 border rounded-md'
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value='America/Sao_Paulo'>São Paulo (GMT-3)</option>
                <option value='America/Rio_Branco'>Rio Branco (GMT-5)</option>
                <option value='America/Manaus'>Manaus (GMT-4)</option>
                <option value='America/Fortaleza'>Fortaleza (GMT-3)</option>
                <option value='America/Recife'>Recife (GMT-3)</option>
                <option value='America/Cuiaba'>Cuiabá (GMT-4)</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='language'>Idioma</Label>
              <select
                id='language'
                name='language'
                className='w-full p-2 border rounded-md'
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value='pt-BR'>Português (Brasil)</option>
                <option value='en-US'>English (US)</option>
                <option value='es-ES'>Español</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Chat AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Brain className='h-5 w-5' />
              <span>Assistente de IA</span>
            </CardTitle>
            <CardDescription>
              Configure os modelos de IA e preferências do chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <Label>Modelo Padrão</Label>
              <div className='grid gap-2'>
                {filteredModels.slice(0, 3).map(model => (
                  <div
                    key={model.model}
                    className='flex items-center justify-between p-2 border rounded-md'
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{model.label}</span>
                      {model.requiresPro
                        ? <Badge variant='secondary' className='text-xs'>Pro</Badge>
                        : <Badge variant='outline' className='text-xs'>Grátis</Badge>}
                    </div>
                    <Button
                      size='sm'
                      variant={defaultModel === model.model ? 'default' : 'outline'}
                      disabled={!model.available || saving}
                      onClick={() => handleSelectDefault(model.model)}
                      className='text-xs'
                    >
                      {defaultModel === model.model ? 'Padrão' : 'Selecionar'}
                    </Button>
                  </div>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                Modelo usado por padrão no chat. Você pode alterar durante a conversa.
              </p>
            </div>

            <div className='space-y-3'>
              <Label>Provedores Visíveis</Label>
              <div className='grid gap-2'>
                {(['openai', 'google', 'anthropic'] as ProviderKey[]).map(pk => (
                  <div key={pk} className='flex items-center justify-between p-2 border rounded-md'>
                    <div className='flex items-center gap-2'>
                      {hiddenProviders.includes(pk)
                        ? <EyeOff className='h-4 w-4 text-muted-foreground' />
                        : <Eye className='h-4 w-4 text-muted-foreground' />}
                      <span className='text-sm capitalize'>{pk}</span>
                    </div>
                    <Switch
                      checked={!hiddenProviders.includes(pk)}
                      onCheckedChange={() =>
                        toggleProvider(pk)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Bell className='h-5 w-5' />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Notificações de Agendamento</p>
                <p className='text-sm text-muted-foreground'>Novos agendamentos e alterações</p>
              </div>
              <Switch
                checked={notifications.appointment_notifications}
                onCheckedChange={() => handleNotificationToggle('appointment_notifications')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Lembretes de Consulta</p>
                <p className='text-sm text-muted-foreground'>Lembretes 24h antes da consulta</p>
              </div>
              <Switch
                checked={notifications.appointment_reminders}
                onCheckedChange={() => handleNotificationToggle('appointment_reminders')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Relatórios Financeiros</p>
                <p className='text-sm text-muted-foreground'>Relatórios mensais automáticos</p>
              </div>
              <Switch
                checked={notifications.financial_reports}
                onCheckedChange={() => handleNotificationToggle('financial_reports')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Atualizações do Sistema</p>
                <p className='text-sm text-muted-foreground'>Novidades e atualizações</p>
              </div>
              <Switch
                checked={notifications.system_updates}
                onCheckedChange={() => handleNotificationToggle('system_updates')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5' />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Autenticação de Dois Fatores</p>
                <p className='text-sm text-muted-foreground'>Segurança adicional para login</p>
              </div>
              <Button variant='outline' size='sm'>Configurar</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Sessões Ativas</p>
                <p className='text-sm text-muted-foreground'>Gerencie dispositivos conectados</p>
              </div>
              <Button variant='outline' size='sm'>Ver Sessões</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Log de Atividades</p>
                <p className='text-sm text-muted-foreground'>Histórico de ações no sistema</p>
              </div>
              <Button variant='outline' size='sm'>Ver Log</Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & LGPD Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <ShieldCheck className='h-5 w-5' />
              <span>Privacidade & LGPD</span>
            </CardTitle>
            <CardDescription>
              Configurações de privacidade e proteção de dados
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Coleta de Dados</p>
                <p className='text-sm text-muted-foreground'>
                  Dados coletados para melhorar o serviço
                </p>
              </div>
              <Button variant='outline' size='sm'>Configurar</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Compartilhamento de Dados</p>
                <p className='text-sm text-muted-foreground'>Como seus dados são compartilhados</p>
              </div>
              <Button variant='outline' size='sm'>Ver Política</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Exportar Dados</p>
                <p className='text-sm text-muted-foreground'>Baixe uma cópia dos seus dados</p>
              </div>
              <Button variant='outline' size='sm'>Exportar</Button>
            </div>

            <div className='text-sm text-muted-foreground border-t pt-4'>
              Seus dados são protegidos conforme a LGPD. O uso do chat AI segue as políticas de
              privacidade e consentimento.
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Users className='h-5 w-5' />
              <span>Equipe</span>
            </CardTitle>
            <CardDescription>
              Gerencie usuários e permissões
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Convidar Usuários</p>
                <p className='text-sm text-muted-foreground'>Adicione novos membros à equipe</p>
              </div>
              <Button size='sm'>Convidar</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Gerenciar Permissões</p>
                <p className='text-sm text-muted-foreground'>Configure níveis de acesso</p>
              </div>
              <Button variant='outline' size='sm'>Configurar</Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Usuários Ativos</p>
                <p className='text-sm text-muted-foreground'>
                  {teamStats?.activeUsers ?? 0} usuário{(teamStats?.activeUsers ?? 0) !== 1 ? 's' : ''} ativo{(teamStats?.activeUsers ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Button variant='outline' size='sm'>Ver Todos</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className='flex justify-end space-x-4'>
        <Button variant='outline'>Restaurar Padrões</Button>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </div>
  );
}

