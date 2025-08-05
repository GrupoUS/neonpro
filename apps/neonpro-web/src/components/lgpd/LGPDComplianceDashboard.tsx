/**
 * LGPD Compliance Dashboard Component
 * Story 1.5: LGPD Compliance Automation
 *
 * This component provides a comprehensive dashboard for LGPD compliance monitoring
 * and management with real-time analytics, consent management, and audit trail.
 */

"use client";

import type {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type {
  AuditTrailAnalytics,
  auditTrailManager,
  DataSubjectRequest,
  LGPDAuditEventType,
  LGPDAuditRecord,
  LGPDAuditSeverity,
} from "@/lib/lgpd/audit-trail-manager";
// Import LGPD managers
import type {
  ConsentAnalytics,
  ConsentRecord,
  consentAutomationManager,
  LGPDDataType,
  LGPDPurpose,
} from "@/lib/lgpd/consent-automation-manager";
import type {
  DataRetentionPolicy,
  dataRetentionManager,
  RetentionAnalytics,
} from "@/lib/lgpd/data-retention-manager";

interface LGPDComplianceDashboardProps {
  clinicId: string;
  userRole: string;
}

interface ComplianceOverview {
  complianceScore: number;
  totalConsents: number;
  activeConsents: number;
  pendingRequests: number;
  recentViolations: number;
  dataRetentionCompliance: number;
  riskScore: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function LGPDComplianceDashboard({
  clinicId,
  userRole,
}: LGPDComplianceDashboardProps) {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [complianceOverview, setComplianceOverview] = useState<ComplianceOverview | null>(null);
  const [consentAnalytics, setConsentAnalytics] = useState<ConsentAnalytics | null>(null);
  const [auditAnalytics, setAuditAnalytics] = useState<AuditTrailAnalytics | null>(null);
  const [retentionAnalytics, setRetentionAnalytics] = useState<RetentionAnalytics | null>(null);
  const [auditTrail, setAuditTrail] = useState<LGPDAuditRecord[]>([]);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [auditFilters, setAuditFilters] = useState({
    eventType: "",
    severity: "",
    dataType: "",
  });

  // Dialog states
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = dateRange.start ? new Date(dateRange.start) : undefined;
      const endDate = dateRange.end ? new Date(dateRange.end) : undefined;

      // Load all analytics in parallel
      const [consentData, auditData, retentionData] = await Promise.all([
        consentAutomationManager.getConsentAnalytics(clinicId, startDate, endDate),
        auditTrailManager.getAuditAnalytics(clinicId, startDate, endDate),
        dataRetentionManager.getRetentionAnalytics(clinicId, startDate, endDate),
      ]);

      setConsentAnalytics(consentData);
      setAuditAnalytics(auditData);
      setRetentionAnalytics(retentionData);

      // Calculate compliance overview
      const overview: ComplianceOverview = {
        complianceScore: Math.round(
          (auditData.complianceRate + retentionData.retentionCompliance) / 2,
        ),
        totalConsents: consentData.totalConsents,
        activeConsents: consentData.activeConsents,
        pendingRequests: auditData.dataSubjectRequests.pending,
        recentViolations: auditData.recentViolations.length,
        dataRetentionCompliance: Math.round(retentionData.retentionCompliance),
        riskScore: auditData.riskScore,
      };
      setComplianceOverview(overview);

      // Load audit trail
      const auditRecords = await auditTrailManager.getAuditTrail(
        clinicId,
        {
          eventType: (auditFilters.eventType as LGPDAuditEventType) || undefined,
          severity: (auditFilters.severity as LGPDAuditSeverity) || undefined,
          dataType: (auditFilters.dataType as LGPDDataType) || undefined,
          startDate,
          endDate,
        },
        50,
      );
      setAuditTrail(auditRecords);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh dashboard data
   */
  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    loadDashboardData();
  };

  /**
   * Get compliance score color
   */
  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  /**
   * Get risk level badge
   */
  const getRiskBadge = (score: number) => {
    if (score <= 20) return <Badge variant="default">Baixo</Badge>;
    if (score <= 50) return <Badge variant="secondary">Médio</Badge>;
    if (score <= 80) return <Badge variant="destructive">Alto</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  /**
   * Format date for display
   */
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get event type icon
   */
  const getEventTypeIcon = (eventType: LGPDAuditEventType) => {
    const iconMap = {
      [LGPDAuditEventType.DATA_ACCESS]: <Eye className="h-4 w-4" />,
      [LGPDAuditEventType.DATA_MODIFICATION]: <Settings className="h-4 w-4" />,
      [LGPDAuditEventType.DATA_DELETION]: <Trash2 className="h-4 w-4" />,
      [LGPDAuditEventType.CONSENT_COLLECTED]: <UserCheck className="h-4 w-4" />,
      [LGPDAuditEventType.CONSENT_WITHDRAWN]: <AlertCircle className="h-4 w-4" />,
      [LGPDAuditEventType.DATA_BREACH]: <AlertTriangle className="h-4 w-4" />,
      [LGPDAuditEventType.DATA_SUBJECT_REQUEST]: <FileText className="h-4 w-4" />,
    };
    return iconMap[eventType] || <FileText className="h-4 w-4" />;
  };

  /**
   * Get severity badge
   */
  const getSeverityBadge = (severity: LGPDAuditSeverity) => {
    const variants = {
      [LGPDAuditSeverity.INFO]: "default",
      [LGPDAuditSeverity.WARNING]: "secondary",
      [LGPDAuditSeverity.ERROR]: "destructive",
      [LGPDAuditSeverity.CRITICAL]: "destructive",
    };
    return <Badge variant={variants[severity] as any}>{severity.toUpperCase()}</Badge>;
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDashboardData();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados de conformidade...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
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
          <p className="text-muted-foreground">Monitoramento e gestão de conformidade com a LGPD</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Data Início</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de Evento</Label>
              <Select
                value={auditFilters.eventType}
                onValueChange={(value) =>
                  setAuditFilters((prev) => ({ ...prev, eventType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.values(LGPDAuditEventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={applyFilters} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      {complianceOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getComplianceColor(complianceOverview.complianceScore)}`}
              >
                {complianceOverview.complianceScore}%
              </div>
              <Progress value={complianceOverview.complianceScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceOverview.activeConsents}</div>
              <p className="text-xs text-muted-foreground">
                de {complianceOverview.totalConsents} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceOverview.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível de Risco</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{complianceOverview.riskScore}</div>
                {getRiskBadge(complianceOverview.riskScore)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="audit">Trilha de Auditoria</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consent Analytics Chart */}
            {consentAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Consentimentos por Tipo de Dados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(consentAnalytics.consentsByDataType).map(
                        ([type, count]) => ({
                          type: type.replace("_", " "),
                          count,
                        }),
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Audit Events Chart */}
            {auditAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Eventos de Auditoria por Severidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(auditAnalytics.eventsBySeverity).map(
                          ([severity, count]) => ({
                            name: severity,
                            value: count,
                          }),
                        )}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(auditAnalytics.eventsBySeverity).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Violations Alert */}
          {auditAnalytics && auditAnalytics.recentViolations.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Violações Recentes Detectadas</AlertTitle>
              <AlertDescription>
                {auditAnalytics.recentViolations.length} violação(ões) de conformidade detectada(s)
                recentemente. Revise a trilha de auditoria para mais detalhes.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Consentimentos</CardTitle>
              <CardDescription>
                Monitore e gerencie consentimentos LGPD dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {consentAnalytics.activeConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {consentAnalytics.expiredConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Expirados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {consentAnalytics.withdrawnConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Retirados</div>
                  </div>
                </div>
              )}

              <Button onClick={() => setShowConsentDialog(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Coletar Novo Consentimento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria LGPD</CardTitle>
              <CardDescription>Histórico completo de eventos relacionados à LGPD</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Tipo de Dados</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(record.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(record.eventType)}
                          <span className="text-sm">{record.eventType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(record.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.dataType}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.complianceStatus === "compliant" ? "default" : "destructive"
                          }
                        >
                          {record.complianceStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Retenção de Dados</CardTitle>
              <CardDescription>Monitore políticas de retenção e expiração de dados</CardDescription>
            </CardHeader>
            <CardContent>
              {retentionAnalytics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{retentionAnalytics.activeRecords}</div>
                      <div className="text-sm text-muted-foreground">Registros Ativos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {retentionAnalytics.expiringSoonRecords}
                      </div>
                      <div className="text-sm text-muted-foreground">Expirando em Breve</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {retentionAnalytics.expiredRecords}
                      </div>
                      <div className="text-sm text-muted-foreground">Expirados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(retentionAnalytics.retentionCompliance)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Conformidade</div>
                    </div>
                  </div>

                  {retentionAnalytics.upcomingExpirations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Próximas Expirações</h4>
                      <div className="space-y-2">
                        {retentionAnalytics.upcomingExpirations.slice(0, 5).map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div>
                              <div className="font-medium">{record.dataType}</div>
                              <div className="text-sm text-muted-foreground">
                                Expira em: {formatDate(record.retentionExpiresAt)}
                              </div>
                            </div>
                            <Badge variant="secondary">{record.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Titulares de Dados</CardTitle>
              <CardDescription>
                Gerencie solicitações de acesso, retificação e exclusão de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {auditAnalytics.dataSubjectRequests.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {auditAnalytics.dataSubjectRequests.pending}
                    </div>
                    <div className="text-sm text-muted-foreground">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(auditAnalytics.dataSubjectRequests.averageResponseTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">Dias (Tempo Médio)</div>
                  </div>
                </div>
              )}

              <Button onClick={() => setShowRequestDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consent Collection Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Coletar Consentimento LGPD</DialogTitle>
            <DialogDescription>
              Configure e colete consentimento para processamento de dados pessoais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="consent-user">ID do Usuário</Label>
              <Input id="consent-user" placeholder="Digite o ID do usuário" />
            </div>
            <div>
              <Label htmlFor="consent-types">Tipos de Dados</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione os tipos de dados" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LGPDDataType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="consent-text">Texto do Consentimento</Label>
              <Textarea
                id="consent-text"
                placeholder="Digite o texto do consentimento..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowConsentDialog(false)}>Coletar Consentimento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Subject Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Titular</DialogTitle>
            <DialogDescription>Registre uma nova solicitação de titular de dados</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="request-type">Tipo de Solicitação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="access">Acesso aos Dados</SelectItem>
                  <SelectItem value="rectification">Retificação</SelectItem>
                  <SelectItem value="deletion">Exclusão</SelectItem>
                  <SelectItem value="portability">Portabilidade</SelectItem>
                  <SelectItem value="restriction">Restrição</SelectItem>
                  <SelectItem value="objection">Oposição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="request-subject">ID do Titular</Label>
              <Input id="request-subject" placeholder="Digite o ID do titular" />
            </div>
            <div>
              <Label htmlFor="request-details">Detalhes da Solicitação</Label>
              <Textarea
                id="request-details"
                placeholder="Descreva os detalhes da solicitação..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowRequestDialog(false)}>Criar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
