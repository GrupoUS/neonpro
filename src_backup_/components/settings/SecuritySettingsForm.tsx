
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecuritySettings } from '@/types/settings';
import { Shield, Lock, Clock, Key } from 'lucide-react';

interface SecuritySettingsFormProps {
  settings: SecuritySettings | null;
  onUpdate: (updates: Partial<SecuritySettings>) => void;
}

export const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  settings,
  onUpdate,
}) => {
  const handleSwitchChange = (field: keyof SecuritySettings, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleSessionTimeoutChange = (value: string) => {
    onUpdate({ session_timeout_minutes: parseInt(value) });
  };

  const handlePasswordChange = () => {
    // TODO: Implementar mudança de senha
    console.log('Implementar mudança de senha');
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      // TODO: Implementar configuração de 2FA
      console.log('Implementar configuração de 2FA');
    } else {
      onUpdate({ two_factor_enabled: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Segurança
        </CardTitle>
        <CardDescription>
          Gerencie suas configurações de segurança e privacidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Autenticação
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">Autenticação de dois fatores</Label>
              <Switch
                id="two-factor"
                checked={settings?.two_factor_enabled || false}
                onCheckedChange={handleTwoFactorToggle}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-notifications">Notificar sobre novos logins</Label>
              <Switch
                id="login-notifications"
                checked={settings?.login_notifications || false}
                onCheckedChange={(checked) => handleSwitchChange('login_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Alterar senha</Label>
              <Button variant="outline" size="sm" onClick={handlePasswordChange}>
                <Key className="w-4 h-4 mr-2" />
                Alterar
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Sessão
          </h4>
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <Label>Timeout de sessão:</Label>
              <Select
                value={settings?.session_timeout_minutes?.toString() || '60'}
                onValueChange={handleSessionTimeoutChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {settings?.password_changed_at && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Última alteração de senha: {new Date(settings.password_changed_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
