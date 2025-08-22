'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Filter,
  LineChart,
  PieChart,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  UserCheck,
  Heart,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  Target,
  Gauge,
  MapPin,
  Phone,
  Mail,
  Globe,
  Zap,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppointments } from '@/hooks/useAppointments';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { usePatients } from '@/hooks/usePatients';

// Types for analytics data
type AnalyticsTimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface AnalyticsKPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend: number[];
}

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

interface TrendData {
  period: string;
  revenue: number;
  patients: number;
  appointments: number;
  satisfaction: number;
}

// Visual components maintaining NeonPro design
const NeonGradientCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

const CosmicGlowButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '' 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// Mock data for healthcare analytics
const generateMockAnalyticsData = () => {
  const currentDate = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      period: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      revenue: Math.floor(Math.random() * 150000) + 80000,
      patients: Math.floor(Math.random() * 200) + 150,
      appointments: Math.floor(Math.random() * 300) + 200,
      satisfaction: Math.floor(Math.random() * 30) + 70,
    };
  }).reverse();

  const treatmentSuccessRates = [
    { name: 'Estética Facial', value: 94, total: 156, color: '#10b981' },
    { name: 'Cirurgia Plástica', value: 91, total: 89, color: '#3b82f6' },
    { name: 'Dermatologia', value: 96, total: 234, color: '#8b5cf6' },
    { name: 'Odontologia Estética', value: 88, total: 167, color: '#f59e0b' },
    { name: 'Harmonização Facial', value: 93, total: 198, color: '#ef4444' },
  ];

  const patientDemographics = [
    { name: '18-25 anos', value: 18, count: 89, color: '#06b6d4' },
    { name: '26-35 anos', value: 34, count: 167, color: '#3b82f6' },
    { name: '36-45 anos', value: 28, count: 134, color: '#8b5cf6' },
    { name: '46-55 anos', value: 15, count: 72, color: '#f59e0b' },
    { name: '56+ anos', value: 5, count: 24, color: '#ef4444' },
  ];

  const revenueByService = [
    { name: 'Cirurgia Plástica', value: 45, revenue: 245000, color: '#10b981' },
    { name: 'Estética Facial', value: 25, revenue: 136000, color: '#3b82f6' },
    { name: 'Harmonização', value: 18, revenue: 98000, color: '#8b5cf6' },
    { name: 'Dermatologia', value: 8, revenue: 43500, color: '#f59e0b' },
    { name: 'Outros', value: 4, revenue: 21800, color: '#ef4444' },
  ];

  const complianceMetrics = [
    { metric: 'LGPD Conformidade', score: 96, status: 'excellent', trend: 'up' },
    { metric: 'ANVISA Qualidade', score: 94, status: 'excellent', trend: 'up' },
    { metric: 'CFM Protocolos', score: 91, status: 'good', trend: 'stable' },
    { metric: 'ANS Indicadores', score: 89, status: 'good', trend: 'up' },
    { metric: 'Auditoria Interna', score: 97, status: 'excellent', trend: 'up' },
  ];

  return {
    trendData: last12Months,
    treatmentSuccessRates,
    patientDemographics,
    revenueByService,
    complianceMetrics,
  };
};

// KPI Card Component
const KPICard = ({ kpi }: { kpi: AnalyticsKPI }) => {
  const Icon = kpi.icon;
  const isPositive = kpi.changeType === 'increase';
  
  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-slate-300 text-sm font-medium">{kpi.title}</p>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-slate-400 text-xs">vs mês anterior</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white/10 p-3">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
      <p className="mt-3 text-slate-400 text-xs">{kpi.description}</p>
    </NeonGradientCard>
  );
};

