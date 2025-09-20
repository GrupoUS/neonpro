import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Sync, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  RefreshCw,
  Shield
} from 'lucide-react';

interface SyncSettingsProps {
  userId: string;
  clinicId: string;
  integrationId?: string;
}

export function SyncSettings({ userId, clinicId, integrationId }: SyncSettingsProps) {
  const [autoSync, setAutoSync] = useState(true);
  const [bidirectional, setBidirectional] = useState(true);
  const [syncInterval, setSyncInterval] = useState('30');

  // Mock query for integration settings
  const { data: integration, isLoading } = useQuery({
    queryKey: ['google-calendar-integration', userId, clinicId],
    queryFn: async () => {
      // In real app, fetch from API
      return {
        syncEnabled: true,
        autoSync: true,
        bidirectional: true,
        syncCalendarId: 'primary',
        syncTimezone: 'America/Sao_Paulo',
        lastSyncAt: new Date(),
        lastError: null,
        errorCount: 0,
      };
    },
    enabled: !!integrationId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // In real app, update via API
      return { success: true };
    },
    onSuccess: () => {
      // Show success message
    },
  });

  const syncNowMutation = useMutation({
    mutationFn: async () => {
      // In real app, trigger sync via API
      return { success: true, synced: 5 };
    },
    onSuccess: () => {
      // Show success message
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      autoSync,
      bidirectional,
      syncInterval: parseInt(syncInterval),
    });
  };

  const handleSyncNow = () => {
    syncNowMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações de Sincronização</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações de Sincronização</span>
        </CardTitle>
        <CardDescription>
          Configure como seus compromissos são sincronizados com o Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sync Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              integration?.syncEnabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {integration?.syncEnabled ? (
                <Sync className="h-4 w-4 text-green-600" />
              ) : (
                <Sync className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {integration?.syncEnabled ? 'Sincronização Ativa' : 'Sincronização Inativa'}
              </p>
              {integration?.lastSyncAt && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Última sincronização: {integration.lastSyncAt.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleSyncNow}
            disabled={syncNowMutation.isPending}
            variant="outline"
            size="sm"
          >
            {syncNowMutation.isPending && (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sincronizar Agora
          </Button>
        </div>

        {/* Sync Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Sincronização Automática</Label>
              <p className="text-sm text-gray-500">
                Sincronizar compromissos automaticamente
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bidirectional">Sincronização Bidirecional</Label>
              <p className="text-sm text-gray-500">
                Alterações no Google Calendar refletem no NeonPro
              </p>
            </div>
            <Switch
              id="bidirectional"
              checked={bidirectional}
              onCheckedChange={setBidirectional}
            />
          </div>

          {autoSync && (
            <div className="space-y-2">
              <Label htmlFor="sync-interval">Intervalo de Sincronização</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="360">6 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Calendar Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configurações do Calendário</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Calendário de Destino</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {integration?.syncCalendarId || 'Calendário Principal'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fuso Horário</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {integration?.syncTimezone || 'America/Sao_Paulo'}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Info */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Todos os dados são sincronizados de forma segura e em conformidade com a LGPD. 
            Os compromissos são marcados como privados no Google Calendar.
          </AlertDescription>
        </Alert>

        {/* Error Status */}
        {integration?.lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Erro na última sincronização</p>
              <p className="text-sm">{integration.lastError}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending && (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar Configurações
          </Button>
        </div>

        {/* Sync Results */}
        {syncNowMutation.isSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Sincronização concluída com sucesso! 
              {syncNowMutation.data?.synced && (
                <Badge variant="secondary" className="ml-2">
                  {syncNowMutation.data.synced} compromissos sincronizados
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}