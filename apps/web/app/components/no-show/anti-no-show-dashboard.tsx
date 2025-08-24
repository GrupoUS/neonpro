'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Target,
  Brain,
  BarChart3,
  Activity,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getPredictions, getDashboardStats } from '@/app/lib/services/no-show-prediction';

interface PatientRiskData {
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  noShowProbability: number;
  riskCategory: 'low' | 'medium' | 'high' | 'very_high';
  confidenceScore: number;
  contributingFactors: FactorContribution[];
  recommendations: RecommendedAction[];
}

interface FactorContribution {
  factorName: string;
  category: 'patient' | 'appointment' | 'external' | 'historical';
  importanceWeight: number;
  impactDirection: 'increases_risk' | 'decreases_risk';
  description: string;
  confidence: number;
}

interface RecommendedAction {
  actionType: 'reminder' | 'scheduling' | 'incentive' | 'support' | 'escalation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedImpact: number;
  implementationCost: 'low' | 'medium' | 'high';
  timingRecommendation: string;
  successProbability: number;
}

interface DashboardStats {
  totalAppointments: number;
  predictedNoShows: number;
  noShowRate: number;
  prevented: number;
  cost_savings: number;
  modelAccuracy: number;
}

interface AntiNoShowDashboardProps {
  className?: string;
}

