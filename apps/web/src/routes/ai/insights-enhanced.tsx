'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UniversalButton } from '@/components/ui/universal-button';
import { useToast } from '@/hooks/use-toast';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, isThisMonth, isThisWeek, isToday, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  Activity as ActivityIcon,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  CheckCircle as CheckCircleIcon,
  ChevronDown,
  ChevronRight,
  Clock,
  Clock as ClockIcon,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Globe,
  HardDrive,
  Heart,
  LineChart,
  Mail,
  MapPin,
  Monitor,
  MoreHorizontal,
  Network,
  Phone,
  PieChart,
  Pill,
  Pulse,
  RefreshCw,
  ScatterChart,
  Server,
  Settings,
  Shield,
  Smartphone,
  Stethoscope,
  Syringe,
  Tablet,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/ai/insights-enhanced')({
  component: AIInsightsPage,
});

// Enhanced Types for comprehensive AI analytics
interface AIInsight {
  id: string;
  type:
    | 'health_risk'
    | 'treatment_optimization'
    | 'prevention'
    | 'compliance'
    | 'operational'
    | 'population_health';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  subcategory?: string;
  patientCount?: number;
  impact: string;
  potentialSavings?: number;
  recommendations: string[];
  data: {
    labels: string[];
    values: number[];
    secondaryValues?: number[];
    trends?: number[];
  };
  metadata?: {
    modelVersion: string;
    dataSource: string;
    updateFrequency: string;
    confidenceInterval?: [number, number];
  };
  createdAt: string;
  expiresAt?: string;
  actionable: boolean;
  actionLabel?: string;
}

interface AIModel {
  id: string;
  name: string;
  type:
    | 'prediction'
    | 'classification'
    | 'clustering'
    | 'nlp'
    | 'anomaly_detection'
    | 'time_series';
  status: 'active' | 'training' | 'maintenance' | 'error' | 'updating';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  predictionsCount: number;
  description: string;
  features: string[];
  targetVariable: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    roc_auc?: number;
  };
  usage: {
    dailyPredictions: number;
    totalPredictions: number;
    averageResponseTime: number;
  };
}

interface PredictionTrend {
  date: string;
  accuracy: number;
  predictions: number;
  impact: number;
  modelVersion: string;
}

interface PopulationHealthMetrics {
  totalPatients: number;
  activePatients: number;
  highRiskPatients: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  demographics: {
    ageGroups: {
      '0-18': number;
      '19-35': number;
      '36-50': number;
      '51-65': number;
      '65+': number;
    };
    gender: {
      male: number;
      female: number;
      other: number;
    };
    locations: {
      city: string;
      patientCount: number;
      averageRiskScore: number;
    }[];
  };
  treatmentOutcomes: {
    successRate: number;
    complicationRate: number;
    readmissionRate: number;
    patientSatisfaction: number;
  };
}

interface NoShowAnalysis {
  overallRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  predictionAccuracy: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  highRiskPatients: {
    id: string;
    name: string;
    riskScore: number;
    lastAppointment: string;
    nextAppointment?: string;
  }[];
  recommendations: string[];
}

interface TreatmentEffectiveness {
  treatmentType: string;
  patientCount: number;
  successRate: number;
  averageDuration: number;
  costEffectiveness: number;
  satisfactionScore: number;
  trends: {
    period: string;
    successRate: number;
  }[];
}

