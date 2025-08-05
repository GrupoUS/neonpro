// Brazilian Tax Dashboard Component
// Story 5.5: Main dashboard for Brazilian tax management

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  FileCheck,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface TaxDashboardProps {
  clinicId: string;
}

interface TaxStatistics {
  nfe_statistics: {
    total_documents: number;
    total_value: number;
    by_status: Record<string, number>;
    by_month: Array<{
      month: string;
      count: number;
      value: number;
    }>;
  };
  tax_summary: {
    total_revenue: number;
    total_taxes: number;
    effective_rate: number;
    breakdown: {
      icms: number;
      iss: number;
      pis: number;
      cofins: number;
      irpj: number;
      csll: number;
      simples_nacional: number;
      inss: number;
      outros: number;
    };
  };
  period: {
    start: string;
    end: string;
  };
}

export default function TaxDashboard({ clinicId }: TaxDashboardProps) {
  const [statistics, setStatistics] = useState<TaxStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        clinic_id: clinicId,
        start_date: dateRange.start,
        end_date: dateRange.end,
        type: 'overview'
      });

      const response = await fetch(`/api/tax/statistics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load tax statistics');
      }

      const data = await response.json();
      setStatistics(data.data);
    } catch (err) {
      console.error('Error loading tax statistics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [clinicId, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authorized':
        return CheckCircle;
      case 'draft':
        return Clock;
      case 'cancelled':
      case 'rejected':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando estatísticas fiscais...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro ao carregar dados: {error}</span>
          </div>
          <Button 
            onClick={loadStatistics} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Fiscal</h1>
          <p className="text-gray-600">
            Período: {new Date(statistics.period.start).toLocaleDateString()} - {new Date(statistics.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={loadStatistics} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFes Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.nfe_statistics.total_documents}</div>
            <p className="text-xs text-muted-foreground">
              Valor total: {formatCurrency(statistics.nfe_statistics.total_value)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.tax_summary.total_revenue || statistics.nfe_statistics.total_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Impostos: {formatCurrency(statistics.tax_summary.total_taxes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga Tributária</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(statistics.tax_summary.effective_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa efetiva de impostos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFes Autorizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.nfe_statistics.by_status.authorized || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((statistics.nfe_statistics.by_status.authorized || 0) / Math.max(statistics.nfe_statistics.total_documents, 1) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="nfe" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nfe">NFe Status</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
        </TabsList>

        {/* NFe Status Tab */}
        <TabsContent value="nfe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das NFes</CardTitle>
              <CardDescription>
                Distribuição das notas fiscais por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statistics.nfe_statistics.by_status).map(([status, count]) => {
                  const Icon = getStatusIcon(status);
                  return (
                    <div key={status} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Icon className="h-5 w-5" />
                      <div>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                        <p className="text-lg font-semibold mt-1">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Breakdown Tab */}
        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Impostos</CardTitle>
              <CardDescription>
                Breakdown dos impostos calculados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(statistics.tax_summary.breakdown)
                  .filter(([_, value]) => value > 0)
                  .map(([tax, value]) => (
                    <div key={tax} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium uppercase">{tax}</span>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {formatCurrency(value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((value / Math.max(statistics.tax_summary.total_taxes, 1)) * 100).toFixed(1)}% do total
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trends Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>
                NFes emitidas e valores por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.nfe_statistics.by_month.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('pt-BR', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {month.count} NFes emitidas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(month.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Média: {formatCurrency(month.value / Math.max(month.count, 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
