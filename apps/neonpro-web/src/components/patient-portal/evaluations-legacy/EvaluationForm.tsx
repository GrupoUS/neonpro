'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface EvaluationQuestion {
  id: string;
  question_text: string;
  question_type: 'rating' | 'text' | 'boolean' | 'choice';
  is_required: boolean;
  choice_options?: string[];
  order_index: number;
}

interface Evaluation {
  id: string;
  professional: {
    name: string;
    specialty: string;
  };
  treatment?: {
    name: string;
    procedure_name: string;
  };
  expires_at: string;
  status: string;
  questions?: EvaluationQuestion[];
}

interface EvaluationAnswer {
  question_id: string;
  answer_type: string;
  answer_text?: string;
  answer_rating?: number;
  answer_choice?: string;
  answer_boolean?: boolean;
}

interface EvaluationFormProps {
  evaluation: Evaluation;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EvaluationForm({ evaluation, onSuccess, onCancel }: EvaluationFormProps) {
  const [answers, setAnswers] = useState<{ [questionId: string]: EvaluationAnswer }>({});
  const [overallRating, setOverallRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (evaluation.questions) {
      setQuestions(evaluation.questions.sort((a, b) => a.order_index - b.order_index));
    }
  }, [evaluation]);

  const handleAnswerChange = (questionId: string, answer: Partial<EvaluationAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        ...answer
      }
    }));
  };

  const handleRatingClick = (questionId: string, rating: number) => {
    handleAnswerChange(questionId, {
      answer_type: 'rating',
      answer_rating: rating
    });
  };

  const handleOverallRatingClick = (rating: number) => {
    setOverallRating(rating);
  };

  const validateAnswers = () => {
    const requiredQuestions = questions.filter(q => q.is_required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]);

    if (missingAnswers.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, responda todas as perguntas obrigatórias.",
        variant: "destructive",
      });
      return false;
    }

    if (overallRating === 0) {
      toast({
        title: "Avaliação geral obrigatória",
        description: "Por favor, dê uma nota geral para o atendimento.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;

    try {
      setLoading(true);

      const response = await fetch('/api/patient-portal/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluation_id: evaluation.id,
          answers: Object.values(answers),
          overall_rating: overallRating,
          feedback_text: feedbackText.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit evaluation');
      }

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback. Sua opinião é muito importante para nós.",
      });

      onSuccess?.();

    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isExpired = new Date() > new Date(evaluation.expires_at);

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Avaliação Expirada
          </h3>
          <p className="text-red-700 dark:text-red-300">
            O prazo para responder esta avaliação expirou em{' '}
            {new Date(evaluation.expires_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const expiresIn = Math.ceil((new Date(evaluation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Avalie seu Atendimento
              </h2>
              <p className="text-blue-700 dark:text-blue-300 mb-3">
                Sua opinião nos ajuda a melhorar nossos serviços
              </p>
              
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Profissional:</span> {evaluation.professional.name}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span> {evaluation.professional.specialty}
                </p>
                {evaluation.treatment && (
                  <p>
                    <span className="font-medium">Procedimento:</span> {evaluation.treatment.procedure_name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {expiresIn > 1 ? `${expiresIn} dias restantes` : 'Último dia'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Avaliação Geral
          </CardTitle>
          <CardDescription>
            Como você avalia o atendimento de forma geral? *
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="lg"
                className="p-2"
                onClick={() => handleOverallRatingClick(rating)}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    rating <= overallRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  )}
                />
              </Button>
            ))}
          </div>
          
          {overallRating > 0 && (
            <div className="text-center mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {overallRating === 1 && "Muito insatisfeito"}
                {overallRating === 2 && "Insatisfeito"}
                {overallRating === 3 && "Neutro"}
                {overallRating === 4 && "Satisfeito"}
                {overallRating === 5 && "Muito satisfeito"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.map((question) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {question.question_type === 'rating' && (
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleRatingClick(question.id, rating)}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        rating <= (answers[question.id]?.answer_rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      )}
                    />
                  </Button>
                ))}
              </div>
            )}

            {question.question_type === 'text' && (
              <Textarea
                placeholder="Digite sua resposta..."
                value={answers[question.id]?.answer_text || ''}
                onChange={(e) => handleAnswerChange(question.id, {
                  answer_type: 'text',
                  answer_text: e.target.value
                })}
                rows={3}
              />
            )}

            {question.question_type === 'boolean' && (
              <div className="flex items-center space-x-3">
                <Switch
                  checked={answers[question.id]?.answer_boolean || false}
                  onCheckedChange={(checked) => handleAnswerChange(question.id, {
                    answer_type: 'boolean',
                    answer_boolean: checked
                  })}
                />
                <Label>
                  {answers[question.id]?.answer_boolean ? 'Sim' : 'Não'}
                </Label>
              </div>
            )}

            {question.question_type === 'choice' && question.choice_options && (
              <RadioGroup
                value={answers[question.id]?.answer_choice || ''}
                onValueChange={(value) => handleAnswerChange(question.id, {
                  answer_type: 'choice',
                  answer_choice: value
                })}
              >
                {question.choice_options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                    <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Additional Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comentários Adicionais
          </CardTitle>
          <CardDescription>
            Tem mais alguma coisa que gostaria de compartilhar?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Seus comentários e sugestões são muito importantes para nós..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Avaliação
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}