// Mock data generators
const generateMockInsights = (): AIInsight[] => [
  {
    id: '1',
    type: 'health_risk',
    title: 'Risco Elevado de Não Comparecimento',
    description:
      'Análise preditiva identifica 45 pacientes com alto risco (>80%) de não comparecimento a consultas esta semana',
    confidence: 92,
    priority: 'high',
    category: 'Predição',
    subcategory: 'Não Comparecimento',
    patientCount: 45,
    impact: 'Alto impacto na receita e eficiência operacional',
    potentialSavings: 12500,
    recommendations: [
      'Enviar lembretes personalizados 24h antes',
      'Oferecer teleconsulta como alternativa',
      'Priorizar confirmação por telefone',
    ],
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      values: [12, 15, 18, 22, 25, 28, 30],
      trends: [2, 3, 4, 4, 3, 2, 2],
    },
    metadata: {
      modelVersion: 'v2.1.3',
      dataSource: 'Appointments + Patient History',
      updateFrequency: 'Diária',
      confidenceInterval: [0.88, 0.96],
    },
    createdAt: new Date().toISOString(),
    actionable: true,
    actionLabel: 'Ver Pacientes em Risco',
  },
  {
    id: '2',
    type: 'treatment_optimization',
    title: 'Otimização de Protocolo para Hipertensão',
    description:
      'Análise sugere ajuste de dosagem para 120 pacientes com hipertensão não controlada',
    confidence: 87,
    priority: 'medium',
    category: 'Tratamento',
    subcategory: 'Otimização',
    patientCount: 120,
    impact: 'Melhoria significativa nos desfechos clínicos',
    potentialSavings: 8500,
    recommendations: [
      'Ajustar dosagem de Losartana',
      'Adicionar Amlodipina para pacientes refratários',
      'Monitorar pressão semanalmente',
    ],
    data: {
      labels: ['Atual', 'Proposto'],
      values: [65, 82],
      secondaryValues: [75, 88],
    },
    metadata: {
      modelVersion: 'v2.0.1',
      dataSource: 'Clinical Records + Vital Signs',
      updateFrequency: 'Semanal',
      confidenceInterval: [0.82, 0.92],
    },
    createdAt: new Date().toISOString(),
    actionable: true,
    actionLabel: 'Revisar Protocolos',
  },
  {
    id: '3',
    type: 'population_health',
    title: 'Tendência de Aumento de Diabetes Tipo 2',
    description:
      'Análise populacional mostra aumento de 15% em casos de diabetes tipo 2 em jovens adultos',
    confidence: 94,
    priority: 'high',
    category: 'Saúde Populacional',
    subcategory: 'Tendências',
    patientCount: 280,
    impact: 'Preocupação para saúde pública a longo prazo',
    recommendations: [
      'Implementar programa de prevenção',
      'Campanha de educação em estilo de vida',
      'Rastreamento precoce para grupos de risco',
    ],
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      values: [45, 52, 61, 73, 84],
      trends: [7, 9, 12, 11, 11],
    },
    metadata: {
      modelVersion: 'v3.0.2',
      dataSource: 'Population Health Records',
      updateFrequency: 'Mensal',
      confidenceInterval: [0.9, 0.98],
    },
    createdAt: new Date().toISOString(),
    actionable: true,
    actionLabel: 'Plano de Ação',
  },
  {
    id: '4',
    type: 'operational',
    title: 'Otimização de Agendamento',
    description: 'Padrões de agendamento indicam oportunidade de redução de 18% no tempo de espera',
    confidence: 89,
    priority: 'medium',
    category: 'Operacional',
    subcategory: 'Eficiência',
    impact: 'Melhoria na experiência do paciente e utilização de recursos',
    potentialSavings: 15200,
    recommendations: [
      'Redistribuir horários de pico',
      'Implementar sistema de triagem inteligente',
      'Aumentar capacidade em horários de alta demanda',
    ],
    data: {
      labels: ['Manhã', 'Tarde', 'Noite'],
      values: [85, 92, 78],
      secondaryValues: [70, 75, 65],
    },
    metadata: {
      modelVersion: 'v1.8.5',
      dataSource: 'Scheduling System + Wait Times',
      updateFrequency: 'Diária',
      confidenceInterval: [0.85, 0.93],
    },
    createdAt: new Date().toISOString(),
    actionable: true,
    actionLabel: 'Otimizar Agenda',
  },
];

