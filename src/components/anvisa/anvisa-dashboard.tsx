/**
 * ANVISA Compliance Dashboard Component
 * Main dashboard for ANVISA compliance monitoring and management
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceMetrics {
  overall_score: number;
  total_products: number;
  compliant_products: number;
  total_professionals: number;
  certified_professionals: number;
  active_alerts: number;
  resolved_alerts: number;
  pending_procedures: number;
  completed_procedures: number;
}

interface ANVISADashboardProps {
  clinicId: string;
}

export function ANVISADashboard({ clinicId }: ANVISADashboardProps) {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchComplianceMetrics();
  }, [clinicId]);

  const fetchComplianceMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/anvisa/compliance?clinic_id=${clinicId}&action=metrics`
      );
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching ANVISA metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90)
      return { status: 'excellent', color: 'bg-green-500', text: 'Excelente' };
    if (score >= 75)
      return { status: 'good', color: 'bg-blue-500', text: 'Bom' };
    if (score >= 60)
      return { status: 'warning', color: 'bg-yellow-500', text: 'Atenção' };
    return { status: 'critical', color: 'bg-red-500', text: 'Crítico' };
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const complianceStatus = getComplianceStatus(metrics.overall_score);

  return (
    <div className="space-y-6">
      {/* Header with Overall Compliance Score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            ANVISA Compliance
          </h2>
          <p className="text-muted-foreground">
            Monitoramento e gestão de conformidade regulatória
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Score de Conformidade
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={cn('h-3 w-3 rounded-full', complianceStatus.color)}
              ></div>
              <span className="text-2xl font-bold">
                {metrics.overall_score}%
              </span>
              <Badge
                variant={
                  complianceStatus.status === 'excellent'
                    ? 'default'
                    : complianceStatus.status === 'good'
                      ? 'secondary'
                      : complianceStatus.status === 'warning'
                        ? 'outline'
                        : 'destructive'
                }
              >
                {complianceStatus.text}
              </Badge>
            </div>
          </div>
          <Button onClick={fetchComplianceMetrics} variant="outline" size="sm">
            Atualizar Dados
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.compliant_products}/{metrics.total_products}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (metrics.compliant_products / metrics.total_products) *
                100
              ).toFixed(1)}
              % em conformidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.certified_professionals}/{metrics.total_professionals}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (metrics.certified_professionals /
                  metrics.total_professionals) *
                100
              ).toFixed(1)}
              % certificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_alerts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.resolved_alerts} resolvidos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procedimentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.pending_procedures}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.completed_procedures} concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {metrics.active_alerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas de Conformidade Ativos</AlertTitle>
          <AlertDescription>
            Existem {metrics.active_alerts} alertas de conformidade que requerem
            atenção imediata.
            <Button variant="outline" size="sm" className="ml-2">
              Ver Alertas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="professionals">Profissionais</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Categoria</CardTitle>
                <CardDescription>
                  Status de conformidade por área regulatória
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Registro de Produtos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.compliant_products / metrics.total_products) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {(
                        (metrics.compliant_products / metrics.total_products) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Certificação Profissional</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.certified_professionals / metrics.total_professionals) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {(
                        (metrics.certified_professionals /
                          metrics.total_professionals) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Recomendadas</CardTitle>
                <CardDescription>
                  Próximos passos para melhorar a conformidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.active_alerts > 0 && (
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Resolver alertas ativos</div>
                      <div className="text-sm text-muted-foreground">
                        {metrics.active_alerts} alertas requerem atenção
                      </div>
                    </div>
                  </div>
                )}
                {metrics.compliant_products < metrics.total_products && (
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <Package className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        Atualizar registro de produtos
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metrics.total_products - metrics.compliant_products}{' '}
                        produtos pendentes
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Produtos</CardTitle>
              <CardDescription>
                Produtos registrados e conformidade ANVISA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface detalhada de produtos será implementada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals">
          <Card>
            <CardHeader>
              <CardTitle>Profissionais Certificados</CardTitle>
              <CardDescription>
                Certificações e autorizações profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de profissionais será implementada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures">
          <Card>
            <CardHeader>
              <CardTitle>Procedimentos Estéticos</CardTitle>
              <CardDescription>
                Registro e acompanhamento de procedimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de procedimentos será implementada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Conformidade</CardTitle>
              <CardDescription>
                Monitoramento e resolução de alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de alertas será implementada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
