"use client";

import type {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  LineChart,
  PieChart,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  getAggregatedMetrics,
  getProfessionalMetrics,
  getProfessionals,
} from "@/lib/supabase/professionals";
import type { MetricType, PerformanceMetric, Professional } from "@/lib/types/professional";

interface ProfessionalPerformanceDashboardProps {
  professionalId?: string;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  description: string;
}

interface TeamPerformance {
  professional: Professional;
  metrics: {
    satisfaction: number;
    consultations: number;
    revenue: number;
    efficiency: number;
  };
}

const metricTypeLabels = {
  quality: "Qualidade",
  safety: "Segurança",
  efficiency: "Eficiência",
  patient_satisfaction: "Satisfação do Paciente",
  productivity: "Produtividade",
  compliance: "Conformidade",
  availability: "Disponibilidade",
};

const getMetricIcon = (type: MetricType) => {
  switch (type) {
    case "quality":
      return <Award className="h-4 w-4" />;
    case "safety":
      return <CheckCircle className="h-4 w-4" />;
    case "efficiency":
      return <Clock className="h-4 w-4" />;
    case "patient_satisfaction":
      return <Star className="h-4 w-4" />;
    case "productivity":
      return <TrendingUp className="h-4 w-4" />;
    case "compliance":
      return <Target className="h-4 w-4" />;
    case "availability":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case "increase":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "decrease":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

const getPerformanceColor = (value: number, max: number = 100) => {
  const percentage = (value / max) * 100;
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 70) return "text-yellow-600";
  return "text-red-600";
};

export default function ProfessionalPerformanceDashboard({
  professionalId,
}: ProfessionalPerformanceDashboardProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>(professionalId || "all");
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const overviewMetrics: MetricCard[] = [
    {
      id: "satisfaction",
      title: "Satisfação do Paciente",
      value: "4.8",
      previousValue: "4.6",
      change: 4.3,
      changeType: "increase",
      icon: <Star className="h-4 w-4" />,
      description: "Média de avaliações dos pacientes",
    },
    {
      id: "consultations",
      title: "Consultas Realizadas",
      value: 142,
      previousValue: 128,
      change: 10.9,
      changeType: "increase",
      icon: <Calendar className="h-4 w-4" />,
      description: "Total de consultas no período",
    },
    {
      id: "revenue",
      title: "Receita Gerada",
      value: "R$ 28.400",
      previousValue: "R$ 24.800",
      change: 14.5,
      changeType: "increase",
      icon: <DollarSign className="h-4 w-4" />,
      description: "Receita total no período",
    },
    {
      id: "efficiency",
      title: "Eficiência Operacional",
      value: "92%",
      previousValue: "89%",
      change: 3.4,
      changeType: "increase",
      icon: <Clock className="h-4 w-4" />,
      description: "Pontualidade e duração adequada",
    },
  ];

  useEffect(() => {
    loadData();
  }, [selectedProfessional, period]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load professionals
      const professionalsData = await getProfessionals();
      setProfessionals(professionalsData);

      // Load metrics for selected professional or aggregated
      if (selectedProfessional !== "all") {
        const metricsData = await getProfessionalMetrics(selectedProfessional, period);
        setMetrics(metricsData);
      } else {
        const aggregatedData = await getAggregatedMetrics(period);
        // Handle aggregated metrics
      }

      // Generate mock team performance data
      generateTeamPerformanceData(professionalsData);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTeamPerformanceData = (professionalsData: Professional[]) => {
    const teamData = professionalsData.slice(0, 10).map((professional) => ({
      professional,
      metrics: {
        satisfaction: Math.random() * 2 + 3, // 3-5 range
        consultations: Math.floor(Math.random() * 100) + 50, // 50-150 range
        revenue: Math.floor(Math.random() * 20000) + 10000, // 10k-30k range
        efficiency: Math.floor(Math.random() * 30) + 70, // 70-100% range
      },
    }));
    setTeamPerformance(teamData);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">Acompanhe métricas de performance e qualidade</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.given_name} {professional.family_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="individual">Performance Individual</TabsTrigger>
          <TabsTrigger value="team">Comparativo da Equipe</TabsTrigger>
          <TabsTrigger value="goals">Metas e Objetivos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getChangeIcon(metric.changeType || "neutral")}
                    <span className="ml-1">
                      {metric.change?.toFixed(1)}% em relação ao período anterior
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Satisfação do Paciente
                </CardTitle>
                <CardDescription>Evolução da satisfação ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de linha da satisfação do paciente
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Produtividade por Especialidade
                </CardTitle>
                <CardDescription>Comparativo de consultas por área</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de barras da produtividade
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Melhores Performers do Mês
              </CardTitle>
              <CardDescription>Profissionais com melhor desempenho no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.slice(0, 5).map((performer, index) => (
                  <div
                    key={performer.professional.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {performer.professional.given_name} {performer.professional.family_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {performer.professional.qualification}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">
                          {performer.metrics.satisfaction.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground">Satisfação</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{performer.metrics.consultations}</div>
                        <div className="text-muted-foreground">Consultas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{performer.metrics.efficiency}%</div>
                        <div className="text-muted-foreground">Eficiência</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Performance Tab */}
        <TabsContent value="individual" className="space-y-6">
          {selectedProfessional === "all" ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecione um profissional específico para ver métricas individuais
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Individual Metrics */}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {Object.entries(metricTypeLabels).map(([type, label]) => (
                  <Card key={type}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{label}</CardTitle>
                      {getMetricIcon(type as MetricType)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.floor(Math.random() * 30) + 70}%
                      </div>
                      <Progress value={Math.floor(Math.random() * 30) + 70} className="mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed Metrics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Performance</CardTitle>
                    <CardDescription>Evolução das métricas nos últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Gráfico de evolução individual
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feedback dos Pacientes</CardTitle>
                    <CardDescription>Resumo das avaliações recebidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Excelente (5 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Muito Bom (4 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={12} className="w-20" />
                          <span className="text-sm">12%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bom (3 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={3} className="w-20" />
                          <span className="text-sm">3%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Áreas de Melhoria
                  </CardTitle>
                  <CardDescription>Sugestões baseadas nos dados coletados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Pontualidade</div>
                        <div className="text-sm text-muted-foreground">
                          Considere revisar o cronograma para melhorar a pontualidade nas consultas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Tempo de Consulta</div>
                        <div className="text-sm text-muted-foreground">
                          Algumas consultas estão excedendo o tempo programado
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Team Comparison Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo da Equipe</CardTitle>
              <CardDescription>
                Performance de todos os profissionais no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Satisfação</TableHead>
                    <TableHead>Consultas</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Eficiência</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformance.map((performer) => (
                    <TableRow key={performer.professional.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {performer.professional.given_name[0]}
                            {performer.professional.family_name[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {performer.professional.given_name}{" "}
                              {performer.professional.family_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {performer.professional.qualification}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={getPerformanceColor(performer.metrics.satisfaction, 5)}>
                            {performer.metrics.satisfaction.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getPerformanceColor(performer.metrics.consultations, 150)}>
                          {performer.metrics.consultations}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getPerformanceColor(performer.metrics.revenue, 30000)}>
                          R$ {performer.metrics.revenue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={performer.metrics.efficiency} className="w-16" />
                          <span className={getPerformanceColor(performer.metrics.efficiency)}>
                            {performer.metrics.efficiency}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            performer.metrics.efficiency >= 90
                              ? "default"
                              : performer.metrics.efficiency >= 70
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {performer.metrics.efficiency >= 90
                            ? "Excelente"
                            : performer.metrics.efficiency >= 70
                              ? "Bom"
                              : "Precisa Melhorar"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas Individuais
                </CardTitle>
                <CardDescription>Progresso das metas do profissional selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação do Paciente</span>
                      <span className="text-sm text-muted-foreground">4.8 / 5.0</span>
                    </div>
                    <Progress value={96} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Consultas Mensais</span>
                      <span className="text-sm text-muted-foreground">142 / 150</span>
                    </div>
                    <Progress value={94.7} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pontualidade</span>
                      <span className="text-sm text-muted-foreground">88 / 95%</span>
                    </div>
                    <Progress value={92.6} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Metas da Equipe
                </CardTitle>
                <CardDescription>Objetivos coletivos da clínica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação Geral</span>
                      <span className="text-sm text-muted-foreground">4.6 / 5.0</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Receita Mensal</span>
                      <span className="text-sm text-muted-foreground">R$ 380k / R$ 400k</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Retenção</span>
                      <span className="text-sm text-muted-foreground">78 / 85%</span>
                    </div>
                    <Progress value={91.8} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Metas</CardTitle>
              <CardDescription>Próximas avaliações e marcos importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Avaliação Trimestral</div>
                    <div className="text-sm text-muted-foreground">
                      Revisão completa de performance - 15 de Março
                    </div>
                  </div>
                  <Badge variant="outline">Em 2 semanas</Badge>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Meta de Satisfação</div>
                    <div className="text-sm text-muted-foreground">
                      Objetivo: manter acima de 4.5 estrelas
                    </div>
                  </div>
                  <Badge variant="default">Atingida</Badge>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Treinamento Obrigatório</div>
                    <div className="text-sm text-muted-foreground">
                      Atualização em protocolos de segurança - 30 de Março
                    </div>
                  </div>
                  <Badge variant="secondary">Agendado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
