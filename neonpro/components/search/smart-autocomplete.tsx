/**
 * Smart Autocomplete Component
 * Story 3.4: Smart Search + NLP Integration - Task 4
 * Intelligent autocomplete with learning capabilities and contextual suggestions
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Clock,
  TrendingUp,
  User,
  Brain,
  Sparkles,
  Filter,
  ArrowRight,
  Zap,
  Target,
  History,
  Star,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import {
  searchSuggestions,
  type SearchSuggestion,
  type SuggestionContext,
  type SuggestionOptions,
  type LearningData
} from '@/lib/search/search-suggestions';

interface SmartAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onSearch?: (query: string) => void;
  context: SuggestionContext;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSuggestions?: number;
  showCategories?: boolean;
  showIcons?: boolean;
  enableLearning?: boolean;
}

export function SmartAutocomplete({
  value,
  onValueChange,
  onSuggestionSelect,
  onSearch,
  context,
  placeholder = "Buscar...",
  disabled = false,
  className,
  maxSuggestions = 8,
  showCategories = true,
  showIcons = true,
  enableLearning = true
}: SmartAutocompleteProps) {
  // State
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [interactionStartTime, setInteractionStartTime] = useState<number>(0);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Debounced value for API calls
  const debouncedValue = useDebounce(value, 300);
  
  // Load suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue.length >= 2) {
      loadSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedValue]);
  
  // Load suggestions from API
  const loadSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const options: SuggestionOptions = {
        maxSuggestions,
        includeHistory: true,
        includePopular: true,
        includePersonalized: context.userPreferences.personalizedSuggestions,
        includeContextual: true,
        minConfidence: 0.3,
        language: context.userPreferences.language
      };
      
      const results = await searchSuggestions.getSuggestions(query, context, options);
      setSuggestions(results);
      setOpen(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxSuggestions, context]);
  
  // Handle input change
  const handleInputChange = (newValue: string) => {
    onValueChange(newValue);
    if (newValue.length >= 2 && !interactionStartTime) {
      setInteractionStartTime(Date.now());
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: SearchSuggestion) => {
    const timeToSelect = interactionStartTime ? Date.now() - interactionStartTime : 0;
    
    onValueChange(suggestion.text);
    setOpen(false);
    setSelectedIndex(-1);
    
    // Trigger search if callback provided
    if (onSearch) {
      onSearch(suggestion.text);
    }
    
    // Notify parent component
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    // Learn from interaction
    if (enableLearning) {
      const learningData: LearningData = {
        query: value,
        selectedSuggestion: suggestion.text,
        resultClicked: true,
        timeToSelect,
        refinements: [],
        success: true
      };
      
      await searchSuggestions.learnFromInteraction(learningData);
    }
    
    setInteractionStartTime(0);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (value.trim()) {
          // Search with current value
          setOpen(false);
          if (onSearch) {
            onSearch(value);
          }
        }
        break;
        
      case 'Escape':
        setOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  // Handle input focus
  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setOpen(true);
    }
  };
  
  // Handle input blur
  const handleBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      setOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };
  
  // Get suggestion icon
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (!showIcons) return null;
    
    const iconMap = {
      'query_completion': <Sparkles className="h-4 w-4 text-blue-500" />,
      'entity_suggestion': <Target className="h-4 w-4 text-green-500" />,
      'historical': <History className="h-4 w-4 text-gray-500" />,
      'popular': <TrendingUp className="h-4 w-4 text-orange-500" />,
      'contextual': <Brain className="h-4 w-4 text-purple-500" />,
      'personalized': <User className="h-4 w-4 text-pink-500" />,
      'semantic': <Zap className="h-4 w-4 text-yellow-500" />,
      'filter_suggestion': <Filter className="h-4 w-4 text-indigo-500" />
    };
    
    return iconMap[suggestion.type] || <Search className="h-4 w-4 text-gray-400" />;
  };
  
  // Get suggestion category label
  const getCategoryLabel = (category: string) => {
    const labelMap = {
      'completion': 'Completar',
      'history': 'Histórico',
      'trending': 'Popular',
      'context': 'Contextual',
      'preferences': 'Personalizado',
      'patterns': 'Padrões',
      'similar': 'Similares',
      'session': 'Sessão'
    };
    
    return labelMap[category] || category;
  };
  
  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const category = suggestion.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(suggestion);
    return groups;
  }, {} as Record<string, SearchSuggestion[]>);
  
  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-gray-500';
  };
  
  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start"
          side="bottom"
        >
          <Command>
            <CommandList ref={listRef}>
              {suggestions.length === 0 ? (
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="ml-2 text-sm text-muted-foreground">Carregando sugestões...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Search className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Nenhuma sugestão encontrada</span>
                    </div>
                  )}
                </CommandEmpty>
              ) : (
                <ScrollArea className="max-h-80">
                  {showCategories ? (
                    // Grouped by category
                    Object.entries(groupedSuggestions).map(([category, categorySuggestions], categoryIndex) => (
                      <div key={category}>
                        {categoryIndex > 0 && <Separator className="my-1" />}
                        
                        <CommandGroup heading={getCategoryLabel(category)}>
                          {categorySuggestions.map((suggestion, index) => {
                            const globalIndex = suggestions.findIndex(s => s.id === suggestion.id);
                            const isSelected = selectedIndex === globalIndex;
                            
                            return (
                              <CommandItem
                                key={suggestion.id}
                                value={suggestion.text}
                                onSelect={() => handleSuggestionSelect(suggestion)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2 cursor-pointer",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  isSelected && "bg-accent text-accent-foreground"
                                )}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  {getSuggestionIcon(suggestion)}
                                  
                                  <div className="ml-3 flex-1 min-w-0">
                                    <div 
                                      className="text-sm font-medium truncate"
                                      dangerouslySetInnerHTML={{ 
                                        __html: suggestion.highlighted || suggestion.text 
                                      }}
                                    />
                                    
                                    {suggestion.metadata?.context && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {suggestion.metadata.context}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-2">
                                  {suggestion.frequency > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {suggestion.frequency}
                                    </Badge>
                                  )}
                                  
                                  <div className={cn(
                                    "text-xs font-medium",
                                    getConfidenceColor(suggestion.confidence)
                                  )}>
                                    {Math.round(suggestion.confidence * 100)}%
                                  </div>
                                  
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </div>
                    ))
                  ) : (
                    // Flat list
                    <CommandGroup>
                      {suggestions.map((suggestion, index) => {
                        const isSelected = selectedIndex === index;
                        
                        return (
                          <CommandItem
                            key={suggestion.id}
                            value={suggestion.text}
                            onSelect={() => handleSuggestionSelect(suggestion)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 cursor-pointer",
                              "hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              {getSuggestionIcon(suggestion)}
                              
                              <div className="ml-3 flex-1 min-w-0">
                                <div 
                                  className="text-sm font-medium truncate"
                                  dangerouslySetInnerHTML={{ 
                                    __html: suggestion.highlighted || suggestion.text 
                                  }}
                                />
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {getCategoryLabel(suggestion.category)}
                                  </Badge>
                                  
                                  {suggestion.metadata?.context && (
                                    <span className="text-xs text-muted-foreground">
                                      {suggestion.metadata.context}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                              {suggestion.frequency > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.frequency}
                                </Badge>
                              )}
                              
                              <div className={cn(
                                "text-xs font-medium",
                                getConfidenceColor(suggestion.confidence)
                              )}>
                                {Math.round(suggestion.confidence * 100)}%
                              </div>
                              
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </ScrollArea>
              )}
            </CommandList>
          </Command>
          
          {/* Footer with tips */}
          {suggestions.length > 0 && (
            <>
              <Separator />
              <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
                <div className="flex items-center justify-between">
                  <span>Use ↑↓ para navegar, Enter para selecionar</span>
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    <span>IA Ativa</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Enhanced autocomplete with additional features
export function EnhancedSmartAutocomplete({
  value,
  onValueChange,
  onSuggestionSelect,
  onSearch,
  context,
  ...props
}: SmartAutocompleteProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  return (
    <div className="space-y-2">
      <SmartAutocomplete
        value={value}
        onValueChange={onValueChange}
        onSuggestionSelect={onSuggestionSelect}
        onSearch={onSearch}
        context={context}
        {...props}
      />
      
      {/* Advanced options */}
      {showAdvanced && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(false)}
          >
            Ocultar Filtros
          </Button>
          
          {/* Add filter controls here */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtros avançados disponíveis</span>
          </div>
        </div>
      )}
      
      {!showAdvanced && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(true)}
          className="text-xs text-muted-foreground"
        >
          <Filter className="h-3 w-3 mr-1" />
          Mostrar Filtros Avançados
        </Button>
      )}
    </div>
  );
}