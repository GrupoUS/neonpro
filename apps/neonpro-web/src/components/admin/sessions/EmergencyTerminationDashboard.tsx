/**
 * Emergency Termination Dashboard Component
 * Story 1.4 - Task 8: Emergency termination capabilities
 * 
 * Features:
 * - Real-time session monitoring
 * - Emergency termination controls
 * - Protocol management
 * - Audit log viewer
 * - Bulk termination operations
 * - Security incident response
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
  Progress,
  Separator
} from '@/components/ui';
import {
  AlertTriangle,
  Shield,
  Users,
  Monitor,
  Clock,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  AlertCircle,
  Play,
  Pause,
  Stop
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EmergencyTermination,
  EmergencyTerminationRequest,
  TerminationResult,
  EmergencyProtocol,
  TerminationAuditLog,
  EmergencyConfig
} from '@/lib/auth/emergency-termination';
import { UserRole } from '@/types/auth';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActiveSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  location: string;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface EmergencyTerminationDashboardProps {
  emergencyTermination: EmergencyTermination;
  currentUser: {
    id: string;
    role: UserRole;
    email: string;
  };
}

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
  patient: 'bg-gray-100 text-gray-800'
};

export function EmergencyTerminationDashboard({
  emergencyTermination,
  currentUser
}: EmergencyTerminationDashboardProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [protocols, setProtocols] = useState<EmergencyProtocol[]>([]);
  const [auditLogs, setAuditLogs] = useState<TerminationAuditLog[]>([]);
  const [config, setConfig] = useState<EmergencyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [terminationInProgress, setTerminationInProgress] = useState(false);
  const [showTerminationDialog, setShowTerminationDialog] = useState(false);
  const [showProtocolDialog, setShowProtocolDialog] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationType, setTerminationType] = useState<'single' | 'bulk' | 'all'>('single');
  const [preserveData, setPreserveData] = useState(true);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    highRiskSessions: 0,
    recentTerminations: 0,
    activeProtocols: 0
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load active sessions (mock data for now)
      const mockSessions: ActiveSession[] = [
        {
          sessionId: 'sess_001',
          userId: 'user_001',
          userEmail: 'admin@clinic.com',
          userName: 'Dr. Silva',
          userRole: 'manager',
          deviceId: 'dev_001',
          deviceName: 'Desktop - Chrome',
          ipAddress: '192.168.1.100',
          location: 'São Paulo, SP',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          isActive: true,
          riskLevel: 'low'
        },
        {
          sessionId: 'sess_002',
          userId: 'user_002',
          userEmail: 'nurse@clinic.com',
          userName: 'Enfermeira Ana',
          userRole: 'employee',
          deviceId: 'dev_002',
          deviceName: 'Mobile - Safari',
          ipAddress: '192.168.1.101',
          location: 'Rio de Janeiro, RJ',
          startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 1 * 60 * 1000),
          isActive: true,
          riskLevel: 'medium'
        },
        {
          sessionId: 'sess_003',
          userId: 'user_003',
          userEmail: 'suspicious@external.com',
          userName: 'Unknown User',
          userRole: 'patient',
          deviceId: 'dev_003',
          deviceName: 'Unknown Device',
          ipAddress: '203.0.113.1',
          location: 'Unknown Location',
          startedAt: new Date(Date.now() - 30 * 60 * 1000),
          lastActivity: new Date(Date.now() - 2 * 60 * 1000),
          isActive: true,
          riskLevel: 'critical'
        }
      ];
      
      setActiveSessions(mockSessions);
      
      // Load protocols
      const protocolsList = emergencyTermination.getProtocols();
      setProtocols(protocolsList);
      
      // Load recent audit logs
      const logs = await emergencyTermination.getTerminationLogs({
        limit: 50
      });
      setAuditLogs(logs);
      
      // Calculate stats
      setStats({
        totalSessions: mockSessions.length,
        highRiskSessions: mockSessions.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
        recentTerminations: logs.filter(log => 
          new Date(log.terminatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length,
        activeProtocols: protocolsList.filter(p => p.isActive).length
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [emergencyTermination]);

  const handleSessionSelection = (sessionId: string, selected: boolean) => {
    if (selected) {
      setSelectedSessions(prev => [...prev, sessionId]);
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === activeSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(activeSessions.map(s => s.sessionId));
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!terminationReason.trim()) {
      toast.error('Motivo da terminação é obrigatório');
      return;
    }

    try {
      setTerminationInProgress(true);
      
      const result = await emergencyTermination.terminateSession(
        sessionId,
        currentUser.id,
        terminationReason,
        preserveData
      );

      if (result.success) {
        toast.success(`Sessão terminada com sucesso`);
        setSelectedSessions(prev => prev.filter(id => id !== sessionId));
        await loadDashboardData();
      } else {
        toast.error(`Falha ao terminar sessão: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast.error('Erro ao terminar sessão');
    } finally {
      setTerminationInProgress(false);
      setShowTerminationDialog(false);
      setTerminationReason('');
    }
  };

  const handleBulkTermination = async () => {
    if (!terminationReason.trim()) {
      toast.error('Motivo da terminação é obrigatório');
      return;
    }

    if (selectedSessions.length === 0) {
      toast.error('Selecione pelo menos uma sessão');
      return;
    }

    try {
      setTerminationInProgress(true);
      
      const results = await Promise.all(
        selectedSessions.map(sessionId =>
          emergencyTermination.terminateSession(
            sessionId,
            currentUser.id,
            terminationReason,
            preserveData
          )
        )
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        toast.success(`${successful} sessões terminadas com sucesso`);
      }
      
      if (failed > 0) {
        toast.error(`${failed} sessões falharam ao terminar`);
      }
      
      setSelectedSessions([]);
      await loadDashboardData();
      
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
      toast.error('Erro ao terminar sessões');
    } finally {
      setTerminationInProgress(false);
      setShowTerminationDialog(false);
      setTerminationReason('');
    }
  };

  const handleTerminateAll = async () => {
    if (!terminationReason.trim()) {
      toast.error('Motivo da terminação é obrigatório');
      return;
    }

    try {
      setTerminationInProgress(true);
      
      const result = await emergencyTermination.terminateAllSessions(
        currentUser.id,
        terminationReason,
        preserveData
      );

      if (result.success) {
        toast.success(`Todas as sessões foram terminadas (${result.totalSuccessful} sessões)`);
        setSelectedSessions([]);
        await loadDashboardData();
      } else {
        toast.error(`Falha ao terminar todas as sessões: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast.error('Erro ao terminar todas as sessões');
    } finally {
      setTerminationInProgress(false);
      setShowTerminationDialog(false);
      setTerminationReason('');
    }
  };

  const handleExecuteProtocol = async (protocolId: string) => {
    try {
      setTerminationInProgress(true);
      
      const result = await emergencyTermination.executeProtocol(
        protocolId,
        currentUser.id,
        currentUser.role
      );

      if (result.success) {
        toast.success(`Protocolo executado com sucesso (${result.totalSuccessful} sessões terminadas)`);
        await loadDashboardData();
      } else {
        toast.error(`Falha ao executar protocolo: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Failed to execute protocol:', error);
      toast.error('Erro ao executar protocolo');
    } finally {
      setTerminationInProgress(false);
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Emergência</h1>
          <p className="text-muted-foreground">
            Monitoramento e controle de terminação de sessões
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {selectedSessions.length} selecionadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRiskSessions}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminações (24h)</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTerminations}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocolos Ativos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProtocols}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para execução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-red-600" />
            Ações de Emergência
          </CardTitle>
          <CardDescription>
            Controles rápidos para situações críticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {protocols.filter(p => p.isActive).map((protocol) => (
              <Button
                key={protocol.protocolId}
                variant={protocol.severity === 'critical' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleExecuteProtocol(protocol.protocolId)}
                disabled={terminationInProgress}
                className="flex items-center"
              >
                {getSeverityIcon(protocol.severity)}
                <span className="ml-2">{protocol.name}</span>
              </Button>
            ))}
            
            <Dialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={terminationInProgress}
                  onClick={() => {
                    setTerminationType('all');
                    setShowTerminationDialog(true);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Terminar Todas as Sessões
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="audit">Log de Auditoria</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sessões Ativas</CardTitle>
                  <CardDescription>
                    {activeSessions.length} sessões ativas no sistema
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSessions.length > 0 && (
                    <Dialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={terminationInProgress}
                          onClick={() => {
                            setTerminationType('bulk');
                            setShowTerminationDialog(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Terminar Selecionadas ({selectedSessions.length})
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedSessions.length === activeSessions.length && activeSessions.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.sessionId}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.sessionId)}
                            onChange={(e) => handleSessionSelection(session.sessionId, e.target.checked)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{session.userName}</span>
                            <span className="text-sm text-muted-foreground">{session.userEmail}</span>
                            <Badge className={`w-fit mt-1 ${ROLE_COLORS[session.userRole]}`}>
                              {session.userRole}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{session.deviceName}</span>
                            <span className="text-sm text-muted-foreground">{session.ipAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{session.location}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              Iniciada {formatDistanceToNow(session.startedAt, { addSuffix: true, locale: ptBR })}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Última atividade {formatDistanceToNow(session.lastActivity, { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRiskLevelIcon(session.riskLevel)}
                            <Badge className={SEVERITY_COLORS[session.riskLevel]}>
                              {session.riskLevel}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // View session details
                                toast.info('Funcionalidade em desenvolvimento');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={terminationInProgress}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Terminar Sessão</DialogTitle>
                                  <DialogDescription>
                                    Tem certeza que deseja terminar a sessão de {session.userName}?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reason">Motivo da terminação</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="Descreva o motivo da terminação..."
                                      value={terminationReason}
                                      onChange={(e) => setTerminationReason(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="preserve-data"
                                      checked={preserveData}
                                      onCheckedChange={setPreserveData}
                                    />
                                    <Label htmlFor="preserve-data">Preservar dados da sessão</Label>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleTerminateSession(session.sessionId)}
                                    disabled={terminationInProgress || !terminationReason.trim()}
                                  >
                                    {terminationInProgress ? (
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Ban className="h-4 w-4 mr-2" />
                                    )}
                                    Terminar Sessão
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Protocolos de Emergência</CardTitle>
                  <CardDescription>
                    Protocolos automatizados para resposta a incidentes
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProtocolDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Novo Protocolo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {protocols.map((protocol) => (
                  <Card key={protocol.protocolId} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={SEVERITY_COLORS[protocol.severity]}>
                            {protocol.severity}
                          </Badge>
                          <h3 className="font-semibold">{protocol.name}</h3>
                          {protocol.automaticTrigger && (
                            <Badge variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                          {!protocol.isActive && (
                            <Badge variant="secondary">
                              <Pause className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteProtocol(protocol.protocolId)}
                            disabled={!protocol.isActive || terminationInProgress}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Executar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {protocol.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Condições de Ativação:</strong>
                          <ul className="list-disc list-inside mt-1 text-muted-foreground">
                            {protocol.triggerConditions.map((condition, index) => (
                              <li key={index}>{condition}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <strong>Ações:</strong>
                          <ul className="list-disc list-inside mt-1 text-muted-foreground">
                            {protocol.actions.terminateAllSessions && <li>Terminar todas as sessões</li>}
                            {protocol.actions.lockAccounts && <li>Bloquear contas</li>}
                            {protocol.actions.disableNewLogins && <li>Desabilitar novos logins</li>}
                            {protocol.actions.notifyAdministrators && <li>Notificar administradores</li>}
                          </ul>
                        </div>
                      </div>
                      
                      {protocol.lastTriggered && (
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-sm text-muted-foreground">
                            Última execução: {format(protocol.lastTriggered, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Log de Auditoria</CardTitle>
                  <CardDescription>
                    Histórico de terminações de sessão
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export audit logs
                    toast.info('Funcionalidade de exportação em desenvolvimento');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Iniciado Por</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.logId}>
                        <TableCell>
                          {format(log.terminatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.userId}</span>
                            <span className="text-sm text-muted-foreground">{log.sessionId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.initiatedBy}</span>
                            <Badge className={`w-fit ${ROLE_COLORS[log.initiatorRole]}`}>
                              {log.initiatorRole}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.terminationType}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.reason}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={log.success ? 'text-green-600' : 'text-red-600'}>
                              {log.success ? 'Sucesso' : 'Falha'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Emergência</CardTitle>
              <CardDescription>
                Configure as políticas de terminação de emergência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configurações Avançadas</AlertTitle>
                  <AlertDescription>
                    As configurações de emergência devem ser ajustadas apenas por administradores experientes.
                    Mudanças inadequadas podem comprometer a segurança do sistema.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configurações em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Interface de configuração será implementada na próxima versão
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Termination Dialog */}
      <Dialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              {terminationType === 'all' ? 'Terminar Todas as Sessões' : 
               terminationType === 'bulk' ? `Terminar ${selectedSessions.length} Sessões` : 
               'Terminar Sessão'}
            </DialogTitle>
            <DialogDescription>
              {terminationType === 'all' ? 
                'Esta ação irá terminar TODAS as sessões ativas no sistema. Esta ação não pode ser desfeita.' :
                terminationType === 'bulk' ?
                `Esta ação irá terminar ${selectedSessions.length} sessões selecionadas. Esta ação não pode ser desfeita.` :
                'Esta ação irá terminar a sessão selecionada. Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="termination-reason">Motivo da terminação *</Label>
              <Textarea
                id="termination-reason"
                placeholder="Descreva o motivo da terminação de emergência..."
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="preserve-session-data"
                  checked={preserveData}
                  onCheckedChange={setPreserveData}
                />
                <Label htmlFor="preserve-session-data">Preservar dados das sessões</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-affected-users"
                  checked={notifyUsers}
                  onCheckedChange={setNotifyUsers}
                />
                <Label htmlFor="notify-affected-users">Notificar usuários afetados</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerminationDialog(false);
                setTerminationReason('');
              }}
              disabled={terminationInProgress}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (terminationType === 'all') {
                  handleTerminateAll();
                } else if (terminationType === 'bulk') {
                  handleBulkTermination();
                }
              }}
              disabled={terminationInProgress || !terminationReason.trim()}
            >
              {terminationInProgress ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              {terminationType === 'all' ? 'Terminar Todas' : 
               terminationType === 'bulk' ? 'Terminar Selecionadas' : 
               'Terminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
