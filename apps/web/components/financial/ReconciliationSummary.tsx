'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

type ReconciliationSummaryProps = {
  'data-testid'?: string;
  className?: string;
};

type SummaryMetrics = {
  totalTransactions: number;
  reconciledAmount: number;
  pendingAmount: number;
  discrepanciesAmount: number;
  reconciliationRate: number;
  patientsAffected: number;
  lastUpdateTime: string;
  complianceScore: number;
  medicalProcedures: number;
  paymentMethods: {
    pix: number;
    card: number;
    cash: number;
    insurance: number;
  };
};

/**
 * Reconciliation Summary Component
 *
 * Healthcare Financial Reconciliation Overview
 * - Patient payment reconciliation status
 * - Medical procedure billing summary
 * - LGPD compliance metrics
 * - ANVISA procedure tracking
 * - CFM professional billing oversight
 *
 * Quality Standard: ≥9.9/10 (Healthcare financial integrity)
 */
export const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({
  'data-testid': testId = 'reconciliation-summary',
  className = '',
}) => {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummaryMetrics();
  }, [loadSummaryMetrics]);

  const loadSummaryMetrics = async () => {
    try {
      setIsLoading(true);
      // Simulate healthcare API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock healthcare financial data
      const mockMetrics: SummaryMetrics = {
        totalTransactions: 1247,
        reconciledAmount: 89_420.5,
        pendingAmount: 12_630.75,
        discrepanciesAmount: 890.25,
        reconciliationRate: 87.6,
        patientsAffected: 156,
        lastUpdateTime: new Date().toISOString(),
        complianceScore: 94.2,
        medicalProcedures: 89,
        paymentMethods: {
          pix: 45.2,
          card: 32.1,
          cash: 15.3,
          insurance: 7.4,
        },
      };

      setMetrics(mockMetrics);
    } catch (_err) {
      setError('Erro ao carregar métricas de reconciliação');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className} data-testid={`${testId}-loading`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Carregando Resumo...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div className="h-4 animate-pulse rounded bg-muted" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Alert data-testid={`${testId}-error`} variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || 'Dados indisponíveis'}</AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (rate: number) => {
    if (rate >= 95) {
      return (
        <Badge className="bg-green-100 text-green-800" variant="default">
          Excelente
        </Badge>
      );
    }
    if (rate >= 85) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800" variant="default">
          Bom
        </Badge>
      );
    }
    return <Badge variant="destructive">Atenção</Badge>;
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge className="bg-green-100 text-green-800" variant="default">
          Conforme
        </Badge>
      );
    }
    if (score >= 75) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800" variant="default">
          Atenção
        </Badge>
      );
    }
    return <Badge variant="destructive">Não Conforme</Badge>;
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
              <CardDescription>
                Reconciliação de pagamentos médicos e procedimentos
              </CardDescription>
            </div>
            {getStatusBadge(metrics.reconciliationRate)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Reconciled Amount */}
            <div className="space-y-2" data-testid="reconciled-amount">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Reconciliado</span>
              </div>
              <p className="font-bold text-2xl text-green-600">
                {formatCurrency(metrics.reconciledAmount)}
              </p>
            </div>

            {/* Pending Amount */}
            <div className="space-y-2" data-testid="pending-amount">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm">Pendente</span>
              </div>
              <p className="font-bold text-2xl text-yellow-600">
                {formatCurrency(metrics.pendingAmount)}
              </p>
            </div>

            {/* Discrepancies */}
            <div className="space-y-2" data-testid="discrepancies-amount">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-sm">Divergências</span>
              </div>
              <p className="font-bold text-2xl text-red-600">
                {formatCurrency(metrics.discrepanciesAmount)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de Reconciliação</span>
              <span className="font-medium">
                {metrics.reconciliationRate.toFixed(1)}%
              </span>
            </div>
            <Progress
              className="w-full"
              data-testid="reconciliation-progress"
              value={metrics.reconciliationRate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Healthcare Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Patient Impact */}
        <Card data-testid="patient-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-4 w-4" />
              Impacto nos Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pacientes Afetados</span>
                <span className="font-medium">{metrics.patientsAffected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Procedimentos Médicos</span>
                <span className="font-medium">{metrics.medicalProcedures}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Transações</span>
                <span className="font-medium">
                  {metrics.totalTransactions.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card data-testid="compliance-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-4 w-4" />
              Conformidade LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Score de Conformidade</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {metrics.complianceScore.toFixed(1)}%
                  </span>
                  {getComplianceBadge(metrics.complianceScore)}
                </div>
              </div>
              <Progress
                className="w-full"
                data-testid="compliance-progress"
                value={metrics.complianceScore}
              />
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <FileText className="h-3 w-3" />
                <span>
                  Última auditoria:{' '}
                  {new Date(metrics.lastUpdateTime).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <Card data-testid="payment-methods">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-4 w-4" />
            Distribuição de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.paymentMethods).map(
              ([method, percentage]) => (
                <div className="space-y-1" key={method}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {method === 'pix'
                        ? 'PIX'
                        : method === 'card'
                          ? 'Cartão'
                          : method === 'cash'
                            ? 'Dinheiro'
                            : 'Convênio'}
                    </span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <Progress className="h-2" value={percentage} />
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