const generateMockModels = (): AIModel[] => [
  {
    id: '1',
    name: 'No-Show Prediction v2.1',
    type: 'prediction',
    status: 'active',
    accuracy: 0.92,
    precision: 0.88,
    recall: 0.85,
    f1Score: 0.86,
    lastTrained: '2024-01-15',
    predictionsCount: 15420,
    description: 'Modelo de machine learning para prever não comparecimento a consultas',
    features: [
      'patient_age',
      'appointment_time',
      'day_of_week',
      'history',
      'distance',
    ],
    targetVariable: 'no_show',
    performance: {
      accuracy: 0.92,
      precision: 0.88,
      recall: 0.85,
      f1Score: 0.86,
      roc_auc: 0.91,
    },
    usage: {
      dailyPredictions: 450,
      totalPredictions: 15420,
      averageResponseTime: 120,
    },
  },
  {
    id: '2',
    name: 'Treatment Effectiveness Analyzer',
    type: 'classification',
    status: 'active',
    accuracy: 0.87,
    precision: 0.85,
    recall: 0.89,
    f1Score: 0.87,
    lastTrained: '2024-01-10',
    predictionsCount: 8750,
    description: 'Análise da efetividade de tratamentos médicos',
    features: ['treatment_type', 'duration', 'patient_profile', 'compliance'],
    targetVariable: 'treatment_success',
    performance: {
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.89,
      f1Score: 0.87,
      roc_auc: 0.89,
    },
    usage: {
      dailyPredictions: 280,
      totalPredictions: 8750,
      averageResponseTime: 200,
    },
  },
  {
    id: '3',
    name: 'Population Health Trend Analysis',
    type: 'time_series',
    status: 'training',
    accuracy: 0.94,
    precision: 0.92,
    recall: 0.93,
    f1Score: 0.92,
    lastTrained: '2024-01-12',
    predictionsCount: 3200,
    description: 'Análise de tendências em saúde populacional',
    features: [
      'demographics',
      'time_series',
      'environmental_factors',
      'utilization',
    ],
    targetVariable: 'health_trend',
    performance: {
      accuracy: 0.94,
      precision: 0.92,
      recall: 0.93,
      f1Score: 0.92,
    },
    usage: {
      dailyPredictions: 150,
      totalPredictions: 3200,
      averageResponseTime: 350,
    },
  },
];

const generateMockTrends = (): PredictionTrend[] => [
  {
    date: '2024-01-15',
    accuracy: 0.92,
    predictions: 450,
    impact: 85,
    modelVersion: 'v2.1.3',
  },
  {
    date: '2024-01-14',
    accuracy: 0.91,
    predictions: 432,
    impact: 82,
    modelVersion: 'v2.1.3',
  },
  {
    date: '2024-01-13',
    accuracy: 0.89,
    predictions: 418,
    impact: 79,
    modelVersion: 'v2.1.2',
  },
  {
    date: '2024-01-12',
    accuracy: 0.9,
    predictions: 445,
    impact: 84,
    modelVersion: 'v2.1.2',
  },
  {
    date: '2024-01-11',
    accuracy: 0.88,
    predictions: 401,
    impact: 76,
    modelVersion: 'v2.1.1',
  },
];

const generateMockPopulationMetrics = (): PopulationHealthMetrics => ({
  totalPatients: 2450,
  activePatients: 2156,
  highRiskPatients: 342,
  averageRiskScore: 0.42,
  riskDistribution: {
    low: 1256,
    medium: 852,
    high: 234,
    critical: 108,
  },
  demographics: {
    ageGroups: {
      '0-18': 156,
      '19-35': 485,
      '36-50': 687,
      '51-65': 745,
      '65+': 377,
    },
    gender: {
      male: 1028,
      female: 1398,
      other: 24,
    },
    locations: [
      { city: 'São Paulo', patientCount: 892, averageRiskScore: 0.41 },
      { city: 'Santos', patientCount: 234, averageRiskScore: 0.38 },
      { city: 'Guarulhos', patientCount: 445, averageRiskScore: 0.45 },
      { city: 'Osasco', patientCount: 267, averageRiskScore: 0.43 },
    ],
  },
  treatmentOutcomes: {
    successRate: 0.87,
    complicationRate: 0.08,
    readmissionRate: 0.05,
    patientSatisfaction: 4.2,
  },
});

