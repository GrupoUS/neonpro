// Revenue Analytics Dashboard
// Epic 5, Story 5.1, Task 4: Revenue & Profitability Analysis UI
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { RevenueAnalyticsEngine } from '@/lib/financial/revenue-analytics-engine';

interface ServiceRevenueData {
  serviceId: string;
  serviceName: string;
  category: string;
  totalRevenue: number;
  transactionCount: number;
  averageValue: number;
  costAllocation: number;
  profitMargin: number;
  growthRate: number;
  seasonalIndex: number;
}

interface ProviderRevenueData {
  providerId: string;
  providerName: string;
  specialization: string;
  totalRevenue: number;
  patientCount: number;
  averageRevenuePerPatient: number;
  utilizationRate: number;
  conversionRate: number;
  growthTrend: number;
}

interface PatientLTVData {
  patientId: string;
  totalLifetimeValue: number;
  averageVisitValue: number;
  visitFrequency: number;
  retentionRate: number;
  churnRisk: number;
  nextVisitProbability: number;
  recommendedActions: string[];
}

export default function RevenueAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('current_month');
  const [serviceData, setServiceData] = useState<ServiceRevenueData[]>([]);
  const [providerData, setProviderData] = useState<ProviderRevenueData[]>([]);
  const [patientLTVData, setPatientLTVData] = useState<PatientLTVData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState<any>({});

  const revenueEngine = new RevenueAnalyticsEngine();

  useEffect(() => {
    loadRevenueAnalytics();
  }, [dateRange]);

  const loadRevenueAnalytics = async () => {
    setLoading(true);
    try {
      const clinicId = 'clinic-1'; // Get from context
      const dateRanges = parseDateRange(dateRange);
      
      const [
        serviceRevenue,
        providerPerformance,
        timeSeries,
        patientLTV,
        forecast,
        dashboardData
      ] = await Promise.all([
        revenueEngine.analyzeRevenueByService({
          clinicId,
          dateRange: dateRanges
        }),
        revenueEngine.analyzeProviderPerformance({
          clinicId,
          dateRange: dateRanges
        }),
        revenueEngine.generateTimePeriodAnalysis(clinicId, dateRanges, 'previous_period'),
        revenueEngine.calculatePatientLifetimeValue(clinicId),
        revenueEngine.generateRevenueForecast(clinicId, 6),
        revenueEngine.getRevenueAnalyticsDashboard(clinicId, dateRanges)
      ]);

      setServiceData(serviceRevenue);
      setProviderData(providerPerformance);
      setTimeSeriesData(timeSeries);
      setPatientLTVData(patientLTV);
      setForecastData(forecast);
      setSummaryMetrics(dashboardData.summary);
    } catch (error) {
      console.error('Failed to load revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'current_month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
      case 'last_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
        return {
          start: new Date(now.getFullYear(), quarterStart, 1),
          end: new Date(now.getFullYear(), quarterStart + 3, 0)
        };
      case 'current_year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31)
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando analytics de receita...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Análise detalhada de receita e rentabilidade por serviço, provedor e paciente
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="last_quarter">Último Trimestre</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadRevenueAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summaryMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                {summaryMetrics.growthRate > 0 ? '+' : ''}{formatPercent(summaryMetrics.growthRate || 0)}
              </span>
              {' '}vs período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(summaryMetrics.averageProfitMargin || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Meta: 35%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviço Top</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.topServiceRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {serviceData[0]?.serviceName || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provedor Top</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.topProviderRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {providerData[0]?.providerName || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Análise por Serviço</TabsTrigger>
          <TabsTrigger value="providers">Performance de Provedores</TabsTrigger>
          <TabsTrigger value="patients">Lifetime Value</TabsTrigger>
          <TabsTrigger value="forecast">Previsão de Receita</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Serviço</CardTitle>
              <CardDescription>Análise de rentabilidade e performance por tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceData.map((service) => (
                  <div key={service.serviceId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{service.serviceName}</h4>
                        <Badge variant={service.profitMargin > 30 ? 'default' : service.profitMargin > 15 ? 'secondary' : 'destructive'}>
                          {formatPercent(service.profitMargin)} margem
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Total</p>
                          <p className="font-medium">{formatCurrency(service.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transações</p>
                          <p className="font-medium">{service.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Médio</p>
                          <p className="font-medium">{formatCurrency(service.averageValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Crescimento</p>
                          <p className={`font-medium ${service.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {service.growthRate > 0 ? '+' : ''}{formatPercent(service.growthRate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Provedores</CardTitle>
              <CardDescription>Análise de receita e eficiência por profissional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerData.map((provider) => (
                  <div key={provider.providerId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{provider.providerName}</h4>
                        <Badge variant="outline">{provider.specialization}</Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Total</p>
                          <p className="font-medium">{formatCurrency(provider.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pacientes</p>
                          <p className="font-medium">{provider.patientCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Receita/Paciente</p>
                          <p className="font-medium">{formatCurrency(provider.averageRevenuePerPatient)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilização</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={provider.utilizationRate} className="flex-1" />
                            <span className="text-xs">{formatPercent(provider.utilizationRate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversão</p>
                          <p className="font-medium">{formatPercent(provider.conversionRate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value dos Pacientes</CardTitle>
              <CardDescription>Análise de valor e comportamento dos pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientLTVData.slice(0, 10).map((patient) => (
                  <div key={patient.patientId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Paciente {patient.patientId.slice(-8)}</h4>
                        <div className="flex items-center space-x-2">
                          {patient.churnRisk > 0.7 && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Alto Risco
                            </Badge>
                          )}
                          <Badge variant={patient.totalLifetimeValue > 5000 ? 'default' : 'secondary'}>
                            {formatCurrency(patient.totalLifetimeValue)} LTV
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor por Visita</p>
                          <p className="font-medium">{formatCurrency(patient.averageVisitValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frequência</p>
                          <p className="font-medium">{patient.visitFrequency.toFixed(1)} visitas/ano</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Retenção</p>
                          <p className="font-medium">{formatPercent(patient.retentionRate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próxima Visita</p>
                          <p className="font-medium">{formatPercent(patient.nextVisitProbability)}</p>
                        </div>
                      </div>
                      {patient.recommendedActions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Ações Recomendadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.recommendedActions.map((action, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Receita</CardTitle>
              <CardDescription>Projeções baseadas em dados históricos e tendências</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{forecast.period}</h4>
                        <Badge variant={forecast.trend === 'increasing' ? 'default' : forecast.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                          {forecast.trend === 'increasing' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                           forecast.trend === 'decreasing' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                          {forecast.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Prevista</p>
                          <p className="font-medium">{formatCurrency(forecast.forecastedRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intervalo de Confiança</p>
                          <p className="font-medium">
                            {formatCurrency(forecast.confidenceInterval.lower)} - {formatCurrency(forecast.confidenceInterval.upper)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa de Crescimento</p>
                          <p className={`font-medium ${forecast.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {forecast.growthRate > 0 ? '+' : ''}{formatPercent(forecast.growthRate)}
                          </p>
                        </div>
                      </div>
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