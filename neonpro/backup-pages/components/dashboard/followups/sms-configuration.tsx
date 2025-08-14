// SMS Configuration Component for NeonPro
// Comprehensive SMS provider setup and management

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  Users,
  BarChart3,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useSMSProviders, 
  useActiveSMSProvider, 
  useUpsertSMSProvider, 
  useTestSMSProvider,
  useSMSConfigurationWizard,
  useFormatPhoneNumber
} from '@/app/hooks/use-sms';
import type { SMSProvider, SMSProviderConfig } from '@/app/types/sms';

// Provider configuration schemas
const TwilioConfigSchema = z.object({
  account_sid: z.string().min(1, 'Account SID é obrigatório'),
  auth_token: z.string().min(1, 'Auth Token é obrigatório'),
  from_number: z.string().regex(/^\+55\d{10,11}$/, 'Número deve estar no formato +55XXXXXXXXXXX'),
  webhook_url: z.string().url().optional(),
  status_callback: z.string().url().optional()
});

const SMSDevConfigSchema = z.object({
  api_key: z.string().min(1, 'API Key é obrigatória'),
  sender_id: z.string().min(1, 'Sender ID é obrigatório'),
  webhook_url: z.string().url().optional(),
  callback_option: z.boolean().default(false)
});

const ZenviaConfigSchema = z.object({
  api_token: z.string().min(1, 'API Token é obrigatório'),
  account_id: z.string().min(1, 'Account ID é obrigatório'),
  from: z.string().min(1, 'Canal de envio é obrigatório'),
  webhook_url: z.string().url().optional()
});

const MovileConfigSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  auth_token: z.string().min(1, 'Auth Token é obrigatório'),
  sender_id: z.string().min(1, 'Sender ID é obrigatório'),
  webhook_url: z.string().url().optional()
});

const ProviderSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  provider: z.enum(['twilio', 'sms_dev', 'zenvia', 'movile']),
  enabled: z.boolean().default(false),
  config: z.union([TwilioConfigSchema, SMSDevConfigSchema, ZenviaConfigSchema, MovileConfigSchema])
});

type ProviderFormData = z.infer<typeof ProviderSchema>;

// Provider information
const PROVIDER_INFO = {
  twilio: {
    name: 'Twilio Brasil',
    description: 'Plataforma global de comunicação com cobertura completa no Brasil',
    features: ['Delivery reports', 'Two-way SMS', 'Bulk messaging', 'Templates'],
    website: 'https://www.twilio.com/pt-br',
    pricing: 'A partir de R$ 0,045 por SMS',
    setupTime: '5 minutos',
    reliability: 99.9
  },
  sms_dev: {
    name: 'SMS Dev (ZENVIA)',
    description: 'Provedor brasileiro especializado em SMS marketing e transacional',
    features: ['Delivery reports', 'Bulk messaging', 'Scheduling', 'Templates'],
    website: 'https://smsdev.com.br',
    pricing: 'A partir de R$ 0,035 por SMS',
    setupTime: '3 minutos',
    reliability: 99.5
  },
  zenvia: {
    name: 'ZENVIA',
    description: 'Líder brasileiro em comunicação empresarial multicanal',
    features: ['Multi-channel', 'Two-way SMS', 'Analytics', 'Templates'],
    website: 'https://zenvia.com',
    pricing: 'A partir de R$ 0,040 por SMS',
    setupTime: '5 minutos',
    reliability: 99.8
  },
  movile: {
    name: 'Movile',
    description: 'Plataforma de messaging com foco em mobile engagement',
    features: ['Delivery reports', 'Bulk messaging', 'Analytics', 'Two-way'],
    website: 'https://movile.com',
    pricing: 'A partir de R$ 0,038 por SMS',
    setupTime: '4 minutos',
    reliability: 99.6
  }
} as const;

