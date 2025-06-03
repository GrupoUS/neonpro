
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm';
import { SecuritySettingsForm } from '@/components/settings/SecuritySettingsForm';
import { AppearanceSettingsForm } from '@/components/settings/AppearanceSettingsForm';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Shield, Palette } from 'lucide-react';

const Configuracoes: React.FC = () => {
  const {
    notificationSettings,
    securitySettings,
    appearanceSettings,
    isLoading,
    updateNotificationSettings,
    updateSecuritySettings,
    updateAppearanceSettings,
  } = useSettings();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettingsForm
            settings={notificationSettings}
            onUpdate={updateNotificationSettings}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsForm
            settings={securitySettings}
            onUpdate={updateSecuritySettings}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettingsForm
            settings={appearanceSettings}
            onUpdate={updateAppearanceSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
