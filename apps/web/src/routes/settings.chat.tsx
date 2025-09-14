import { getCurrentSession } from '@/integrations/supabase/client';
import { useSubscription, useSubscriptionPrompt } from '@/hooks/useSubscription';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Switch, Label, Alert, AlertTitle, AlertDescription } from '@neonpro/ui';
import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { Brain, ShieldCheck, EyeOff, Eye } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchDefaultChatModel, updateDefaultChatModel, getHiddenProviders, setHiddenProviders, type ProviderKey } from '@/services/chat-settings.service';

// Route: /settings/chat
export const Route = createFileRoute('/settings/chat')({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: '/settings/chat' },
      });
    }
    return { session };
  },
  component: ChatSettingsPage,
});

function ChatSettingsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const { availableModels, subscriptionInfo } = useSubscription();
  const { shouldShowUpgradePrompt, upgradeUrl } = useSubscriptionPrompt();

  // Default model (server + local fallback)
  const [defaultModel, setDefaultModel] = React.useState<string>(() => {
    if (typeof window === 'undefined') return 'gpt-5-mini';
    return localStorage.getItem('neonpro-default-chat-model') || 'gpt-5-mini';
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const serverModel = await fetchDefaultChatModel(user.id);
      if (serverModel) {
        setDefaultModel(serverModel);
        try { localStorage.setItem('neonpro-default-chat-model', serverModel); } catch {}
      }
    })();
  }, [user?.id]);

  const handleSelectDefault = async (model: string) => {
    setDefaultModel(model);
    try { localStorage.setItem('neonpro-default-chat-model', model); } catch {}

    if (!user?.id) return;
    setSaving(true);
    const ok = await updateDefaultChatModel(user.id, model);
    setSaving(false);
    // Optionally toast on failure (omitted to keep minimal)
    if (!ok) {
      // noop
    }
  };

  // Provider visibility toggles (local, per user device)
  const [hiddenProviders, setHidden] = React.useState<ProviderKey[]>(() => getHiddenProviders());
  const toggleProvider = (key: ProviderKey) => {
    const next = hiddenProviders.includes(key)
      ? hiddenProviders.filter(p => p !== key)
      : [...hiddenProviders, key];
    setHidden(next);
    setHiddenProviders(next);
  };

  // Map model -> provider for simple filtering
  const providerByModel: Record<string, ProviderKey> = {
    'gpt-5-mini': 'openai',
    'gpt-4o-mini': 'openai',
    'o4-mini': 'openai',
    'gemini-2.5-flash': 'google',
    'gemini-1.5-pro': 'google',
    'claude-3-sonnet': 'anthropic',
  };

  const filteredModels = availableModels.filter(m => !hiddenProviders.includes(providerByModel[m.model]));

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' role='status' aria-label='Carregando' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>Acesso Negado</h2>
          <p className='text-muted-foreground'>Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>Configurações do Chat</h1>
          <p className='text-sm text-muted-foreground'>Gerencie os modelos de IA e preferências do chat</p>
        </div>
        <div className='text-sm text-muted-foreground'>Plano: {subscriptionInfo.displayStatus}</div>
      </div>

      {shouldShowUpgradePrompt && (
        <Alert>
          <AlertTitle>Desbloqueie modelos avançados</AlertTitle>
          <AlertDescription>
            Faça upgrade para o NeonPro Pro e acesse todos os modelos de IA avançados.
            {' '}<a href={upgradeUrl} target='_blank' rel='noreferrer' className='underline text-primary'>Fazer upgrade</a>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5' /> Modelos Disponíveis
          </CardTitle>
          <CardDescription>
            Selecione o modelo padrão e veja quais estão disponíveis no seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {filteredModels.map(model => (
              <div key={model.model} className='flex items-start justify-between rounded-md border p-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{model.label}</span>
                    {model.requiresPro ? (
                      <Badge variant='secondary' className='bg-amber-100 text-amber-900'>Pro</Badge>
                    ) : (
                      <Badge variant='outline'>Grátis</Badge>
                    )}
                    {!model.available && (
                      <span className='text-xs text-muted-foreground'>(bloqueado)</span>
                    )}
                  </div>
                  {model.description && (
                    <p className='text-sm text-muted-foreground mt-1'>{model.description}</p>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant={defaultModel === model.model ? 'default' : 'outline'}
                    disabled={!model.available || saving}
                    onClick={() => handleSelectDefault(model.model)}
                    aria-label={`Definir ${model.label} como modelo padrão`}
                  >
                    {defaultModel === model.model ? (saving ? 'Salvando...' : 'Padrão') : 'Definir padrão'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className='text-xs text-muted-foreground mt-4'>
            Observação: o modelo selecionado será usado como padrão ao abrir o chat. Você pode mudar a qualquer momento no próprio chat.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' /> Visibilidade por Provedor
          </CardTitle>
          <CardDescription>Oculte modelos de provedores que você não usa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            {(['openai','google','anthropic'] as ProviderKey[]).map(pk => (
              <div key={pk} className='flex items-center justify-between rounded-md border p-4'>
                <div className='flex items-center gap-2'>
                  {hiddenProviders.includes(pk) ? <EyeOff className='h-4 w-4 text-muted-foreground' /> : <Eye className='h-4 w-4 text-muted-foreground' />}
                  <span className='capitalize'>{pk}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Label htmlFor={`toggle-${pk}`} className='text-sm text-muted-foreground'>Ocultar</Label>
                  <Switch id={`toggle-${pk}`} checked={hiddenProviders.includes(pk)} onCheckedChange={() => toggleProvider(pk)} />
                </div>
              </div>
            ))}
          </div>
          <p className='text-xs text-muted-foreground mt-4'>
            Isso afeta apenas a sua visualização neste dispositivo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='h-5 w-5' /> Privacidade & LGPD
          </CardTitle>
          <CardDescription>O uso do chat segue as políticas de privacidade e consentimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>
            Seus dados são protegidos e usados somente para melhorar a experiência de atendimento. Saiba mais nas
            {' '}<Link to='/settings'>Configurações</Link> gerais.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
