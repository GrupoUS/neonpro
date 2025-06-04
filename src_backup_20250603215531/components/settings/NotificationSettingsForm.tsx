
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationSettings } from '@/types/settings';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationSettingsFormProps {
  settings: NotificationSettings | null;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
}

export const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  settings,
  onUpdate,
}) => {
  const handleSwitchChange = (field: keyof NotificationSettings, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleReminderTimeChange = (value: string) => {
    onUpdate({ reminder_hours_before: parseInt(value) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Notificações por Email
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-appointments">Novos agendamentos</Label>
              <Switch
                id="email-appointments"
                checked={settings?.email_appointments || false}
                onCheckedChange={(checked) => handleSwitchChange('email_appointments', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-reminders">Lembretes de consulta</Label>
              <Switch
                id="email-reminders"
                checked={settings?.email_reminders || false}
                onCheckedChange={(checked) => handleSwitchChange('email_reminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-marketing">Comunicações de marketing</Label>
              <Switch
                id="email-marketing"
                checked={settings?.email_marketing || false}
                onCheckedChange={(checked) => handleSwitchChange('email_marketing', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notificações por SMS
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-appointments">Novos agendamentos</Label>
              <Switch
                id="sms-appointments"
                checked={settings?.sms_appointments || false}
                onCheckedChange={(checked) => handleSwitchChange('sms_appointments', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-reminders">Lembretes de consulta</Label>
              <Switch
                id="sms-reminders"
                checked={settings?.sms_reminders || false}
                onCheckedChange={(checked) => handleSwitchChange('sms_reminders', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Outras Notificações
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Notificações push</Label>
              <Switch
                id="push-notifications"
                checked={settings?.push_notifications || false}
                onCheckedChange={(checked) => handleSwitchChange('push_notifications', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Enviar lembretes com antecedência de:</Label>
              <Select
                value={settings?.reminder_hours_before?.toString() || '24'}
                onValueChange={handleReminderTimeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
