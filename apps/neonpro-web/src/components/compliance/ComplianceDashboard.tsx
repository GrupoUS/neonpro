/**
 * LGPD Compliance Dashboard Component
 * Dashboard para monitoramento de compliance LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 37, 38, 39 (Relatórios e Monitoramento)
 */

"use client";

import type { endOfDay, format, startOfDay, subDays } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Lock,
  RefreshCw,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuditEventType, AuditSeverity, AuditStatus } from "@/lib/compliance/audit-trail";
import type { useLGPD } from "@/lib/compliance/useLGPD";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComplianceMetrics {
  totalEvents: number;
  dataAccesses: number;
  consentChanges: number;
  securityEvents: number;
  complianceScore: number;
  criticalIssues: number;
  pendingRequests: number;
  activeConsents: number;
}

interface EventSummary {
  type: AuditEventType;
  count: number;
  severity: AuditSeverity;
  trend: "up" | "down" | "stable";
}

interface ComplianceAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ComplianceDashboard() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { auditEvents, complianceReport, isLoading: lgpdLoading, error, refreshData } = useLGPD();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (auditEvents && complianceReport) {
      processComplianceData();
    }
  }, [auditEvents, complianceReport]);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await refreshData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processComplianceData = () => {
    if (!auditEvents || !complianceReport) return;

    // Calculate metrics
    const totalEvents = auditEvents.length;
    const dataAccesses = auditEvents.filter((e) =>
      [AuditEventType.DATA_ACCESS, AuditEventType.DATA_VIEW].includes(e.eventType),
    ).length;
    const consentChanges = auditEvents.filter((e) =>
      [AuditEventType.CONSENT_GRANTED, AuditEventType.CONSENT_WITHDRAWN].includes(e.eventType),
    ).length;
    const securityEvents = auditEvents.filter((e) =>
      [AuditEventType.UNAUTHORIZED_ACCESS, AuditEventType.DATA_BREACH].includes(e.eventType),
    ).length;

    // Calculate compliance score
    const complianceScore = calculateComplianceScore(auditEvents);
    const criticalIssues = complianceReport.compliance.issues.length;

    setMetrics({
      totalEvents,
      dataAccesses,
      consentChanges,
      securityEvents,
      complianceScore,
      criticalIssues,
      pendingRequests: 0, // Would come from API
      activeConsents: 0, // Would come from API
    });

    // Process event summaries
    const eventSummaries = processEventSummaries(auditEvents);
    setEvents(eventSummaries);

    // Generate alerts
    const complianceAlerts = generateAlerts(auditEvents, complianceReport);
    setAlerts(complianceAlerts);
  };

  const calculateComplianceScore = (events: any[]): number => {
    if (events.length === 0) return 100;

    const totalEvents = events.length;
    const failedEvents = events.filter((e) => e.status === AuditStatus.FAILURE).length;
    const securityEvents = events.filter((e) =>
      [AuditEventType.UNAUTHORIZED_ACCESS, AuditEventType.DATA_BREACH].includes(e.eventType),
    ).length;

    // Calculate score based on success rate and security events
    const successRate = ((totalEvents - failedEvents) / totalEvents) * 100;
    const securityPenalty = Math.min(securityEvents * 10, 50); // Max 50% penalty

    return Math.max(0, Math.round(successRate - securityPenalty));
  };

  const processEventSummaries = (events: any[]): EventSummary[] => {
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<AuditEventType, number>,
    );

    return Object.entries(eventCounts).map(([type, count]) => ({
      type: type as AuditEventType,
      count,
      severity: getSeverityForEventType(type as AuditEventType),
      trend: "stable" as const, // Would calculate based on historical data
    }));
  };

  const generateAlerts = (events: any[], report: any): ComplianceAlert[] => {
    const alerts: ComplianceAlert[] = [];

    // Critical security events
    const criticalEvents = events.filter((e) => e.severity === AuditSeverity.CRITICAL);

    if (criticalEvents.length > 0) {
      alerts.push({
        id: "critical-events",
        type: "critical",
        title: "Eventos Críticos Detectados",
        description: `${criticalEvents.length} eventos críticos foram registrados`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Compliance issues
    if (report.compliance.issues.length > 0) {
      alerts.push({
        id: "compliance-issues",
        type: "warning",
        title: "Problemas de Compliance",
        description: `${report.compliance.issues.length} problemas de compliance identificados`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  };

  const getSeverityForEventType = (eventType: AuditEventType): AuditSeverity => {
    switch (eventType) {
      case AuditEventType.DATA_BREACH:
      case AuditEventType.UNAUTHORIZED_ACCESS:
        return AuditSeverity.CRITICAL;
      case AuditEventType.ENCRYPTION_FAILURE:
      case AuditEventType.DECRYPTION_FAILURE:
        return AuditSeverity.HIGH;
      case AuditEventType.CONSENT_EXPIRED:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  };

  const getPeriodDates = () => {
    const end = endOfDay(new Date());
    const start = startOfDay(
      subDays(end, selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90),
    );
    return { start, end };
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMetricCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    trend?: "up" | "down" | "stable",
    color?: "default" | "success" | "warning" | "destructive",
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span>
              Tendência:{" "}
              {trend === "up" ? "Crescente" : trend === "down" ? "Decrescente" : "Estável"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplianceScore = () => {
    const score = metrics?.complianceScore || 0;
    const color = score >= 90 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-red-600";
    const bgColor = score >= 90 ? "bg-green-100" : score >= 70 ? "bg-yellow-100" : "bg-red-100";

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Score de Compliance LGPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${color} mb-2`}>{score}%</div>
          <Progress value={score} className="mb-4" />
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}
          >
            {score >= 90 ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" /> Excelente
              </>
            ) : score >= 70 ? (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" /> Atenção
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" /> Crítico
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Nenhum alerta ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === "critical" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.description}
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(alert.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEventSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Resumo de Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div key={event.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={event.severity === AuditSeverity.CRITICAL ? "destructive" : "secondary"}
                >
                  {event.type.replace("_", " ")}
                </Badge>
              </div>
              <div className="text-sm font-medium">{event.count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading || lgpdLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dashboard</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard LGPD</h1>
          <p className="text-muted-foreground">Monitoramento de compliance e auditoria</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Atualizado: {format(lastUpdated, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Período:</span>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : "90 dias"}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          "Total de Eventos",
          metrics?.totalEvents || 0,
          <Activity className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Acessos a Dados",
          metrics?.dataAccesses || 0,
          <Eye className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Mudanças de Consentimento",
          metrics?.consentChanges || 0,
          <UserCheck className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Eventos de Segurança",
          metrics?.securityEvents || 0,
          <Shield className="h-4 w-4 text-muted-foreground" />,
          "stable",
          metrics?.securityEvents && metrics.securityEvents > 0 ? "destructive" : "success",
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Compliance Score */}
        {renderComplianceScore()}

        {/* Alerts */}
        {renderAlerts()}

        {/* Event Summary */}
        {renderEventSummary()}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="consent">Consentimentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
              <CardDescription>
                Análise de compliance para os últimos{" "}
                {selectedPeriod === "7d"
                  ? "7 dias"
                  : selectedPeriod === "30d"
                    ? "30 dias"
                    : "90 dias"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Estatísticas Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de eventos:</span>
                        <span className="font-medium">{metrics?.totalEvents || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score de compliance:</span>
                        <span className="font-medium">{metrics?.complianceScore || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Problemas críticos:</span>
                        <span className="font-medium">{metrics?.criticalIssues || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Atividade de Dados</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Acessos a dados:</span>
                        <span className="font-medium">{metrics?.dataAccesses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mudanças de consentimento:</span>
                        <span className="font-medium">{metrics?.consentChanges || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eventos de segurança:</span>
                        <span className="font-medium">{metrics?.securityEvents || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria</CardTitle>
              <CardDescription>Eventos de auditoria registrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Implementação detalhada do log de auditoria em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Consentimentos</CardTitle>
              <CardDescription>Status e histórico de consentimentos dos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="mx-auto h-12 w-12 mb-4" />
                <p>Interface de gerenciamento de consentimentos em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Compliance</CardTitle>
              <CardDescription>Relatórios automáticos e exportação de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                <p>Sistema de relatórios automáticos em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