export default function SMSConfiguration() {
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const { formatToInternational, formatToDisplay, isValidBrazilianPhone } = useFormatPhoneNumber();
  
  // API hooks
  const { data: providers = [], isLoading: providersLoading } = useSMSProviders();
  const { data: activeProvider } = useActiveSMSProvider();
  const upsertProvider = useUpsertSMSProvider();
  const testProvider = useTestSMSProvider();
  
  // Wizard state
  const wizard = useSMSConfigurationWizard();

  // Form setup
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(ProviderSchema),
    defaultValues: {
      name: '',
      provider: 'twilio',
      enabled: false,
      config: {
        account_sid: '',
        auth_token: '',
        from_number: '',
        webhook_url: '',
        status_callback: ''
      }
    }
  });

  // Handle provider selection
  const handleProviderSelect = (provider: SMSProvider) => {
    wizard.setProviderType(provider);
    const info = PROVIDER_INFO[provider];
    
    form.setValue('provider', provider);
    form.setValue('name', info.name);
    
    // Reset config based on provider
    const defaultConfigs = {
      twilio: { account_sid: '', auth_token: '', from_number: '', webhook_url: '', status_callback: '' },
      sms_dev: { api_key: '', sender_id: '', webhook_url: '', callback_option: false },
      zenvia: { api_token: '', account_id: '', from: '', webhook_url: '' },
      movile: { username: '', auth_token: '', sender_id: '', webhook_url: '' }
    };
    
    form.setValue('config', defaultConfigs[provider]);
    wizard.nextStep();
  };

  // Handle form submission
  const handleSubmit = async (data: ProviderFormData) => {
    try {
      await upsertProvider.mutateAsync(data);
      wizard.nextStep();
    } catch (error) {
      console.error('Error saving SMS provider:', error);
    }
  };

  // Handle provider test
  const handleTestProvider = async () => {
    if (!activeProvider || !testPhone) {
      toast.error('Configure um provedor e informe um número para teste');
      return;
    }

    if (!isValidBrazilianPhone(testPhone)) {
      toast.error('Número de telefone inválido. Use o formato brasileiro.');
      return;
    }

    const formattedPhone = formatToInternational(testPhone);
    
    try {
      await testProvider.mutateAsync({
        providerId: activeProvider.id,
        testPhone: formattedPhone
      });
    } catch (error) {
      console.error('Error testing SMS provider:', error);
    }
  };

  // Render provider selection
  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha um Provedor SMS</h3>
        <p className="text-muted-foreground">
          Selecione o provedor que melhor atende suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PROVIDER_INFO).map(([key, info]) => (
          <Card 
            key={key}
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
            onClick={() => handleProviderSelect(key as SMSProvider)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{info.name}</CardTitle>
                <Badge variant="secondary">{info.reliability}% uptime</Badge>
              </div>
              <CardDescription className="text-sm">
                {info.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Preço:</span>
                  <span className="font-medium">{info.pricing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setup:</span>
                  <span className="font-medium">{info.setupTime}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {info.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {info.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{info.features.length - 3} mais
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render configuration form
  const renderConfigurationForm = () => {
    if (!wizard.providerType) return null;

    const providerInfo = PROVIDER_INFO[wizard.providerType];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Configurar {providerInfo.name}</h3>
          <p className="text-muted-foreground">
            Configure as credenciais do seu provedor SMS
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Configuração</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: SMS Produção" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ativar Provedor</FormLabel>
                        <FormDescription>
                          Ativar este provedor para envio de SMS
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Provider-specific configuration */}
            {wizard.providerType === 'twilio' && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Twilio</CardTitle>
                  <CardDescription>
                    Configure suas credenciais da conta Twilio Brasil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="config.account_sid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account SID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showSensitiveData ? 'text' : 'password'}
                              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowSensitiveData(!showSensitiveData)}
                            >
                              {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Encontre no Console Twilio em Account Info
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="config.auth_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auth Token</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="•••••••••••••••••••••••••••••••••"
                          />
                        </FormControl>
                        <FormDescription>
                          Token de autenticação da sua conta Twilio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="config.from_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Envio</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="+5511999999999"
                            onChange={(e) => {
                              const formatted = formatToInternational(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Número Twilio autorizado para envio no Brasil
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {wizard.providerType === 'sms_dev' && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações SMS Dev</CardTitle>
                  <CardDescription>
                    Configure suas credenciais da conta SMS Dev
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="config.api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="•••••••••••••••••••••••••••••••••"
                          />
                        </FormControl>
                        <FormDescription>
                          Chave de API encontrada no painel SMS Dev
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="config.sender_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender ID</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="NeonPro"
                            maxLength={11}
                          />
                        </FormControl>
                        <FormDescription>
                          Identificador do remetente (máximo 11 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={wizard.prevStep}
                disabled={wizard.isFirstStep}
              >
                Voltar
              </Button>
              
              <Button
                type="submit"
                disabled={upsertProvider.isPending}
              >
                {upsertProvider.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configuração
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  // Render test connection
  const renderTestConnection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold">Configuração Salva!</h3>
        <p className="text-muted-foreground">
          Agora vamos testar a conexão com seu provedor SMS
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Teste de Conexão
          </CardTitle>
          <CardDescription>
            Envie um SMS de teste para verificar se tudo está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de Teste</label>
            <div className="flex gap-2">
              <Input
                placeholder="(11) 99999-9999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTestProvider}
                disabled={testProvider.isPending || !testPhone}
              >
                {testProvider.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Testar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {testPhone && (
                <>Formato internacional: {formatToInternational(testPhone)}</>
              )}
            </p>
          </div>

          {activeProvider && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Um SMS de teste será enviado via <strong>{activeProvider.name}</strong> 
                para verificar a configuração. Custo aproximado: R$ 0,05
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={wizard.prevStep}
        >
          Voltar
        </Button>
        
        <Button
          onClick={wizard.nextStep}
        >
          Finalizar
        </Button>
      </div>
    </div>
  );

  // Render completion
  const renderCompletion = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <div>
        <h3 className="text-xl font-semibold mb-2">SMS Configurado com Sucesso!</h3>
        <p className="text-muted-foreground">
          Seu provedor SMS está configurado e pronto para uso
        </p>
      </div>

      {activeProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuração Ativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provedor:</span>
              <span className="font-medium">{activeProvider.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Configurado em:</span>
              <span className="font-medium">
                {new Date(activeProvider.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={wizard.resetWizard} variant="outline">
          Configurar Outro Provedor
        </Button>
        <Button onClick={() => window.location.reload()}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );

  // Main render
  if (providersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">Configuração SMS</h1>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-md mx-auto">
          <Progress value={(wizard.currentStep + 1) / wizard.totalSteps * 100} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Passo {wizard.currentStep + 1} de {wizard.totalSteps}: {wizard.stepTitle}
          </p>
        </div>
      </div>

      {/* Current provider status */}
      {activeProvider && wizard.currentStep === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Provedor <strong>{activeProvider.name}</strong> está ativo. 
            Configure um novo provedor ou modifique o atual.
          </AlertDescription>
        </Alert>
      )}

      {/* Wizard steps */}
      <Card>
        <CardContent className="p-6">
          {wizard.currentStep === 0 && renderProviderSelection()}
          {wizard.currentStep === 1 && renderConfigurationForm()}
          {wizard.currentStep === 2 && renderTestConnection()}
          {wizard.currentStep === 3 && renderCompletion()}
        </CardContent>
      </Card>

      {/* Quick actions */}
      {activeProvider && wizard.currentStep === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Send className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-medium">Enviar SMS</h3>
              <p className="text-sm text-muted-foreground">Enviar mensagens individuais</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium">Envio em Lote</h3>
              <p className="text-sm text-muted-foreground">Campanhas para múltiplos contatos</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-medium">Relatórios</h3>
              <p className="text-sm text-muted-foreground">Analytics e métricas de entrega</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}