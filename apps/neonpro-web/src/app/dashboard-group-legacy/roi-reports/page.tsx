/**
 * ROI Reports Dashboard
 * NeonPro - Sistema de relatórios de ROI para comunicação
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Area, AreaChart, ScatterChart, Scatter,
  RadialBarChart, RadialBar, TreeMap, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  CalendarIcon, DownloadIcon, FilterIcon, RefreshCwIcon, TrendingUpIcon, TrendingDownIcon,
  DollarSignIcon, PercentIcon, UsersIcon, TargetIcon, BarChart3Icon, PieChartIcon,
  TrendingUp, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, InfoIcon,
  ArrowUpIcon, ArrowDownIcon, MinusIcon, PlayIcon, PauseIcon, StopIcon,
  FileTextIcon, ShareIcon, PrinterIcon, MailIcon, SlackIcon, Settings2Icon
} from 'lucide-react';

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface ROIMetrics {
  overall: {
    roi: number;
    revenue: number;
    investment: number;
    profit: number;
    roiTrend: 'up' | 'down' | 'stable';
    confidence: number;
  };
  byChannel: ChannelROI[];
  byCampaign: CampaignROI[];
  byPeriod: PeriodROI[];
  bySegment: SegmentROI[];
  projections: ROIProjection[];
  benchmarks: ROIBenchmark[];
}

interface ChannelROI {
  channel: string;
  roi: number;
  revenue: number;
  cost: number;
  volume: number;
  efficiency: number;
  trend: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface CampaignROI {
  campaignId: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  roi: number;
  revenue: number;
  cost: number;
  impressions: number;
  conversions: number;
  conversionRate: number;
  status: 'active' | 'completed' | 'paused';
}

interface PeriodROI {
  period: string;
  roi: number;
  revenue: number;
  cost: number;
  volume: number;
  trend: number;
  benchmark: number;
}

interface SegmentROI {
  segment: string;
  patients: number;
  roi: number;
  ltv: number;
  acquisitionCost: number;
  retentionRate: number;
  churnRate: number;
}

interface ROIProjection {
  period: string;
  projectedROI: number;
  conservative: number;
  optimistic: number;
  confidence: number;
  assumptions: string[];
}

interface ROIBenchmark {
  category: string;
  industry: number;
  region: number;
  clinic: number;
  gap: number;
  percentile: number;
}

interface ReportConfig {
  period: {
    start: Date;
    end: Date;
  };
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  channels: string[];
  segments: string[];
  metrics: string[];
  includeProjections: boolean;
  includeBenchmarks: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

// ====================================================================
// SAMPLE DATA
// ====================================================================

const sampleROIData: ROIMetrics = {
  overall: {
    roi: 285,
    revenue: 156800,
    investment: 42300,
    profit: 114500,
    roiTrend: 'up',
    confidence: 92
  },
  byChannel: [
    {
      channel: 'WhatsApp',
      roi: 420,
      revenue: 68500,
      cost: 12800,
      volume: 2840,
      efficiency: 95,
      trend: 15,
      status: 'excellent'
    },
    {
      channel: 'Email',
      roi: 315,
      revenue: 45200,
      cost: 11200,
      volume: 8650,
      efficiency: 88,
      trend: 8,
      status: 'excellent'
    },
    {
      channel: 'SMS',
      roi: 245,
      revenue: 28400,
      cost: 9200,
      volume: 1560,
      efficiency: 82,
      trend: -3,
      status: 'good'
    },
    {
      channel: 'Push',
      roi: 180,
      revenue: 14700,
      cost: 6100,
      volume: 4200,
      efficiency: 75,
      trend: 5,
      status: 'average'
    }
  ],
  byCampaign: [
    {
      campaignId: 'camp-001',
      name: 'Promoção Verão 2025',
      type: 'promotional',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-03-31'),
      roi: 380,
      revenue: 45600,
      cost: 9800,
      impressions: 125000,
      conversions: 456,
      conversionRate: 3.65,
      status: 'active'
    },
    {
      campaignId: 'camp-002',
      name: 'Reativação de Pacientes',
      type: 'retention',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-28'),
      roi: 295,
      revenue: 32400,
      cost: 8200,
      impressions: 45000,
      conversions: 324,
      conversionRate: 7.2,
      status: 'completed'
    }
  ],
  byPeriod: [
    { period: 'Jan 2025', roi: 265, revenue: 52400, cost: 15200, volume: 2400, trend: 12, benchmark: 220 },
    { period: 'Dez 2024', roi: 245, revenue: 48900, cost: 16800, volume: 2200, trend: 8, benchmark: 215 },
    { period: 'Nov 2024', roi: 230, revenue: 45600, cost: 17200, volume: 2100, trend: -2, benchmark: 210 }
  ],
  bySegment: [
    {
      segment: 'Premium',
      patients: 145,
      roi: 450,
      ltv: 8500,
      acquisitionCost: 280,
      retentionRate: 92,
      churnRate: 8
    },
    {
      segment: 'Regular',
      patients: 680,
      roi: 280,
      ltv: 3200,
      acquisitionCost: 180,
      retentionRate: 85,
      churnRate: 15
    },
    {
      segment: 'Básico',
      patients: 420,
      roi: 180,
      ltv: 1200,
      acquisitionCost: 120,
      retentionRate: 78,
      churnRate: 22
    }
  ],
  projections: [
    {
      period: 'Fev 2025',
      projectedROI: 295,
      conservative: 260,
      optimistic: 340,
      confidence: 85,
      assumptions: ['Manutenção das campanhas atuais', 'Crescimento sazonal típico']
    },
    {
      period: 'Mar 2025',
      projectedROI: 315,
      conservative: 280,
      optimistic: 365,
      confidence: 78,
      assumptions: ['Nova campanha primavera', 'Aumento de orçamento em 20%']
    }
  ],
  benchmarks: [
    { category: 'Email Marketing', industry: 220, region: 240, clinic: 315, gap: 75, percentile: 85 },
    { category: 'WhatsApp Business', industry: 280, region: 320, clinic: 420, gap: 100, percentile: 92 },
    { category: 'SMS Marketing', industry: 180, region: 200, clinic: 245, gap: 45, percentile: 78 }
  ]
};

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function ROIReportsPage() {
  const [roiData, setROIData] = useState<ROIMetrics>(sampleROIData);
  const [config, setConfig] = useState<ReportConfig>({
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    granularity: 'monthly',
    channels: ['WhatsApp', 'Email', 'SMS', 'Push'],
    segments: ['Premium', 'Regular', 'Básico'],
    metrics: ['roi', 'revenue', 'cost', 'volume'],
    includeProjections: true,
    includeBenchmarks: true,
    autoRefresh: false,
    refreshInterval: 300
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'campaigns' | 'projections' | 'benchmarks'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  useEffect(() => {
    loadROIData();
  }, [config.period, config.granularity]);

  const loadROIData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Em produção, buscar dados da API
      toast.success('Dados de ROI atualizados com sucesso');
    } catch (error) {
      toast.error('Erro ao carregar dados de ROI');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    toast.info(`Exportando relatório em formato ${format.toUpperCase()}...`);
    // Implementar exportação
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 200) return 'text-blue-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      average: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de ROI</h1>
          <p className="text-gray-600 mt-1">
            Análise avançada de retorno sobre investimento em comunicação
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => loadROIData()}
            disabled={loading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => exportReport('pdf')}
                >
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => exportReport('excel')}
                >
                  <BarChart3Icon className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => exportReport('csv')}
                >
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Visão Geral', icon: BarChart3Icon },
            { key: 'channels', label: 'Canais', icon: TrendingUp },
            { key: 'campaigns', label: 'Campanhas', icon: TargetIcon },
            { key: 'projections', label: 'Projeções', icon: TrendingUpIcon },
            { key: 'benchmarks', label: 'Benchmarks', icon: PercentIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI Geral</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${getROIColor(roiData.overall.roi)}`}>
                    {roiData.overall.roi}%
                  </div>
                  {getTrendIcon(15)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confiança: {roiData.overall.confidence}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {(roiData.overall.revenue / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investimento</CardTitle>
                <TargetIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(roiData.overall.investment / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-muted-foreground">
                  Orçamento utilizado: 85%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {(roiData.overall.profit / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {((roiData.overall.profit / roiData.overall.revenue) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ROI Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do ROI</CardTitle>
              <CardDescription>
                Acompanhamento do retorno sobre investimento ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={roiData.byPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Receita" />
                  <Bar yAxisId="left" dataKey="cost" fill="#ef4444" name="Custo" />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={3} name="ROI %" />
                  <Line yAxisId="right" type="monotone" dataKey="benchmark" stroke="#6b7280" strokeDasharray="5 5" name="Benchmark" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
                <CardDescription>ROI e eficiência de cada canal de comunicação</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roiData.byChannel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="roi" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita</CardTitle>
                <CardDescription>Contribuição de cada canal para a receita total</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roiData.byChannel}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      nameKey="channel"
                    >
                      {roiData.byChannel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Segment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise por Segmento</CardTitle>
              <CardDescription>Performance de ROI por segmento de pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roiData.bySegment.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{segment.segment}</h4>
                      <p className="text-sm text-gray-600">{segment.patients} pacientes</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className={`text-lg font-bold ${getROIColor(segment.roi)}`}>
                          {segment.roi}%
                        </div>
                        <div className="text-xs text-gray-500">ROI</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">
                          R$ {(segment.ltv / 1000).toFixed(1)}k
                        </div>
                        <div className="text-xs text-gray-500">LTV</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">
                          {segment.retentionRate}%
                        </div>
                        <div className="text-xs text-gray-500">Retenção</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {segment.churnRate}%
                        </div>
                        <div className="text-xs text-gray-500">Churn</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Detalhada por Canal</CardTitle>
              <CardDescription>
                Análise completa de ROI, custos e eficiência por canal de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roiData.byChannel.map((channel, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{channel.channel}</h3>
                        {getStatusBadge(channel.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(channel.trend)}
                        <span className="text-sm text-gray-600">
                          {channel.trend > 0 ? '+' : ''}{channel.trend}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className={`text-2xl font-bold ${getROIColor(channel.roi)}`}>
                          {channel.roi}%
                        </div>
                        <div className="text-sm text-gray-500">ROI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          R$ {(channel.revenue / 1000).toFixed(0)}k
                        </div>
                        <div className="text-sm text-gray-500">Receita</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          R$ {(channel.cost / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-gray-500">Custo</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {channel.volume.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Volume</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">
                            {channel.efficiency}%
                          </div>
                          <Progress value={channel.efficiency} className="w-16" />
                        </div>
                        <div className="text-sm text-gray-500">Eficiência</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Channel Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Canais</CardTitle>
              <CardDescription>ROI vs Eficiência por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={roiData.byChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="efficiency" name="Eficiência" unit="%" />
                  <YAxis dataKey="roi" name="ROI" unit="%" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Canais" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas e Concluídas</CardTitle>
              <CardDescription>
                Performance detalhada de campanhas de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roiData.byCampaign.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(campaign.startDate, 'dd/MM/yyyy', { locale: ptBR })} - {format(campaign.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(campaign.status)}
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <div className={`text-xl font-bold ${getROIColor(campaign.roi)}`}>
                          {campaign.roi}%
                        </div>
                        <div className="text-sm text-gray-500">ROI</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          R$ {(campaign.revenue / 1000).toFixed(0)}k
                        </div>
                        <div className="text-sm text-gray-500">Receita</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-600">
                          R$ {(campaign.cost / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-gray-500">Custo</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {campaign.impressions.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Impressões</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {campaign.conversions}
                        </div>
                        <div className="text-sm text-gray-500">Conversões</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {campaign.conversionRate}%
                        </div>
                        <div className="text-sm text-gray-500">Taxa Conversão</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projeções de ROI</CardTitle>
              <CardDescription>
                Previsões baseadas em dados históricos e tendências atuais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={roiData.projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="optimistic" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Cenário Otimista" />
                  <Area type="monotone" dataKey="projectedROI" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Projeção Base" />
                  <Area type="monotone" dataKey="conservative" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Cenário Conservador" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roiData.projections.map((projection, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{projection.period}</CardTitle>
                  <CardDescription>
                    Confiança: {projection.confidence}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {projection.conservative}%
                        </div>
                        <div className="text-sm text-gray-500">Conservador</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {projection.projectedROI}%
                        </div>
                        <div className="text-sm text-gray-500">Projetado</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {projection.optimistic}%
                        </div>
                        <div className="text-sm text-gray-500">Otimista</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Premissas:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {projection.assumptions.map((assumption, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação com Benchmarks</CardTitle>
              <CardDescription>
                Performance vs indústria, região e concorrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roiData.benchmarks.map((benchmark, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{benchmark.category}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        Percentil {benchmark.percentile}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-600">
                            {benchmark.industry}%
                          </div>
                          <div className="text-sm text-gray-500">Indústria</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-600">
                            {benchmark.region}%
                          </div>
                          <div className="text-sm text-gray-500">Região</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getROIColor(benchmark.clinic)}`}>
                            {benchmark.clinic}%
                          </div>
                          <div className="text-sm text-gray-500">Sua Clínica</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Diferença vs Indústria:
                        </span>
                        <span className={`text-lg font-bold ${benchmark.gap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {benchmark.gap > 0 ? '+' : ''}{benchmark.gap}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={(benchmark.clinic / Math.max(benchmark.industry, benchmark.region, benchmark.clinic)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação Visual</CardTitle>
              <CardDescription>Sua performance vs benchmarks do mercado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData.benchmarks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="industry" fill="#6b7280" name="Indústria" />
                  <Bar dataKey="region" fill="#f59e0b" name="Região" />
                  <Bar dataKey="clinic" fill="#3b82f6" name="Sua Clínica" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}