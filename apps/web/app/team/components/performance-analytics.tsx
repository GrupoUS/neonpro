'use client';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Heart,
  LineChart,
  PieChart,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type {
  ComplianceStatus,
  HealthcareProfessional,
  TeamPerformanceMetrics,
} from '@/types/team-coordination';

// Mock analytics data for Brazilian healthcare context
const mockTeamKPIs = {
  patientSatisfaction: {
    current: 8.7,
    target: 9.0,
    trend: 'up',
    previousPeriod: 8.4,
    change: 0.3,
  },
  averageResponseTime: {
    current: 4.2, // minutes
    target: 5.0,
    trend: 'down',
    previousPeriod: 4.8,
    change: -0.6,
  },
  treatmentSuccessRate: {
    current: 92.4, // percentage
    target: 90.0,
    trend: 'up',
    previousPeriod: 90.8,
    change: 1.6,
  },
  teamEfficiency: {
    current: 87.3, // percentage
    target: 85.0,
    trend: 'up',
    previousPeriod: 84.9,
    change: 2.4,
  },
};

const mockComplianceData = {
  cfm: {
    totalProfessionals: 18,
    validLicenses: 17,
    expiringWithin30Days: 2,
    expired: 1,
    complianceRate: 94.4,
    trend: 'stable',
  },
  clt: {
    totalEmployees: 24,
    compliantShifts: 22,
    overtimeViolations: 1,
    restPeriodViolations: 1,
    complianceRate: 91.7,
    trend: 'up',
  },
  lgpd: {
    dataProcessingActivities: 15,
    compliantActivities: 14,
    pendingConsents: 3,
    dataBreaches: 0,
    complianceRate: 93.3,
    trend: 'up',
  },
  anvisa: {
    medicalEquipment: 32,
    compliantEquipment: 30,
    maintenanceDue: 2,
    expired: 0,
    complianceRate: 93.8,
    trend: 'stable',
  },
};

const mockIndividualPerformance = [
  {
    id: 'prof-001',
    name: 'Dra. Maria Silva',
    role: 'Cardiologista',
    cfmLicense: 'Válida',
    patientLoad: 12,
    satisfactionScore: 9.2,
    proceduresCompleted: 28,
    complianceRate: 98.5,
    hoursWorked: 42,
    overtimeHours: 2,
    cmeCredits: 15,
    cmeRequired: 12,
  },
  {
    id: 'prof-002',
    name: 'Dr. Roberto Oliveira',
    role: 'Emergencista',
    cfmLicense: 'Válida',
    patientLoad: 18,
    satisfactionScore: 8.9,
    proceduresCompleted: 45,
    complianceRate: 95.2,
    hoursWorked: 44,
    overtimeHours: 4,
    cmeCredits: 10,
    cmeRequired: 12,
  },
  {
    id: 'prof-003',
    name: 'Enf. Ana Paula',
    role: 'Enfermeira UTI',
    cfmLicense: 'N/A',
    patientLoad: 8,
    satisfactionScore: 9.5,
    proceduresCompleted: 67,
    complianceRate: 99.1,
    hoursWorked: 40,
    overtimeHours: 0,
    cmeCredits: 18,
    cmeRequired: 15,
  },
  {
    id: 'prof-004',
    name: 'Dr. Carlos Mendes',
    role: 'Anestesista',
    cfmLicense: 'Expira em 15 dias',
    patientLoad: 10,
    satisfactionScore: 8.7,
    proceduresCompleted: 22,
    complianceRate: 92.8,
    hoursWorked: 38,
    overtimeHours: 0,
    cmeCredits: 8,
    cmeRequired: 12,
  },
];

