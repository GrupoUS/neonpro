/**
 * Smart Search Component
 * Story 3.4: Smart Search + NLP Integration - Task 1
 * Intelligent search interface with NLP processing
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Search, Mic, Filter, Clock, TrendingUp, X, Loader2 } from "lucide-react";
import type { Input } from "@/components/ui/input";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Separator } from "@/components/ui/separator";
import type { useDebounce } from "@/hooks/use-debounce";
import type { cn } from "@/lib/utils";

// Types
interface SearchResult {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  description: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  highlightedText?: string;
}

interface SearchSuggestion {
  text: string;
  type: "recent" | "popular" | "nlp";
  count?: number;
}

interface NLPAnalysis {
  normalized: string;
  intent: {
    primary: string;
    confidence: number;
    secondary?: string[];
  };
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  confidence: number;
  suggestions?: string[];
}

interface SmartSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  showAnalytics?: boolean;
  contentTypes?: string[];
  maxResults?: number;
}

/**
 * Smart Search Component with NLP Integration
 */
export function SmartSearch({
  onResultSelect,
  placeholder = "Pesquisar pacientes, consultas, tratamentos...",
  className,
  showFilters = true,
  showAnalytics = true,
  contentTypes,
  maxResults = 20,
}: SmartSearchProps) {
  // State
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [nlpAnalysis, setNlpAnalysis] = useState<NLPAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  // Debounced query for suggestions
  const debouncedQuery = useDebounce(query, 300);

  // Available content types
  const availableContentTypes = [
    { id: "patient", label: "Pacientes", icon: "👤" },
    { id: "appointment", label: "Consultas", icon: "📅" },
    { id: "treatment", label: "Tratamentos", icon: "💊" },
    { id: "note", label: "Anotações", icon: "📝" },
    { id: "file", label: "Arquivos", icon: "📄" },
    { id: "provider", label: "Profissionais", icon: "👨‍⚕️" },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "pt-BR";

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsVoiceActive(false);
      };

      recognition.current.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.current.onend = () => {
        setIsVoiceActive(false);
      };
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("smart-search-recent");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  // Get suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setNlpAnalysis(null);
        return;
      }

      setIsSearching(true);
      const startTime = Date.now();

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            language: "pt",
            contentTypes: contentTypes || selectedFilters,
            limit: maxResults,
            includeAnalytics: showAnalytics,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setResults(data.data.results);
          setTotalResults(data.data.totalCount);
          setNlpAnalysis(data.data.nlpAnalysis);
          setSearchTime(Date.now() - startTime);

          // Save to recent searches
          saveRecentSearch(searchQuery);
        } else {
          console.error("Search error:", data.error);
          setResults([]);
          setNlpAnalysis(null);
        }
      } catch (error) {
        console.error("Search request error:", error);
        setResults([]);
        setNlpAnalysis(null);
      } finally {
        setIsSearching(false);
        setShowSuggestions(false);
      }
    },
    [contentTypes, selectedFilters, maxResults, showAnalytics],
  );

  // Get search suggestions
  const getSuggestions = useCallback(
    async (searchQuery: string) => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&lang=pt&limit=8`,
        );

        const data = await response.json();

        if (data.success) {
          const apiSuggestions: SearchSuggestion[] = data.data.suggestions.map((text: string) => ({
            text,
            type: "nlp" as const,
          }));

          // Combine with recent searches
          const recentSuggestions: SearchSuggestion[] = recentSearches
            .filter((recent) => recent.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 3)
            .map((text) => ({ text, type: "recent" as const }));

          setSuggestions([...recentSuggestions, ...apiSuggestions]);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error getting suggestions:", error);
      }
    },
    [recentSearches],
  );

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("smart-search-recent", JSON.stringify(updated));
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (queryToSearch.trim()) {
      performSearch(queryToSearch);
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (recognition.current && !isVoiceActive) {
      setIsVoiceActive(true);
      recognition.current.start();
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId],
    );
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="pl-10 pr-20 h-12 text-base"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {recognition.current && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                disabled={isVoiceActive}
                className={cn("h-8 w-8 p-0", isVoiceActive && "text-red-500 animate-pulse")}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              size="sm"
              className="h-8"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.type === "recent" ? (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="flex-1">{suggestion.text}</span>
                  {suggestion.count && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {availableContentTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedFilters.includes(type.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(type.id)}
              className="h-8"
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </Button>
          ))}
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFilters([])}
              className="h-8 text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      )}

      {/* NLP Analysis */}
      {nlpAnalysis && showAnalytics && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Análise Inteligente</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Intenção:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{nlpAnalysis.intent.primary}</Badge>
                  <span className="text-muted-foreground">
                    {Math.round(nlpAnalysis.intent.confidence * 100)}%
                  </span>
                </div>
              </div>
              {nlpAnalysis.entities.length > 0 && (
                <div>
                  <span className="font-medium">Entidades:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nlpAnalysis.entities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {entity.value} ({entity.type})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium">Confiança:</span>
                <div className="mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${nlpAnalysis.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {Math.round(nlpAnalysis.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(results.length > 0 || isSearching) && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {isSearching ? "Pesquisando..." : `${totalResults} resultados`}
              </CardTitle>
              {searchTime > 0 && (
                <span className="text-sm text-muted-foreground">{searchTime}ms</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Processando consulta...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {availableContentTypes.find((t) => t.id === result.contentType)
                              ?.label || result.contentType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Relevância: {Math.round(result.relevanceScore * 100)}%
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.highlightedText || result.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado para "{query}"</p>
                {nlpAnalysis?.suggestions && nlpAnalysis.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm mb-2">Tente pesquisar por:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {nlpAnalysis.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearch(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SmartSearch;
