/**
 * Smart Search Interface Component
 *
 * Provides a conversational search interface with NLP capabilities.
 * Supports natural language queries and intelligent result display.
 *
 * @module smart-search-interface
 * @version 1.0.0
 */

"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchResponse, SearchResult, SearchType } from "@/lib/search/types";
import type {
  Activity,
  Calendar,
  Clock,
  FileText,
  Filter,
  Loader2,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface SmartSearchProps {
  userId: string;
  userRole?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  initialQuery?: string;
  maxResults?: number;
  enableFilters?: boolean;
  enableNLP?: boolean;
}

interface SearchFilters {
  types: SearchType[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy: "relevance" | "date" | "name";
  includeInactive: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
  types: ["patients", "appointments", "medical_records", "timeline_events"],
  sortBy: "relevance",
  includeInactive: false,
};

export function SmartSearchInterface({
  userId,
  userRole = "user",
  className = "",
  onResultSelect,
  initialQuery = "",
  maxResults = 20,
  enableFilters = true,
  enableNLP = true,
}: SmartSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | SearchType>("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(
    async (searchTerm: string, searchFilters = filters) => {
      if (!searchTerm.trim()) {
        setSearchResponse(null);
        return;
      }

      setIsSearching(true);

      try {
        let response: SearchResponse;

        if (enableNLP) {
          // Use conversational search for NLP processing via API
          const apiResponse = await fetch("/api/search/conversational", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              term: searchTerm,
              userId,
              userRole,
            }),
          });
          response = await apiResponse.json();
        } else {
          // Use traditional search via API
          const apiResponse = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              term: searchTerm,
              filters: {
                types: searchFilters.types,
                dateRange: searchFilters.dateRange
                  ? {
                      start: new Date(searchFilters.dateRange.start),
                      end: new Date(searchFilters.dateRange.end),
                    }
                  : undefined,
              },
              options: {
                useNLP: false,
                limit: maxResults,
                sortBy: searchFilters.sortBy,
              },
            }),
          });
          response = await apiResponse.json();
        }

        setSearchResponse(response);

        // Add to search history
        if (!searchHistory.includes(searchTerm)) {
          setSearchHistory((prev) => [searchTerm, ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResponse(null);
      } finally {
        setIsSearching(false);
      }
    },
    [userId, userRole, enableNLP, maxResults, filters, searchHistory],
  );

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle immediate search (Enter key or search button)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(query);
  };

  // Filter results by type for tabs
  const getFilteredResults = (type: SearchType | "all"): SearchResult[] => {
    if (!searchResponse) return [];
    if (type === "all") return searchResponse.results;
    return searchResponse.results.filter((result) => result.type === type);
  };

  // Get icon for search result type
  const getTypeIcon = (type: SearchType) => {
    const iconMap = {
      patients: User,
      appointments: Calendar,
      medical_records: FileText,
      timeline_events: Activity,
      insights: MessageCircle,
      lab_results: FileText,
      medications: FileText,
      documents: FileText,
      duplicates: User,
      photos: User,
    };

    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get type label in Portuguese
  const getTypeLabel = (type: SearchType): string => {
    const labelMap = {
      patients: "Pacientes",
      appointments: "Agendamentos",
      medical_records: "Registros Médicos",
      timeline_events: "Timeline",
      insights: "Insights",
      lab_results: "Exames",
      medications: "Medicamentos",
      documents: "Documentos",
      duplicates: "Duplicatas",
      photos: "Fotos",
    };

    return labelMap[type] || type;
  };

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
  };

  // Get result counts by type
  const getResultCounts = (): Record<SearchType | "all", number> => {
    if (!searchResponse) return {} as any;

    const counts: Record<string, number> = {
      all: searchResponse.results.length,
    };

    for (const result of searchResponse.results) {
      counts[result.type] = (counts[result.type] || 0) + 1;
    }

    return counts as Record<SearchType | "all", number>;
  };

  const resultCounts = getResultCounts();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus();
    }
  }, [initialQuery]);

  // Perform initial search if query provided
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              enableNLP
                ? "Busque de forma natural: 'pacientes com botox hoje', 'João Silva consultas'..."
                : "Buscar pacientes, consultas, registros..."
            }
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {enableFilters && (
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="px-2">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filtros de Busca</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipos de Conteúdo</Label>
                      <div className="mt-2 space-y-2">
                        {(
                          [
                            "patients",
                            "appointments",
                            "medical_records",
                            "timeline_events",
                            "insights",
                          ] as SearchType[]
                        ).map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={filters.types.includes(type)}
                              onCheckedChange={(checked) => {
                                setFilters((prev) => ({
                                  ...prev,
                                  types: checked
                                    ? [...prev.types, type]
                                    : prev.types.filter((t) => t !== type),
                                }));
                              }}
                            />
                            <Label htmlFor={type}>{getTypeLabel(type)}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Ordenação</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { value: "relevance", label: "Relevância" },
                          { value: "date", label: "Data" },
                          { value: "name", label: "Nome" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.value}
                              checked={filters.sortBy === option.value}
                              onCheckedChange={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  sortBy: option.value as any,
                                }));
                              }}
                            />
                            <Label htmlFor={option.value}>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeInactive"
                        checked={filters.includeInactive}
                        onCheckedChange={(checked) => {
                          setFilters((prev) => ({
                            ...prev,
                            includeInactive: !!checked,
                          }));
                        }}
                      />
                      <Label htmlFor="includeInactive">Incluir registros inativos</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowFilters(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          setShowFilters(false);
                          performSearch(query, filters);
                        }}
                      >
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button type="submit" size="sm" className="px-3" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && !searchResponse && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Buscas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NLP Analysis Display */}
      {enableNLP && searchResponse?.nlpAnalysis && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">Análise Inteligente:</span>
              <span>
                {searchResponse.nlpAnalysis.intent.action}{" "}
                {searchResponse.nlpAnalysis.intent.target}
              </span>
              {searchResponse.nlpAnalysis.entities.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {searchResponse.nlpAnalysis.entities
                      .map((e) => `${e.type}: ${e.value}`)
                      .join(", ")}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResponse && (
        <div className="space-y-4">
          {/* Search Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {searchResponse.totalCount} resultados em {searchResponse.executionTime.toFixed(0)}ms
            </span>
            {enableNLP && searchResponse.nlpAnalysis && (
              <Badge variant="secondary" className="text-xs">
                NLP Ativo
              </Badge>
            )}
          </div>

          {/* Results Tabs */}
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center space-x-1">
                <span>Todos</span>
                {resultCounts.all > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {resultCounts.all}
                  </Badge>
                )}
              </TabsTrigger>

              {(
                [
                  "patients",
                  "appointments",
                  "medical_records",
                  "timeline_events",
                  "insights",
                ] as const
              ).map((type) => {
                const count = resultCounts[type] || 0;
                if (count === 0) return null;

                return (
                  <TabsTrigger key={type} value={type} className="flex items-center space-x-1">
                    {getTypeIcon(type)}
                    <span className="hidden sm:inline">{getTypeLabel(type)}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Results Content */}
            <div className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {getFilteredResults(selectedTab).map((result, index) => (
                    <Card
                      key={result.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(result.type)}
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(result.relevanceScore * 100)}% relevante
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-sm mb-1">{result.title}</h3>

                            <p className="text-sm text-muted-foreground mb-2">
                              {result.description}
                            </p>

                            {/* Highlights */}
                            {result.highlights && result.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {result.highlights.map((highlight, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            {result.actions && result.actions.length > 0 && (
                              <div className="flex space-x-2">
                                {result.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (action.url) {
                                        window.location.href = action.url;
                                      }
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>

          {/* Suggestions */}
          {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sugestões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchResponse.suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {query && searchResponse && searchResponse.results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar sua busca ou usar termos diferentes.
            </p>
            {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Que tal tentar:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchResponse.suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SmartSearchInterface;
