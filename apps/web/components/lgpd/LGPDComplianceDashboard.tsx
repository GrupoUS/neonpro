/**
 * LGPD Compliance Dashboard Component
 * Story 1.5: LGPD Compliance Automation
 *
 * This component provides a comprehensive dashboard for LGPD compliance monitoring
 * and management with real-time analytics, consent management, and audit trail.
 */

'use client';

import {
  AlertCircle,
  AlertTriangle,
  Clock,
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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import {
  type AuditTrailAnalytics,
  auditTrailManager,
  type DataSubjectRequest,
  LGPDAuditEventType,
  type LGPDAuditRecord,
  LGPDAuditSeverity,
} from '@/lib/lgpd/audit-trail-manager';
// Import LGPD managers
import {
  type ConsentAnalytics,
  consentAutomationManager,
  LGPDDataType,
} from '@/lib/lgpd/consent-automation-manager';
import {
  dataRetentionManager,
  type RetentionAnalytics,
} from '@/lib/lgpd/data-retention-manager';

type LGPDComplianceDashboardProps = {
  clinicId: string;
  userRole: string;
};

type ComplianceOverview = {
  complianceScore: number;
  totalConsents: number;
  activeConsents: number;
  pendingRequests: number;
  recentViolations: number;
  dataRetentionCompliance: number;
  riskScore: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function LGPDComplianceDashboard({
  clinicId,
  userRole,
}: LGPDComplianceDashboardProps) {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [complianceOverview, setComplianceOverview] =
    useState<ComplianceOverview | null>(null);
  const [consentAnalytics, setConsentAnalytics] =
    useState<ConsentAnalytics | null>(null);
  const [auditAnalytics, setAuditAnalytics] =
    useState<AuditTrailAnalytics | null>(null);
  const [retentionAnalytics, setRetentionAnalytics] =
    useState<RetentionAnalytics | null>(null);
  const [auditTrail, setAuditTrail] = useState<LGPDAuditRecord[]>([]);
  const [_dataSubjectRequests, _setDataSubjectRequests] = useState<
    DataSubjectRequest[]
  >([]);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [auditFilters, setAuditFilters] = useState({
    eventType: '',
    severity: '',
    dataType: '',
  });

  // Dialog states
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [_selectedRequest, _setSelectedRequest] =
    useState<DataSubjectRequest | null>(null);

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
        consentAutomationManager.getConsentAnalytics(
          clinicId,
          startDate,
          endDate,
        ),
        auditTrailManager.getAuditAnalytics(clinicId, startDate, endDate),
        dataRetentionManager.getRetentionAnalytics(
          clinicId,
          startDate,
          endDate,
        ),
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
          eventType:
            (auditFilters.eventType as LGPDAuditEventType) || undefined,
          severity: (auditFilters.severity as LGPDAuditSeverity) || undefined,
          dataType: (auditFilters.dataType as LGPDDataType) || undefined,
          startDate,
          endDate,
        },
        50,
      );
      setAuditTrail(auditRecords);
    } catch (_err) {
      setError('Erro ao carregar dados do dashboard');
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
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
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
    if (score >= 90) {
      return 'text-green-600';
    }
    if (score >= 70) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  /**
   * Get risk level badge
   */
  const getRiskBadge = (score: number) => {
    if (score <= 20) {
      return <Badge variant="default">Baixo</Badge>;
    }
    if (score <= 50) {
      return <Badge variant="secondary">Médio</Badge>;
    }
    if (score <= 80) {
      return <Badge variant="destructive">Alto</Badge>;
    }
    return <Badge variant="destructive">Crítico</Badge>;
  };

  /**
   * Format date for display
   */
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      [LGPDAuditEventType.CONSENT_WITHDRAWN]: (
        <AlertCircle className="h-4 w-4" />
      ),
      [LGPDAuditEventType.DATA_BREACH]: <AlertTriangle className="h-4 w-4" />,
      [LGPDAuditEventType.DATA_SUBJECT_REQUEST]: (
        <FileText className="h-4 w-4" />
      ),
    };
    return iconMap[eventType] || <FileText className="h-4 w-4" />;
  };

  /**
   * Get severity badge
   */
  const getSeverityBadge = (severity: LGPDAuditSeverity) => {
    const variants = {
      [LGPDAuditSeverity.INFO]: 'default',
      [LGPDAuditSeverity.WARNING]: 'secondary',
      [LGPDAuditSeverity.ERROR]: 'destructive',
      [LGPDAuditSeverity.CRITICAL]: 'destructive',
    };
    return (
      <Badge variant={variants[severity] as any}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
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
          <h1 className="font-bold text-3xl tracking-tight">Dashboard LGPD</h1>
          <p className="text-muted-foreground">
            Monitoramento e gestão de conformidade com a LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={refreshing}
            onClick={refreshData}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="start-date">Data Início</Label>
              <Input
                id="start-date"
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                type="date"
                value={dateRange.start}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data Fim</Label>
              <Input
                id="end-date"
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                type="date"
                value={dateRange.end}
              />
            </div>
            <div>
              <Label>Tipo de Evento</Label>
              <Select
                onValueChange={(value) =>
                  setAuditFilters((prev) => ({ ...prev, eventType: value }))
                }
                value={auditFilters.eventType}
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
              <Button className="w-full" onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      {complianceOverview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Score de Conformidade
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`font-bold text-2xl ${getComplianceColor(complianceOverview.complianceScore)}`}
              >
                {complianceOverview.complianceScore}%
              </div>
              <Progress
                className="mt-2"
                value={complianceOverview.complianceScore}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Consentimentos Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {complianceOverview.activeConsents}
              </div>
              <p className="text-muted-foreground text-xs">
                de {complianceOverview.totalConsents} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Solicitações Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {complianceOverview.pendingRequests}
              </div>
              <p className="text-muted-foreground text-xs">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Nível de Risco
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="font-bold text-2xl">
                  {complianceOverview.riskScore}
                </div>
                {getRiskBadge(complianceOverview.riskScore)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="audit">Trilha de Auditoria</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Consent Analytics Chart */}
            {consentAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Consentimentos por Tipo de Dados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={300} width="100%">
                    <BarChart
                      data={Object.entries(
                        consentAnalytics.consentsByDataType,
                      ).map(([type, count]) => ({
                        type: type.replace('_', ' '),
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        angle={-45}
                        dataKey="type"
                        height={80}
                        textAnchor="end"
                      />
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
                  <ResponsiveContainer height={300} width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={Object.entries(
                          auditAnalytics.eventsBySeverity,
                        ).map(([severity, count]) => ({
                          name: severity,
                          value: count,
                        }))}
                        dataKey="value"
                        fill="#8884d8"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                        outerRadius={80}
                      >
                        {Object.entries(auditAnalytics.eventsBySeverity).map(
                          (_entry, index) => (
                            <Cell
                              fill={COLORS[index % COLORS.length]}
                              key={`cell-${index}`}
                            />
                          ),
                        )}
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
                {auditAnalytics.recentViolations.length} violação(ões) de
                conformidade detectada(s) recentemente. Revise a trilha de
                auditoria para mais detalhes.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent className="space-y-4" value="consents">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Consentimentos</CardTitle>
              <CardDescription>
                Monitore e gerencie consentimentos LGPD dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentAnalytics && (
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {consentAnalytics.activeConsents}
                    </div>
                    <div className="text-muted-foreground text-sm">Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-yellow-600">
                      {consentAnalytics.expiredConsents}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Expirados
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-red-600">
                      {consentAnalytics.withdrawnConsents}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Retirados
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={() => setShowConsentDialog(true)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Coletar Novo Consentimento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent className="space-y-4" value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria LGPD</CardTitle>
              <CardDescription>
                Histórico completo de eventos relacionados à LGPD
              </CardDescription>
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
                      <TableCell className="max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.complianceStatus === 'compliant'
                              ? 'default'
                              : 'destructive'
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
        <TabsContent className="space-y-4" value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Retenção de Dados</CardTitle>
              <CardDescription>
                Monitore políticas de retenção e expiração de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {retentionAnalytics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="font-bold text-2xl">
                        {retentionAnalytics.activeRecords}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Registros Ativos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-yellow-600">
                        {retentionAnalytics.expiringSoonRecords}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Expirando em Breve
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-red-600">
                        {retentionAnalytics.expiredRecords}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Expirados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">
                        {Math.round(retentionAnalytics.retentionCompliance)}%
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Conformidade
                      </div>
                    </div>
                  </div>

                  {retentionAnalytics.upcomingExpirations.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-semibold">
                        Próximas Expirações
                      </h4>
                      <div className="space-y-2">
                        {retentionAnalytics.upcomingExpirations
                          .slice(0, 5)
                          .map((record) => (
                            <div
                              className="flex items-center justify-between rounded border p-2"
                              key={record.id}
                            >
                              <div>
                                <div className="font-medium">
                                  {record.dataType}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  Expira em:{' '}
                                  {formatDate(record.retentionExpiresAt)}
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
        <TabsContent className="space-y-4" value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Titulares de Dados</CardTitle>
              <CardDescription>
                Gerencie solicitações de acesso, retificação e exclusão de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditAnalytics && (
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="font-bold text-2xl">
                      {auditAnalytics.dataSubjectRequests.total}
                    </div>
                    <div className="text-muted-foreground text-sm">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-yellow-600">
                      {auditAnalytics.dataSubjectRequests.pending}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Pendentes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {Math.round(
                        auditAnalytics.dataSubjectRequests.averageResponseTime,
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Dias (Tempo Médio)
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={() => setShowRequestDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consent Collection Dialog */}
      <Dialog onOpenChange={setShowConsentDialog} open={showConsentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Coletar Consentimento LGPD</DialogTitle>
            <DialogDescription>
              Configure e colete consentimento para processamento de dados
              pessoais
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
            <Button
              onClick={() => setShowConsentDialog(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={() => setShowConsentDialog(false)}>
              Coletar Consentimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Subject Request Dialog */}
      <Dialog onOpenChange={setShowRequestDialog} open={showRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Titular</DialogTitle>
            <DialogDescription>
              Registre uma nova solicitação de titular de dados
            </DialogDescription>
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
              <Input
                id="request-subject"
                placeholder="Digite o ID do titular"
              />
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
            <Button
              onClick={() => setShowRequestDialog(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={() => setShowRequestDialog(false)}>
              Criar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
