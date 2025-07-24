// =============================================
// NeonPro Alternative Slots Suggestion Component
// Story 1.2: Task 5 - Alternative time slot suggestion system
// Enhanced with research-based UI patterns and performance metrics
// =============================================

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Calendar, Star, ArrowRight, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import {
  AlternativeSlot,
  UseAlternativeSlotsResult,
  formatAlternativeSlot,
  getSuggestionQuality,
  getSuggestionQualityColor,
  groupSuggestionsByDay,
  filterSuggestionsWithDayjs,
} from '@/hooks/appointments/use-alternative-slots';

interface AlternativeSlotsDisplayProps {
  alternativeSlots: UseAlternativeSlotsResult;
  onSelectSlot?: (slot: AlternativeSlot) => void;
  maxDisplaySlots?: number;
  showGroupByDay?: boolean;
  compact?: boolean;
  className?: string;
  // Research-based enhancements
  showPerformanceMetrics?: boolean;
  enableRealtimeFiltering?: boolean;
  showBookingProbability?: boolean;
}

export default function AlternativeSlotsDisplay({
  alternativeSlots,
  onSelectSlot,
  maxDisplaySlots = 5,
  showGroupByDay = false,
  compact = false,
  className,
  // Research-based props
  showPerformanceMetrics = false,
  enableRealtimeFiltering = false,
  showBookingProbability = false,
}: AlternativeSlotsDisplayProps) {
  const {
    suggestions,
    isLoading,
    error,
    selectedSuggestion,
    searchMetadata,
    performanceMetrics,
  } = alternativeSlots;

  // Performance-optimized suggestion processing with useMemo
  const processedSuggestions = useMemo(() => {
    let processed = suggestions;
    
    // Apply real-time filtering if enabled
    if (enableRealtimeFiltering) {
      processed = filterSuggestionsWithDayjs(processed, {
        onlyWorkingHours: true,
        excludeDays: [0], // Exclude Sundays
      });
    }
    
    // Sort by score and booking probability
    processed = processed
      .sort((a, b) => {
        const scoreA = showBookingProbability ? (a.booking_success_probability || 0) * 100 : a.score;
        const scoreB = showBookingProbability ? (b.booking_success_probability || 0) * 100 : b.score;
        return scoreB - scoreA;
      })
      .slice(0, maxDisplaySlots);
    
    return processed;
  }, [suggestions, enableRealtimeFiltering, showBookingProbability, maxDisplaySlots]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Buscando horários alternativos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Erro ao buscar horários alternativos</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No suggestions state
  if (!suggestions.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">Nenhum horário alternativo encontrado</p>
            <p className="text-sm mt-1">
              Tente expandir a janela de busca ou escolher outro profissional
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit displayed suggestions
  const displaySuggestions = suggestions.slice(0, maxDisplaySlots);

  // Group by day if requested
  if (showGroupByDay) {
    const groupedSuggestions = groupSuggestionsByDay(displaySuggestions);
    
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Horários Alternativos Disponíveis</h3>
          {searchMetadata && (
            <Badge variant="outline" className="text-xs">
              {searchMetadata.total_suggestions} encontrado{searchMetadata.total_suggestions !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {Object.entries(groupedSuggestions).map(([date, daySlots]) => {
          const dayName = new Intl.DateTimeFormat('pt-BR', { 
            weekday: 'long',
            day: '2-digit',
            month: 'long'
          }).format(new Date(date));
          
          return (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">{dayName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySlots.map((slot, index) => (
                  <SlotCard
                    key={index}
                    slot={slot}
                    onSelect={onSelectSlot}
                    isSelected={selectedSuggestion?.start_time === slot.start_time}
                    compact={compact}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Regular list display
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Horários Alternativos</CardTitle>
            <CardDescription>
              {searchMetadata && (
                <>Encontramos {searchMetadata.total_suggestions} opção{searchMetadata.total_suggestions !== 1 ? 'ões' : ''} disponível{searchMetadata.total_suggestions !== 1 ? 'is' : ''}</>
              )}
            </CardDescription>
          </div>
          {searchMetadata && (
            <Badge variant="outline">
              {displaySuggestions.length} de {searchMetadata.total_suggestions}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displaySuggestions.map((slot, index) => (
          <SlotCard
            key={index}
            slot={slot}
            onSelect={onSelectSlot}
            isSelected={selectedSuggestion?.start_time === slot.start_time}
            compact={compact}
            showRanking={!compact}
            ranking={index + 1}
          />
        ))}
        
        {suggestions.length > maxDisplaySlots && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              +{suggestions.length - maxDisplaySlots} horário{suggestions.length - maxDisplaySlots !== 1 ? 's' : ''} adicional{suggestions.length - maxDisplaySlots !== 1 ? 'is' : ''} disponível{suggestions.length - maxDisplaySlots !== 1 ? 'is' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Individual slot card component
interface SlotCardProps {
  slot: AlternativeSlot;
  onSelect?: (slot: AlternativeSlot) => void;
  isSelected?: boolean;
  compact?: boolean;
  showRanking?: boolean;
  ranking?: number;
}

function SlotCard({
  slot,
  onSelect,
  isSelected = false,
  compact = false,
  showRanking = false,
  ranking,
}: SlotCardProps) {
  const quality = getSuggestionQuality(slot);
  const qualityColor = getSuggestionQualityColor(quality);
  
  const handleSelect = () => {
    onSelect?.(slot);
  };

  if (compact) {
    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        className={cn(
          'w-full justify-between h-auto p-3',
          isSelected && 'ring-2 ring-primary ring-offset-2'
        )}
        onClick={handleSelect}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formatAlternativeSlot(slot)}</span>
        </div>
        <div className="flex items-center gap-2">
          {slot.is_same_day && (
            <Badge variant="secondary" className="text-xs">
              Mesmo dia
            </Badge>
          )}
          <ArrowRight className="h-4 w-4" />
        </div>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
        qualityColor.includes('border-') && qualityColor
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            {showRanking && ranking && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                #{ranking}
              </Badge>
            )}
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>{formatAlternativeSlot(slot)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>Score: {slot.score.toFixed(0)}</span>
            </div>
            
            {slot.distance_from_preferred_minutes !== 0 && (
              <div>
                {slot.distance_from_preferred_minutes > 0 ? '+' : ''}
                {Math.round(slot.distance_from_preferred_minutes / 60 * 10) / 10}h
              </div>
            )}
            
            {slot.is_same_day && (
              <Badge variant="secondary" className="text-xs">
                Mesmo dia
              </Badge>
            )}
          </div>
          
          {slot.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {slot.reasons.slice(0, 2).map((reason, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
              {slot.reasons.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{slot.reasons.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex items-center">
          {isSelected ? (
            <Badge className="bg-primary text-primary-foreground">
              Selecionado
            </Badge>
          ) : (
            <Button size="sm" variant="ghost">
              Selecionar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Performance Metrics Display (Research-based KPI tracking)
  const PerformanceMetricsCard = () => {
    if (!showPerformanceMetrics || !performanceMetrics) return null;

    return (
      <Card className="mt-4 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tempo de Busca</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {performanceMetrics.searchTime.toFixed(0)}ms
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Opções Geradas</p>
              <p className="text-sm font-medium">{performanceMetrics.totalOptions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Eficiência do Algoritmo</p>
              <p className="text-sm font-medium">
                {(performanceMetrics.algorithm_efficiency * 100).toFixed(0)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Satisfação Média</p>
              <p className="text-sm font-medium">
                {(performanceMetrics.avgUserSatisfaction * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Enhanced slot rendering with booking probability
  const renderSlotWithProbability = (slot: AlternativeSlot, index: number) => {
    const probability = slot.booking_success_probability || 0;
    const probabilityPercent = Math.round(probability * 100);
    
    return (
      <div key={slot.start_time} className="relative">
        {renderSlot(slot, index + 1)}
        {showBookingProbability && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs">
            <div className="flex items-center gap-1">
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  probabilityPercent >= 70 ? "bg-green-500" : 
                  probabilityPercent >= 40 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
              {probabilityPercent}%
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main component return with enhanced features
  return (
    <div className={cn('space-y-4', className)}>
      {/* Existing main card content */}
      <Card className="w-full">
        {/* ... existing loading, error, and content logic ... */}
        {/* Updated to use processedSuggestions */}
        <div className="space-y-3">
          {processedSuggestions.map((slot, index) => 
            showBookingProbability ? 
            renderSlotWithProbability(slot, index) : 
            renderSlot(slot, index + 1)
          )}
        </div>
        
        {/* Research-based metadata display */}
        {searchMetadata && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Janela de busca: {dayjs(searchMetadata.generated_at).format('DD/MM/YYYY HH:mm')} • 
              {searchMetadata.total_suggestions} sugestões geradas
            </div>
          </div>
        )}
      </Card>

      {/* Performance metrics card */}
      <PerformanceMetricsCard />
    </div>
  );
}