const mockMonthlyTrends = [
  {
    month: 'Jan',
    patientSatisfaction: 8.2,
    efficiency: 83.1,
    compliance: 91.5,
  },
  {
    month: 'Fev',
    patientSatisfaction: 8.4,
    efficiency: 84.3,
    compliance: 92.8,
  },
  {
    month: 'Mar',
    patientSatisfaction: 8.1,
    efficiency: 82.9,
    compliance: 90.2,
  },
  {
    month: 'Abr',
    patientSatisfaction: 8.6,
    efficiency: 85.7,
    compliance: 93.4,
  },
  {
    month: 'Mai',
    patientSatisfaction: 8.8,
    efficiency: 86.2,
    compliance: 94.1,
  },
  {
    month: 'Jun',
    patientSatisfaction: 8.7,
    efficiency: 87.3,
    compliance: 93.8,
  },
];

// Helper functions
const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <LineChart className="h-4 w-4 text-gray-600" />;
  }
};

const getComplianceColor = (rate: number) => {
  if (rate >= 95) return 'text-green-600';
  if (rate >= 90) return 'text-accent';
  return 'text-red-600';
};

const getComplianceBgColor = (rate: number) => {
  if (rate >= 95) return 'bg-green-100 border-green-200';
  if (rate >= 90) return 'bg-accent/10 border-accent/20';
  return 'bg-red-100 border-red-200';
};

interface PerformanceAnalyticsProps {
  emergencyMode?: boolean;
}

