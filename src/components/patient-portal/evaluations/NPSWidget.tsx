'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface NPSWidgetProps {
  className?: string;
  onComplete?: (score: number, feedback?: string) => void;
  compact?: boolean;
}

interface NPSData {
  current_score: number;
  total_responses: number;
  distribution: {
    promoters: number;
    passives: number;
    detractors: number;
  };
}

export function NPSWidget({ className, onComplete, compact = false }: NPSWidgetProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [npsData, setNpsData] = useState<NPSData | null>(null);
  const [showWidget, setShowWidget] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!compact) {
      loadNPSData();
    }
  }, [compact]);

  const loadNPSData = async () => {
    try {
      const response = await fetch('/api/patient-portal/evaluations/stats');
      const data = await response.json();
      
      if (response.ok && data.nps_data) {
        setNpsData(data.nps_data);
      }
    } catch (error) {
      console.error('Error loading NPS data:', error);
    }
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    
    // Show feedback input for detractors and passives
    if (score <= 8) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
      setFeedback('');
    }
  };

  const handleSubmit = async () => {
    if (selectedScore === null) return;

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/patient-portal/evaluations/nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: selectedScore,
          feedback: feedback.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit NPS');
      }

      toast({
        title: "Obrigado pelo seu feedback!",
        description: "Sua avaliação nos ajuda a melhorar nossos serviços.",
      });

      onComplete?.(selectedScore, feedback.trim() || undefined);
      
      // Reset form or hide widget based on type
      if (compact) {
        setShowWidget(false);
      } else {
        setSelectedScore(null);
        setFeedback('');
        setShowFeedback(false);
        loadNPSData(); // Reload data
      }

    } catch (error: any) {
      console.error('Error submitting NPS:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'text-red-600 dark:text-red-400';
    if (score <= 8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detrator';
    if (score <= 8) return 'Neutro';
    return 'Promotor';
  };

  const getScoreQuestion = (score: number) => {
    if (score <= 6) return 'O que podemos melhorar?';
    if (score <= 8) return 'Como podemos superar suas expectativas?';
    return 'Ficamos felizes! Quer compartilhar sua experiência?';
  };

  if (!showWidget && compact) {
    return null;
  }

  if (compact) {
    return (
      <Card className={cn("border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Recomendaria nossa clínica?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                De 0 a 10, quanto você nos recomendaria?
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWidget(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-11 gap-1 mb-3">
            {[...Array(11)].map((_, i) => (
              <Button
                key={i}
                variant={selectedScore === i ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  selectedScore === i && getScoreColor(i)
                )}
                onClick={() => handleScoreSelect(i)}
              >
                {i}
              </Button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>Não recomendaria</span>
            <span>Recomendaria totalmente</span>
          </div>

          {selectedScore !== null && (
            <div className="space-y-3">
              <div className="text-center">
                <Badge variant="outline" className={getScoreColor(selectedScore)}>
                  {getScoreLabel(selectedScore)}
                </Badge>
              </div>

              {showFeedback && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    {getScoreQuestion(selectedScore)}
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Sua opinião é muito importante para nós..."
                    className="w-full p-2 text-sm border rounded-md resize-none"
                    rows={2}
                  />
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="sm"
                className="w-full"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* NPS Survey */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
            <TrendingUp className="h-5 w-5 mr-2" />
            Net Promoter Score (NPS)
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Sua opinião nos ajuda a melhorar continuamente nossos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2 text-blue-900 dark:text-blue-100">
                De 0 a 10, o quanto você recomendaria nossa clínica para um amigo ou familiar?
              </h3>
              
              <div className="grid grid-cols-11 gap-2 mb-4">
                {[...Array(11)].map((_, i) => (
                  <Button
                    key={i}
                    variant={selectedScore === i ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "h-12 w-full text-lg font-bold",
                      selectedScore === i && "ring-2 ring-blue-500"
                    )}
                    onClick={() => handleScoreSelect(i)}
                  >
                    {i}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Não recomendaria</span>
                <span>Recomendaria totalmente</span>
              </div>
            </div>

            {selectedScore !== null && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className={`text-2xl font-bold ${getScoreColor(selectedScore)}`}>
                    {selectedScore}/10
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("mt-2", getScoreColor(selectedScore))}
                  >
                    {getScoreLabel(selectedScore)}
                  </Badge>
                </div>

                {showFeedback && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {getScoreQuestion(selectedScore)}
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Compartilhe sua experiência conosco..."
                      className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Avaliação'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedScore(null);
                      setFeedback('');
                      setShowFeedback(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current NPS Data */}
      {npsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              NPS Atual da Clínica
            </CardTitle>
            <CardDescription>
              Baseado em {npsData.total_responses} avaliações de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(npsData.current_score)}`}>
                  {npsData.current_score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Score NPS Atual
                </p>
                <Badge 
                  variant="outline" 
                  className={cn("mt-2", getScoreColor(npsData.current_score))}
                >
                  {npsData.current_score >= 70 ? 'Excelente' : 
                   npsData.current_score >= 50 ? 'Muito Bom' : 
                   npsData.current_score >= 0 ? 'Razoável' : 'Crítico'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Promotores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.promoters / npsData.total_responses) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm font-medium w-8">
                      {npsData.distribution.promoters}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Neutros</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.passives / npsData.total_responses) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm font-medium w-8">
                      {npsData.distribution.passives}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Detratores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(npsData.distribution.detractors / npsData.total_responses) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm font-medium w-8">
                      {npsData.distribution.detractors}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}