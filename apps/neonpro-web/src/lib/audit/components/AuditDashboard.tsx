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

"use client";

import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle,
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
} from "lucide-react";
import React, { useMemo, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuditEventType, AuditQueryFilters, AuditSeverity } from "../audit-system";
import type {
  useAuditLogger,
  useAuditLogs,
  useAuditReports,
  useAuditStatistics,
  useSecurityAlerts,
} from "../hooks/useAuditSystem";

// =====================================================
// TYPES E INTERFACES
// =====================================================

interface AuditDashboardProps {
  className?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function AuditDashboard({ className }: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState("logs");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Hooks do sistema de auditoria
  const logs = useAuditLogs({ autoRefresh: true, refreshInterval: 30000 });
  const alerts = useSecurityAlerts();
  const reports = useAuditReports();
  const statistics = useAuditStatistics();
  const logger = useAuditLogger();

  // Estado para filtros
  const [logFilters, setLogFilters] = useState<AuditQueryFilters>({});

  // Estatísticas resumidas
  const summaryStats = useMemo(() => {
    if (!statistics.statistics) return null;

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
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Auditoria</h1>
          <p className="text-muted-foreground">Monitoramento e análise de eventos de segurança</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logs.refresh();
              alerts.refresh();
              reports.refresh();
              statistics.refresh();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalEvents.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summaryStats.criticalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos de Alta Prioridade</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summaryStats.highEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summaryStats.activeAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.recentReports}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="alerts">Alertas de Segurança</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Tab: Logs de Auditoria */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs de Auditoria</CardTitle>
                  <CardDescription>Visualização e análise de eventos do sistema</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => logs.exportLogs("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => logs.exportLogs("json")}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Tipo de Evento</Label>
                  <Select
                    value={logFilters.event_type || ""}
                    onValueChange={(value) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        event_type: value as AuditEventType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="user.login">Login</SelectItem>
                      <SelectItem value="user.logout">Logout</SelectItem>
                      <SelectItem value="user.create">Criação de Usuário</SelectItem>
                      <SelectItem value="security.failed_login">Login Falhado</SelectItem>
                      <SelectItem value="security.suspicious_activity">
                        Atividade Suspeita
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidade</Label>
                  <Select
                    value={logFilters.severity || ""}
                    onValueChange={(value) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        severity: value as AuditSeverity,
                      }))
                    }
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
                    placeholder="Filtrar por usuário"
                    value={logFilters.user_id || ""}
                    onChange={(e) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        user_id: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip-address">Endereço IP</Label>
                  <Input
                    id="ip-address"
                    placeholder="Filtrar por IP"
                    value={logFilters.ip_address || ""}
                    onChange={(e) =>
                      setLogFilters((prev) => ({
                        ...prev,
                        ip_address: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={() => logs.setFilters(logFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogFilters({});
                    logs.setFilters({});
                  }}
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
                        <TableCell colSpan={7} className="text-center py-8">
                          Carregando logs...
                        </TableCell>
                      </TableRow>
                    ) : logs.logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                            <Badge variant={getSeverityVariant(log.severity)}>{log.severity}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {log.user_id || "Sistema"}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              {log.ip_address || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
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
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {logs.logs.length} de {logs.totalCount} eventos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas de Segurança */}
        <TabsContent value="alerts" className="space-y-4">
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
                  <div className="text-center py-8">Carregando alertas...</div>
                ) : alerts.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium">Nenhum alerta ativo</p>
                    <p className="text-muted-foreground">Sistema funcionando normalmente</p>
                  </div>
                ) : (
                  alerts.alerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-lg">{alert.alert_type}</CardTitle>
                            <Badge variant={getSeverityVariant(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={getStatusVariant(alert.status)}>
                              {getStatusLabel(alert.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alerts.markAsRead(alert.id)}
                              disabled={alert.status !== "open"}
                            >
                              Marcar como Lido
                            </Button>
                            <Select
                              value={alert.status}
                              onValueChange={(value) => alerts.updateStatus(alert.id, value as any)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Aberto</SelectItem>
                                <SelectItem value="investigating">Investigando</SelectItem>
                                <SelectItem value="resolved">Resolvido</SelectItem>
                                <SelectItem value="false_positive">Falso Positivo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(alert.created_at, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {alert.user_id && (
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {alert.user_id}
                              </span>
                            )}
                            {alert.ip_address && (
                              <span className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
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
                            <h4 className="text-sm font-medium mb-2">Ações Tomadas:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
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
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Relatórios de Auditoria</CardTitle>
                  <CardDescription>Geração e gestão de relatórios personalizados</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    // TODO: Implementar modal de criação de relatório
                    logger.logUserAction("generate_report", "audit_report");
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.loading ? (
                  <div className="text-center py-8">Carregando relatórios...</div>
                ) : reports.reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Nenhum relatório encontrado</p>
                    <p className="text-muted-foreground">Crie seu primeiro relatório</p>
                  </div>
                ) : (
                  reports.reports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription>{report.description}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Exportar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => reports.deleteReport(report.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDistanceToNow(report.generated_at, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
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
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Sistema</CardTitle>
              <CardDescription>Análise e métricas do sistema de auditoria</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.loading ? (
                <div className="text-center py-8">Carregando estatísticas...</div>
              ) : !statistics.statistics ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma estatística disponível</p>
                  <Button className="mt-4" onClick={() => statistics.refresh()}>
                    Gerar Estatísticas
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Estatísticas por Severidade */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Eventos por Severidade</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      {Object.entries(statistics.statistics.events_by_severity).map(
                        ([severity, count]) => (
                          <Card key={severity}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {severity}
                                  </p>
                                  <p className="text-2xl font-bold">{count}</p>
                                </div>
                                <Badge variant={getSeverityVariant(severity as AuditSeverity)}>
                                  {severity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Estatísticas por Tipo */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Eventos por Tipo</h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.statistics.events_by_type).map(([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <span className="font-medium">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usuários Mais Ativos */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Usuários Mais Ativos</h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.statistics.top_users).map(([userId, count]) => (
                        <div
                          key={userId}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{userId}</span>
                          </div>
                          <Badge variant="outline">{count} eventos</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
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
          <Label className="text-sm font-medium">ID do Evento</Label>
          <p className="text-sm font-mono">{log.id}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Timestamp</Label>
          <p className="text-sm">{log.timestamp.toLocaleString("pt-BR")}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Tipo de Evento</Label>
          <Badge variant="outline">{log.event_type}</Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Severidade</Label>
          <Badge variant={getSeverityVariant(log.severity)}>{log.severity}</Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Usuário</Label>
          <p className="text-sm">{log.user_id || "Sistema"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Endereço IP</Label>
          <p className="text-sm">{log.ip_address || "N/A"}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Descrição</Label>
        <p className="text-sm mt-1">{log.description}</p>
      </div>

      {log.resource_type && (
        <div>
          <Label className="text-sm font-medium">Recurso</Label>
          <p className="text-sm mt-1">
            {log.resource_type}: {log.resource_id}
          </p>
        </div>
      )}

      {log.user_agent && (
        <div>
          <Label className="text-sm font-medium">User Agent</Label>
          <p className="text-sm mt-1 font-mono break-all">{log.user_agent}</p>
        </div>
      )}

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <Label className="text-sm font-medium">Metadados</Label>
          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}

      {log.checksum && (
        <div>
          <Label className="text-sm font-medium">Checksum (Integridade)</Label>
          <p className="text-xs font-mono mt-1 break-all">{log.checksum}</p>
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
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case AuditSeverity.CRITICAL:
      return "destructive";
    case AuditSeverity.HIGH:
      return "destructive";
    case AuditSeverity.MEDIUM:
      return "secondary";
    case AuditSeverity.LOW:
      return "outline";
    default:
      return "default";
  }
}

/**
 * Retorna a variante do badge baseada no status do alerta
 */
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "open":
      return "destructive";
    case "investigating":
      return "secondary";
    case "resolved":
      return "outline";
    case "false_positive":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Retorna o label do status do alerta
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Aberto";
    case "investigating":
      return "Investigando";
    case "resolved":
      return "Resolvido";
    case "false_positive":
      return "Falso Positivo";
    default:
      return status;
  }
}

export default AuditDashboard;
