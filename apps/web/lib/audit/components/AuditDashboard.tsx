/**
 * NeonPro Audit Dashboard Component
 *
 * Componente principal para visualização e gestão do sistema
 * de auditoria, incluindo logs, alertas, relatórios e estatísticas.
 *
 * Features:
 * - Visualização de logs com filtros avançados
 * - Monitoramento de alertas de segurança
 * - Geração e gestão de relatórios
 * - Dashboard de estatísticas
 * - Exportação de dados
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Globe,
  RefreshCw,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type AuditEventType,
  type AuditQueryFilters,
  AuditSeverity,
} from '../audit-system';
import {
  useAuditLogger,
  useAuditLogs,
  useAuditReports,
  useAuditStatistics,
  useSecurityAlerts,
} from '../hooks/useAuditSystem';

// =====================================================
// TYPES E INTERFACES
// =====================================================

type AuditDashboardProps = {
  className?: string;
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function AuditDashboard({ className }: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState('logs');
  const [_selectedLogId, _setSelectedLogId] = useState<string | null>(null);

  // Hooks do sistema de auditoria
  const logs = useAuditLogs({ autoRefresh: true, refreshInterval: 30_000 });
  const alerts = useSecurityAlerts();
  const reports = useAuditReports();
  const statistics = useAuditStatistics();
  const logger = useAuditLogger();

  // Estado para filtros
  const [logFilters, setLogFilters] = useState<AuditQueryFilters>({});

  // Estatísticas resumidas
  const summaryStats = useMemo(() => {
    if (!statistics.statistics) {
      return null;
    }

    return {
      totalEvents: statistics.statistics.total_events,
      criticalEvents: statistics.statistics.events_by_severity.CRITICAL || 0,
      highEvents: statistics.statistics.events_by_severity.HIGH || 0,
      activeAlerts: alerts.unreadCount,
      recentReports: reports.reports.length,
    };
  }, [statistics.statistics, alerts.unreadCount, reports.reports.length]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Sistema de Auditoria
          </h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de eventos de segurança
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              logs.refresh();
              alerts.refresh();
              reports.refresh();
              statistics.refresh();
            }}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total de Eventos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {summaryStats.totalEvents.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Eventos Críticos
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-red-600">
                {summaryStats.criticalEvents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Eventos de Alta Prioridade
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-orange-600">
                {summaryStats.highEvents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Alertas Ativos
              </CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-yellow-600">
                {summaryStats.activeAlerts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Relatórios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {summaryStats.recentReports}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Principais */}
      <Tabs
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="alerts">Alertas de Segurança</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Tab: Logs de Auditoria */}
        <TabsContent className="space-y-4" value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs de Auditoria</CardTitle>
                  <CardDescription>
                    Visualização e análise de eventos do sistema
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => logs.exportLogs('csv')}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button
                    onClick={() => logs.exportLogs('json')}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Tipo de Evento</Label>
                  <Select
                    onValueChange={(value) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        event_type: value as AuditEventType,
                      }))
                    }
                    value={logFilters.event_type || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="user.login">Login</SelectItem>
                      <SelectItem value="user.logout">Logout</SelectItem>
                      <SelectItem value="user.create">
                        Criação de Usuário
                      </SelectItem>
                      <SelectItem value="security.failed_login">
                        Login Falhado
                      </SelectItem>
                      <SelectItem value="security.suspicious_activity">
                        Atividade Suspeita
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidade</Label>
                  <Select
                    onValueChange={(value) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        severity: value as AuditSeverity,
                      }))
                    }
                    value={logFilters.severity || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as severidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as severidades</SelectItem>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-id">ID do Usuário</Label>
                  <Input
                    id="user-id"
                    onChange={(e) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        user_id: e.target.value,
                      }))
                    }
                    placeholder="Filtrar por usuário"
                    value={logFilters.user_id || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip-address">Endereço IP</Label>
                  <Input
                    id="ip-address"
                    onChange={(e) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        ip_address: e.target.value,
                      }))
                    }
                    placeholder="Filtrar por IP"
                    value={logFilters.ip_address || ''}
                  />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <Button
                  onClick={() => logs.setFilters(logFilters)}
                  size="sm"
                  variant="outline"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
                <Button
                  onClick={() => {
                    setLogFilters({});
                    logs.setFilters({});
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Limpar Filtros
                </Button>
              </div>

              {/* Tabela de Logs */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.loading ? (
                      <TableRow>
                        <TableCell className="py-8 text-center" colSpan={7}>
                          Carregando logs...
                        </TableCell>
                      </TableRow>
                    ) : logs.logs.length === 0 ? (
                      <TableRow>
                        <TableCell className="py-8 text-center" colSpan={7}>
                          Nenhum log encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDistanceToNow(log.timestamp, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.event_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(log.severity)}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              {log.user_id || 'Sistema'}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="mr-2 h-4 w-4" />
                              {log.ip_address || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Log</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do evento de auditoria
                                  </DialogDescription>
                                </DialogHeader>
                                <LogDetailsView log={log} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {logs.totalCount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Mostrando {logs.logs.length} de {logs.totalCount} eventos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas de Segurança */}
        <TabsContent className="space-y-4" value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Monitoramento de atividades suspeitas e violações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.loading ? (
                  <div className="py-8 text-center">Carregando alertas...</div>
                ) : alerts.alerts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Shield className="mx-auto mb-4 h-12 w-12 text-green-500" />
                    <p className="font-medium text-lg">Nenhum alerta ativo</p>
                    <p className="text-muted-foreground">
                      Sistema funcionando normalmente
                    </p>
                  </div>
                ) : (
                  alerts.alerts.map((alert) => (
                    <Card
                      className="border-l-4 border-l-red-500"
                      key={alert.id}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-lg">
                              {alert.alert_type}
                            </CardTitle>
                            <Badge variant={getSeverityVariant(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={getStatusVariant(alert.status)}>
                              {getStatusLabel(alert.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              disabled={alert.status !== 'open'}
                              onClick={() => alerts.markAsRead(alert.id)}
                              size="sm"
                              variant="outline"
                            >
                              Marcar como Lido
                            </Button>
                            <Select
                              onValueChange={(value) =>
                                alerts.updateStatus(alert.id, value as any)
                              }
                              value={alert.status}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Aberto</SelectItem>
                                <SelectItem value="investigating">
                                  Investigando
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Resolvido
                                </SelectItem>
                                <SelectItem value="false_positive">
                                  Falso Positivo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatDistanceToNow(alert.created_at, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {alert.user_id && (
                              <span className="flex items-center">
                                <User className="mr-1 h-4 w-4" />
                                {alert.user_id}
                              </span>
                            )}
                            {alert.ip_address && (
                              <span className="flex items-center">
                                <Globe className="mr-1 h-4 w-4" />
                                {alert.ip_address}
                              </span>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{alert.description}</p>
                        {alert.actions_taken.length > 0 && (
                          <div className="mt-4">
                            <h4 className="mb-2 font-medium text-sm">
                              Ações Tomadas:
                            </h4>
                            <ul className="space-y-1 text-muted-foreground text-sm">
                              {alert.actions_taken.map((action, index) => (
                                <li key={index}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent className="space-y-4" value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Relatórios de Auditoria</CardTitle>
                  <CardDescription>
                    Geração e gestão de relatórios personalizados
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    // TODO: Implementar modal de criação de relatório
                    logger.logUserAction('generate_report', 'audit_report');
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Novo Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.loading ? (
                  <div className="py-8 text-center">
                    Carregando relatórios...
                  </div>
                ) : reports.reports.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="font-medium text-lg">
                      Nenhum relatório encontrado
                    </p>
                    <p className="text-muted-foreground">
                      Crie seu primeiro relatório
                    </p>
                  </div>
                ) : (
                  reports.reports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {report.title}
                            </CardTitle>
                            <CardDescription>
                              {report.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Exportar
                            </Button>
                            <Button
                              onClick={() => reports.deleteReport(report.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatDistanceToNow(report.generated_at, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          <span className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            {report.generated_by}
                          </span>
                          <span>{report.events.length} eventos</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estatísticas */}
        <TabsContent className="space-y-4" value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Sistema</CardTitle>
              <CardDescription>
                Análise e métricas do sistema de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.loading ? (
                <div className="py-8 text-center">
                  Carregando estatísticas...
                </div>
              ) : statistics.statistics ? (
                <div className="space-y-6">
                  {/* Estatísticas por Severidade */}
                  <div>
                    <h3 className="mb-4 font-medium text-lg">
                      Eventos por Severidade
                    </h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      {Object.entries(
                        statistics.statistics.events_by_severity,
                      ).map(([severity, count]) => (
                        <Card key={severity}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-muted-foreground text-sm">
                                  {severity}
                                </p>
                                <p className="font-bold text-2xl">{count}</p>
                              </div>
                              <Badge
                                variant={getSeverityVariant(
                                  severity as AuditSeverity,
                                )}
                              >
                                {severity}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Estatísticas por Tipo */}
                  <div>
                    <h3 className="mb-4 font-medium text-lg">
                      Eventos por Tipo
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.statistics.events_by_type).map(
                        ([type, count]) => (
                          <div
                            className="flex items-center justify-between rounded border p-3"
                            key={type}
                          >
                            <span className="font-medium">{type}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Usuários Mais Ativos */}
                  <div>
                    <h3 className="mb-4 font-medium text-lg">
                      Usuários Mais Ativos
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.statistics.top_users).map(
                        ([userId, count]) => (
                          <div
                            className="flex items-center justify-between rounded border p-3"
                            key={userId}
                          >
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              <span className="font-medium">{userId}</span>
                            </div>
                            <Badge variant="outline">{count} eventos</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium text-lg">
                    Nenhuma estatística disponível
                  </p>
                  <Button className="mt-4" onClick={() => statistics.refresh()}>
                    Gerar Estatísticas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

/**
 * Componente para exibir detalhes de um log
 */
function LogDetailsView({ log }: { log: any }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="font-medium text-sm">ID do Evento</Label>
          <p className="font-mono text-sm">{log.id}</p>
        </div>
        <div>
          <Label className="font-medium text-sm">Timestamp</Label>
          <p className="text-sm">{log.timestamp.toLocaleString('pt-BR')}</p>
        </div>
        <div>
          <Label className="font-medium text-sm">Tipo de Evento</Label>
          <Badge variant="outline">{log.event_type}</Badge>
        </div>
        <div>
          <Label className="font-medium text-sm">Severidade</Label>
          <Badge variant={getSeverityVariant(log.severity)}>
            {log.severity}
          </Badge>
        </div>
        <div>
          <Label className="font-medium text-sm">Usuário</Label>
          <p className="text-sm">{log.user_id || 'Sistema'}</p>
        </div>
        <div>
          <Label className="font-medium text-sm">Endereço IP</Label>
          <p className="text-sm">{log.ip_address || 'N/A'}</p>
        </div>
      </div>

      <div>
        <Label className="font-medium text-sm">Descrição</Label>
        <p className="mt-1 text-sm">{log.description}</p>
      </div>

      {log.resource_type && (
        <div>
          <Label className="font-medium text-sm">Recurso</Label>
          <p className="mt-1 text-sm">
            {log.resource_type}: {log.resource_id}
          </p>
        </div>
      )}

      {log.user_agent && (
        <div>
          <Label className="font-medium text-sm">User Agent</Label>
          <p className="mt-1 break-all font-mono text-sm">{log.user_agent}</p>
        </div>
      )}

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <Label className="font-medium text-sm">Metadados</Label>
          <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}

      {log.checksum && (
        <div>
          <Label className="font-medium text-sm">Checksum (Integridade)</Label>
          <p className="mt-1 break-all font-mono text-xs">{log.checksum}</p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Retorna a variante do badge baseada na severidade
 */
function getSeverityVariant(
  severity: AuditSeverity,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case AuditSeverity.CRITICAL:
      return 'destructive';
    case AuditSeverity.HIGH:
      return 'destructive';
    case AuditSeverity.MEDIUM:
      return 'secondary';
    case AuditSeverity.LOW:
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Retorna a variante do badge baseada no status do alerta
 */
function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'open':
      return 'destructive';
    case 'investigating':
      return 'secondary';
    case 'resolved':
      return 'outline';
    case 'false_positive':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Retorna o label do status do alerta
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Aberto';
    case 'investigating':
      return 'Investigando';
    case 'resolved':
      return 'Resolvido';
    case 'false_positive':
      return 'Falso Positivo';
    default:
      return status;
  }
}

export default AuditDashboard;
