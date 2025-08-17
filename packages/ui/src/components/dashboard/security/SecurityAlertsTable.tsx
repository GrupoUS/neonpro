'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@neonpro/ui/badge';
import { Button } from '@neonpro/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui/card';
import { Input } from '@neonpro/ui/input';
import { Label } from '@neonpro/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neonpro/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@neonpro/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@neonpro/ui/dialog';
import { AlertTriangle, Eye, Search, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  source_ip?: string;
  user_id?: string;
  session_id?: string;
  alert_data?: Record<string, any>;
  affected_resources?: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  response_required: boolean;
  escalation_level: number;
  assigned_to?: string;
  acknowledged_by?: string;
  resolved_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export function SecurityAlertsTable() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/alerts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      toast.error('Erro ao carregar alertas de segurança');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }

      await fetchAlerts();
      toast.success('Status do alerta atualizado com sucesso');
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error('Erro ao atualizar status do alerta');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'destructive';
      case 'acknowledged':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'dismissed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source_ip?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando alertas de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar alertas</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por título, descrição, tipo ou IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="severity-filter">Severidade</Label>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="acknowledged">Reconhecido</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="dismissed">Descartado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchAlerts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Prioridade</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum alerta de segurança encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className={alert.status === 'active' ? 'bg-red-50/50' : ''}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(alert.priority)}
                      <Badge variant={getSeverityColor(alert.priority)}>
                        {alert.priority === 'urgent' && 'URGENTE'}
                        {alert.priority === 'high' && 'ALTA'}
                        {alert.priority === 'medium' && 'MÉDIA'}
                        {alert.priority === 'low' && 'BAIXA'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        {alert.response_required && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{alert.title}</span>
                      </div>
                      {alert.description && (
                        <div className="text-sm text-muted-foreground">
                          {alert.description.length > 50 
                            ? `${alert.description.substring(0, 50)}...`
                            : alert.description
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{alert.alert_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity === 'critical' && 'CRÍTICA'}
                      {alert.severity === 'high' && 'ALTA'}
                      {alert.severity === 'medium' && 'MÉDIA'}
                      {alert.severity === 'low' && 'BAIXA'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.status)}
                      <Badge variant={getStatusColor(alert.status)}>
                        {alert.status === 'active' && 'Ativo'}
                        {alert.status === 'acknowledged' && 'Reconhecido'}
                        {alert.status === 'resolved' && 'Resolvido'}
                        {alert.status === 'dismissed' && 'Descartado'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getPriorityIcon(alert.priority)}
                              <span>{alert.title}</span>
                              {alert.response_required && (
                                <Badge variant="destructive">Resposta Necessária</Badge>
                              )}
                            </DialogTitle>
                            <DialogDescription>
                              Detalhes do alerta de segurança #{alert.id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAlert && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo de Alerta</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">{selectedAlert.alert_type}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Severidade</Label>
                                  <div className="mt-1">
                                    <Badge variant={getSeverityColor(selectedAlert.severity)}>
                                      {selectedAlert.severity === 'critical' && 'CRÍTICA'}
                                      {selectedAlert.severity === 'high' && 'ALTA'}
                                      {selectedAlert.severity === 'medium' && 'MÉDIA'}
                                      {selectedAlert.severity === 'low' && 'BAIXA'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Prioridade</Label>
                                  <div className="mt-1 flex items-center space-x-2">
                                    {getPriorityIcon(selectedAlert.priority)}
                                    <Badge variant={getSeverityColor(selectedAlert.priority)}>
                                      {selectedAlert.priority === 'urgent' && 'URGENTE'}
                                      {selectedAlert.priority === 'high' && 'ALTA'}
                                      {selectedAlert.priority === 'medium' && 'MÉDIA'}
                                      {selectedAlert.priority === 'low' && 'BAIXA'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1 flex items-center space-x-2">
                                    {getStatusIcon(selectedAlert.status)}
                                    <Badge variant={getStatusColor(selectedAlert.status)}>
                                      {selectedAlert.status === 'active' && 'Ativo'}
                                      {selectedAlert.status === 'acknowledged' && 'Reconhecido'}
                                      {selectedAlert.status === 'resolved' && 'Resolvido'}
                                      {selectedAlert.status === 'dismissed' && 'Descartado'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>IP de Origem</Label>
                                  <div className="mt-1">
                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                      {selectedAlert.source_ip || 'N/A'}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label>Nível de Escalação</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">Nível {selectedAlert.escalation_level}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Criado em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(new Date(selectedAlert.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                  </div>
                                </div>
                                {selectedAlert.acknowledged_at && (
                                  <div>
                                    <Label>Reconhecido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(new Date(selectedAlert.acknowledged_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                    </div>
                                  </div>
                                )}
                                {selectedAlert.resolved_at && (
                                  <div>
                                    <Label>Resolvido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(new Date(selectedAlert.resolved_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                    </div>
                                  </div>
                                )}
                                {selectedAlert.assigned_to && (
                                  <div>
                                    <Label>Atribuído para</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedAlert.assigned_to}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {selectedAlert.description && (
                                <div>
                                  <Label>Descrição</Label>
                                  <div className="mt-1 text-sm bg-muted p-3 rounded">
                                    {selectedAlert.description}
                                  </div>
                                </div>
                              )}

                              {selectedAlert.alert_data && Object.keys(selectedAlert.alert_data).length > 0 && (
                                <div>
                                  <Label>Dados do Alerta</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedAlert.alert_data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {selectedAlert.affected_resources && Object.keys(selectedAlert.affected_resources).length > 0 && (
                                <div>
                                  <Label>Recursos Afetados</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedAlert.affected_resources, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 pt-4">
                                <Label>Atualizar Status:</Label>
                                <Select
                                  value={selectedAlert.status}
                                  onValueChange={(value) => {
                                    handleUpdateStatus(selectedAlert.id, value);
                                    setSelectedAlert({ ...selectedAlert, status: value as any });
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="acknowledged">Reconhecido</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                    <SelectItem value="dismissed">Descartado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando {filteredAlerts.length} de {alerts.length} alertas de segurança</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Ativos: {alerts.filter(a => a.status === 'active').length}</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Resolvidos: {alerts.filter(a => a.status === 'resolved').length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}