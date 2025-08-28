"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Shield,
  FileText,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Activity,
  Bell,
  Target,
  Zap,
  Users,
  Database,
  Lock,
  Stethoscope,
  Pill,
  UserCheck,
  Phone,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Minus,
  ExternalLink,
  BookOpen,
  Scale,
  Heart,
  Brain,
  Lungs,
} from "lucide-react";

import type { ComplianceDashboardData } from "@/lib/compliance/compliance-dashboard";
import {
  ComplianceScore,
  ComplianceAlert,
  ComplianceMetrics,
  ComplianceRiskLevel,
  ComplianceDashboardService,
} from "@/lib/compliance/compliance-dashboard";

// Initialize Compliance Dashboard service
const complianceService = ComplianceDashboardService.getInstance();

interface ComplianceDashboardProps {
  className?: string;
}

const RISK_LEVEL_CONFIG = {
  low: {
    label: "Baixo",
    description: "Risco operacional mínimo",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
    color: "text-green-600",
  },
  medium: {
    label: "Médio",
    description: "Requer monitoramento regular",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  high: {
    label: "Alto",
    description: "Ação corretiva necessária",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertCircle,
    color: "text-orange-600",
  },
  critical: {
    label: "Crítico",
    description: "Intervenção imediata requerida",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
    color: "text-red-600",
  },
} as const;

const SEVERITY_CONFIG = {
  info: {
    label: "Informação",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Eye,
  },
  warning: {
    label: "Aviso",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: AlertTriangle,
  },
  high: {
    label: "Alta",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertCircle,
  },
  critical: {
    label: "Crítica",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
} as const;

const CATEGORY_CONFIG = {
  "cfm-professional": {
    label: "CFM Profissionais",
    description: "Validação de registros profissionais",
    icon: UserCheck,
    color: "text-blue-600",
  },
  "anvisa-substances": {
    label: "ANVISA Substâncias",
    description: "Controle de substâncias regulamentadas",
    icon: Pill,
    color: "text-green-600",
  },
  "lgpd-consent": {
    label: "LGPD Consentimento",
    description: "Gestão de consentimentos de dados",
    icon: Lock,
    color: "text-purple-600",
  },
  "emergency-protocols": {
    label: "Protocolos de Emergência",
    description: "Procedimentos médicos de emergência",
    icon: Heart,
    color: "text-red-600",
  },
  overall: {
    label: "Geral",
    description: "Conformidade geral do sistema",
    icon: Shield,
    color: "text-indigo-600",
  },
} as const;

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  className,
}) => {
  const [dashboardData, setDashboardData] =
    useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 60_000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await complianceService.getDashboardData();

      if (result.isValid && result.data) {
        setDashboardData(result.data);
        setLastRefresh(new Date());
      } else {
        toast.error(result.errors?.[0] || "Erro ao carregar dados do painel");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Erro interno ao carregar painel de conformidade");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) {
      return "text-green-600";
    }
    if (score >= 80) {
      return "text-yellow-600";
    }
    if (score >= 70) {
      return "text-orange-600";
    }
    return "text-red-600";
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 90) {
      return "from-green-500 to-green-600";
    }
    if (score >= 80) {
      return "from-yellow-500 to-yellow-600";
    }
    if (score >= 70) {
      return "from-orange-500 to-orange-600";
    }
    return "from-red-500 to-red-600";
  };

  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up":
        return <ChevronUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <ChevronDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleGenerateReport = async () => {
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();

      const result = await complianceService.generateComplianceReport(
        startDate,
        endDate,
      );

      if (result.isValid) {
        toast.success("Relatório de conformidade gerado com sucesso");
        // In real implementation, would download or display the report
        console.log("Compliance Report Generated:", result.data);
      } else {
        toast.error(result.errors?.[0] || "Erro ao gerar relatório");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erro interno ao gerar relatório");
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando painel de conformidade...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <span className="ml-2">Erro ao carregar dados de conformidade</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Painel de Conformidade Regulatória
          </h2>
          <p className="text-muted-foreground">
            Monitoramento integrado de conformidade para estabelecimentos de
            saúde brasileiros
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Última atualização:{" "}
              {lastRefresh ? lastRefresh.toLocaleTimeString("pt-BR") : "Nunca"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")}
              />
              {autoRefresh ? "Auto" : "Manual"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
              />
              Atualizar
            </Button>
            <Button size="sm" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Conformidade Regulatória Geral
              </CardTitle>
              <CardDescription>
                {dashboardData.overallScore.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-4xl font-bold",
                  getScoreColor(dashboardData.overallScore.score),
                )}
              >
                {dashboardData.overallScore.score}%
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getTrendIcon(dashboardData.overallScore.trends.direction)}
                Risco:{" "}
                {
                  RISK_LEVEL_CONFIG[dashboardData.riskAssessment.overallRisk]
                    ?.label
                }
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress
              value={dashboardData.overallScore.score}
              className="h-3"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {dashboardData.riskAssessment.criticalIssues}
                </div>
                <div className="text-sm text-muted-foreground">
                  Questões Críticas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {dashboardData.riskAssessment.highPriorityIssues}
                </div>
                <div className="text-sm text-muted-foreground">
                  Alta Prioridade
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {dashboardData.alerts.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Alertas Ativos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    Object.values(dashboardData.systemStatus).filter(
                      (status) => status === "active",
                    ).length
                  }
                  /4
                </div>
                <div className="text-sm text-muted-foreground">
                  Sistemas Ativos
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="compliance-scores">Pontuações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="audit-trail">Auditoria</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Compliance System Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dashboardData.scores).map(([category, score]) => {
              const config =
                CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
              const Icon = config?.icon || Shield;
              const isExpanded = expandedCards.has(category);

              return (
                <Card
                  key={category}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    score.score < 70 && "border-red-200 bg-red-50/50",
                    score.score >= 70 &&
                      score.score < 85 &&
                      "border-yellow-200 bg-yellow-50/50",
                    score.score >= 85 && "border-green-200 bg-green-50/50",
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className={cn("h-5 w-5", config?.color)} />
                          {config?.label}
                        </CardTitle>
                        <CardDescription>{config?.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-3xl font-bold",
                            getScoreColor(score.score),
                          )}
                        >
                          {score.score}%
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getTrendIcon(score.trends.direction)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpansion(category)}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={score.score} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        {score.description}
                      </div>

                      {isExpanded && score.details && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-xs font-medium mb-2">
                            Detalhes:
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(score.details).map(
                              ([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}:
                                  </span>
                                  <span className="font-medium">
                                    {String(value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Alerts */}
          {dashboardData.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas Ativos ({dashboardData.alerts.length})
                </CardTitle>
                <CardDescription>
                  Questões de conformidade que requerem atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.alerts.slice(0, 5).map((alert) => {
                    const severityConfig = SEVERITY_CONFIG[alert.severity];
                    const riskConfig = RISK_LEVEL_CONFIG[alert.riskLevel];
                    const categoryConfig = CATEGORY_CONFIG[alert.category];
                    const SeverityIcon = severityConfig?.icon || AlertTriangle;
                    const CategoryIcon = categoryConfig?.icon || Shield;

                    return (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <SeverityIcon
                            className={cn(
                              "h-4 w-4",
                              severityConfig?.text.split(" ")[0],
                            )}
                          />
                          <CategoryIcon
                            className={cn("h-4 w-4", categoryConfig?.color)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {alert.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {alert.description}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {alert.createdAt.toLocaleString("pt-BR")}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    riskConfig?.bg,
                                    riskConfig?.text,
                                  )}
                                >
                                  {riskConfig?.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {alert.actions && alert.actions.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Ações sugeridas:
                              </div>
                              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                {alert.actions
                                  .slice(0, 2)
                                  .map((action, index) => (
                                    <li key={index}>{action}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {dashboardData.alerts.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Todos os Alertas ({dashboardData.alerts.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status dos Sistemas
              </CardTitle>
              <CardDescription>
                Estado operacional dos sistemas de conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardData.systemStatus).map(
                  ([system, status]) => {
                    const config =
                      CATEGORY_CONFIG[system as keyof typeof CATEGORY_CONFIG];
                    const Icon = config?.icon || Database;
                    const isActive = status === "active";

                    return (
                      <div
                        key={system}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {config?.label}
                          </div>
                          <div
                            className={cn(
                              "text-xs",
                              isActive ? "text-green-600" : "text-gray-600",
                            )}
                          >
                            {isActive ? "Operacional" : "Inativo"}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Scores Tab */}
        <TabsContent value="compliance-scores" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(dashboardData.scores).map(([category, score]) => {
              const config =
                CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
              const Icon = config?.icon || Shield;

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", config?.color)} />
                        {config?.label}
                      </CardTitle>
                      <div
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(score.score),
                        )}
                      >
                        {score.score}%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={score.score} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {score.description}
                      </p>

                      {score.details && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                          {Object.entries(score.details).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-lg font-bold">
                                {String(value)}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Última atualização:{" "}
                          {score.lastUpdated.toLocaleString("pt-BR")}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(score.trends.direction)}
                          <span className="text-muted-foreground">
                            Tendência:{" "}
                            {score.trends.direction === "up"
                              ? "Melhorando"
                              : score.trends.direction === "down"
                                ? "Declinando"
                                : "Estável"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Alertas de Conformidade</h3>
              <p className="text-sm text-muted-foreground">
                {dashboardData.alerts.length} alertas ativos requerem atenção
              </p>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Alertas</SelectItem>
                <SelectItem value="critical">Críticos</SelectItem>
                <SelectItem value="high">Alta Prioridade</SelectItem>
                <SelectItem value="warning">Avisos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {dashboardData.alerts.map((alert) => {
              const severityConfig = SEVERITY_CONFIG[alert.severity];
              const riskConfig = RISK_LEVEL_CONFIG[alert.riskLevel];
              const categoryConfig = CATEGORY_CONFIG[alert.category];
              const SeverityIcon = severityConfig?.icon || AlertTriangle;
              const CategoryIcon = categoryConfig?.icon || Shield;

              return (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 mt-1">
                          <SeverityIcon
                            className={cn(
                              "h-5 w-5",
                              severityConfig?.text.split(" ")[0],
                            )}
                          />
                          <CategoryIcon
                            className={cn("h-5 w-5", categoryConfig?.color)}
                          />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {alert.title}
                          </CardTitle>
                          <CardDescription>{alert.description}</CardDescription>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                severityConfig?.bg,
                                severityConfig?.text,
                              )}
                            >
                              {severityConfig?.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                riskConfig?.bg,
                                riskConfig?.text,
                              )}
                            >
                              Risco {riskConfig?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categoryConfig?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {alert.createdAt.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </CardHeader>
                  {alert.actions && alert.actions.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Ações Recomendadas:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {alert.actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Resolvido
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardData.metrics.validatedProfessionals}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profissionais Validados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Pill className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardData.metrics.activePrescriptions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prescrições Ativas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardData.metrics.activeConsents}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consentimentos Ativos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardData.metrics.activeEmergencies}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emergências Ativas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Conformidade</CardTitle>
                <CardDescription>
                  Indicadores chave de performance regulatória
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Violações de Conformidade</span>
                    <span className="font-bold text-red-600">
                      {dashboardData.metrics.complianceViolations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Indicadores de Risco</span>
                    <span className="font-bold text-orange-600">
                      {dashboardData.metrics.riskIndicators}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Atividades de Auditoria</span>
                    <span className="font-bold text-blue-600">
                      {dashboardData.metrics.auditActivities}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime do Sistema</span>
                    <span className="font-bold text-green-600">
                      {dashboardData.metrics.systemUptime}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Atividades</CardTitle>
                <CardDescription>
                  Auditorias e certificações programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {deadline.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {deadline.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {deadline.dueDate.toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.ceil(
                            (deadline.dueDate.getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          dias
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trilha de Auditoria
              </CardTitle>
              <CardDescription>
                Histórico de atividades de conformidade e alterações no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentAudits.map((audit) => {
                  const categoryConfig = CATEGORY_CONFIG[audit.category];
                  const Icon = categoryConfig?.icon || FileText;

                  return (
                    <div
                      key={audit.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-muted",
                          categoryConfig?.color,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {audit.description}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {audit.timestamp.toLocaleString("pt-BR")}
                              <Badge variant="outline" className="text-xs">
                                {categoryConfig?.label}
                              </Badge>
                              {audit.severity !== "info" && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    SEVERITY_CONFIG[audit.severity]?.bg,
                                    SEVERITY_CONFIG[audit.severity]?.text,
                                  )}
                                >
                                  {SEVERITY_CONFIG[audit.severity]?.label}
                                </Badge>
                              )}
                            </div>
                            {audit.userId && (
                              <div className="text-xs text-muted-foreground">
                                Usuário: {audit.userId}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceDashboard;
