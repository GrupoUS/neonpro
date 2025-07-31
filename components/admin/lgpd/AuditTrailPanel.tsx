'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Search,
  Download,
  Eye,
  Filter,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  RefreshCw,
  Clock,
  Database,
  Settings,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Globe,
  Trash2
} from 'lucide-react';
import { useAuditTrail } from '@/hooks/useLGPD';
import { AuditEvent, AuditEventType } from '@/types/lgpd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Audit Trail Panel
 * 
 * Comprehensive audit trail management for LGPD compliance including:
 * - Event logging and tracking
 * - User activity monitoring
 * - Data access auditing
 * - Consent change tracking
 * - System security events
 * - Export and reporting capabilities
 */
export function AuditTrailPanel() {
  const {
    events,
    loading,
    error,
    loadEvents,
    exportAuditTrail,
    searchEvents
  } = useAuditTrail();

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    eventType: 'all' as AuditEventType | 'all',
    userId: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    loadEvents({
      page: currentPage,
      limit: pageSize,
      filters: filters.eventType !== 'all' ? { eventType: filters.eventType } : undefined
    });
  }, [loadEvents, currentPage, pageSize, filters.eventType]);

  const filteredEvents = events.filter(event => {
    const matchesType = filters.eventType === 'all' || event.eventType === filters.eventType;
    const matchesUser = !filters.userId || event.userId?.includes(filters.userId);
    const matchesDateFrom = !filters.dateFrom || new Date(event.timestamp) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(event.timestamp) <= new Date(filters.dateTo);
    const matchesSearch = !filters.searchTerm || 
      event.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.details?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesType && matchesUser && matchesDateFrom && matchesDateTo && matchesSearch;
  });

  const getEventTypeIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'user_login':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'user_logout':
        return <UserX className="h-4 w-4 text-gray-600" />;
      case 'data_access':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'data_export':
        return <Download className="h-4 w-4 text-purple-600" />;
      case 'data_deletion':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'consent_given':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'consent_withdrawn':
        return <UserX className="h-4 w-4 text-orange-600" />;
      case 'consent_updated':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'security_event':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'system_access':
        return <Database className="h-4 w-4 text-gray-600" />;
      case 'admin_action':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'breach_detected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'policy_change':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventTypeLabel = (eventType: AuditEventType) => {
    const labels: Record<AuditEventType, string> = {
      'user_login': 'Login de Usuário',
      'user_logout': 'Logout de Usuário',
      'data_access': 'Acesso a Dados',
      'data_export': 'Exportação de Dados',
      'data_deletion': 'Exclusão de Dados',
      'consent_given': 'Consentimento Concedido',
      'consent_withdrawn': 'Consentimento Retirado',
      'consent_updated': 'Consentimento Atualizado',
      'security_event': 'Evento de Segurança',
      'system_access': 'Acesso ao Sistema',
      'admin_action': 'Ação Administrativa',
      'breach_detected': 'Violação Detectada',
      'policy_change': 'Mudança de Política'
    };
    return labels[eventType] || eventType;
  };

  const getEventTypeBadge = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'security_event':
      case 'breach_detected':
        return <Badge variant="destructive">{getEventTypeLabel(eventType)}</Badge>;
      case 'consent_withdrawn':
      case 'data_deletion':
        return <Badge className="bg-orange-100 text-orange-800">{getEventTypeLabel(eventType)}</Badge>;
      case 'consent_given':
      case 'user_login':
        return <Badge className="bg-green-100 text-green-800">{getEventTypeLabel(eventType)}</Badge>;
      case 'admin_action':
      case 'policy_change':
        return <Badge className="bg-purple-100 text-purple-800">{getEventTypeLabel(eventType)}</Badge>;
      default:
        return <Badge variant="outline">{getEventTypeLabel(eventType)}</Badge>;
    }
  };

  const getRiskLevel = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'security_event':
      case 'breach_detected':
        return 'high';
      case 'data_deletion':
      case 'consent_withdrawn':
      case 'admin_action':
        return 'medium';
      default:
        return 'low';
    }
  };

  const handleSearch = async () => {
    if (filters.searchTerm) {
      await searchEvents(filters.searchTerm, {
        eventType: filters.eventType !== 'all' ? filters.eventType : undefined,
        userId: filters.userId || undefined,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      });
    } else {
      await loadEvents({
        page: 1,
        limit: pageSize,
        filters: filters.eventType !== 'all' ? { eventType: filters.eventType } : undefined
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportAuditTrail({
        eventType: filters.eventType !== 'all' ? filters.eventType : undefined,
        userId: filters.userId || undefined,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      });
    } catch (error) {
      console.error('Error exporting audit trail:', error);
    }
  };

  const getEventStats = () => {
    const total = events.length;
    const securityEvents = events.filter(e => e.eventType === 'security_event' || e.eventType === 'breach_detected').length;
    const dataAccess = events.filter(e => e.eventType === 'data_access').length;
    const consentChanges = events.filter(e => 
      e.eventType === 'consent_given' || 
      e.eventType === 'consent_withdrawn' || 
      e.eventType === 'consent_updated'
    ).length;
    const adminActions = events.filter(e => e.eventType === 'admin_action').length;
    
    return { total, securityEvents, dataAccess, consentChanges, adminActions };
  };

  const getRecentHighRiskEvents = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return events.filter(event => 
      new Date(event.timestamp) > twentyFourHoursAgo &&
      getRiskLevel(event.eventType) === 'high'
    );
  };

  const stats = getEventStats();
  const recentHighRiskEvents = getRecentHighRiskEvents();

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando trilha de auditoria...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trilha de Auditoria LGPD</h2>
          <p className="text-muted-foreground">
            Monitore e audite todas as atividades relacionadas a dados pessoais
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => loadEvents({ page: 1, limit: pageSize })} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* High Risk Events Alert */}
      {recentHighRiskEvents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {recentHighRiskEvents.length} evento(s) de alto risco detectado(s) nas últimas 24 horas. 
            Revise imediatamente para garantir a segurança dos dados.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.securityEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos a Dados</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.dataAccess}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mudanças de Consentimento</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.consentChanges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Administrativas</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.adminActions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Buscar eventos</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Buscar por descrição ou detalhes..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <Input
                  placeholder="Filtrar por usuário..."
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select value={filters.eventType} onValueChange={(value) => setFilters({ ...filters, eventType: value as AuditEventType | 'all' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="user_login">Login de Usuário</SelectItem>
                    <SelectItem value="user_logout">Logout de Usuário</SelectItem>
                    <SelectItem value="data_access">Acesso a Dados</SelectItem>
                    <SelectItem value="data_export">Exportação de Dados</SelectItem>
                    <SelectItem value="data_deletion">Exclusão de Dados</SelectItem>
                    <SelectItem value="consent_given">Consentimento Concedido</SelectItem>
                    <SelectItem value="consent_withdrawn">Consentimento Retirado</SelectItem>
                    <SelectItem value="consent_updated">Consentimento Atualizado</SelectItem>
                    <SelectItem value="security_event">Evento de Segurança</SelectItem>
                    <SelectItem value="system_access">Acesso ao Sistema</SelectItem>
                    <SelectItem value="admin_action">Ação Administrativa</SelectItem>
                    <SelectItem value="breach_detected">Violação Detectada</SelectItem>
                    <SelectItem value="policy_change">Mudança de Política</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="datetime-local"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="datetime-local"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Auditoria ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const riskLevel = getRiskLevel(event.eventType);
                  
                  return (
                    <TableRow 
                      key={event.id} 
                      className={riskLevel === 'high' ? 'bg-red-50' : riskLevel === 'medium' ? 'bg-yellow-50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.eventType)}
                          {getEventTypeBadge(event.eventType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{event.userId || 'Sistema'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm font-medium truncate">{event.description}</div>
                          {event.details && (
                            <div className="text-xs text-muted-foreground truncate">{event.details}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="text-sm">{event.ipAddress || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {riskLevel === 'high' && (
                          <Badge variant="destructive">Alto</Badge>
                        )}
                        {riskLevel === 'medium' && (
                          <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>
                        )}
                        {riskLevel === 'low' && (
                          <Badge variant="outline">Baixo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredEvents.length)} a {Math.min(currentPage * pageSize, filteredEvents.length)} de {filteredEvents.length} eventos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="text-sm">
                Página {currentPage} de {Math.ceil(filteredEvents.length / pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredEvents.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(filteredEvents.length / pageSize)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento de Auditoria</DialogTitle>
            <DialogDescription>
              Informações completas sobre o evento selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedEvent.id}</div>
                    <div><strong>Tipo:</strong> {getEventTypeLabel(selectedEvent.eventType)}</div>
                    <div><strong>Timestamp:</strong> {format(new Date(selectedEvent.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</div>
                    <div><strong>Usuário:</strong> {selectedEvent.userId || 'Sistema'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Contexto Técnico</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>IP:</strong> {selectedEvent.ipAddress || 'N/A'}</div>
                    <div><strong>User Agent:</strong> {selectedEvent.userAgent || 'N/A'}</div>
                    <div><strong>Sessão:</strong> {selectedEvent.sessionId || 'N/A'}</div>
                    <div><strong>Risco:</strong> 
                      {getRiskLevel(selectedEvent.eventType) === 'high' && <Badge variant="destructive" className="ml-2">Alto</Badge>}
                      {getRiskLevel(selectedEvent.eventType) === 'medium' && <Badge className="bg-yellow-100 text-yellow-800 ml-2">Médio</Badge>}
                      {getRiskLevel(selectedEvent.eventType) === 'low' && <Badge variant="outline" className="ml-2">Baixo</Badge>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.details && (
                <div>
                  <h4 className="font-medium mb-2">Detalhes Adicionais</h4>
                  <pre className="text-sm text-muted-foreground bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {selectedEvent.details}
                  </pre>
                </div>
              )}
              
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Metadados</h4>
                  <pre className="text-sm text-muted-foreground bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
