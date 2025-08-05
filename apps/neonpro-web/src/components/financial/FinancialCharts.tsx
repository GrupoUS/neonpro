'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Download,
  Maximize2,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';

interface FinancialChartsProps {
  charts: any;
  analytics?: any;
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';
  loading?: boolean;
  detailed?: boolean;
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
  [key: string]: any;
}

interface ChartConfig {
  title: string;
  description: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: ChartData[];
  xKey: string;
  yKey: string;
  color: string;
  format: 'currency' | 'percentage' | 'number';
}

export function FinancialCharts({
  charts,
  analytics,
  timeframe,
  loading = false,
  detailed = false,
  className = ''
}: FinancialChartsProps) {
  const [selectedChart, setSelectedChart] = useState<string>('revenue');
  const [chartView, setChartView] = useState<'overview' | 'detailed'>('overview');
  const [dateRange, setDateRange] = useState<string>('30');

  // Color palette for charts
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6'
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Generate mock data for demonstration
  const generateMockData = (type: string, days: number = 30): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const baseValue = type === 'revenue' ? 15000 : 
                       type === 'patients' ? 25 :
                       type === 'treatments' ? 12 :
                       type === 'satisfaction' ? 4.2 : 100;
      
      const variance = baseValue * 0.3;
      const value = baseValue + (Math.random() - 0.5) * variance;
      
      data.push({
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        date: date.toISOString(),
        value: Math.max(0, value),
        category: type
      });
    }
    
    return data;
  };

  // Chart configurations
  const chartConfigs: Record<string, ChartConfig> = useMemo(() => ({
    revenue: {
      title: 'Receita Diária',
      description: 'Evolução da receita ao longo do tempo',
      type: 'area',
      data: generateMockData('revenue', parseInt(dateRange)),
      xKey: 'name',
      yKey: 'value',
      color: colors.primary,
      format: 'currency'
    },
    patients: {
      title: 'Pacientes por Dia',
      description: 'Número de pacientes atendidos diariamente',
      type: 'bar',
      data: generateMockData('patients', parseInt(dateRange)),
      xKey: 'name',
      yKey: 'value',
      color: colors.secondary,
      format: 'number'
    },
    treatments: {
      title: 'Tratamentos Realizados',
      description: 'Quantidade de tratamentos por dia',
      type: 'line',
      data: generateMockData('treatments', parseInt(dateRange)),
      xKey: 'name',
      yKey: 'value',
      color: colors.accent,
      format: 'number'
    },
    satisfaction: {
      title: 'Satisfação do Paciente',
      description: 'Avaliação média diária dos pacientes',
      type: 'line',
      data: generateMockData('satisfaction', parseInt(dateRange)),
      xKey: 'name',
      yKey: 'value',
      color: colors.purple,
      format: 'number'
    }
  }), [dateRange]);

  // Treatment distribution data for pie chart
  const treatmentDistribution = [
    { name: 'Limpeza', value: 35, color: colors.primary },
    { name: 'Restauração', value: 25, color: colors.secondary },
    { name: 'Ortodontia', value: 20, color: colors.accent },
    { name: 'Endodontia', value: 12, color: colors.danger },
    { name: 'Outros', value: 8, color: colors.purple }
  ];

  // Revenue by treatment type
  const revenueByTreatment = [
    { name: 'Ortodontia', value: 45000, percentage: 35 },
    { name: 'Implantes', value: 32000, percentage: 25 },
    { name: 'Restauração', value: 25000, percentage: 20 },
    { name: 'Limpeza', value: 15000, percentage: 12 },
    { name: 'Outros', value: 10000, percentage: 8 }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, format }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = format === 'currency' ? formatCurrency(value) :
                            format === 'percentage' ? formatPercentage(value) :
                            value.toLocaleString('pt-BR');
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {`${payload[0].name}: ${formattedValue}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Período:</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {detailed && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Visualização:</label>
              <Select value={chartView} onValueChange={(value: any) => setChartView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="detailed">Detalhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {chartConfigs.revenue.title}
            </CardTitle>
            <CardDescription>{chartConfigs.revenue.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartConfigs.revenue.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfigs.revenue.xKey} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip format={chartConfigs.revenue.format} />} />
                <Area 
                  type="monotone" 
                  dataKey={chartConfigs.revenue.yKey} 
                  stroke={chartConfigs.revenue.color}
                  fill={chartConfigs.revenue.color}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patients Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {chartConfigs.patients.title}
            </CardTitle>
            <CardDescription>{chartConfigs.patients.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartConfigs.patients.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfigs.patients.xKey} />
                <YAxis />
                <Tooltip content={<CustomTooltip format={chartConfigs.patients.format} />} />
                <Bar dataKey={chartConfigs.patients.yKey} fill={chartConfigs.patients.color} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treatment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição de Tratamentos
            </CardTitle>
            <CardDescription>Percentual de tratamentos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={treatmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {treatmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              {chartConfigs.satisfaction.title}
            </CardTitle>
            <CardDescription>{chartConfigs.satisfaction.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartConfigs.satisfaction.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfigs.satisfaction.xKey} />
                <YAxis domain={[0, 5]} />
                <Tooltip content={<CustomTooltip format={chartConfigs.satisfaction.format} />} />
                <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={4.5} stroke="#10b981" strokeDasharray="5 5" />
                <Line 
                  type="monotone" 
                  dataKey={chartConfigs.satisfaction.yKey} 
                  stroke={chartConfigs.satisfaction.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfigs.satisfaction.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Section */}
      {detailed && chartView === 'detailed' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Análise Detalhada</h3>
          
          {/* Revenue by Treatment Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Receita por Tipo de Tratamento
              </CardTitle>
              <CardDescription>Análise de receita por categoria de tratamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByTreatment.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: Object.values(colors)[index] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.value)}</div>
                      <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crescimento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">+12.5%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Comparado ao mês anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eficiência Operacional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">87%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Taxa de utilização da agenda
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">R$ 485</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Valor médio por consulta
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialCharts;
