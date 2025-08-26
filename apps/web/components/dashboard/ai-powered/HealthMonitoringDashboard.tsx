/**
 * Health Monitoring Dashboard
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Heart,
  Monitor,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface HealthMetrics {
  systemUptime: number;
  apiResponseTime: number;
  databaseHealth: number;
  activeUsers: number;
  errorRate: number;
  complianceStatus: number;
  securityScore: number;
  backupStatus: "success" | "warning" | "error";
  lastBackup: string;
}

interface HealthAlert {
  id: string;
  type: "error" | "warning" | "info";
  component: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function HealthMonitoringDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time health monitoring
    const loadHealthData = () => {
      setMetrics({
        systemUptime: 99.97,
        apiResponseTime: 187,
        databaseHealth: 98.5,
        activeUsers: 47,
        errorRate: 0.12,
        complianceStatus: 99.2,
        securityScore: 96.8,
        backupStatus: "success",
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      });

      setAlerts([
        {
          id: "1",
          type: "warning",
          component: "Cache Layer",
          message: "Cache hit rate baixa (78%) - recomendado >85%",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: "2",
          type: "info",
          component: "LGPD Monitor",
          message: "Auditoria LGPD executada com sucesso - 100% compliant",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: true,
        },
        {
          id: "3",
          type: "error",
          component: "API Gateway",
          message: "Pico de latência detectado no endpoint /api/patients",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          resolved: true,
        },
      ]);

      setLoading(false);
    };

    loadHealthData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (metrics) {
        setMetrics((prev) => ({
          ...prev!,
          apiResponseTime: Math.floor(150 + Math.random() * 100),
          activeUsers: Math.floor(40 + Math.random() * 20),
          errorRate: Math.random() * 0.5,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getHealthStatus = (
    value: number,
    thresholds: { good: number; warning: number },
  ) => {
    if (value >= thresholds.good) {
      return "success";
    }
    if (value >= thresholds.warning) {
      return "warning";
    }
    return "error";
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "success": {
        return "text-green-600";
      }
      case "warning": {
        return "text-yellow-600";
      }
      case "error": {
        return "text-red-600";
      }
      default: {
        return "text-muted-foreground";
      }
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": {
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      }
      case "warning": {
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      }
      case "info": {
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      }
      default: {
        return <Activity className="h-4 w-4" />;
      }
    }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      role="main"
      aria-labelledby="health-heading"
      aria-describedby="health-description"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="health-heading"
            className="text-2xl font-bold text-foreground"
          >
            Monitoramento de Saúde
          </h2>
          <p id="health-description" className="text-muted-foreground">
            Status em tempo real da infraestrutura e compliance
          </p>
        </div>
        <div
          className="flex items-center space-x-2"
          role="status"
          aria-label="Sistema operacional"
        >
          <div
            className="flex h-3 w-3 rounded-full bg-green-600 animate-pulse"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            Sistema Operacional
          </span>
        </div>
      </div>

      {/* System Health Overview */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-labelledby="health-metrics-heading"
      >
        <h3 id="health-metrics-heading" className="sr-only">
          Métricas de saúde do sistema
        </h3>

        {/* System Uptime */}
        <Card
          className="neonpro-card group"
          role="article"
          aria-labelledby="uptime-title"
        >
          <CardHeader className="pb-2">
            <CardTitle
              id="uptime-title"
              className="flex items-center text-sm font-medium"
            >
              <div
                className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 transition-all"
                aria-hidden="true"
              >
                <Monitor
                  className="h-4 w-4 text-green-600"
                  aria-hidden="true"
                />
              </div>
              System Uptime
            </CardTitle>
            <CardDescription>Disponibilidade do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="text-2xl font-bold text-green-600"
                aria-label={`${metrics.systemUptime}% de disponibilidade do sistema`}
              >
                {metrics.systemUptime}%
              </div>
              <Progress
                value={metrics.systemUptime}
                className="h-2"
                aria-label={`Progresso de uptime: ${metrics.systemUptime}%`}
              />
              <div className="text-xs text-muted-foreground">
                Meta: 99.9% | Status: Excelente
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Response Time */}
        <Card
          className="neonpro-card group"
          role="article"
          aria-labelledby="response-time-title"
        >
          <CardHeader className="pb-2">
            <CardTitle
              id="response-time-title"
              className="flex items-center text-sm font-medium"
            >
              <div
                className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-all"
                aria-hidden="true"
              >
                <Zap className="h-4 w-4 text-blue-600" aria-hidden="true" />
              </div>
              Tempo de Resposta
            </CardTitle>
            <CardDescription>API média (últimos 5min)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="text-2xl font-bold"
                aria-label={`Tempo de resposta da API: ${metrics.apiResponseTime} milissegundos`}
              >
                {metrics.apiResponseTime}ms
              </div>
              <div
                className={`text-xs ${getHealthColor(
                  getHealthStatus(300 - metrics.apiResponseTime, {
                    good: 150,
                    warning: 100,
                  }),
                )}`}
                role="status"
                aria-label={`Status: ${
                  metrics.apiResponseTime < 200
                    ? "Excelente"
                    : metrics.apiResponseTime < 300
                      ? "Bom"
                      : "Atenção"
                }`}
              >
                {metrics.apiResponseTime < 200
                  ? "Excelente"
                  : metrics.apiResponseTime < 300
                    ? "Bom"
                    : "Atenção"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Health */}
        <Card
          className="neonpro-card group"
          role="article"
          aria-labelledby="database-title"
        >
          <CardHeader className="pb-2">
            <CardTitle
              id="database-title"
              className="flex items-center text-sm font-medium"
            >
              <div
                className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-all"
                aria-hidden="true"
              >
                <Activity
                  className="h-4 w-4 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              Saúde do Banco
            </CardTitle>
            <CardDescription>Performance Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="text-2xl font-bold text-green-600"
                aria-label={`${metrics.databaseHealth}% de saúde do banco de dados`}
              >
                {metrics.databaseHealth}%
              </div>
              <Progress
                value={metrics.databaseHealth}
                className="h-2"
                aria-label={`Progresso da saúde do banco: ${metrics.databaseHealth}%`}
              />
              <div className="text-xs text-muted-foreground">
                Conexões: 12/100 | CPU: 23%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card
          className="neonpro-card group"
          role="article"
          aria-labelledby="users-title"
        >
          <CardHeader className="pb-2">
            <CardTitle
              id="users-title"
              className="flex items-center text-sm font-medium"
            >
              <div
                className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 transition-all"
                aria-hidden="true"
              >
                <Users className="h-4 w-4 text-chart-2" aria-hidden="true" />
              </div>
              Usuários Ativos
            </CardTitle>
            <CardDescription>Sessões simultâneas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="text-2xl font-bold"
                aria-label={`${metrics.activeUsers} usuários ativos atualmente`}
              >
                {metrics.activeUsers}
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp
                  className="h-3 w-3 text-green-600"
                  aria-hidden="true"
                />
                <span
                  className="text-xs text-green-600"
                  role="status"
                  aria-label="Crescimento de 15% em relação a ontem"
                >
                  +15% vs ontem
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance & Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neonpro-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Shield className="mr-2 h-4 w-4 text-green-600" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">LGPD</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  100%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ANVISA</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  98.5%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CFM</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  100%
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="text-lg font-bold text-green-600">
                  {metrics.complianceStatus}%
                </div>
                <div className="text-xs text-muted-foreground">Score Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Heart className="mr-2 h-4 w-4 text-red-600" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{metrics.securityScore}%</div>
              <Progress value={metrics.securityScore} className="h-2" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Firewall</span>
                  <span className="text-green-600">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL</span>
                  <span className="text-green-600">A+</span>
                </div>
                <div className="flex justify-between">
                  <span>Vulnerabilidades</span>
                  <span className="text-green-600">0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Stethoscope className="mr-2 h-4 w-4 text-blue-600" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Backup Completo</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Último backup:{" "}
                {new Date(metrics.lastBackup).toLocaleString("pt-BR")}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Frequência</span>
                  <span>A cada 2h</span>
                </div>
                <div className="flex justify-between">
                  <span>Retenção</span>
                  <span>30 dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Local</span>
                  <span>Brasil (São Paulo)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="neonpro-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
            Alertas Recentes
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real de eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 rounded-lg border p-3 ${
                  alert.resolved ? "opacity-60" : ""
                } transition-opacity`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {alert.component}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                    {alert.resolved && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600 text-xs"
                      >
                        Resolvido
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
                {!alert.resolved && (
                  <Button size="sm" variant="outline">
                    Investigar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
