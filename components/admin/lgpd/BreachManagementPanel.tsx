'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Bell,
  FileText,
  Users,
  Calendar,
  Activity,
  Zap,
  Mail,
  Phone
} from 'lucide-react';
import { useBreachManagement } from '@/hooks/useLGPD';
import { BreachIncident, BreachSeverity, BreachStatus, BreachType } from '@/types/lgpd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Breach Management Panel
 * 
 * Comprehensive panel for managing data breach incidents including:
 * - Incident reporting and tracking
 * - Severity assessment and classification
 * - Authority notification management
 * - Affected users notification
 * - Incident response workflow
 * - Compliance timeline monitoring
 */
export function BreachManagementPanel() {
  const {
    incidents,
    loading,
    error,
    loadIncidents,
    reportIncident,
    updateIncident,
    notifyAuthorities,
    notifyAffectedUsers
  } = useBreachManagement();

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<BreachIncident | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<BreachSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BreachStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BreachType | 'all'>('all');

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    type: 'unauthorized_access' as BreachType,
    severity: 'medium' as BreachSeverity,
    affectedUsersCount: 0,
    dataTypes: [] as string[],
    discoveredAt: new Date().toISOString().slice(0, 16),
    containedAt: '',
    rootCause: '',
    mitigationSteps: ''
  });

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    
    return matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityBadge = (severity: BreachSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Crítica</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Média</Badge>;
      case 'low':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Baixa</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: BreachStatus) => {
    switch (status) {
      case 'detected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Detectado</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800"><Activity className="h-3 w-3 mr-1" />Investigando</Badge>;
      case 'contained':
        return <Badge className="bg-yellow-100 text-yellow-800"><Shield className="h-3 w-3 mr-1" />Contido</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case 'closed':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: BreachType) => {
    const labels: Record<BreachType, string> = {
      'unauthorized_access': 'Acesso Não Autorizado',
      'data_theft': 'Roubo de Dados',
      'system_compromise': 'Comprometimento de Sistema',
      'human_error': 'Erro Humano',
      'malware': 'Malware',
      'phishing': 'Phishing',
      'insider_threat': 'Ameaça Interna',
      'third_party': 'Terceiros'
    };
    return labels[type] || type;
  };

  const handleReportIncident = async () => {
    try {
      await reportIncident({
        ...newIncident,
        discoveredAt: new Date(newIncident.discoveredAt),
        containedAt: newIncident.containedAt ? new Date(newIncident.containedAt) : undefined
      });
      await loadIncidents();
      setShowReportDialog(false);
      // Reset form
      setNewIncident({
        title: '',
        description: '',
        type: 'unauthorized_access',
        severity: 'medium',
        affectedUsersCount: 0,
        dataTypes: [],
        discoveredAt: new Date().toISOString().slice(0, 16),
        containedAt: '',
        rootCause: '',
        mitigationSteps: ''
      });
    } catch (error) {
      console.error('Error reporting incident:', error);
    }
  };

  const handleNotifyAuthorities = async (incident: BreachIncident) => {
    try {
      await notifyAuthorities(incident.id);
      await loadIncidents();
    } catch (error) {
      console.error('Error notifying authorities:', error);
    }
  };

  const handleNotifyUsers = async (incident: BreachIncident) => {
    try {
      await notifyAffectedUsers(incident.id);
      await loadIncidents();
    } catch (error) {
      console.error('Error notifying users:', error);
    }
  };

  const getIncidentStats = () => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.severity === 'critical').length;
    const open = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const requiresNotification = incidents.filter(i => 
      (i.severity === 'critical' || i.severity === 'high') && 
      !i.authoritiesNotifiedAt
    ).length;
    
    return { total, critical, open, resolved, requiresNotification };
  };

  const getOverdueNotifications = () => {
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    
    return incidents.filter(incident => 
      (incident.severity === 'critical' || incident.severity === 'high') &&
      !incident.authoritiesNotifiedAt &&
      new Date(incident.discoveredAt) < seventyTwoHoursAgo
    );
  };

  const stats = getIncidentStats();
  const overdueNotifications = getOverdueNotifications();

  if (loading && incidents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando incidentes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Incidentes de Violação</h2>
          <p className="text-muted-foreground">
            Monitore e gerencie incidentes de violação de dados pessoais
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadIncidents} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowReportDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Reportar Incidente
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overdue Notifications Alert */}
      {overdueNotifications.length > 0 && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Notificações em Atraso</AlertTitle>
          <AlertDescription>
            {overdueNotifications.length} incidente(s) crítico(s) ou alto(s) não foram notificados às autoridades dentro de 72 horas. 
            Notifique imediatamente para manter a conformidade LGPD.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente Notificação</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.requiresNotification}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as BreachSeverity | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as severidades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BreachStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="detected">Detectado</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="contained">Contido</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as BreachType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="unauthorized_access">Acesso Não Autorizado</SelectItem>
                  <SelectItem value="data_theft">Roubo de Dados</SelectItem>
                  <SelectItem value="system_compromise">Comprometimento de Sistema</SelectItem>
                  <SelectItem value="human_error">Erro Humano</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="insider_threat">Ameaça Interna</SelectItem>
                  <SelectItem value="third_party">Terceiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incidentes ({filteredIncidents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usuários Afetados</TableHead>
                  <TableHead>Descoberto em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const isOverdue = overdueNotifications.some(o => o.id === incident.id);
                  
                  return (
                    <TableRow key={incident.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {incident.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeLabel(incident.type)}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{incident.affectedUsersCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(incident.discoveredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          {(incident.severity === 'critical' || incident.severity === 'high') && 
                           !incident.authoritiesNotifiedAt && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNotifyAuthorities(incident)}
                              className={isOverdue ? 'border-red-500 text-red-600' : ''}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              ANPD
                            </Button>
                          )}
                          
                          {!incident.usersNotifiedAt && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNotifyUsers(incident)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Usuários
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Incident Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reportar Novo Incidente</DialogTitle>
            <DialogDescription>
              Registre um novo incidente de violação de dados pessoais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Incidente</Label>
                <Input
                  id="title"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Breve descrição do incidente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={newIncident.type} onValueChange={(value) => setNewIncident({ ...newIncident, type: value as BreachType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unauthorized_access">Acesso Não Autorizado</SelectItem>
                    <SelectItem value="data_theft">Roubo de Dados</SelectItem>
                    <SelectItem value="system_compromise">Comprometimento de Sistema</SelectItem>
                    <SelectItem value="human_error">Erro Humano</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="insider_threat">Ameaça Interna</SelectItem>
                    <SelectItem value="third_party">Terceiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                placeholder="Descreva o incidente em detalhes..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="severity">Severidade</Label>
                <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({ ...newIncident, severity: value as BreachSeverity })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="affectedUsers">Usuários Afetados</Label>
                <Input
                  id="affectedUsers"
                  type="number"
                  value={newIncident.affectedUsersCount}
                  onChange={(e) => setNewIncident({ ...newIncident, affectedUsersCount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discoveredAt">Data de Descoberta</Label>
                <Input
                  id="discoveredAt"
                  type="datetime-local"
                  value={newIncident.discoveredAt}
                  onChange={(e) => setNewIncident({ ...newIncident, discoveredAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReportIncident} disabled={!newIncident.title || !newIncident.description}>
                Reportar Incidente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Incident Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              Detalhes completos do incidente de violação
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tipo:</strong> {getTypeLabel(selectedIncident.type)}</div>
                    <div><strong>Severidade:</strong> {getSeverityBadge(selectedIncident.severity)}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedIncident.status)}</div>
                    <div><strong>Usuários Afetados:</strong> {selectedIncident.affectedUsersCount}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Descoberto:</strong> {format(new Date(selectedIncident.discoveredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                    {selectedIncident.containedAt && (
                      <div><strong>Contido:</strong> {format(new Date(selectedIncident.containedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                    )}
                    {selectedIncident.authoritiesNotifiedAt && (
                      <div><strong>ANPD Notificada:</strong> {format(new Date(selectedIncident.authoritiesNotifiedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                    )}
                    {selectedIncident.usersNotifiedAt && (
                      <div><strong>Usuários Notificados:</strong> {format(new Date(selectedIncident.usersNotifiedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>
              
              {selectedIncident.rootCause && (
                <div>
                  <h4 className="font-medium mb-2">Causa Raiz</h4>
                  <p className="text-sm text-muted-foreground">{selectedIncident.rootCause}</p>
                </div>
              )}
              
              {selectedIncident.mitigationSteps && (
                <div>
                  <h4 className="font-medium mb-2">Medidas de Mitigação</h4>
                  <p className="text-sm text-muted-foreground">{selectedIncident.mitigationSteps}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
