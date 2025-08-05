// =============================================
// NeonPro Alternative Slots Suggestion Component
// Story 1.2: Task 5 - Alternative time slot suggestion system
// Enhanced with research-based UI patterns and performance metrics
// =============================================
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AlternativeSlotsDisplay;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var use_alternative_slots_1 = require("@/hooks/appointments/use-alternative-slots");
function AlternativeSlotsDisplay(_a) {
    var alternativeSlots = _a.alternativeSlots, onSelectSlot = _a.onSelectSlot, _b = _a.maxDisplaySlots, maxDisplaySlots = _b === void 0 ? 5 : _b, _c = _a.showGroupByDay, showGroupByDay = _c === void 0 ? false : _c, _d = _a.compact, compact = _d === void 0 ? false : _d, className = _a.className, 
    // Research-based props
    _e = _a.showPerformanceMetrics, 
    // Research-based props
    showPerformanceMetrics = _e === void 0 ? false : _e, _f = _a.enableRealtimeFiltering, enableRealtimeFiltering = _f === void 0 ? false : _f, _g = _a.showBookingProbability, showBookingProbability = _g === void 0 ? false : _g;
    var suggestions = alternativeSlots.suggestions, isLoading = alternativeSlots.isLoading, error = alternativeSlots.error, selectedSuggestion = alternativeSlots.selectedSuggestion, searchMetadata = alternativeSlots.searchMetadata, performanceMetrics = alternativeSlots.performanceMetrics;
    // Performance-optimized suggestion processing with useMemo
    var processedSuggestions = (0, react_1.useMemo)(function () {
        var processed = suggestions;
        // Apply real-time filtering if enabled
        if (enableRealtimeFiltering) {
            processed = (0, use_alternative_slots_1.filterSuggestionsWithDayjs)(processed, {
                onlyWorkingHours: true,
                excludeDays: [0], // Exclude Sundays
            });
        }
        // Sort by score and booking probability
        processed = processed
            .sort(function (a, b) {
            var scoreA = showBookingProbability ? (a.booking_success_probability || 0) * 100 : a.score;
            var scoreB = showBookingProbability ? (b.booking_success_probability || 0) * 100 : b.score;
            return scoreB - scoreA;
        })
            .slice(0, maxDisplaySlots);
        return processed;
    }, [suggestions, enableRealtimeFiltering, showBookingProbability, maxDisplaySlots]);
    // Loading state
    if (isLoading) {
        return (<card_1.Card className={(0, utils_1.cn)('w-full', className)}>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <lucide_react_1.Loader2 className="h-5 w-5 animate-spin"/>
            <span>Buscando horários alternativos...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    // Error state
    if (error) {
        return (<card_1.Card className={(0, utils_1.cn)('w-full', className)}>
        <card_1.CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <lucide_react_1.AlertCircle className="h-5 w-5"/>
            <div>
              <p className="font-semibold">Erro ao buscar horários alternativos</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    // No suggestions state
    if (!suggestions.length) {
        return (<card_1.Card className={(0, utils_1.cn)('w-full', className)}>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <lucide_react_1.Clock className="h-8 w-8 mx-auto mb-2 opacity-50"/>
            <p className="font-semibold">Nenhum horário alternativo encontrado</p>
            <p className="text-sm mt-1">
              Tente expandir a janela de busca ou escolher outro profissional
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    // Limit displayed suggestions
    var displaySuggestions = suggestions.slice(0, maxDisplaySlots);
    // Group by day if requested
    if (showGroupByDay) {
        var groupedSuggestions = (0, use_alternative_slots_1.groupSuggestionsByDay)(displaySuggestions);
        return (<div className={(0, utils_1.cn)('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Horários Alternativos Disponíveis</h3>
          {searchMetadata && (<badge_1.Badge variant="outline" className="text-xs">
              {searchMetadata.total_suggestions} encontrado{searchMetadata.total_suggestions !== 1 ? 's' : ''}
            </badge_1.Badge>)}
        </div>
        
        {Object.entries(groupedSuggestions).map(function (_a) {
                var date = _a[0], daySlots = _a[1];
                var dayName = new Intl.DateTimeFormat('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long'
                }).format(new Date(date));
                return (<card_1.Card key={date}>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-base capitalize">{dayName}</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                {daySlots.map(function (slot, index) { return (<SlotCard key={index} slot={slot} onSelect={onSelectSlot} isSelected={(selectedSuggestion === null || selectedSuggestion === void 0 ? void 0 : selectedSuggestion.start_time) === slot.start_time} compact={compact}/>); })}
              </card_1.CardContent>
            </card_1.Card>);
            })}
      </div>);
    }
    // Regular list display
    return (<card_1.Card className={(0, utils_1.cn)('w-full', className)}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="text-lg">Horários Alternativos</card_1.CardTitle>
            <card_1.CardDescription>
              {searchMetadata && (<>Encontramos {searchMetadata.total_suggestions} opção{searchMetadata.total_suggestions !== 1 ? 'ões' : ''} disponível{searchMetadata.total_suggestions !== 1 ? 'is' : ''}</>)}
            </card_1.CardDescription>
          </div>
          {searchMetadata && (<badge_1.Badge variant="outline">
              {displaySuggestions.length} de {searchMetadata.total_suggestions}
            </badge_1.Badge>)}
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        {displaySuggestions.map(function (slot, index) { return (<SlotCard key={index} slot={slot} onSelect={onSelectSlot} isSelected={(selectedSuggestion === null || selectedSuggestion === void 0 ? void 0 : selectedSuggestion.start_time) === slot.start_time} compact={compact} showRanking={!compact} ranking={index + 1}/>); })}
        
        {suggestions.length > maxDisplaySlots && (<div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              +{suggestions.length - maxDisplaySlots} horário{suggestions.length - maxDisplaySlots !== 1 ? 's' : ''} adicional{suggestions.length - maxDisplaySlots !== 1 ? 'is' : ''} disponível{suggestions.length - maxDisplaySlots !== 1 ? 'is' : ''}
            </p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
function SlotCard(_a) {
    var slot = _a.slot, onSelect = _a.onSelect, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, _c = _a.compact, compact = _c === void 0 ? false : _c, _d = _a.showRanking, showRanking = _d === void 0 ? false : _d, ranking = _a.ranking;
    var quality = (0, use_alternative_slots_1.getSuggestionQuality)(slot);
    var qualityColor = (0, use_alternative_slots_1.getSuggestionQualityColor)(quality);
    var handleSelect = function () {
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(slot);
    };
    if (compact) {
        return (<button_1.Button variant={isSelected ? "default" : "outline"} className={(0, utils_1.cn)('w-full justify-between h-auto p-3', isSelected && 'ring-2 ring-primary ring-offset-2')} onClick={handleSelect}>
        <div className="flex items-center gap-2">
          <lucide_react_1.Calendar className="h-4 w-4"/>
          <span className="font-medium">{(0, use_alternative_slots_1.formatAlternativeSlot)(slot)}</span>
        </div>
        <div className="flex items-center gap-2">
          {slot.is_same_day && (<badge_1.Badge variant="secondary" className="text-xs">
              Mesmo dia
            </badge_1.Badge>)}
          <lucide_react_1.ArrowRight className="h-4 w-4"/>
        </div>
      </button_1.Button>);
    }
    return (<div className={(0, utils_1.cn)('relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md', isSelected && 'ring-2 ring-primary ring-offset-2 bg-primary/5', qualityColor.includes('border-') && qualityColor)} onClick={handleSelect}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            {showRanking && ranking && (<badge_1.Badge variant="outline" className="text-xs px-2 py-1">
                #{ranking}
              </badge_1.Badge>)}
            <div className="flex items-center gap-2 text-sm font-medium">
              <lucide_react_1.Calendar className="h-4 w-4"/>
              <span>{(0, use_alternative_slots_1.formatAlternativeSlot)(slot)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <lucide_react_1.Star className="h-3 w-3"/>
              <span>Score: {slot.score.toFixed(0)}</span>
            </div>
            
            {slot.distance_from_preferred_minutes !== 0 && (<div>
                {slot.distance_from_preferred_minutes > 0 ? '+' : ''}
                {Math.round(slot.distance_from_preferred_minutes / 60 * 10) / 10}h
              </div>)}
            
            {slot.is_same_day && (<badge_1.Badge variant="secondary" className="text-xs">
                Mesmo dia
              </badge_1.Badge>)}
          </div>
          
          {slot.reasons.length > 0 && (<div className="flex flex-wrap gap-1">
              {slot.reasons.slice(0, 2).map(function (reason, idx) { return (<badge_1.Badge key={idx} variant="outline" className="text-xs">
                  {reason}
                </badge_1.Badge>); })}
              {slot.reasons.length > 2 && (<badge_1.Badge variant="outline" className="text-xs">
                  +{slot.reasons.length - 2}
                </badge_1.Badge>)}
            </div>)}
        </div>
        
        <div className="ml-4 flex items-center">
          {isSelected ? (<badge_1.Badge className="bg-primary text-primary-foreground">
              Selecionado
            </badge_1.Badge>) : (<button_1.Button size="sm" variant="ghost">
              Selecionar
              <lucide_react_1.ArrowRight className="ml-2 h-4 w-4"/>
            </button_1.Button>)}
        </div>
      </div>
    </div>);
}