const generateMockNoShowAnalysis = (): NoShowAnalysis => ({
  overallRate: 0.125,
  trend: 'decreasing',
  predictionAccuracy: 0.92,
  factors: [
    {
      name: 'Distância da clínica',
      impact: 0.85,
      description: 'Pacientes que moram >15km têm 2.3x mais risco',
    },
    {
      name: 'Horário da consulta',
      impact: 0.78,
      description: 'Consultas antes das 8h têm 45% menos não comparecimento',
    },
    {
      name: 'Histórico prévio',
      impact: 0.92,
      description: 'Pacientes com histórico têm 3.1x mais risco',
    },
    {
      name: 'Dias desde último contato',
      impact: 0.67,
      description: '>30 dias sem contato aumenta risco em 85%',
    },
  ],
  highRiskPatients: [
    {
      id: '1',
      name: 'João Silva',
      riskScore: 0.92,
      lastAppointment: '2023-12-01',
      nextAppointment: '2024-02-01',
    },
    {
      id: '2',
      name: 'Maria Santos',
      riskScore: 0.88,
      lastAppointment: '2023-11-15',
      nextAppointment: '2024-02-02',
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      riskScore: 0.85,
      lastAppointment: '2023-12-10',
      nextAppointment: '2024-02-03',
    },
  ],
  recommendations: [
    'Implementar sistema de lembretes personalizados',
    'Oferecer teleconsulta para pacientes de alto risco',
    'Priorizar confirmação por telefone para casos críticos',
    'Considerar horários preferenciais para pacientes distantes',
  ],
});

const generateMockTreatmentEffectiveness = (): TreatmentEffectiveness[] => [
  {
    treatmentType: 'Hipertensão',
    patientCount: 485,
    successRate: 0.82,
    averageDuration: 120,
    costEffectiveness: 0.87,
    satisfactionScore: 4.1,
    trends: [
      { period: 'Q1 2023', successRate: 0.78 },
      { period: 'Q2 2023', successRate: 0.8 },
      { period: 'Q3 2023', successRate: 0.81 },
      { period: 'Q4 2023', successRate: 0.82 },
    ],
  },
  {
    treatmentType: 'Diabetes Tipo 2',
    patientCount: 342,
    successRate: 0.76,
    averageDuration: 180,
    costEffectiveness: 0.82,
    satisfactionScore: 3.9,
    trends: [
      { period: 'Q1 2023', successRate: 0.72 },
      { period: 'Q2 2023', successRate: 0.74 },
      { period: 'Q3 2023', successRate: 0.75 },
      { period: 'Q4 2023', successRate: 0.76 },
    ],
  },
];

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'training':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'maintenance':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'updating':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return CheckCircle;
    case 'training':
      return Brain;
    case 'maintenance':
      return Settings;
    case 'error':
      return XCircle;
    case 'updating':
      return RefreshCw;
    default:
      return Clock;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'Crítico';
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Médio';
    case 'low':
      return 'Baixo';
    default:
      return priority;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

function AIInsightsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [trends, setTrends] = useState<PredictionTrend[]>([]);
  const [populationMetrics, setPopulationMetrics] = useState<PopulationHealthMetrics | null>(null);
  const [noShowAnalysis, setNoShowAnalysis] = useState<NoShowAnalysis | null>(
    null,
  );
  const [treatmentEffectiveness, setTreatmentEffectiveness] = useState<
    TreatmentEffectiveness[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [activeTab, setActiveTab] = useState('insights');

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setInsights(generateMockInsights());
        setModels(generateMockModels());
        setTrends(generateMockTrends());
        setPopulationMetrics(generateMockPopulationMetrics());
        setNoShowAnalysis(generateMockNoShowAnalysis());
        setTreatmentEffectiveness(generateMockTreatmentEffectiveness());

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados de IA');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter insights based on selections
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const categoryMatch = selectedCategory === 'all' || insight.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || insight.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [insights, selectedCategory, selectedPriority]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalInsights: insights.length,
      criticalInsights: insights.filter(i => i.priority === 'critical')
        .length,
      highRiskPatients: noShowAnalysis?.highRiskPatients.length || 0,
      modelAccuracy: models.length > 0
        ? models.reduce((sum, model) => sum + model.accuracy, 0)
          / models.length
        : 0,
      potentialSavings: insights.reduce(
        (sum, insight) => sum + (insight.potentialSavings || 0),
        0,
      ),
    };
  }, [insights, models, noShowAnalysis]);

  const handleInsightAction = (insight: AIInsight) => {
    toast({
      title: 'Ação executada',
      description: `${insight.actionLabel} foi realizada com sucesso.`,
    });
  };

  const handleExportReport = () => {
    toast({
      title: 'Relatório exportado',
      description: 'O relatório de insights de IA foi exportado conforme LGPD.',
    });
  };

  const handleRefreshData = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setInsights(generateMockInsights());
      setModels(generateMockModels());
      setLoading(false);
      toast({
        title: 'Dados atualizados',
        description: 'Os insights de IA foram atualizados com sucesso.',
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className='container mx-auto p-4 sm:p-6 max-w-7xl'>
        <div className='space-y-6'>
          {/* Header skeleton */}
          <div className='flex items-center gap-4'>
            <Skeleton className='h-10 w-10' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
            {Array.from({ length: 5 }).map((_, _index) => <Skeleton key={index} className='h-32' />)}
          </div>

          {/* Content skeleton */}
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <Skeleton className='h-96' />
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-64' />
              <Skeleton className='h-48' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4 sm:p-6 max-w-7xl'>
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 sm:p-6 max-w-7xl'>
      {/* Header with CFM compliance */}
      <header className='space-y-4 sm:space-y-6 mb-6 sm:mb-8'>
        {/* CFM Header */}
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Brain className='h-5 w-5 text-purple-600' />
              <span className='text-sm sm:text-base font-medium text-purple-900'>
                Sistema de Inteligência Artificial - CFM Compliant
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Shield className='h-4 w-4 text-purple-600' />
              <span className='text-xs sm:text-sm text-purple-700'>
                Análises realizadas conforme Resolução CFM 2.314/2022
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: '/patients/dashboard' })}
              className='h-10 w-10 p-0'
              aria-label='Voltar para dashboard'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>

            <div>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
                Insights de Inteligência Artificial
              </h1>
              <p className='text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0'>
                Análises preditivas e recomendações para otimização do cuidado
              </p>
            </div>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Button
              variant='outline'
              onClick={handleRefreshData}
              className='h-11 sm:h-10 text-base sm:text-sm font-medium'
              aria-label='Atualizar dados de IA'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Atualizar
            </Button>

            <Button
              variant='primary'
              onClick={handleExportReport}
              className='h-11 sm:h-10 text-base sm:text-sm font-medium'
              aria-label='Exportar relatório de IA'
            >
              <Download className='h-4 w-4 mr-2' />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <section aria-labelledby='metrics-heading' className='space-y-4'>
        <h2 id='metrics-heading' className='sr-only'>
          Métricas principais de IA
        </h2>
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
          <Card className='transition-all hover:shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm sm:text-base font-medium text-gray-900'>
                Total de Insights
              </CardTitle>
              <Brain className='h-4 w-4 text-purple-600' />
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='text-2xl sm:text-3xl font-bold text-gray-900'>
                {stats.totalInsights}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card className='transition-all hover:shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm sm:text-base font-medium text-gray-900'>
                Insights Críticos
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-red-600' />
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='text-2xl sm:text-3xl font-bold text-red-600'>
                {stats.criticalInsights}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Requerem ação imediata
              </p>
            </CardContent>
          </Card>

          <Card className='transition-all hover:shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm sm:text-base font-medium text-gray-900'>
                Pacientes em Risco
              </CardTitle>
              <Users className='h-4 w-4 text-orange-600' />
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='text-2xl sm:text-3xl font-bold text-orange-600'>
                {stats.highRiskPatients}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Alto risco de não comparecimento
              </p>
            </CardContent>
          </Card>

          <Card className='transition-all hover:shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm sm:text-base font-medium text-gray-900'>
                Acurácia dos Modelos
              </CardTitle>
              <Target className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='text-2xl sm:text-3xl font-bold text-green-600'>
                {formatPercentage(stats.modelAccuracy)}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Média geral
              </p>
            </CardContent>
          </Card>

          <Card className='transition-all hover:shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm sm:text-base font-medium text-gray-900'>
                Economia Potencial
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='text-2xl sm:text-3xl font-bold text-blue-600'>
                {formatCurrency(stats.potentialSavings)}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Mensal estimada
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filters */}
      <Card>
        <CardContent className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Filtros:</span>
            </div>

            <div className='grid gap-2 grid-cols-1 sm:grid-cols-3 flex-1'>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Categoria' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas as Categorias</SelectItem>
                  <SelectItem value='Predição'>Predição</SelectItem>
                  <SelectItem value='Tratamento'>Tratamento</SelectItem>
                  <SelectItem value='Saúde Populacional'>
                    Saúde Populacional
                  </SelectItem>
                  <SelectItem value='Operacional'>Operacional</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Prioridade' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas as Prioridades</SelectItem>
                  <SelectItem value='critical'>Crítico</SelectItem>
                  <SelectItem value='high'>Alto</SelectItem>
                  <SelectItem value='medium'>Médio</SelectItem>
                  <SelectItem value='low'>Baixo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Período' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='24h'>Últimas 24 horas</SelectItem>
                  <SelectItem value='7d'>Últimos 7 dias</SelectItem>
                  <SelectItem value='30d'>Últimos 30 dias</SelectItem>
                  <SelectItem value='90d'>Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='insights' className='text-sm sm:text-base'>
            Insights
          </TabsTrigger>
          <TabsTrigger value='population' className='text-sm sm:text-base'>
            Saúde Populacional
          </TabsTrigger>
          <TabsTrigger value='models' className='text-sm sm:text-base'>
            Modelos de IA
          </TabsTrigger>
          <TabsTrigger value='analytics' className='text-sm sm:text-base'>
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value='insights' className='space-y-6'>
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
            {filteredInsights.map(insight => (
              <Card
                key={insight.id}
                className='transition-all hover:shadow-lg border-l-4 border-l-purple-500'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-sm font-medium leading-tight'>
                      {insight.title}
                    </CardTitle>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {getPriorityLabel(insight.priority)}
                    </Badge>
                  </div>
                  <CardDescription className='text-xs'>
                    {insight.category} • {formatPercentage(insight.confidence)} confiança
                    {insight.patientCount
                      && ` • ${insight.patientCount} pacientes`}
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-2 space-y-4'>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {insight.description}
                  </p>

                  {insight.potentialSavings && (
                    <div className='bg-green-50 border border-green-200 rounded p-2'>
                      <div className='text-xs font-medium text-green-800'>
                        Economia potencial: {formatCurrency(insight.potentialSavings)}
                      </div>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <div className='text-xs font-medium text-gray-900'>
                      Recomendações:
                    </div>
                    <ul className='text-xs text-gray-600 space-y-1'>
                      {insight.recommendations.slice(0, 2).map((rec, _index) => (
                        <li key={index} className='flex items-start gap-1'>
                          <span className='text-green-600 mt-1'>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                      {insight.recommendations.length > 2 && (
                        <li className='text-xs text-purple-600'>
                          +{insight.recommendations.length - 2} mais recomendações
                        </li>
                      )}
                    </ul>
                  </div>

                  {insight.actionable && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleInsightAction(insight)}
                      className='w-full'
                    >
                      {insight.actionLabel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInsights.length === 0 && (
            <Card>
              <CardContent className='text-center py-12'>
                <Brain className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>
                  Nenhum insight encontrado
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Tente ajustar os filtros para ver mais insights.
                </p>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Population Health Tab */}
        <TabsContent value='population' className='space-y-6'>
          {populationMetrics && (
            <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='h-5 w-5 text-orange-600' />
                    Distribuição de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    {Object.entries(populationMetrics.riskDistribution).map(
                      ([level, count]) => {
                        const percentage = (count / populationMetrics.totalPatients) * 100;
                        const color = level === 'critical'
                          ? 'red'
                          : level === 'high'
                          ? 'orange'
                          : level === 'medium'
                          ? 'yellow'
                          : 'green';

                        return (
                          <div key={level} className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                              <span className='font-medium capitalize'>
                                {level}
                              </span>
                              <span>
                                {count} pacientes ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className='h-2' />
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-blue-600' />
                    Demografia
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <div className='text-sm font-medium mb-2'>
                      Grupos Etários
                    </div>
                    <div className='space-y-2'>
                      {Object.entries(
                        populationMetrics.demographics.ageGroups,
                      ).map(([group, count]) => {
                        const percentage = (count / populationMetrics.totalPatients) * 100;
                        return (
                          <div
                            key={group}
                            className='flex justify-between text-sm'
                          >
                            <span>{group}</span>
                            <span>
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm font-medium mb-2'>Gênero</div>
                    <div className='space-y-2'>
                      {Object.entries(
                        populationMetrics.demographics.gender,
                      ).map(([gender, count]) => {
                        const percentage = (count / populationMetrics.totalPatients) * 100;
                        return (
                          <div
                            key={gender}
                            className='flex justify-between text-sm'
                          >
                            <span className='capitalize'>{gender}</span>
                            <span>
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Heart className='h-5 w-5 text-red-600' />
                    Desfechos do Tratamento
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 grid-cols-2'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {formatPercentage(
                          populationMetrics.treatmentOutcomes.successRate,
                        )}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Taxa de Sucesso
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {populationMetrics.treatmentOutcomes.patientSatisfaction.toFixed(
                          1,
                        )}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Satisfação
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Taxa de complicações:</span>
                      <span className='text-orange-600'>
                        {formatPercentage(
                          populationMetrics.treatmentOutcomes.complicationRate,
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Taxa de readmissão:</span>
                      <span className='text-red-600'>
                        {formatPercentage(
                          populationMetrics.treatmentOutcomes.readmissionRate,
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5 text-purple-600' />
                    Localizações Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {populationMetrics.demographics.locations
                    .slice(0, 5)
                    .map((location, _index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center text-sm'
                      >
                        <div>
                          <div className='font-medium'>{location.city}</div>
                          <div className='text-xs text-muted-foreground'>
                            {location.patientCount} pacientes
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>
                            {formatPercentage(location.averageRiskScore)} risco
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value='models' className='space-y-6'>
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
            {models.map(model => {
              const StatusIcon = getStatusIcon(model.status);

              return (
                <Card key={model.id} className='transition-all hover:shadow-lg'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg font-medium'>
                        {model.name}
                      </CardTitle>
                      <div className='flex items-center gap-2'>
                        <StatusIcon className='h-4 w-4' />
                        <Badge className={getStatusColor(model.status)}>
                          {model.status === 'active'
                            ? 'Ativo'
                            : model.status === 'training'
                            ? 'Treinando'
                            : model.status === 'maintenance'
                            ? 'Manutenção'
                            : model.status === 'error'
                            ? 'Erro'
                            : 'Atualizando'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 grid-cols-2'>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-blue-600'>
                          {formatPercentage(model.accuracy)}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Acurácia
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-green-600'>
                          {model.predictionsCount.toLocaleString()}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Predições
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-gray-900'>
                        Performance:
                      </div>
                      <div className='grid gap-1 grid-cols-3 text-xs'>
                        <div>Precisão: {formatPercentage(model.precision)}</div>
                        <div>Recall: {formatPercentage(model.recall)}</div>
                        <div>F1-Score: {formatPercentage(model.f1Score)}</div>
                      </div>
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      Último treinamento: {format(new Date(model.lastTrained), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>

                    <div className='bg-gray-50 border border-gray-200 rounded p-2'>
                      <div className='text-xs font-medium text-gray-700 mb-1'>
                        Uso Diário:
                      </div>
                      <div className='text-xs text-gray-600'>
                        {model.usage.dailyPredictions} predições •{' '}
                        {model.usage.averageResponseTime}ms tempo médio
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-6'>
          {noShowAnalysis && (
            <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
              {/* No-Show Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='h-5 w-5 text-orange-600' />
                    Análise de Não Comparecimento
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 grid-cols-2'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {formatPercentage(noShowAnalysis.overallRate)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Taxa Geral
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formatPercentage(noShowAnalysis.predictionAccuracy)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Precisão da Previsão
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='text-sm font-medium mb-2'>
                      Fatores de Risco:
                    </div>
                    <div className='space-y-2'>
                      {noShowAnalysis.factors.map((factor, _index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between text-sm'
                        >
                          <span>{factor.name}</span>
                          <div className='flex items-center gap-2'>
                            <Progress
                              value={factor.impact * 100}
                              className='w-16 h-2'
                            />
                            <span className='text-xs text-gray-600'>
                              {formatPercentage(factor.impact)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* High Risk Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-red-600' />
                    Pacientes de Alto Risco
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {noShowAnalysis.highRiskPatients.map((patient, _index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 border rounded'
                    >
                      <div>
                        <div className='text-sm font-medium'>
                          {patient.name}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Última consulta: {format(
                            new Date(patient.lastAppointment),
                            'dd/MM/yyyy',
                            {
                              locale: ptBR,
                            },
                          )}
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge variant='destructive' className='text-xs'>
                          {formatPercentage(patient.riskScore)} risco
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Treatment Effectiveness */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Stethoscope className='h-5 w-5 text-green-600' />
                    Efetividade do Tratamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b'>
                          <th className='text-left p-2'>Tratamento</th>
                          <th className='text-left p-2'>Pacientes</th>
                          <th className='text-left p-2'>Taxa de Sucesso</th>
                          <th className='text-left p-2'>Duração Média</th>
                          <th className='text-left p-2'>Custo-efetividade</th>
                          <th className='text-left p-2'>Satisfação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentEffectiveness.map((treatment, _index) => (
                          <tr key={index} className='border-b'>
                            <td className='p-2 font-medium'>
                              {treatment.treatmentType}
                            </td>
                            <td className='p-2'>{treatment.patientCount}</td>
                            <td className='p-2'>
                              <span className='text-green-600 font-medium'>
                                {formatPercentage(treatment.successRate)}
                              </span>
                            </td>
                            <td className='p-2'>
                              {treatment.averageDuration} dias
                            </td>
                            <td className='p-2'>
                              <span className='text-blue-600 font-medium'>
                                {formatPercentage(treatment.costEffectiveness)}
                              </span>
                            </td>
                            <td className='p-2'>
                              <span className='text-purple-600 font-medium'>
                                {treatment.satisfactionScore.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Processing Status */}
      <Card className='bg-gray-50'>
        <CardContent className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Cpu className='h-6 w-6 text-blue-600' />
              <div>
                <h3 className='text-sm font-medium text-gray-900'>
                  Status do Sistema de IA
                </h3>
                <p className='text-xs text-gray-600'>
                  Todos os modelos estão operacionais e processando dados
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                {models.filter(m => m.status === 'active').length} modelos ativos
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {models
                  .reduce((sum, m) => sum + m.predictionsCount, 0)
                  .toLocaleString()} previsões
              </Badge>
              <Badge variant='outline' className='text-xs'>
                Última atualização: {format(new Date(), 'HH:mm', { locale: ptBR })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
