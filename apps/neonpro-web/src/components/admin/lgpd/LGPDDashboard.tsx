"use client";

import React from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import type { useLGPDDashboard } from "@/hooks/useLGPD";
import type { LGPDMetrics } from "@/types/lgpd";

interface LGPDDashboardProps {
  className?: string;
}

export function LGPDDashboard({ className }: LGPDDashboardProps) {
  const { metrics, isLoading, error, refreshMetrics, exportReport } = useLGPDDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar métricas: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Nenhuma métrica disponível</AlertDescription>
      </Alert>
    );
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className={className}>
      {/* Header com ações */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard LGPD</h2>
          <p className="text-muted-foreground">
            Visão geral da conformidade com a Lei Geral de Proteção de Dados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Geral</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.overallCompliance}%</div>
            <Progress value={metrics.overallCompliance} className="mb-2" />
            <Badge variant={getComplianceVariant(metrics.overallCompliance)}>
              {metrics.overallCompliance >= 90
                ? "Excelente"
                : metrics.overallCompliance >= 70
                  ? "Bom"
                  : "Crítico"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConsents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 &&
                `${((metrics.activeConsents / metrics.totalUsers) * 100).toFixed(1)}% dos usuários`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingRequests > 5 ? (
                <span className="text-red-600">Atenção necessária</span>
              ) : (
                "Dentro do prazo"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeIncidents === 0 ? (
                <span className="text-green-600">Nenhum incidente</span>
              ) : (
                <span className="text-red-600">Requer atenção</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e notificações */}
      {(metrics.pendingRequests > 5 || metrics.activeIncidents > 0) && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong>
            {metrics.pendingRequests > 5 && (
              <span>
                {" "}
                Há {metrics.pendingRequests} solicitações pendentes que precisam de atenção.
              </span>
            )}
            {metrics.activeIncidents > 0 && (
              <span>
                {" "}
                Há {metrics.activeIncidents} incidente(s) ativo(s) que requer(em) resolução.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Detalhes por categoria */}
      <Tabs defaultValue="consents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="consents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Consentimentos</CardTitle>
                <CardDescription>Distribuição dos consentimentos por status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Ativos</span>
                  <Badge variant="default">{metrics.activeConsents}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expirados</span>
                  <Badge variant="secondary">{metrics.expiredConsents || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Retirados</span>
                  <Badge variant="outline">{metrics.withdrawnConsents || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências</CardTitle>
                <CardDescription>Evolução dos consentimentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Esta semana</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Este mês</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Acesso</span>
                  <Badge variant="outline">15</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exclusão</span>
                  <Badge variant="outline">8</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Retificação</span>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Portabilidade</span>
                  <Badge variant="outline">3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Média</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">2.3 dias</span>
                    </div>
                  </div>
                  <Progress value={77} className="mb-2" />
                  <p className="text-xs text-muted-foreground">Meta: 3 dias (LGPD)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pendentes</span>
                  <Badge variant="secondary">{metrics.pendingRequests}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em Processamento</span>
                  <Badge variant="default">12</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Concluídas</span>
                  <Badge variant="outline">156</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incidentes por Severidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Crítica</span>
                  <Badge variant="destructive">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Alta</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Média</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Baixa</span>
                  <Badge variant="outline">0</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resolução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Média</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">4.2 horas</span>
                    </div>
                  </div>
                  <Progress value={85} className="mb-2" />
                  <p className="text-xs text-muted-foreground">Meta: 6 horas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Última Avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pontuação</span>
                    <Badge variant={getComplianceVariant(metrics.overallCompliance)}>
                      {metrics.overallCompliance}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Aprovada</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próxima Avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Agendada para</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tipo</span>
                    <Badge variant="outline">Automatizada</Badge>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    Executar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
