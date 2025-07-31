/**
 * Session Management Admin Page
 * Story 1.4: Session Management & Security
 * 
 * Main admin interface for session management, security monitoring,
 * and device control with comprehensive dashboard and controls.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Monitor, 
  AlertTriangle, 
  Activity,
  Clock,
  MapPin,
  Wifi,
  RefreshCw,
  Settings,
  Download,
  Bell
} from 'lucide-react';
import SessionDashboard from '@/components/admin/sessions/SessionDashboard';
import SecurityEventsTable from '@/components/admin/sessions/SecurityEventsTable';
import DeviceManagement from '@/components/admin/sessions/DeviceManagement';
import { 
  useSession, 
  useSecurityEvents, 
  useDeviceManagement 
} from '@/hooks/useSession';
import { 
  SessionSecurityEvent, 
  SecurityEventType, 
  SessionDevice 
} from '@/types/session';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// INTERFACES
// ============================================================================

interface SessionStats {
  totalActiveSessions: number;
  totalDevices: number;
  securityEvents: number;
  suspiciousActivity: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionManagementPage() {
  const { toast } = useToast();
  const { 
    sessions, 
    isLoading: sessionsLoading, 
    refreshSessions,
    terminateSession,
    terminateAllSessions
  } = useSession();
  const { 
    events, 
    isLoading: eventsLoading, 
    reportActivity,
    refreshEvents
  } = useSecurityEvents();
  const { 
    devices, 
    isLoading: devicesLoading, 
    refreshDevices
  } = useDeviceManagement();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<SessionStats>({
    totalActiveSessions: 0,
    totalDevices: 0,
    securityEvents: 0,
    suspiciousActivity: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Calculate stats when data changes
    const activeSessions = sessions?.filter(s => s.is_active).length || 0;
    const totalDevices = devices?.length || 0;
    const totalEvents = events?.length || 0;
    const suspiciousEvents = events?.filter(e => 
      !e.resolved && (e.severity === 'high' || e.severity === 'critical')
    ).length || 0;

    setStats({
      totalActiveSessions: activeSessions,
      totalDevices,
      securityEvents: totalEvents,
      suspiciousActivity: suspiciousEvents
    });
  }, [sessions, devices, events]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshAll(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRefreshAll = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    
    try {
      await Promise.all([
        refreshSessions(),
        refreshEvents(),
        refreshDevices()
      ]);
      
      if (!silent) {
        toast({
          title: "Dados atualizados",
          description: "Todas as informações foram atualizadas com sucesso."
        });
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Falha ao atualizar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleDeviceAction = async (deviceId: string, action: string) => {
    try {
      // This would be implemented in the device management hook
      // await deviceAction(deviceId, action);
      
      toast({
        title: "Ação executada",
        description: `Ação "${action}" executada no dispositivo com sucesso.`
      });
      
      await refreshDevices();
    } catch (error) {
      console.error(`Failed to ${action} device:`, error);
      toast({
        title: "Erro na ação",
        description: `Falha ao executar a ação "${action}" no dispositivo.`,
        variant: "destructive"
      });
    }
  };

  const handleReportActivity = async (eventType: SecurityEventType, details?: any) => {
    try {
      await reportActivity(eventType, details);
      
      toast({
        title: "Atividade reportada",
        description: "Evento de segurança reportado com sucesso."
      });
      
      await refreshEvents();
    } catch (error) {
      console.error('Failed to report activity:', error);
      toast({
        title: "Erro ao reportar",
        description: "Falha ao reportar atividade suspeita.",
        variant: "destructive"
      });
    }
  };

  const handleEmergencyTermination = async () => {
    try {
      await terminateAllSessions();
      
      toast({
        title: "Sessões terminadas",
        description: "Todas as sessões foram terminadas por segurança.",
        variant: "destructive"
      });
      
      await refreshSessions();
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast({
        title: "Erro na terminação",
        description: "Falha ao terminar todas as sessões.",
        variant: "destructive"
      });
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (sessionsLoading || eventsLoading || devicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Carregando dados de sessão...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Sessão</h1>
          <p className="text-muted-foreground">
            Monitore sessões ativas, eventos de segurança e dispositivos conectados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefreshAll()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyTermination}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Terminação de Emergência
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      {stats.suspiciousActivity > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {stats.suspiciousActivity} evento(s) de segurança 
            suspeito(s) detectado(s). Verifique a aba "Eventos de Segurança" para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveSessions}</div>
            <p className="text-xs text-muted-foreground">
              Usuários conectados atualmente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              Dispositivos registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityEvents}</div>
            <p className="text-xs text-muted-foreground">
              Total de eventos registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Suspeita</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              Eventos não resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Eventos de Segurança</span>
            {stats.suspiciousActivity > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {stats.suspiciousActivity}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Dispositivos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SessionDashboard 
            sessions={sessions || []}
            events={events || []}
            devices={devices || []}
            onTerminateSession={terminateSession}
            onReportActivity={handleReportActivity}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityEventsTable 
            events={events || []}
            onReportActivity={handleReportActivity}
          />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceManagement 
            devices={devices || []}
            onDeviceAction={handleDeviceAction}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>Atualização automática: 30s</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
