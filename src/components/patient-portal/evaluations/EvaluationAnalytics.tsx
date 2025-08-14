'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, MessageSquare, Calendar, Target, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface NPSData {
  current_score: number;
  period_comparison: {
    previous_score: number;
    change_percentage: number;
  };
  distribution: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  trend_data: Array<{
    period: string;
    score: number;
    responses: number;
  }>;
}

interface EvaluationMetrics {
  total_evaluations: number;
  response_rate: number;
  average_rating: number;
  satisfaction_rate: number;
  top_rated_professionals: Array<{
    professional_id: string;
    name: string;
    specialty: string;
    average_rating: number;
    total_evaluations: number;
  }>;
  recent_feedback: Array<{
    id: string;
    professional_name: string;
    rating: number;
    feedback_text: string;
    submitted_at: string;
    patient_name?: string;
  }>;
}

interface EvaluationAnalyticsProps {
  className?: string;
}

export function EvaluationAnalytics({ className }: EvaluationAnalyticsProps) {
  const [npsData, setNpsData] = useState<NPSData | null>(null);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedProfessional, selectedSpecialty]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('start_date', dateRange.from.toISOString());
      if (dateRange?.to) params.append('end_date', dateRange.to.toISOString());
      if (selectedProfessional !== 'all') params.append('professional_id', selectedProfessional);
      if (selectedSpecialty !== 'all') params.append('specialty', selectedSpecialty);

      const [npsResponse, metricsResponse] = await Promise.all([
        fetch(`/api/dashboard/evaluations/nps?${params}`),
        fetch(`/api/dashboard/evaluations/metrics?${params}`)
      ]);

      if (!npsResponse.ok || !metricsResponse.ok) {
        throw new Error('Failed to load analytics data');
      }

      const npsData = await npsResponse.json();
      const metricsData = await metricsResponse.json();

      setNpsData(npsData);
      setMetrics(metricsData);

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('start_date', dateRange.from.toISOString());
      if (dateRange?.to) params.append('end_date', dateRange.to.toISOString());
      if (selectedProfessional !== 'all') params.append('professional_id', selectedProfessional);
      if (selectedSpecialty !== 'all') params.append('specialty', selectedSpecialty);

      const response = await fetch(`/api/dashboard/evaluations/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `evaluations-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso.",
      });

    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getNpsColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getNpsLabel = (score: number) => {
    if (score >= 70) return 'Excelente';
    if (score >= 50) return 'Muito Bom';
    if (score >= 0) return 'Razoável';
    return 'Crítico';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Avaliações</h2>
          <p className="text-muted-foreground">
            Insights sobre satisfação e feedback dos pacientes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Período"
          />
          
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas especialidades</SelectItem>
              <SelectItem value="dermatologia">Dermatologia</SelectItem>
              <SelectItem value="cirurgia_plastica">Cirurgia Plástica</SelectItem>
              <SelectItem value="estetica">Estética</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_evaluations}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.response_rate.toFixed(1)}% taxa de resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.average_rating.toFixed(1)}
              </div>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i <= Math.round(metrics.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Satisfação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.satisfaction_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                nota 4 ou superior
              </p>
            </CardContent>
          </Card>

          {npsData && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getNpsColor(npsData.current_score)}`}>
                  {npsData.current_score}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getNpsLabel(npsData.current_score)}
                  {npsData.period_comparison.change_percentage !== 0 && (
                    <span className={npsData.period_comparison.change_percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                      {' '}({npsData.period_comparison.change_percentage > 0 ? '+' : ''}{npsData.period_comparison.change_percentage.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* NPS Analysis */}
      {npsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição NPS</CardTitle>
              <CardDescription>
                Classificação dos pacientes por nível de satisfação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Promotores (9-10)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.promoters / (npsData.distribution.promoters + npsData.distribution.passives + npsData.distribution.detractors)) * 100} 
                      className="w-24 h-2" 
                    />
                    <span className="text-sm font-medium w-8">{npsData.distribution.promoters}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Neutros (7-8)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.passives / (npsData.distribution.promoters + npsData.distribution.passives + npsData.distribution.detractors)) * 100} 
                      className="w-24 h-2" 
                    />
                    <span className="text-sm font-medium w-8">{npsData.distribution.passives}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Detratores (0-6)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.detractors / (npsData.distribution.promoters + npsData.distribution.passives + npsData.distribution.detractors)) * 100} 
                      className="w-24 h-2" 
                    />
                    <span className="text-sm font-medium w-8">{npsData.distribution.detractors}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getNpsColor(npsData.current_score)}`}>
                    {npsData.current_score}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    NPS Score Atual - {getNpsLabel(npsData.current_score)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendência NPS</CardTitle>
              <CardDescription>
                Evolução do NPS ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {npsData.trend_data.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{item.period}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.responses} respostas
                      </p>
                    </div>
                    <div className={`text-xl font-bold ${getNpsColor(item.score)}`}>
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Professionals and Recent Feedback */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Profissionais Mais Bem Avaliados
              </CardTitle>
              <CardDescription>
                Rankings baseados nas avaliações dos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.top_rated_professionals.map((professional, index) => (
                  <div key={professional.professional_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{professional.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {professional.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">
                          {professional.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {professional.total_evaluations} avaliações
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Feedback Recente
              </CardTitle>
              <CardDescription>
                Últimas avaliações dos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {metrics.recent_feedback.map((feedback) => (
                  <div key={feedback.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{feedback.professional_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(feedback.submitted_at)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i <= feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm font-medium">
                          {feedback.rating}/5
                        </span>
                      </div>
                    </div>
                    
                    {feedback.feedback_text && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        "{feedback.feedback_text}"
                      </p>
                    )}
                    
                    {feedback.patient_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        - {feedback.patient_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}