export function AntiNoShowDashboard({ className }: AntiNoShowDashboardProps) {
  // State management
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 156,
    predictedNoShows: 23,
    noShowRate: 14.7,
    prevented: 18,
    cost_savings: 12750,
    modelAccuracy: 87.3
  });

  const [highRiskPatients, setHighRiskPatients] = useState<PatientRiskData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { toast } = useToast();

  // Mock data for development
  const generateMockData = useCallback((): PatientRiskData[] => {
    const mockData: PatientRiskData[] = [
      {
        patientId: 'PAT-001',
        patientName: 'Maria Silva Santos',
        appointmentId: 'APT-2024-001',
        appointmentDate: '2025-01-25',
        appointmentTime: '09:30',
        appointmentType: 'Consulta de Rotina',
        noShowProbability: 0.78,
        riskCategory: 'very_high',
        confidenceScore: 0.89,
        contributingFactors: [
          {
            factorName: 'Histórico de Faltas',
            category: 'historical',
            importanceWeight: 0.35,
            impactDirection: 'increases_risk',
            description: 'Paciente faltou em 3 das últimas 5 consultas',
            confidence: 0.92
          },
          {
            factorName: 'Distância da Clínica',
            category: 'patient',
            importanceWeight: 0.22,
            impactDirection: 'increases_risk',
            description: 'Reside a 45km da clínica',
            confidence: 0.85
          },
          {
            factorName: 'Condições Climáticas',
            category: 'external',
            importanceWeight: 0.18,
            impactDirection: 'increases_risk',
            description: 'Previsão de chuva forte',
            confidence: 0.71
          }
        ],
        recommendations: [
          {
            actionType: 'reminder',
            priority: 'urgent',
            description: 'Ligação de confirmação 24h antes da consulta',
            estimatedImpact: 0.35,
            implementationCost: 'low',
            timingRecommendation: '24 horas antes',
            successProbability: 0.73
          },
          {
            actionType: 'incentive',
            priority: 'high',
            description: 'Oferecer reagendamento para horário mais próximo',
            estimatedImpact: 0.28,
            implementationCost: 'medium',
            timingRecommendation: 'Imediato',
            successProbability: 0.65
          }
        ]
      },
      {
        patientId: 'PAT-002',
        patientName: 'João Carlos Oliveira',
        appointmentId: 'APT-2024-002',
        appointmentDate: '2025-01-25',
        appointmentTime: '14:15',
        appointmentType: 'Exame de Rotina',
        noShowProbability: 0.65,
        riskCategory: 'high',
        confidenceScore: 0.82,
        contributingFactors: [
          {
            factorName: 'Primeira Consulta',
            category: 'appointment',
            importanceWeight: 0.28,
            impactDirection: 'increases_risk',
            description: 'Primeira consulta na clínica',
            confidence: 0.88
          },
          {
            factorName: 'Horário de Pico',
            category: 'appointment',
            importanceWeight: 0.24,
            impactDirection: 'increases_risk',
            description: 'Horário de alta demanda (14h-16h)',
            confidence: 0.79
          }
        ],
        recommendations: [
          {
            actionType: 'support',
            priority: 'high',
            description: 'SMS com informações de localização e preparação',
            estimatedImpact: 0.25,
            implementationCost: 'low',
            timingRecommendation: '48 horas antes',
            successProbability: 0.68
          }
        ]
      },
      {
        patientId: 'PAT-003',
        patientName: 'Ana Beatriz Costa',
        appointmentId: 'APT-2024-003',
        appointmentDate: '2025-01-25',
        appointmentTime: '16:00',
        appointmentType: 'Retorno',
        noShowProbability: 0.42,
        riskCategory: 'medium',
        confidenceScore: 0.76,
        contributingFactors: [
          {
            factorName: 'Aderência ao Tratamento',
            category: 'patient',
            importanceWeight: 0.31,
            impactDirection: 'decreases_risk',
            description: 'Alta aderência ao tratamento (92%)',
            confidence: 0.91
          }
        ],
        recommendations: [
          {
            actionType: 'reminder',
            priority: 'medium',
            description: 'Email de lembrete 48h antes',
            estimatedImpact: 0.15,
            implementationCost: 'low',
            timingRecommendation: '48 horas antes',
            successProbability: 0.58
          }
        ]
      }
    ];
    return mockData;
  }, []);

  // Load risk predictions data
  const loadPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would call the NoShowPredictionService
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const mockData = generateMockData();
      setHighRiskPatients(mockData);
      
      // Update stats based on loaded data
      const highRiskCount = mockData.filter(p => p.riskCategory === 'high' || p.riskCategory === 'very_high').length;
      setStats(prev => ({
        ...prev,
        predictedNoShows: highRiskCount,
        noShowRate: (highRiskCount / stats.totalAppointments) * 100
      }));
      
      toast({
        title: "Predições Atualizadas",
        description: `${mockData.length} pacientes analisados. ${highRiskCount} em alto risco.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao Carregar Dados",
        description: "Não foi possível carregar as predições. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData, stats.totalAppointments, toast]);

  // Initialize data on mount
  useEffect(() => {
    loadPredictions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter patients based on selection
  const filteredPatients = highRiskPatients.filter(patient => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return patient.riskCategory === 'high' || patient.riskCategory === 'very_high';
    if (selectedFilter === 'medium') return patient.riskCategory === 'medium';
    if (selectedFilter === 'low') return patient.riskCategory === 'low';
    return true;
  });

  // Risk category styling
  const getRiskBadgeVariant = (category: string) => {
    switch (category) {
      case 'very_high': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'very_high': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getRiskLabel = (category: string) => {
    switch (category) {
      case 'very_high': return 'Muito Alto';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Indefinido';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Engine Anti-No-Show
          </h1>
          <p className="text-muted-foreground">
            Predição inteligente e prevenção de faltas em consultas médicas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="w-3 h-3 mr-1" />
            ML Model v1.2.0
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            87.3% Accuracy
          </Badge>
          <Button 
            onClick={loadPredictions} 
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Próximas 48h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predição No-Show</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.predictedNoShows}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">↗ {stats.noShowRate.toFixed(1)}%</span> taxa estimada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prevenção Ativa</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.prevented}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↓ -22%</span> vs sem AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.cost_savings.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão IA</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modelAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +2.1%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intervenções</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Ações automáticas</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="risk_patients" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="risk_patients">Pacientes Risco</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="interventions">Intervenções</TabsTrigger>
              <TabsTrigger value="model_performance">Performance</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtros
              </Button>
              <div className="flex items-center gap-1">
                <Button 
                  variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={selectedFilter === 'high' ? 'destructive' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('high')}
                >
                  Alto Risco
                </Button>
                <Button 
                  variant={selectedFilter === 'medium' ? 'secondary' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('medium')}
                >
                  Médio
                </Button>
                <Button 
                  variant={selectedFilter === 'low' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('low')}
                >
                  Baixo
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Patients Tab */}
          <TabsContent value="risk_patients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <AnimatePresence>
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-12"
                  >
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Carregando predições...</p>
                    </div>
                  </motion.div>
                ) : (
                  filteredPatients.map((patient, index) => (
                    <PatientRiskCard key={patient.patientId} patient={patient} delay={index * 0.1} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics Avançado</h3>
              <p>Gráficos e análises detalhadas serão implementados aqui.</p>
            </div>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions">
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Estratégias de Intervenção</h3>
              <p>Configuração e análise de intervenções automáticas.</p>
            </div>
          </TabsContent>

          {/* Model Performance Tab */}
          <TabsContent value="model_performance">
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Performance do Modelo</h3>
              <p>Métricas detalhadas e matriz de confusão do modelo ML.</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Individual Patient Risk Card Component
function PatientRiskCard({ patient, delay = 0 }: { patient: PatientRiskData; delay?: number }) {
  const riskPercentage = Math.round(patient.noShowProbability * 100);
  const confidencePercentage = Math.round(patient.confidenceScore * 100);

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'very_high': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">{patient.patientName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.appointmentDate} às {patient.appointmentTime} - {patient.appointmentType}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getRiskBadgeVariant(patient.riskCategory)} className="flex items-center gap-1">
                {getRiskIcon(patient.riskCategory)}
                {getRiskLabel(patient.riskCategory)}
              </Badge>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{riskPercentage}%</div>
                <div className="text-xs text-muted-foreground">risco de falta</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Risk Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Probabilidade de No-Show</span>
              <span className="font-medium">{riskPercentage}%</span>
            </div>
            <Progress 
              value={riskPercentage} 
              className={`h-2 ${getRiskColor(patient.riskCategory)}`} 
            />
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confiança da Predição</span>
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
            <Progress value={confidencePercentage} className="h-1" />
          </div>

          {/* Top Contributing Factors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Principais Fatores de Risco</h4>
            <div className="space-y-1">
              {patient.contributingFactors.slice(0, 3).map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {factor.impactDirection === 'increases_risk' ? (
                      <ArrowUp className="w-3 h-3 text-red-500" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-green-500" />
                    )}
                    <span>{factor.factorName}</span>
                  </div>
                  <span className="font-medium">
                    {Math.round(factor.importanceWeight * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Ações Recomendadas</h4>
            <div className="space-y-1">
              {patient.recommendations.slice(0, 2).map((action, index) => (
                <div key={index} className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded">
                  <Badge variant="outline" size="sm" className="text-xs">
                    {action.priority === 'urgent' ? '🚨' : action.priority === 'high' ? '⚡' : '📋'}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{action.description}</p>
                    <p className="text-muted-foreground">
                      {action.timingRecommendation} • {Math.round(action.estimatedImpact * 100)}% impacto
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <Clock className="w-3 h-3 mr-1" />
              Executar Ações
            </Button>
            <Button size="sm" variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AntiNoShowDashboard;