/**
 * Notification Settings Component
 * Allows patients to configure their notification preferences
 */

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotifications';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Switch } from '@/components/ui';
import { Label } from '@/components/ui';
import { Separator } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  patientId: string;
  clinicId: string;
  className?: string;
}

export function NotificationSettings({
  patientId,
  clinicId,
  className,
}: NotificationSettingsProps) {
  const { data: preferences, isLoading } = useNotificationPreferences(patientId);
  const updatePreferences = useUpdateNotificationPreferences();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when preferences load
  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handlePreferenceChange = (key: string, value: boolean) => {
    setLocalPreferences(prev =>
      prev
        ? {
          ...prev,
          [key]: value,
        }
        : undefined
    );
    setHasChanges(true);
  };

  const handleLgpdConsent = (_consent: any) => {
    setLocalPreferences(prev =>
      prev
        ? {
          ...prev,
          lgpdConsent: consent,
          lgpdConsentDate: consent ? new Date() : prev.lgpdConsentDate,
        }
        : undefined
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updatePreferences.mutateAsync({
        patientId,
        preferences: {
          ...localPreferences,
          clinicId,
        },
      });
      setHasChanges(false);
      toast.success('Preferências salvas com sucesso!');
    } catch {
      // ignore error for UX
      console.error('Error saving notification preferences');
      toast.error('Erro ao salvar preferências');
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
            <div className='h-4 bg-muted rounded w-2/3'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Configurações de Notificação
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Configure como você deseja receber notificações sobre seus agendamentos
        </p>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* LGPD Consent Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            <h3 className='font-medium'>Consentimento LGPD</h3>
            {localPreferences?.lgpdConsent
              ? (
                <Badge variant='default' className='ml-auto'>
                  <CheckCircle className='h-3 w-3 mr-1' />
                  Autorizado
                </Badge>
              )
              : (
                <Badge variant='destructive' className='ml-auto'>
                  <XCircle className='h-3 w-3 mr-1' />
                  Não autorizado
                </Badge>
              )}
          </div>

          <div className='flex items-start space-x-3'>
            <Switch
              id='lgpd-consent'
              checked={localPreferences?.lgpdConsent || false}
              onCheckedChange={handleLgpdConsent}
            />
            <div className='space-y-1'>
              <Label htmlFor='lgpd-consent' className='text-sm font-medium'>
                Autorizo o recebimento de notificações
              </Label>
              <p className='text-xs text-muted-foreground'>
                Conforme a Lei Geral de Proteção de Dados (LGPD), você pode autorizar ou revogar o
                consentimento para recebimento de notificações a qualquer momento.
              </p>
            </div>
          </div>

          {localPreferences?.lgpdConsentDate && (
            <p className='text-xs text-muted-foreground'>
              Consentimento dado em: {new Date(localPreferences.lgpdConsentDate).toLocaleDateString(
                'pt-BR',
              )}
            </p>
          )}
        </div>

        <Separator />

        {/* Notification Channels */}
        <div className='space-y-4'>
          <h3 className='font-medium flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            Canais de Comunicação
          </h3>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <Label
                    htmlFor='email-enabled'
                    className='text-sm font-medium'
                  >
                    Email
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Receber notificações por email
                  </p>
                </div>
              </div>
              <Switch
                id='email-enabled'
                checked={localPreferences?.email || false}
                onCheckedChange={checked => handlePreferenceChange('email', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <div>
                  <Label htmlFor='sms-enabled' className='text-sm font-medium'>
                    SMS
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Receber notificações por SMS
                  </p>
                </div>
              </div>
              <Switch
                id='sms-enabled'
                checked={localPreferences?.sms || false}
                onCheckedChange={checked => handlePreferenceChange('sms', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <MessageSquare className='h-4 w-4 text-muted-foreground' />
                <div>
                  <Label
                    htmlFor='whatsapp-enabled'
                    className='text-sm font-medium'
                  >
                    WhatsApp
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Receber notificações pelo WhatsApp
                  </p>
                </div>
              </div>
              <Switch
                id='whatsapp-enabled'
                checked={localPreferences?.whatsapp || false}
                onCheckedChange={checked => handlePreferenceChange('whatsapp', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Types */}
        <div className='space-y-4'>
          <h3 className='font-medium flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            Tipos de Notificação
          </h3>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <Label
                  htmlFor='appointment-confirmations'
                  className='text-sm font-medium'
                >
                  Confirmações de Agendamento
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Receber confirmação imediata após agendar
                </p>
              </div>
              <Switch
                id='appointment-confirmations'
                checked={localPreferences?.appointmentConfirmations || false}
                onCheckedChange={checked =>
                  handlePreferenceChange('appointmentConfirmations', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <Label
                  htmlFor='appointment-reminders'
                  className='text-sm font-medium'
                >
                  Lembretes de Consulta
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Receber lembretes 24h e 1h antes da consulta
                </p>
              </div>
              <Switch
                id='appointment-reminders'
                checked={localPreferences?.appointmentReminders || false}
                onCheckedChange={checked => handlePreferenceChange('appointmentReminders', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <Label
                  htmlFor='appointment-cancellations'
                  className='text-sm font-medium'
                >
                  Cancelamentos
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Receber notificação sobre cancelamentos
                </p>
              </div>
              <Switch
                id='appointment-cancellations'
                checked={localPreferences?.appointmentCancellations || false}
                onCheckedChange={checked =>
                  handlePreferenceChange('appointmentCancellations', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <Label
                  htmlFor='promotional-messages'
                  className='text-sm font-medium'
                >
                  Mensagens Promocionais
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Receber ofertas e promoções da clínica
                </p>
              </div>
              <Switch
                id='promotional-messages'
                checked={localPreferences?.promotionalMessages || false}
                onCheckedChange={checked => handlePreferenceChange('promotionalMessages', checked)}
                disabled={!localPreferences?.lgpdConsent}
              />
            </div>
          </div>
        </div>

        {!localPreferences?.lgpdConsent && (
          <div className='flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
            <AlertTriangle className='h-4 w-4 text-amber-600 mt-0.5' />
            <div className='text-sm text-amber-800'>
              <p className='font-medium'>Consentimento necessário</p>
              <p>
                Para receber notificações, é necessário autorizar o consentimento LGPD acima.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasChanges && (
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              className='flex-1'
            >
              {updatePreferences.isPending
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Button>
            <Button
              variant='outline'
              onClick={handleReset}
              disabled={updatePreferences.isPending}
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
