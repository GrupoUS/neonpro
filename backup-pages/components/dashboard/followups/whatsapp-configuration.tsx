// WhatsApp Configuration UI Component
// Allows configuration of WhatsApp Business API settings

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { useWhatsAppConfig, useUpdateWhatsAppConfig } from '@/app/hooks/use-whatsapp';
import { toast } from 'react-hot-toast';

// Validation schema
const whatsAppConfigSchema = z.object({
  phoneNumberId: z.string()
    .min(1, 'Phone Number ID é obrigatório')
    .regex(/^\d+$/, 'Phone Number ID deve conter apenas números'),
  accessToken: z.string()
    .min(50, 'Access Token deve ter pelo menos 50 caracteres'),
  webhookVerifyToken: z.string()
    .min(8, 'Webhook Verify Token deve ter pelo menos 8 caracteres'),
  businessName: z.string()
    .min(1, 'Nome do negócio é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  businessDescription: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  isActive: z.boolean()
});

type WhatsAppConfigFormData = z.infer<typeof whatsAppConfigSchema>;

export function WhatsAppConfiguration() {
  const [showTokens, setShowTokens] = useState(false);
  const { data: config, isLoading } = useWhatsAppConfig();
  const updateConfig = useUpdateWhatsAppConfig();

  const form = useForm<WhatsAppConfigFormData>({
    resolver: zodResolver(whatsAppConfigSchema),
    defaultValues: {
      phoneNumberId: config?.phoneNumberId || '',
      accessToken: config?.accessToken || '',
      webhookVerifyToken: config?.webhookVerifyToken || '',
      businessName: config?.businessName || '',
      businessDescription: config?.businessDescription || '',
      isActive: config?.isActive || false
    }
  });

  // Update form when config loads
  React.useEffect(() => {
    if (config) {
      form.reset({
        phoneNumberId: config.phoneNumberId || '',
        accessToken: config.accessToken || '',
        webhookVerifyToken: config.webhookVerifyToken || '',
        businessName: config.businessName || '',
        businessDescription: config.businessDescription || '',
        isActive: config.isActive || false
      });
    }
  }, [config, form]);

  const onSubmit = async (data: WhatsAppConfigFormData) => {
    try {
      await updateConfig.mutateAsync(data);
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL do webhook copiada para a área de transferência');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando configuração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Status do WhatsApp
                {config?.isActive ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure a integração com WhatsApp Business API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Negócio</p>
              <p className="text-sm text-gray-500">
                {config?.businessName || 'Não configurado'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Phone Number ID</p>
              <p className="text-sm text-gray-500 font-mono">
                {config?.phoneNumberId || 'Não configurado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da API</CardTitle>
          <CardDescription>
            Configure os parâmetros de conexão com a WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Informações do Negócio
                </h4>
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Negócio *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da sua clínica" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome que aparecerá nas mensagens WhatsApp
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Negócio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição da sua clínica..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição opcional do seu negócio
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Configuração da API
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTokens(!showTokens)}
                  >
                    {showTokens ? 'Ocultar' : 'Mostrar'} Tokens
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012345" {...field} />
                      </FormControl>
                      <FormDescription>
                        ID do número de telefone no Meta Business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token *</FormLabel>
                      <FormControl>
                        <Input 
                          type={showTokens ? 'text' : 'password'}
                          placeholder="EAAxxxxxxxxxxxxxxxxxxxxx"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Token de acesso permanente da WhatsApp API
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookVerifyToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Verify Token *</FormLabel>
                      <FormControl>
                        <Input 
                          type={showTokens ? 'text' : 'password'}
                          placeholder="webhook_verify_token_123"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Token de verificação do webhook (você define este valor)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Webhook URL */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Configuração do Webhook
                </h4>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">URL do Webhook</p>
                      <p className="text-sm text-gray-500 font-mono">
                        {typeof window !== 'undefined' 
                          ? `${window.location.origin}/api/whatsapp/webhook`
                          : '/api/whatsapp/webhook'
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyWebhookUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Configure esta URL no Meta Business Manager como webhook da sua aplicação
                  </p>
                </div>
              </div>

              {/* Status Toggle */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Ativar WhatsApp
                      </FormLabel>
                      <FormDescription>
                        Ativar ou desativar o envio de mensagens WhatsApp
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

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateConfig.isPending}
                  className="min-w-[150px]"
                >
                  {updateConfig.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configuração'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Guia de Configuração
          </CardTitle>
          <CardDescription>
            Passos para configurar a WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Meta Business Manager</h4>
              <p className="text-sm text-gray-600">
                Acesse o Meta Business Manager e configure sua conta WhatsApp Business API
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Phone Number ID</h4>
              <p className="text-sm text-gray-600">
                Encontre o Phone Number ID na seção WhatsApp → Phone Numbers
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Access Token</h4>
              <p className="text-sm text-gray-600">
                Gere um access token permanente na seção System Users
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">4. Webhook</h4>
              <p className="text-sm text-gray-600">
                Configure o webhook com a URL fornecida acima e o verify token
              </p>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Certifique-se de que sua conta WhatsApp Business 
              está verificada e aprovada antes de começar a enviar mensagens.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}