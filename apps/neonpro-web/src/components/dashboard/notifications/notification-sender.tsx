/**
 * NotificationSender Component
 * 
 * Componente para criação e envio de notificações com
 * otimização ML e validação de compliance.
 * 
 * @author APEX UI/UX Team
 * @version 1.0.0
 * @compliance WCAG 2.1 AA, LGPD
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// ================================================================================
// SCHEMAS & TYPES
// ================================================================================

const NotificationFormSchema = z.object({
  recipientType: z.enum(['single', 'group', 'all']),
  recipientId: z.string().optional(),
  groupFilters: z.object({
    ageMin: z.number().optional(),
    ageMax: z.number().optional(),
    gender: z.string().optional(),
    lastVisit: z.string().optional(),
  }).optional(),
  type: z.enum(['appointment_reminder', 'promotional', 'informational', 'urgent', 'system']),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Conteúdo muito longo'),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app'])).min(1, 'Selecione pelo menos um canal'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  scheduledFor: z.string().optional(),
  templateId: z.string().optional(),
  enableMLOptimization: z.boolean(),
  testMode: z.boolean(),
});

type NotificationFormData = z.infer<typeof NotificationFormSchema>;

interface NotificationSenderProps {
  onNotificationSent?: () => void;
}

// ================================================================================
// COMPONENT
// ================================================================================

export function NotificationSender({ onNotificationSent }: NotificationSenderProps) {
  const [loading, setLoading] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number>(0);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const { toast } = useToast();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(NotificationFormSchema),
    defaultValues: {
      recipientType: 'single',
      type: 'informational',
      channels: ['email'],
      priority: 'normal',
      enableMLOptimization: true,
      testMode: false,
    },
  });

  // ================================================================================
  // EFFECTS
  // ================================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.recipientType) {
        calculateEstimatedReach(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // ================================================================================
  // DATA LOADING
  // ================================================================================

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const calculateEstimatedReach = async (formData: Partial<NotificationFormData>) => {
    if (formData.recipientType === 'single') {
      setEstimatedReach(1);
      return;
    }

    try {
      const params = new URLSearchParams({
        type: formData.recipientType!,
        ...(formData.groupFilters && Object.fromEntries(
          Object.entries(formData.groupFilters).filter(([_, value]) => value != null)
        )),
      });

      const response = await fetch(`/api/patients/count?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEstimatedReach(data.count || 0);
      }
    } catch (error) {
      console.error('Erro ao calcular alcance:', error);
    }
  };

  // ================================================================================
  // FORM HANDLERS
  // ================================================================================

  const onSubmit = async (data: NotificationFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor).toISOString() : undefined,
        metadata: {
          estimatedReach,
          formSource: 'dashboard',
        },
      };

      const endpoint = data.recipientType === 'single' 
        ? '/api/notifications/send'
        : '/api/notifications/send';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar notificação');
      }

      toast({
        title: 'Sucesso!',
        description: data.testMode 
          ? 'Notificação de teste enviada com sucesso'
          : `Notificação enviada para ${estimatedReach} destinatário(s)`,
      });

      // Reset form
      form.reset();
      setEstimatedReach(0);
      
      // Callback para atualizar dashboard
      if (onNotificationSent) {
        onNotificationSent();
      }

    } catch (error) {
      console.error('Erro no envio:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao enviar notificação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================================================================
  // RENDER HELPERS
  // ================================================================================

  const renderRecipientSelection = () => (
    <div className=\"space-y-4\">
      <FormField
        control={form.control}
        name=\"recipientType\"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destinatários</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder=\"Selecione o tipo de destinatário\" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value=\"single\">Paciente Individual</SelectItem>
                <SelectItem value=\"group\">Grupo de Pacientes</SelectItem>
                <SelectItem value=\"all\">Todos os Pacientes</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('recipientType') === 'single' && (
        <FormField
          control={form.control}
          name=\"recipientId\"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <FormControl>
                <Input placeholder=\"Buscar paciente...\" {...field} />
              </FormControl>
              <FormDescription>
                Digite o nome ou CPF do paciente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className=\"flex items-center space-x-2 text-sm text-muted-foreground\">
        <Icons.Users className=\"h-4 w-4\" />
        <span>Alcance estimado: {estimatedReach} destinatário(s)</span>
      </div>
    </div>
  );

  const renderChannelSelection = () => (
    <FormField
      control={form.control}
      name=\"channels\"
      render={() => (
        <FormItem>
          <div className=\"mb-4\">
            <FormLabel className=\"text-base\">Canais de Envio</FormLabel>
            <FormDescription>
              Selecione os canais para envio da notificação
            </FormDescription>
          </div>
          <div className=\"grid grid-cols-2 gap-4\">
            {[
              { id: 'email', label: 'E-mail', icon: Icons.Mail },
              { id: 'sms', label: 'SMS', icon: Icons.MessageSquare },
              { id: 'whatsapp', label: 'WhatsApp', icon: Icons.MessageCircle },
              { id: 'push', label: 'Push', icon: Icons.Bell },
              { id: 'in_app', label: 'In-App', icon: Icons.Smartphone },
            ].map((channel) => (
              <FormField
                key={channel.id}
                control={form.control}
                name=\"channels\"
                render={({ field }) => {
                  const Icon = channel.icon;
                  return (
                    <FormItem
                      key={channel.id}
                      className=\"flex flex-row items-start space-x-3 space-y-0\"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(channel.id as any)}
                          onCheckedChange={(checked) => {
                            const updatedChannels = checked
                              ? [...(field.value || []), channel.id]
                              : (field.value || []).filter((value) => value !== channel.id);
                            field.onChange(updatedChannels);
                          }}
                        />
                      </FormControl>
                      <div className=\"flex items-center space-x-2\">
                        <Icon className=\"h-4 w-4\" />
                        <FormLabel className=\"font-normal\">
                          {channel.label}
                        </FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderAdvancedOptions = () => (
    <div className=\"space-y-4\">
      <div className=\"grid grid-cols-2 gap-4\">
        <FormField
          control={form.control}
          name=\"priority\"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value=\"low\">Baixa</SelectItem>
                  <SelectItem value=\"normal\">Normal</SelectItem>
                  <SelectItem value=\"high\">Alta</SelectItem>
                  <SelectItem value=\"urgent\">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name=\"scheduledFor\"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agendar Para</FormLabel>
              <FormControl>
                <Input
                  type=\"datetime-local\"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Deixe vazio para enviar imediatamente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className=\"space-y-3\">
        <FormField
          control={form.control}
          name=\"enableMLOptimization\"
          render={({ field }) => (
            <FormItem className=\"flex flex-row items-center justify-between rounded-lg border p-4\">
              <div className=\"space-y-0.5\">
                <FormLabel className=\"text-base\">
                  Otimização Inteligente
                </FormLabel>
                <FormDescription>
                  Usar IA para otimizar horário e canal de envio
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name=\"testMode\"
          render={({ field }) => (
            <FormItem className=\"flex flex-row items-center justify-between rounded-lg border p-4\">
              <div className=\"space-y-0.5\">
                <FormLabel className=\"text-base\">
                  Modo Teste
                </FormLabel>
                <FormDescription>
                  Enviar apenas para administradores
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // ================================================================================
  // MAIN RENDER
  // ================================================================================

  return (
    <div className=\"max-w-4xl space-y-6\">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificação</CardTitle>
          <CardDescription>
            Crie e envie notificações personalizadas para seus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=\"space-y-6\">
              {/* Destinatários */}
              {renderRecipientSelection()}

              <Separator />

              {/* Conteúdo */}
              <div className=\"grid grid-cols-1 gap-4\">
                <FormField
                  control={form.control}
                  name=\"type\"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Notificação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=\"appointment_reminder\">Lembrete de Consulta</SelectItem>
                          <SelectItem value=\"promotional\">Promocional</SelectItem>
                          <SelectItem value=\"informational\">Informativa</SelectItem>
                          <SelectItem value=\"urgent\">Urgente</SelectItem>
                          <SelectItem value=\"system\">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=\"title\"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder=\"Título da notificação...\" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/100 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=\"content\"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder=\"Conteúdo da notificação...\"
                          className=\"min-h-[100px]\"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1000 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Canais */}
              {renderChannelSelection()}

              <Separator />

              {/* Opções Avançadas */}
              {renderAdvancedOptions()}

              {/* Ações */}
              <div className=\"flex items-center justify-between pt-6\">
                <div className=\"flex items-center space-x-2\">
                  {form.watch('testMode') && (
                    <Badge variant=\"outline\">Modo Teste</Badge>
                  )}
                  {form.watch('enableMLOptimization') && (
                    <Badge variant=\"secondary\">IA Ativada</Badge>
                  )}
                </div>
                
                <div className=\"space-x-2\">
                  <Button 
                    type=\"button\" 
                    variant=\"outline\"
                    onClick={() => form.reset()}
                  >
                    Limpar
                  </Button>
                  <Button type=\"submit\" disabled={loading}>
                    {loading && <Icons.Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />}
                    {loading ? 'Enviando...' : 'Enviar Notificação'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
