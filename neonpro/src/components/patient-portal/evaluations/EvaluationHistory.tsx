'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, MessageCircle, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { EvaluationForm } from './EvaluationForm';

interface EvaluationHistoryItem {
  id: string;
  professional: {
    name: string;
    specialty: string;
  };
  treatment?: {
    name: string;
    procedure_name: string;
  };
  overall_rating: number;
  feedback_text?: string;
  submitted_at: string;
  status: string;
  expires_at?: string;
}

interface EvaluationStats {
  total_evaluations: number;
  pending_evaluations: number;
  average_rating: number;
  satisfaction_distribution: {
    very_satisfied: number;
    satisfied: number;
    neutral: number;
    dissatisfied: number;
    very_dissatisfied: number;
  };
  recent_trends: {
    period: string;
    rating_trend: number;
    feedback_count: number;
  };
}

export function EvaluationHistory() {
  const [history, setHistory] = useState<EvaluationHistoryItem[]>([]);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEvaluationHistory();
    loadEvaluationStats();
  }, []);

  const loadEvaluationHistory = async () => {
    try {
      const response = await fetch('/api/patient-portal/evaluations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load evaluation history');
      }

      setHistory(data.evaluations || []);
    } catch (error: any) {
      console.error('Error loading evaluation history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar suas avaliações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluationStats = async () => {
    try {
      const response = await fetch('/api/patient-portal/evaluations/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load stats');
      }

      setStats(data.stats);
    } catch (error: any) {
      console.error('Error loading evaluation stats:', error);
    }
  };

  const filteredHistory = history.filter(item => {
    if (item.status === 'completed' && !showCompleted) return false;
    if (item.status === 'pending' && !showPending) return false;
    return true;
  });

  const pendingEvaluations = history.filter(item => item.status === 'pending');
  const completedEvaluations = history.filter(item => item.status === 'completed');

  const handleEvaluationSuccess = () => {
    setSelectedEvaluation(null);
    loadEvaluationHistory();
    loadEvaluationStats();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSatisfactionLabel = (rating: number) => {
    if (rating === 5) return 'Muito satisfeito';
    if (rating === 4) return 'Satisfeito';
    if (rating === 3) return 'Neutro';
    if (rating === 2) return 'Insatisfeito';
    return 'Muito insatisfeito';
  };

  if (selectedEvaluation) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setSelectedEvaluation(null)}
          className="mb-6"
        >
          ← Voltar ao histórico
        </Button>
        <EvaluationForm
          evaluation={selectedEvaluation}
          onSuccess={handleEvaluationSuccess}
          onCancel={() => setSelectedEvaluation(null)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minhas Avaliações</h2>
          <p className="text-muted-foreground">
            Acompanhe seu histórico de avaliações e feedback
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_evaluations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending_evaluations} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRatingColor(stats.average_rating)}`}>
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i <= Math.round(stats.average_rating)
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
              <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {((stats.satisfaction_distribution.satisfied + stats.satisfaction_distribution.very_satisfied) / stats.total_evaluations * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                satisfeito ou muito satisfeito
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendência</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.recent_trends.rating_trend > 0 ? 'text-green-600' : 
                stats.recent_trends.rating_trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.recent_trends.rating_trend > 0 ? '+' : ''}{stats.recent_trends.rating_trend.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Satisfaction Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Satisfação</CardTitle>
            <CardDescription>
              Como você tem avaliado nossos serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Muito satisfeito', value: stats.satisfaction_distribution.very_satisfied, color: 'bg-green-500' },
                { label: 'Satisfeito', value: stats.satisfaction_distribution.satisfied, color: 'bg-green-400' },
                { label: 'Neutro', value: stats.satisfaction_distribution.neutral, color: 'bg-yellow-400' },
                { label: 'Insatisfeito', value: stats.satisfaction_distribution.dissatisfied, color: 'bg-red-400' },
                { label: 'Muito insatisfeito', value: stats.satisfaction_distribution.very_dissatisfied, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 w-32">
                    <Progress 
                      value={stats.total_evaluations > 0 ? (item.value / stats.total_evaluations) * 100 : 0} 
                      className="h-2" 
                    />
                    <span className="text-sm font-medium w-8">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for pending and completed */}
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pendentes
              {pendingEvaluations.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingEvaluations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedEvaluations.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="h-8"
            >
              {showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Concluídas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPending(!showPending)}
              className="h-8"
            >
              {showPending ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Pendentes
            </Button>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          {pendingEvaluations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma avaliação pendente
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Você está em dia com suas avaliações!
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                          Pendente
                        </Badge>
                        {evaluation.expires_at && (
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expira em {Math.ceil((new Date(evaluation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {evaluation.professional.name}
                      </h3>
                      <p className="text-muted-foreground mb-1">
                        {evaluation.professional.specialty}
                      </p>
                      
                      {evaluation.treatment && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Procedimento: {evaluation.treatment.procedure_name}
                        </p>
                      )}

                      <Button
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Responder Avaliação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedEvaluations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma avaliação concluída
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Suas avaliações concluídas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedEvaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Concluída
                        </Badge>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i <= evaluation.overall_rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className={`ml-2 font-medium ${getRatingColor(evaluation.overall_rating)}`}>
                            {evaluation.overall_rating}/5
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {evaluation.professional.name}
                      </h3>
                      <p className="text-muted-foreground mb-1">
                        {evaluation.professional.specialty}
                      </p>
                      
                      {evaluation.treatment && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Procedimento: {evaluation.treatment.procedure_name}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground mb-3">
                        Avaliado em {formatDate(evaluation.submitted_at)}
                      </p>

                      {evaluation.feedback_text && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            "{evaluation.feedback_text}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}