// Simple Chart Components (can be replaced with Recharts later)
const SimpleBarChart = ({ data, height = 200 }: { data: ChartData[]; height?: number }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-4">
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{item.name}</span>
              <span className="text-white font-medium">{item.value}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color || '#3b82f6' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart = ({ data }: { data: ChartData[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex items-center space-x-6">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="rgb(51 65 85)"
            strokeWidth="8"
            fill="none"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const circumference = 2 * Math.PI * 56;
            const offset = circumference - (percentage / 100) * circumference;
            const prevPercentages = data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0);
            const rotation = (prevPercentages / total) * 360;
            
            return (
              <motion.circle
                key={index}
                cx="64"
                cy="64"
                r="56"
                stroke={item.color || '#3b82f6'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transformOrigin: '64px 64px',
                  transform: `rotate(${rotation}deg)`,
                }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            );
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || '#3b82f6' }}
            />
            <span className="text-slate-300 text-sm">{item.name}</span>
            <span className="text-white text-sm font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, height = 200 }: { data: TrendData[]; height?: number }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const range = maxRevenue - minRevenue;
  
  return (
    <div className="space-y-4">
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={height * ratio}
              x2="100%"
              y2={height * ratio}
              stroke="rgb(51 65 85)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          {/* Line path */}
          <motion.path
            d={`M ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = height - ((d.revenue - minRevenue) / range) * height;
              return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
            }).join(' ')}`}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
          {/* Area fill */}
          <motion.path
            d={`M ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = height - ((d.revenue - minRevenue) / range) * height;
              return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
            }).join(' ')} L 100% ${height} L 0% ${height} Z`}
            fill="url(#revenueGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d.period}</span>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { totalPatients, monthlyRevenue, upcomingAppointments, loading: metricsLoading } = useDashboardMetrics();
  const { patients, loading: patientsLoading } = usePatients();
  const { todaysAppointments, loading: appointmentsLoading } = useAppointments();

  const mockData = useMemo(() => generateMockAnalyticsData(), []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Healthcare KPIs
  const healthcareKPIs: AnalyticsKPI[] = useMemo(() => [
    {
      id: 'total-patients',
      title: 'Total de Pacientes',
      value: totalPatients || 486,
      change: 12.5,
      changeType: 'increase',
      icon: Users,
      description: 'Pacientes cadastrados no sistema',
      trend: [85, 91, 88, 94, 96, 89, 92],
    },
    {
      id: 'monthly-revenue',
      title: 'Receita Mensal',
      value: `R$ ${(monthlyRevenue || 125000).toLocaleString('pt-BR')}`,
      change: 8.3,
      changeType: 'increase',
      icon: DollarSign,
      description: 'Receita total do mês atual',
      trend: [78, 82, 85, 88, 91, 87, 93],
    },
    {
      id: 'appointments-scheduled',
      title: 'Consultas Agendadas',
      value: upcomingAppointments || 156,
      change: -2.1,
      changeType: 'decrease',
      icon: Calendar,
      description: 'Consultas agendadas próximos 30 dias',
      trend: [92, 89, 91, 88, 85, 87, 84],
    },
    {
      id: 'patient-satisfaction',
      title: 'Satisfação do Paciente',
      value: '94%',
      change: 3.2,
      changeType: 'increase',
      icon: Heart,
      description: 'Média de satisfação nas avaliações',
      trend: [88, 89, 91, 92, 93, 94, 94],
    },
    {
      id: 'treatment-success',
      title: 'Taxa de Sucesso',
      value: '92%',
      change: 1.8,
      changeType: 'increase',
      icon: Target,
      description: 'Taxa de sucesso nos tratamentos',
      trend: [89, 90, 91, 91, 92, 92, 92],
    },
    {
      id: 'compliance-score',
      title: 'Conformidade LGPD',
      value: '96%',
      change: 2.0,
      changeType: 'increase',
      icon: Shield,
      description: 'Score de conformidade regulatória',
      trend: [92, 93, 94, 95, 95, 96, 96],
    },
  ], [totalPatients, monthlyRevenue, upcomingAppointments]);

  if (isLoading || metricsLoading || patientsLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-96 bg-white/20" />
            <Skeleton className="h-6 w-64 bg-white/20" />
          </div>
          
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-white/20" />
            ))}
          </div>
          
          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics - NeonPro Healthcare</h1>
            <p className="text-slate-400">Análise completa da performance clínica e financeira</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={(value: AnalyticsTimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            
            <CosmicGlowButton onClick={() => window.location.reload()} size="sm" variant="secondary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </CosmicGlowButton>
            
            <CosmicGlowButton onClick={() => {}} size="sm" variant="success">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </CosmicGlowButton>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {healthcareKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-blue-600">
              Análise Clínica
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-blue-600">
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="predictive" className="data-[state=active]:bg-blue-600">
              Preditiva
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-600">
              Conformidade
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Revenue Trend */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Tendência de Receita</h3>
                      <p className="text-slate-400 text-sm">Evolução mensal da receita</p>
                    </div>
                    <LineChart className="h-6 w-6 text-blue-400" />
                  </div>
                  <SimpleLineChart data={mockData.trendData} height={250} />
                </div>
              </NeonGradientCard>

              {/* Patient Demographics */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Demografia de Pacientes</h3>
                      <p className="text-slate-400 text-sm">Distribuição por faixa etária</p>
                    </div>
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <SimplePieChart data={mockData.patientDemographics} />
                </div>
              </NeonGradientCard>

              {/* Treatment Success Rates */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Taxa de Sucesso por Tratamento</h3>
                      <p className="text-slate-400 text-sm">Percentual de sucesso por especialidade</p>
                    </div>
                    <Stethoscope className="h-6 w-6 text-green-400" />
                  </div>
                  <SimpleBarChart data={mockData.treatmentSuccessRates} height={250} />
                </div>
              </NeonGradientCard>

              {/* Revenue by Service */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Receita por Serviço</h3>
                      <p className="text-slate-400 text-sm">Distribuição da receita por tipo de serviço</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                  <SimplePieChart data={mockData.revenueByService} />
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>

          {/* Practice Analytics Tab */}
          <TabsContent value="practice" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Patient Flow Analytics */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Fluxo de Pacientes</h3>
                      <p className="text-slate-400 text-sm">Análise do fluxo de entrada e saída</p>
                    </div>
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">Novos Pacientes</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">42</div>
                        <div className="text-green-400 text-sm">+15%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-slate-300">Retornos</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">134</div>
                        <div className="text-blue-400 text-sm">+8%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-slate-300">Faltas</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">12</div>
                        <div className="text-red-400 text-sm">-23%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonGradientCard>

              {/* Provider Performance */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Performance dos Profissionais</h3>
                      <p className="text-slate-400 text-sm">Métricas de performance individual</p>
                    </div>
                    <UserCheck className="h-6 w-6 text-purple-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Dr. Ana Silva', score: 96, consultations: 156, satisfaction: 4.8 },
                      { name: 'Dr. Carlos Santos', score: 94, consultations: 142, satisfaction: 4.7 },
                      { name: 'Dra. Maria Costa', score: 92, consultations: 138, satisfaction: 4.6 },
                      { name: 'Dr. João Oliveira', score: 89, consultations: 124, satisfaction: 4.5 },
                    ].map((provider, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{provider.name}</span>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {provider.score}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{provider.consultations} consultas</span>
                          <span>★ {provider.satisfaction}</span>
                        </div>
                        <Progress value={provider.score} className="mt-2 h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>

              {/* Capacity Utilization */}
              <NeonGradientCard className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Utilização da Capacidade</h3>
                      <p className="text-slate-400 text-sm">Análise da ocupação por período e sala</p>
                    </div>
                    <Gauge className="h-6 w-6 text-orange-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { period: 'Manhã', utilization: 89, rooms: 4 },
                      { period: 'Tarde', utilization: 76, rooms: 4 },
                      { period: 'Noite', utilization: 45, rooms: 2 },
                      { period: 'Fim de Semana', utilization: 23, rooms: 1 },
                    ].map((slot, index) => (
                      <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{slot.utilization}%</div>
                        <div className="text-slate-300 text-sm">{slot.period}</div>
                        <div className="text-slate-400 text-xs">{slot.rooms} salas</div>
                        <Progress value={slot.utilization} className="mt-2 h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>

          {/* Financial Intelligence Tab */}
          <TabsContent value="financial" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Revenue Analytics */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Análise de Receita</h3>
                      <p className="text-slate-400 text-sm">Breakdown detalhado da receita</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-green-400">R$ 125.430</div>
                        <div className="text-slate-300 text-sm">Receita Bruta</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-blue-400">R$ 98.670</div>
                        <div className="text-slate-300 text-sm">Receita Líquida</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Margem Bruta</span>
                        <span className="text-white font-medium">78.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Custos Operacionais</span>
                        <span className="text-white font-medium">R$ 26.760</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">EBITDA</span>
                        <span className="text-green-400 font-medium">R$ 71.910</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonGradientCard>

              {/* Payment Methods */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Métodos de Pagamento</h3>
                      <p className="text-slate-400 text-sm">Distribuição por forma de pagamento</p>
                    </div>
                    <Target className="h-6 w-6 text-pink-400" />
                  </div>
                  
                  <SimplePieChart 
                    data={[
                      { name: 'Cartão de Crédito', value: 45, color: '#10b981' },
                      { name: 'PIX', value: 28, color: '#3b82f6' },
                      { name: 'Dinheiro', value: 15, color: '#8b5cf6' },
                      { name: 'Planos de Saúde', value: 8, color: '#f59e0b' },
                      { name: 'Outros', value: 4, color: '#ef4444' },
                    ]}
                  />
                </div>
              </NeonGradientCard>

              {/* Cash Flow */}
              <NeonGradientCard className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Fluxo de Caixa</h3>
                      <p className="text-slate-400 text-sm">Entradas e saídas mensais</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">R$ 142.580</div>
                      <div className="text-green-300 text-sm">Entradas</div>
                      <div className="text-green-400 text-xs mt-1">+12.5% vs mês anterior</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">R$ 43.910</div>
                      <div className="text-red-300 text-sm">Saídas</div>
                      <div className="text-red-400 text-xs mt-1">+8.2% vs mês anterior</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">R$ 98.670</div>
                      <div className="text-blue-300 text-sm">Saldo Líquido</div>
                      <div className="text-blue-400 text-xs mt-1">+15.8% vs mês anterior</div>
                    </div>
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* No-Show Prediction */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Predição de Faltas</h3>
                      <p className="text-slate-400 text-sm">Probabilidade de no-show por paciente</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { patient: 'Maria Santos', risk: 'Alto', probability: 78, appointment: 'Hoje 14:00' },
                      { patient: 'João Silva', risk: 'Médio', probability: 45, appointment: 'Amanhã 09:30' },
                      { patient: 'Ana Costa', risk: 'Baixo', probability: 12, appointment: 'Quinta 16:00' },
                      { patient: 'Carlos Oliveira', risk: 'Médio', probability: 38, appointment: 'Sexta 11:00' },
                    ].map((prediction, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{prediction.patient}</span>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${prediction.risk === 'Alto' ? 'text-red-400 border-red-400' : 
                                prediction.risk === 'Médio' ? 'text-yellow-400 border-yellow-400' : 
                                'text-green-400 border-green-400'}
                            `}
                          >
                            {prediction.risk}: {prediction.probability}%
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">{prediction.appointment}</div>
                        <Progress value={prediction.probability} className="mt-2 h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>

              {/* Revenue Projections */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Projeções de Receita</h3>
                      <p className="text-slate-400 text-sm">Previsões para os próximos meses</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-blue-400">R$ 132K</div>
                        <div className="text-slate-300 text-xs">Próximo Mês</div>
                        <div className="text-green-400 text-xs">+5.2%</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-purple-400">R$ 389K</div>
                        <div className="text-slate-300 text-xs">Trimestre</div>
                        <div className="text-green-400 text-xs">+8.7%</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-green-400">R$ 1.6M</div>
                        <div className="text-slate-300 text-xs">Anual</div>
                        <div className="text-green-400 text-xs">+12.3%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Confiança da Previsão</span>
                        <span className="text-green-400 font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-200">
                        Baseado em dados históricos e tendências sazonais
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </NeonGradientCard>

              {/* Seasonal Demand */}
              <NeonGradientCard className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Padrões de Demanda Sazonal</h3>
                      <p className="text-slate-400 text-sm">Análise de sazonalidade por tipo de procedimento</p>
                    </div>
                    <Calendar className="h-6 w-6 text-orange-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { season: 'Verão', procedures: 'Estética Corporal', trend: '+45%', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
                      { season: 'Outono', procedures: 'Tratamentos Faciais', trend: '+28%', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
                      { season: 'Inverno', procedures: 'Cirurgias Plásticas', trend: '+35%', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                      { season: 'Primavera', procedures: 'Harmonização Facial', trend: '+22%', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
                    ].map((pattern, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${pattern.color}`}>
                        <div className="font-bold text-lg">{pattern.season}</div>
                        <div className="text-sm opacity-90 mt-1">{pattern.procedures}</div>
                        <div className="text-lg font-bold mt-2">{pattern.trend}</div>
                        <div className="text-xs opacity-75">vs média anual</div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* LGPD Compliance */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Conformidade LGPD</h3>
                      <p className="text-slate-400 text-sm">Status de adequação à LGPD</p>
                    </div>
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-400">96%</div>
                      <div className="text-green-300 text-sm">Score de Conformidade</div>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { item: 'Consentimento de Dados', status: 'completed', score: 98 },
                        { item: 'Anonimização', status: 'completed', score: 95 },
                        { item: 'Relatórios de Impacto', status: 'warning', score: 89 },
                        { item: 'Treinamento de Equipe', status: 'completed', score: 100 },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <div className="flex items-center space-x-2">
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            )}
                            <span className="text-slate-300 text-sm">{item.item}</span>
                          </div>
                          <span className="text-white text-sm font-medium">{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NeonGradientCard>

              {/* Regulatory Metrics */}
              <NeonGradientCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Métricas Regulatórias</h3>
                      <p className="text-slate-400 text-sm">Indicadores de qualidade e conformidade</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {mockData.complianceMetrics.map((metric, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{metric.metric}</span>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${metric.status === 'excellent' ? 'text-green-400 border-green-400' : 
                                metric.status === 'good' ? 'text-blue-400 border-blue-400' : 
                                'text-yellow-400 border-yellow-400'}
                            `}
                          >
                            {metric.score}%
                          </Badge>
                        </div>
                        <Progress value={metric.score} className="h-2 mb-2" />
                        <div className="flex items-center space-x-1">
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                          ) : metric.trend === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          ) : (
                            <div className="h-3 w-3 bg-slate-400 rounded-full" />
                          )}
                          <span className={`text-xs ${
                            metric.trend === 'up' ? 'text-green-400' : 
                            metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {metric.trend === 'up' ? 'Melhorando' : 
                             metric.trend === 'down' ? 'Degradando' : 'Estável'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>

              {/* Audit Trail */}
              <NeonGradientCard className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Trilha de Auditoria</h3>
                      <p className="text-slate-400 text-sm">Atividades recentes de conformidade</p>
                    </div>
                    <Eye className="h-6 w-6 text-purple-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { time: '2 horas atrás', action: 'Backup automático realizado', user: 'Sistema', status: 'success' },
                      { time: '4 horas atrás', action: 'Relatório LGPD gerado', user: 'Admin', status: 'success' },
                      { time: '1 dia atrás', action: 'Auditoria de segurança executada', user: 'Sistema', status: 'success' },
                      { time: '2 dias atrás', action: 'Treinamento LGPD concluído', user: 'Equipe', status: 'success' },
                      { time: '3 dias atrás', action: 'Política de privacidade atualizada', user: 'Admin', status: 'warning' },
                    ].map((audit, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          audit.status === 'success' ? 'bg-green-400' : 
                          audit.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-white font-medium">{audit.action}</div>
                          <div className="text-slate-400 text-sm">por {audit.user}</div>
                        </div>
                        <div className="text-slate-400 text-sm">{audit.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Builder Integration */}
        <NeonGradientCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Custom Report Builder</h3>
              <p className="text-slate-400 text-sm">Crie relatórios personalizados com interface drag-and-drop</p>
            </div>
            <CosmicGlowButton 
              onClick={() => window.open('/dashboard/analytics/report-builder', '_blank')} 
              variant="success"
            >
              <FileText className="mr-2 h-4 w-4" />
              Abrir Report Builder
            </CosmicGlowButton>
          </div>
        </NeonGradientCard>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>NeonPro Healthcare Analytics - Dados atualizados em tempo real</p>
          <p>Conformidade LGPD/ANVISA • Accessibility WCAG 2.1 AA</p>
        </div>
      </div>
    </div>
  );
}