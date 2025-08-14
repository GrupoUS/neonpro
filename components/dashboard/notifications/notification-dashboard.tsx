/**
 * NotificationDashboard Component
 * 
 * Dashboard principal para gerenciamento de notificações
 * com analytics, envios e configurações.
 * 
 * @author APEX UI/UX Team
 * @version 1.0.0
 * @compliance WCAG 2.1 AA, LGPD
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { NotificationSender } from './notification-sender';
import { NotificationHistory } from './notification-history';
import { NotificationAnalytics } from './notification-analytics';
import { NotificationSettings } from './notification-settings';

// ================================================================================
// TYPES & INTERFACES
// ================================================================================

interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  deliveryRate: number;
  engagementRate: number;
}

interface RecentNotification {
  id: string;
  title: string;
  type: string;
  status: 'sent' | 'pending' | 'failed' | 'delivered';
  sentAt: string;
  channels: string[];
  recipientCount: number;
}

// ================================================================================
// COMPONENT
// ================================================================================

export function NotificationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ================================================================================
  // EFFECTS
  // ================================================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ================================================================================
  // DATA LOADING
  // ================================================================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const [statsResponse, historyResponse] = await Promise.all([
        fetch('/api/notifications/analytics?metric=overview&period=week'),
        fetch('/api/notifications/status?limit=5')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setRecentNotifications(historyData.notifications || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================================================================
  // RENDER HELPERS
  // ================================================================================

  const renderOverviewCards = () => (
    <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-4\">
      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
          <CardTitle className=\"text-sm font-medium\">Total Enviadas</CardTitle>
          <Icons.Send className=\"h-4 w-4 text-muted-foreground\" />
        </CardHeader>
        <CardContent>
          <div className=\"text-2xl font-bold\">{stats?.total || 0}</div>
          <p className=\"text-xs text-muted-foreground\">
            +12% em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
          <CardTitle className=\"text-sm font-medium\">Taxa de Entrega</CardTitle>
          <Icons.CheckCircle className=\"h-4 w-4 text-muted-foreground\" />
        </CardHeader>
        <CardContent>
          <div className=\"text-2xl font-bold\">{stats?.deliveryRate || 0}%</div>
          <p className=\"text-xs text-muted-foreground\">
            +2.1% em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
          <CardTitle className=\"text-sm font-medium\">Engajamento</CardTitle>
          <Icons.Users className=\"h-4 w-4 text-muted-foreground\" />
        </CardHeader>
        <CardContent>
          <div className=\"text-2xl font-bold\">{stats?.engagementRate || 0}%</div>
          <p className=\"text-xs text-muted-foreground\">
            +5.4% em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
          <CardTitle className=\"text-sm font-medium\">Pendentes</CardTitle>
          <Icons.Clock className=\"h-4 w-4 text-muted-foreground\" />
        </CardHeader>
        <CardContent>
          <div className=\"text-2xl font-bold\">{stats?.pending || 0}</div>
          <p className=\"text-xs text-muted-foreground\">
            {stats?.failed || 0} falharam
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecentNotifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notificações Recentes</CardTitle>
        <CardDescription>
          Últimas 5 notificações enviadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className=\"space-y-4\">
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className=\"flex items-center justify-between space-x-4\"
            >
              <div className=\"flex-1 space-y-1\">
                <p className=\"text-sm font-medium leading-none\">
                  {notification.title}
                </p>
                <p className=\"text-sm text-muted-foreground\">
                  {notification.type} • {notification.recipientCount} destinatários
                </p>
              </div>
              <div className=\"flex items-center space-x-2\">
                <div className=\"flex space-x-1\">
                  {notification.channels.map((channel) => (
                    <Badge key={channel} variant=\"outline\" className=\"text-xs\">
                      {channel}
                    </Badge>
                  ))}
                </div>
                <Badge
                  variant={
                    notification.status === 'delivered' ? 'default' :
                    notification.status === 'sent' ? 'secondary' :
                    notification.status === 'pending' ? 'outline' : 'destructive'
                  }
                >
                  {notification.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Ações comuns para gerenciamento de notificações
        </CardDescription>
      </CardHeader>
      <CardContent className=\"space-y-4\">
        <Button 
          className=\"w-full justify-start\" 
          variant=\"outline\"
          onClick={() => setActiveTab('send')}
        >
          <Icons.Send className=\"mr-2 h-4 w-4\" />
          Enviar Notificação
        </Button>
        
        <Button 
          className=\"w-full justify-start\" 
          variant=\"outline\"
          onClick={() => setActiveTab('analytics')}
        >
          <Icons.BarChart className=\"mr-2 h-4 w-4\" />
          Ver Analytics
        </Button>
        
        <Button 
          className=\"w-full justify-start\" 
          variant=\"outline\"
          onClick={() => setActiveTab('settings')}
        >
          <Icons.Settings className=\"mr-2 h-4 w-4\" />
          Configurações
        </Button>
      </CardContent>
    </Card>
  );

  // ================================================================================
  // MAIN RENDER
  // ================================================================================

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <Icons.Loader2 className=\"h-8 w-8 animate-spin\" />
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-3xl font-bold tracking-tight\">Sistema de Notificações</h2>
          <p className=\"text-muted-foreground\">
            Gerencie e monitore todas as notificações da clínica
          </p>
        </div>
        <Button onClick={loadDashboardData} variant=\"outline\" size=\"sm\">
          <Icons.RefreshCw className=\"mr-2 h-4 w-4\" />
          Atualizar
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className=\"space-y-4\">
        <TabsList className=\"grid w-full grid-cols-5\">
          <TabsTrigger value=\"overview\">Visão Geral</TabsTrigger>
          <TabsTrigger value=\"send\">Enviar</TabsTrigger>
          <TabsTrigger value=\"history\">Histórico</TabsTrigger>
          <TabsTrigger value=\"analytics\">Analytics</TabsTrigger>
          <TabsTrigger value=\"settings\">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value=\"overview\" className=\"space-y-4\">
          {renderOverviewCards()}
          
          <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-7\">
            <div className=\"col-span-4\">
              {renderRecentNotifications()}
            </div>
            <div className=\"col-span-3\">
              {renderQuickActions()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value=\"send\">
          <NotificationSender onNotificationSent={loadDashboardData} />
        </TabsContent>

        <TabsContent value=\"history\">
          <NotificationHistory />
        </TabsContent>

        <TabsContent value=\"analytics\">
          <NotificationAnalytics />
        </TabsContent>

        <TabsContent value=\"settings\">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}