export function PerformanceAnalytics({
  emergencyMode = false,
}: PerformanceAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('kpis');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('compliance');

  // Filter and sort individual performance data
  const sortedPerformance = useMemo(() => {
    const sorted = [...mockIndividualPerformance].sort((a, b) => {
      switch (sortBy) {
        case 'satisfaction':
          return b.satisfactionScore - a.satisfactionScore;
        case 'procedures':
          return b.proceduresCompleted - a.proceduresCompleted;
        case 'compliance':
          return b.complianceRate - a.complianceRate;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [sortBy]);

  return (
    <div className="space-y-6">
      {/* Header with Export Actions */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="font-bold text-2xl">Analytics de Performance</h2>
          <p className="text-muted-foreground">
            KPIs, métricas de compliance e relatórios detalhados
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>

          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Relatório Detalhado
          </Button>
        </div>
      </div>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <div className="rounded-r-md border-red-500 border-l-4 bg-red-100 p-4">
          <div className="flex items-center">
            <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">
                Modo de Emergência - Dados em Tempo Real
              </p>
              <p className="text-red-700 text-sm">
                Métricas atualizadas automaticamente durante situações críticas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs
        className="space-y-6"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger className="text-sm" value="kpis">
            <BarChart3 className="mr-2 h-4 w-4" />
            KPIs Principais
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="compliance">
            <Shield className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="individual">
            <Users className="mr-2 h-4 w-4" />
            Performance Individual
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="trends">
            <LineChart className="mr-2 h-4 w-4" />
            Tendências
          </TabsTrigger>
        </TabsList>{' '}
        {/* KPIs Tab */}
        <TabsContent className="space-y-6" value="kpis">
          {/* Main KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Patient Satisfaction */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Satisfação do Paciente
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-blue-600">
                  {mockTeamKPIs.patientSatisfaction.current}/10
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                  {getTrendIcon(mockTeamKPIs.patientSatisfaction.trend)}
                  <span>
                    {mockTeamKPIs.patientSatisfaction.change > 0 ? '+' : ''}
                    {mockTeamKPIs.patientSatisfaction.change} vs mês anterior
                  </span>
                </div>
                <Progress
                  className="mt-3"
                  value={(mockTeamKPIs.patientSatisfaction.current / 10) * 100}
                />
                <p className="mt-2 text-muted-foreground text-xs">
                  Meta: {mockTeamKPIs.patientSatisfaction.target}/10
                </p>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Tempo de Resposta
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-green-600">
                  {mockTeamKPIs.averageResponseTime.current} min
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                  {getTrendIcon(mockTeamKPIs.averageResponseTime.trend)}
                  <span>
                    {mockTeamKPIs.averageResponseTime.change > 0 ? '+' : ''}
                    {Math.abs(mockTeamKPIs.averageResponseTime.change)} min vs
                    mês anterior
                  </span>
                </div>
                <Progress
                  className="mt-3"
                  value={
                    100 -
                    (mockTeamKPIs.averageResponseTime.current /
                      mockTeamKPIs.averageResponseTime.target) *
                      100
                  }
                />
                <p className="mt-2 text-muted-foreground text-xs">
                  Meta: ≤ {mockTeamKPIs.averageResponseTime.target} min
                </p>
              </CardContent>
            </Card>

            {/* Treatment Success Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Taxa de Sucesso
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-green-600">
                  {mockTeamKPIs.treatmentSuccessRate.current}%
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                  {getTrendIcon(mockTeamKPIs.treatmentSuccessRate.trend)}
                  <span>
                    +{mockTeamKPIs.treatmentSuccessRate.change}% vs mês anterior
                  </span>
                </div>
                <Progress
                  className="mt-3"
                  value={mockTeamKPIs.treatmentSuccessRate.current}
                />
                <p className="mt-2 text-muted-foreground text-xs">
                  Meta: ≥ {mockTeamKPIs.treatmentSuccessRate.target}%
                </p>
              </CardContent>
            </Card>

            {/* Team Efficiency */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Eficiência da Equipe
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-blue-600">
                  {mockTeamKPIs.teamEfficiency.current}%
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                  {getTrendIcon(mockTeamKPIs.teamEfficiency.trend)}
                  <span>
                    +{mockTeamKPIs.teamEfficiency.change}% vs mês anterior
                  </span>
                </div>
                <Progress
                  className="mt-3"
                  value={mockTeamKPIs.teamEfficiency.current}
                />
                <p className="mt-2 text-muted-foreground text-xs">
                  Meta: ≥ {mockTeamKPIs.teamEfficiency.target}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed KPI Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo de Performance</CardTitle>
                <CardDescription>
                  Principais indicadores do período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Pacientes Atendidos
                    </span>
                    <span className="font-bold text-blue-600 text-lg">324</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Procedimentos Realizados
                    </span>
                    <span className="font-bold text-green-600 text-lg">
                      186
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Taxa de Ocupação
                    </span>
                    <span className="font-bold text-accent text-lg">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Tempo Médio de Espera
                    </span>
                    <span className="font-bold text-lg text-orange-600">
                      23 min
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium text-sm">
                    Alertas de Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span>2 profissionais com CME pendente</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>1 licença CFM expirando em 15 dias</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Compliance LGPD em dia</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Comparação por Departamento
                </CardTitle>
                <CardDescription>
                  Performance relativa entre setores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'UTI',
                      efficiency: 94,
                      satisfaction: 9.1,
                      color: 'bg-green-500',
                    },
                    {
                      name: 'Emergência',
                      efficiency: 87,
                      satisfaction: 8.6,
                      color: 'bg-blue-500',
                    },
                    {
                      name: 'Centro Cirúrgico',
                      efficiency: 91,
                      satisfaction: 9.3,
                      color: 'bg-purple-500',
                    },
                    {
                      name: 'Cardiologia',
                      efficiency: 89,
                      satisfaction: 8.9,
                      color: 'bg-orange-500',
                    },
                    {
                      name: 'Enfermaria',
                      efficiency: 85,
                      satisfaction: 8.4,
                      color: 'bg-accent',
                    },
                  ].map((dept) => (
                    <div className="space-y-2" key={dept.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept.name}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground text-xs">
                            Eficiência: {dept.efficiency}%
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Satisfação: {dept.satisfaction}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Progress className="h-2" value={dept.efficiency} />
                        </div>
                        <div className="flex-1">
                          <Progress
                            className="h-2"
                            value={(dept.satisfaction / 10) * 100}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>{' '}
        {/* Compliance Tab */}
        <TabsContent className="space-y-6" value="compliance">
          {/* Compliance Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* CFM Compliance */}
            <Card
              className={getComplianceBgColor(
                mockComplianceData.cfm.complianceRate
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  CFM (Licenças Médicas)
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold text-2xl ${getComplianceColor(mockComplianceData.cfm.complianceRate)}`}
                >
                  {mockComplianceData.cfm.complianceRate}%
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {mockComplianceData.cfm.validLicenses}/
                  {mockComplianceData.cfm.totalProfessionals} licenças válidas
                </div>
                <Progress
                  className="mt-3"
                  value={mockComplianceData.cfm.complianceRate}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-yellow-600">
                    {mockComplianceData.cfm.expiringWithin30Days} expirando
                  </span>
                  <span className="text-red-600">
                    {mockComplianceData.cfm.expired} expiradas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CLT Compliance */}
            <Card
              className={getComplianceBgColor(
                mockComplianceData.clt.complianceRate
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  CLT (Leis Trabalhistas)
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold text-2xl ${getComplianceColor(mockComplianceData.clt.complianceRate)}`}
                >
                  {mockComplianceData.clt.complianceRate}%
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {mockComplianceData.clt.compliantShifts}/
                  {mockComplianceData.clt.totalEmployees} escalas conformes
                </div>
                <Progress
                  className="mt-3"
                  value={mockComplianceData.clt.complianceRate}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-orange-600">
                    {mockComplianceData.clt.overtimeViolations} horas extras
                  </span>
                  <span className="text-red-600">
                    {mockComplianceData.clt.restPeriodViolations} descanso
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* LGPD Compliance */}
            <Card
              className={getComplianceBgColor(
                mockComplianceData.lgpd.complianceRate
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  LGPD (Proteção Dados)
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold text-2xl ${getComplianceColor(mockComplianceData.lgpd.complianceRate)}`}
                >
                  {mockComplianceData.lgpd.complianceRate}%
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {mockComplianceData.lgpd.compliantActivities}/
                  {mockComplianceData.lgpd.dataProcessingActivities} atividades
                  conformes
                </div>
                <Progress
                  className="mt-3"
                  value={mockComplianceData.lgpd.complianceRate}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-yellow-600">
                    {mockComplianceData.lgpd.pendingConsents} consentimentos
                    pendentes
                  </span>
                  <span className="text-green-600">
                    {mockComplianceData.lgpd.dataBreaches} violações
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ANVISA Compliance */}
            <Card
              className={getComplianceBgColor(
                mockComplianceData.anvisa.complianceRate
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  ANVISA (Equipamentos)
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold text-2xl ${getComplianceColor(mockComplianceData.anvisa.complianceRate)}`}
                >
                  {mockComplianceData.anvisa.complianceRate}%
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {mockComplianceData.anvisa.compliantEquipment}/
                  {mockComplianceData.anvisa.medicalEquipment} equipamentos
                  conformes
                </div>
                <Progress
                  className="mt-3"
                  value={mockComplianceData.anvisa.complianceRate}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-orange-600">
                    {mockComplianceData.anvisa.maintenanceDue} manutenção devida
                  </span>
                  <span className="text-green-600">
                    {mockComplianceData.anvisa.expired} expirados
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Compliance Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* CFM License Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Detalhes CFM - Licenças Médicas
                </CardTitle>
                <CardDescription>
                  Status das licenças do Conselho Federal de Medicina
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
                      <div>
                        <p className="font-medium text-green-800 text-sm">
                          Licenças Válidas
                        </p>
                        <p className="text-green-600 text-xs">
                          Em conformidade total
                        </p>
                      </div>
                      <Badge className="border-green-300 bg-green-100 text-green-800">
                        {mockComplianceData.cfm.validLicenses}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-3">
                      <div>
                        <p className="font-medium text-sm text-yellow-800">
                          Expirando em 30 dias
                        </p>
                        <p className="text-xs text-yellow-600">
                          Renovação necessária
                        </p>
                      </div>
                      <Badge className="border-yellow-300 bg-yellow-100 text-yellow-800">
                        {mockComplianceData.cfm.expiringWithin30Days}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 p-3">
                      <div>
                        <p className="font-medium text-red-800 text-sm">
                          Licenças Expiradas
                        </p>
                        <p className="text-red-600 text-xs">
                          Ação imediata necessária
                        </p>
                      </div>
                      <Badge className="border-red-300 bg-red-100 text-red-800">
                        {mockComplianceData.cfm.expired}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório CFM Detalhado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LGPD Compliance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Detalhes LGPD - Proteção de Dados
                </CardTitle>
                <CardDescription>
                  Status de conformidade com a Lei Geral de Proteção de Dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-3">
                      <div>
                        <p className="font-medium text-blue-800 text-sm">
                          Atividades de Tratamento
                        </p>
                        <p className="text-blue-600 text-xs">
                          Mapeadas e documentadas
                        </p>
                      </div>
                      <Badge className="border-blue-300 bg-blue-100 text-blue-800">
                        {mockComplianceData.lgpd.compliantActivities}/
                        {mockComplianceData.lgpd.dataProcessingActivities}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-3">
                      <div>
                        <p className="font-medium text-sm text-yellow-800">
                          Consentimentos Pendentes
                        </p>
                        <p className="text-xs text-yellow-600">
                          Aguardando coleta
                        </p>
                      </div>
                      <Badge className="border-yellow-300 bg-yellow-100 text-yellow-800">
                        {mockComplianceData.lgpd.pendingConsents}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
                      <div>
                        <p className="font-medium text-green-800 text-sm">
                          Violações de Dados
                        </p>
                        <p className="text-green-600 text-xs">
                          Nenhuma no período
                        </p>
                      </div>
                      <Badge className="border-green-300 bg-green-100 text-green-800">
                        {mockComplianceData.lgpd.dataBreaches}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <Button className="w-full" size="sm" variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Auditoria LGPD
                    </Button>
                    <Button className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Relatório de Conformidade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Actions Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Ações de Compliance Necessárias
              </CardTitle>
              <CardDescription>
                Itens que requerem atenção imediata para manter conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 rounded border border-red-200 bg-red-50 p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800 text-sm">
                      Dr. Carlos Mendes - CFM expira em 15 dias
                    </p>
                    <p className="mt-1 text-red-600 text-xs">
                      Contatar profissional para renovação da licença CFM
                    </p>
                    <Button className="mt-2" size="sm" variant="destructive">
                      Ação Imediata
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded border border-yellow-200 bg-yellow-50 p-3">
                  <Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-yellow-800">
                      Escalas CLT - 2 violações de horas extras identificadas
                    </p>
                    <p className="mt-1 text-xs text-yellow-600">
                      Revisar escalas de trabalho para conformidade CLT
                    </p>
                    <Button className="mt-2" size="sm" variant="outline">
                      Revisar Escalas
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded border border-blue-200 bg-blue-50 p-3">
                  <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 text-sm">
                      LGPD - 3 consentimentos de pacientes pendentes
                    </p>
                    <p className="mt-1 text-blue-600 text-xs">
                      Atualizar consentimentos para uso de dados pessoais
                    </p>
                    <Button className="mt-2" size="sm" variant="outline">
                      Gerenciar Consentimentos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>{' '}
        {/* Individual Performance Tab */}
        <TabsContent className="space-y-6" value="individual">
          {/* Performance Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Individual</CardTitle>
              <CardDescription>
                Métricas detalhadas por profissional de saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center space-x-4">
                <Select
                  onValueChange={setSelectedDepartment}
                  value={selectedDepartment}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Departamentos</SelectItem>
                    <SelectItem value="cardiology">Cardiologia</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="icu">UTI</SelectItem>
                    <SelectItem value="surgery">Centro Cirúrgico</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setSortBy} value={sortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="satisfaction">Satisfação</SelectItem>
                    <SelectItem value="procedures">Procedimentos</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Individual Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ranking de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>CFM</TableHead>
                    <TableHead>Pacientes</TableHead>
                    <TableHead>Satisfação</TableHead>
                    <TableHead>Procedimentos</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Horas/Semana</TableHead>
                    <TableHead>CME</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPerformance.map((professional, index) => (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{professional.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {professional.role}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs"
                          variant={
                            professional.cfmLicense.includes('Expira')
                              ? 'destructive'
                              : professional.cfmLicense === 'N/A'
                                ? 'secondary'
                                : 'default'
                          }
                        >
                          {professional.cfmLicense}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {professional.patientLoad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {professional.satisfactionScore}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                className={`h-3 w-3 ${
                                  star <=
                                  Math.floor(professional.satisfactionScore)
                                    ? 'fill-current text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                key={star}
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {professional.proceduresCompleted}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-medium ${getComplianceColor(professional.complianceRate)}`}
                          >
                            {professional.complianceRate}%
                          </span>
                          <Progress
                            className="h-2 w-16"
                            value={professional.complianceRate}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {professional.hoursWorked}h
                          </span>
                          {professional.overtimeHours > 0 && (
                            <p className="text-xs text-yellow-600">
                              +{professional.overtimeHours}h extra
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-medium text-sm ${
                              professional.cmeCredits >=
                              professional.cmeRequired
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {professional.cmeCredits}/{professional.cmeRequired}
                          </span>
                          <Progress
                            className="h-2 w-12"
                            value={
                              (professional.cmeCredits /
                                professional.cmeRequired) *
                              100
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Trends Tab */}
        <TabsContent className="space-y-6" value="trends">
          {/* Performance Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Tendências de Performance
              </CardTitle>
              <CardDescription>
                Evolução dos principais indicadores nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mock Chart Area - In production, use a proper chart library */}
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50">
                  <div className="text-center">
                    <LineChart className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                    <p className="font-medium text-gray-500">
                      Gráfico de Tendências
                    </p>
                    <p className="text-gray-400 text-sm">
                      Integração com biblioteca de gráficos necessária
                    </p>
                  </div>
                </div>

                {/* Trend Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 text-sm">
                          Satisfação do Paciente
                        </p>
                        <p className="text-green-600 text-xs">
                          Tendência crescente
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-green-700 text-lg">+3.6%</p>
                      <p className="text-green-600 text-xs">
                        vs período anterior
                      </p>
                    </div>
                  </div>

                  <div className="rounded border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800 text-sm">
                          Eficiência da Equipe
                        </p>
                        <p className="text-blue-600 text-xs">
                          Melhoria constante
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-blue-700 text-lg">+5.1%</p>
                      <p className="text-blue-600 text-xs">
                        vs período anterior
                      </p>
                    </div>
                  </div>

                  <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-yellow-800">
                          Compliance Geral
                        </p>
                        <p className="text-xs text-yellow-600">Estável</p>
                      </div>
                      <LineChart className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-lg text-yellow-700">+1.2%</p>
                      <p className="text-xs text-yellow-600">
                        vs período anterior
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Insights e Recomendações
              </CardTitle>
              <CardDescription>
                Análise inteligente baseada nas tendências identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rounded border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">
                      Melhoria na Satisfação do Paciente
                    </p>
                    <p className="mt-1 text-green-600 text-xs">
                      A implementação de protocolos de comunicação resultou em
                      aumento de 3.6% na satisfação. Continue investindo em
                      treinamento de comunicação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded border border-blue-200 bg-blue-50 p-4">
                  <Activity className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800 text-sm">
                      Eficiência Operacional em Alta
                    </p>
                    <p className="mt-1 text-blue-600 text-xs">
                      A otimização de escalas e recursos elevou a eficiência em
                      5.1%. Considere expandir essas práticas para outros
                      departamentos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded border border-orange-200 bg-orange-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800 text-sm">
                      Atenção: CME em Atraso
                    </p>
                    <p className="mt-1 text-orange-600 text-xs">
                      25% dos profissionais estão com CME pendente. Implemente
                      lembretes automáticos e facilite o acesso a cursos online.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded border border-purple-200 bg-purple-50 p-4">
                  <Star className="mt-0.5 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-800 text-sm">
                      Reconhecimento de Performance
                    </p>
                    <p className="mt-1 text-purple-600 text-xs">
                      Enf. Ana Paula e Dra. Maria Silva destacam-se
                      consistentemente. Considere reconhecimento formal e
                      oportunidades de mentoria.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
