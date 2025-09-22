/**
 * TreatmentSuggestions Component - AI-Powered Treatment Recommendations (T110)
 * Displays treatment suggestions based on AI analysis of aesthetic photos
 *
 * Features:
 * - AI-powered treatment recommendations
 * - Confidence scoring and priority sorting
 * - Treatment details with pricing and scheduling
 * - Brazilian healthcare aesthetic standards
 * - Interactive treatment selection and comparison
 * - Print-friendly treatment plans
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconCurrencyReal,
  IconInfoCircle,
  IconScale,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import { TreatmentSuggestion } from './PhotoUpload';

interface TreatmentSuggestionsProps {
  suggestions: TreatmentSuggestion[];
  onTreatmentSelect?: (treatment: TreatmentSuggestion) => void;
  onTreatmentCompare?: (treatments: TreatmentSuggestion[]) => void;
  className?: string;
  maxSuggestions?: number;
  showComparison?: boolean;
  selectedTreatments?: string[];
}

const TREATMENT_CATEGORY_LABELS = {
  limpeza: 'Limpeza',
  peeling: 'Peeling',
  laser: 'Laser',
  toxina: 'Toxina Botulínica',
  preenchimento: 'Preenchimento',
  estimulação: 'Estimulação',
  clareamento: 'Clareamento',
} as const;

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
} as const;

const PRIORITY_LABELS = {
  high: 'Alta Prioridade',
  medium: 'Média Prioridade',
  low: 'Baixa Prioridade',
} as const;

export function TreatmentSuggestions({
  suggestions,
  onTreatmentSelect,
  onTreatmentCompare,
  className,
  maxSuggestions = 6,
  showComparison = true,
  selectedTreatments = [],
}: TreatmentSuggestionsProps) {
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(
    null,
  );
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(selectedTreatments);

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  const handleTreatmentToggle = (_treatmentId: any) => {
    setSelectedForComparison(prev => {
      const newSelection = prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId].slice(0, 3); // Limit to 3 treatments for comparison

      onTreatmentCompare?.(
        suggestions.filter(t => newSelection.includes(t.id)),
      );

      return newSelection;
    });
  };

  const getConfidenceColor = (_confidence: any) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDuration = (sessions: number, intervalWeeks: number) => {
    const totalWeeks = sessions * intervalWeeks;
    const months = Math.ceil(totalWeeks / 4);

    if (months <= 1) {
      return `${sessions} sessões em ${totalWeeks} semanas`;
    }

    return `${sessions} sessões em ~${months} meses`;
  };

  if (displayedSuggestions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <IconInfoCircle className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
        <h3 className='text-lg font-medium mb-2'>
          Nenhuma sugestão de tratamento disponível
        </h3>
        <p className='text-sm text-muted-foreground'>
          Faça o upload de fotos para receber recomendações personalizadas
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='text-center space-y-2'>
        <div className='flex items-center justify-center gap-2'>
          <IconSparkles className='h-6 w-6 text-primary' />
          <h3 className='text-xl font-semibold'>Recomendações de Tratamento</h3>
        </div>
        <p className='text-sm text-muted-foreground'>
          Baseado na análise IA das suas fotos • {displayedSuggestions.length} sugestões
        </p>
      </div>

      {/* Comparison Controls */}
      {showComparison && displayedSuggestions.length > 1 && (
        <div className='bg-muted/50 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-medium'>
              Comparar Tratamentos ({selectedForComparison.length}/3)
            </h4>
            {selectedForComparison.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSelectedForComparison([]);
                  onTreatmentCompare?.([]);
                }}
              >
                Limpar Seleção
              </Button>
            )}
          </div>

          {selectedForComparison.length >= 2 && (
            <Button
              className='w-full'
              onClick={() => {
                onTreatmentCompare?.(
                  suggestions.filter(t => selectedForComparison.includes(t.id)),
                );
              }}
            >
              Comparar Tratamentos Selecionados
            </Button>
          )}
        </div>
      )}

      {/* Treatment Suggestions Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {displayedSuggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className={cn(
              'border rounded-lg overflow-hidden transition-all hover:shadow-md',
              selectedForComparison.includes(suggestion.id)
                && 'ring-2 ring-primary',
            )}
          >
            {/* Treatment Header */}
            <div className='p-4 space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-xs font-medium text-muted-foreground uppercase'>
                      {TREATMENT_CATEGORY_LABELS[
                        suggestion.category as keyof typeof TREATMENT_CATEGORY_LABELS
                      ] || suggestion.category}
                    </span>
                    <div
                      className={cn(
                        'text-xs px-2 py-1 rounded-full border',
                        PRIORITY_COLORS[suggestion.priority],
                      )}
                    >
                      {PRIORITY_LABELS[suggestion.priority]}
                    </div>
                  </div>
                  <h4 className='font-semibold text-lg leading-tight'>
                    {suggestion.name}
                  </h4>
                </div>

                {showComparison && (
                  <button
                    onClick={() => handleTreatmentToggle(suggestion.id)}
                    className={cn(
                      'p-2 rounded border transition-colors',
                      selectedForComparison.includes(suggestion.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border',
                    )}
                    aria-label={`Selecionar ${suggestion.name} para comparação`}
                  >
                    {selectedForComparison.includes(suggestion.id)
                      ? <IconCheck className='h-4 w-4' />
                      : <IconScale className='h-4 w-4' />}
                  </button>
                )}
              </div>

              {/* Confidence Score */}
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  Confiência:
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    getConfidenceColor(suggestion.confidence),
                  )}
                >
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>

              {/* Quick Info */}
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div className='flex items-center gap-1'>
                  <IconCalendar className='h-4 w-4 text-muted-foreground' />
                  <span>{suggestion.estimatedSessions} sessões</span>
                </div>
                <div className='flex items-center gap-1'>
                  <IconClock className='h-4 w-4 text-muted-foreground' />
                  <span>cada {suggestion.intervalWeeks} semanas</span>
                </div>
              </div>

              {/* Price Range */}
              {suggestion.price && (
                <div className='flex items-center gap-1 text-sm'>
                  <IconCurrencyReal className='h-4 w-4 text-muted-foreground' />
                  <span>
                    {formatCurrency(suggestion.price.min)} - {formatCurrency(suggestion.price.max)}
                  </span>
                </div>
              )}

              {/* Description Preview */}
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {suggestion.description}
              </p>

              {/* Expand/Collapse Button */}
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  setExpandedTreatment(
                    expandedTreatment === suggestion.id ? null : suggestion.id,
                  )}
                className='w-full justify-between'
              >
                {expandedTreatment === suggestion.id
                  ? 'Menos Detalhes'
                  : 'Mais Detalhes'}
                <IconX
                  className={cn(
                    'h-4 w-4 transition-transform',
                    expandedTreatment === suggestion.id && 'rotate-180',
                  )}
                />
              </Button>
            </div>

            {/* Expanded Details */}
            {expandedTreatment === suggestion.id && (
              <div className='border-t bg-muted/30 p-4 space-y-3'>
                {/* Full Description */}
                <div>
                  <h5 className='text-sm font-medium mb-1'>
                    Descrição Completa
                  </h5>
                  <p className='text-sm text-muted-foreground'>
                    {suggestion.description}
                  </p>
                </div>

                {/* Treatment Duration */}
                <div>
                  <h5 className='text-sm font-medium mb-1'>
                    Duração do Tratamento
                  </h5>
                  <p className='text-sm text-muted-foreground'>
                    {formatDuration(
                      suggestion.estimatedSessions,
                      suggestion.intervalWeeks,
                    )}
                  </p>
                </div>

                {/* Price Details */}
                {suggestion.price && (
                  <div>
                    <h5 className='text-sm font-medium mb-1'>Investimento</h5>
                    <div className='text-sm text-muted-foreground space-y-1'>
                      <p>
                        Por sessão: {formatCurrency(
                          Math.round(
                            (suggestion.price.min + suggestion.price.max)
                              / 2
                              / suggestion.estimatedSessions,
                          ),
                        )}
                      </p>
                      <p>
                        Total estimado: {formatCurrency(suggestion.price.min)} -{' '}
                        {formatCurrency(suggestion.price.max)}
                      </p>
                    </div>
                  </div>
                )}

                {/* What to Expect */}
                <div>
                  <h5 className='text-sm font-medium mb-1'>O que Esperar</h5>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• Resultados progressivos ao longo das sessões</li>
                    <li>• Recuperação mínima entre sessões</li>
                    <li>
                      • Acompanhamento profissional durante todo tratamento
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 pt-2'>
                  <Button
                    className='flex-1'
                    onClick={() => onTreatmentSelect?.(suggestion)}
                  >
                    Agendar Consulta
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // TODO: Implement share functionality
                      toast.info('Funcionalidade de compartilhamento em breve');
                    }}
                  >
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {suggestions.length > maxSuggestions && (
        <div className='text-center'>
          <Button
            variant='outline'
            onClick={() => {
              // TODO: Implement show more functionality
              toast.info('Carregando mais sugestões...');
            }}
          >
            Ver Mais Sugestões ({suggestions.length - maxSuggestions} restantes)
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <div className='text-xs text-muted-foreground text-center space-y-1'>
        <p>
          💡 As recomendações são baseadas em análise de IA e devem ser confirmadas por um
          profissional
        </p>
        <p>
          Resultados podem variar dependendo das características individuais e adesão ao tratamento
        </p>
      </div>
    </div>
  );
}

// Additional helper components for treatment comparison
interface TreatmentComparisonProps {
  treatments: TreatmentSuggestion[];
  onClose?: () => void;
}

export function TreatmentComparison({
  treatments,
  onClose,
}: TreatmentComparisonProps) {
  if (treatments.length < 2) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6 space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>Comparação de Tratamentos</h3>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <IconX className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {treatments.map(treatment => (
              <div key={treatment.id} className='border rounded-lg p-4'>
                <h4 className='font-semibold mb-2'>{treatment.name}</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Confiança:</span>
                    <span className='font-medium'>
                      {Math.round(treatment.confidence * 100)}%
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Sessões:</span>
                    <span className='font-medium'>
                      {treatment.estimatedSessions}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Intervalo:</span>
                    <span className='font-medium'>
                      {treatment.intervalWeeks} semanas
                    </span>
                  </div>
                  {treatment.price && (
                    <div className='flex justify-between'>
                      <span>Preço:</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: treatment.price.currency,
                          maximumFractionDigits: 0,
                        }).format(treatment.price.min)} - {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: treatment.price.currency,
                          maximumFractionDigits: 0,
                        }).format(treatment.price.max)}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span>Prioridade:</span>
                    <span className='font-medium capitalize'>
                      {treatment.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
