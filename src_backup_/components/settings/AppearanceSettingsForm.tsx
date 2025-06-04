
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppearanceSettings } from '@/types/settings';
import { Palette, Globe, Calendar, Clock, Sidebar } from 'lucide-react';

interface AppearanceSettingsFormProps {
  settings: AppearanceSettings | null;
  onUpdate: (updates: Partial<AppearanceSettings>) => void;
}

export const AppearanceSettingsForm: React.FC<AppearanceSettingsFormProps> = ({
  settings,
  onUpdate,
}) => {
  const handleSelectChange = (field: keyof AppearanceSettings, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleSwitchChange = (field: keyof AppearanceSettings, value: boolean) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Aparência
        </CardTitle>
        <CardDescription>
          Personalize a aparência e o comportamento da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema
          </h4>
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <Label>Modo de cores:</Label>
              <Select
                value={settings?.theme || 'system'}
                onValueChange={(value) => handleSelectChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Localização
          </h4>
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <Label>Idioma:</Label>
              <Select
                value={settings?.language || 'pt-BR'}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuso horário:</Label>
              <Select
                value={settings?.timezone || 'America/Sao_Paulo'}
                onValueChange={(value) => handleSelectChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Formatos
          </h4>
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <Label>Formato de data:</Label>
              <Select
                value={settings?.date_format || 'DD/MM/YYYY'}
                onValueChange={(value) => handleSelectChange('date_format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                  <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato de hora:</Label>
              <Select
                value={settings?.time_format || '24h'}
                onValueChange={(value) => handleSelectChange('time_format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                  <SelectItem value="24h">24 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Sidebar className="w-4 h-4" />
            Interface
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sidebar-collapsed">Barra lateral recolhida por padrão</Label>
              <Switch
                id="sidebar-collapsed"
                checked={settings?.sidebar_collapsed || false}
                onCheckedChange={(checked) => handleSwitchChange('sidebar_collapsed', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
