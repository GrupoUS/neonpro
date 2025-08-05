// components/search/unified-search.tsx
"use client";

import type { searchClient } from "@/lib/search/search-client";
import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchType,
} from "@/lib/search/unified-search";
import type { Bookmark, Clock, Search, X } from "lucide-react";
import type { useCallback, useEffect, useState } from "react";

interface UnifiedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  initialQuery?: string;
  types?: SearchType[];
}

export default function UnifiedSearch({
  onResultSelect,
  placeholder = "Buscar pacientes, consultas, registros...",
  showFilters = true,
  showHistory = true,
  initialQuery = "",
  types,
}: UnifiedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchStats, setSearchStats] = useState<SearchResponse | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<SearchType[]>(
    types || ["patients", "appointments", "medical_records"],
  );
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; query: string }>>([]);

  // Carrega histórico de busca do localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    const saved = localStorage.getItem("savedSearches");
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Função de busca debounced
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      try {
        const searchQuery: SearchQuery = {
          term: searchTerm,
          filters: {
            types: selectedTypes,
          },
          options: {
            limit: 20,
            fuzzy: true,
            highlight: true,
          },
        };

        const response = await searchClient.search(searchQuery);
        setResults(response.results);
        setSearchStats(response);

        // Adiciona ao histórico
        const newHistory = [searchTerm, ...searchHistory.filter((h) => h !== searchTerm)].slice(
          0,
          10,
        );
        setSearchHistory(newHistory);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      } catch (error) {
        console.error("Erro na busca:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedTypes, searchHistory],
  );

  // Debounce para busca automática
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
    setShowResults(false);
  };

  const handleTypeToggle = (type: SearchType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const saveCurrentSearch = () => {
    if (!query.trim()) return;

    const name = prompt("Nome para esta busca:");
    if (name) {
      const newSaved = [...savedSearches, { name, query }];
      setSavedSearches(newSaved);
      localStorage.setItem("savedSearches", JSON.stringify(newSaved));
    }
  };

  const loadSavedSearch = (savedQuery: string) => {
    setQuery(savedQuery);
    setShowResults(false);
  };

  const getTypeIcon = (type: SearchType) => {
    const icons = {
      patients: "👤",
      appointments: "📅",
      medical_records: "📋",
      lab_results: "🧪",
      medications: "💊",
      documents: "📄",
      insights: "🧠",
      timeline_events: "📈",
      duplicates: "👥",
      photos: "📸",
    };
    return icons[type] || "📄";
  };

  const getTypeLabel = (type: SearchType) => {
    const labels = {
      patients: "Pacientes",
      appointments: "Consultas",
      medical_records: "Registros",
      lab_results: "Exames",
      medications: "Medicamentos",
      documents: "Documentos",
      insights: "Insights",
      timeline_events: "Timeline",
      duplicates: "Duplicatas",
      photos: "Fotos",
    };
    return labels[type] || type;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-12 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={saveCurrentSearch}
            disabled={!query.trim()}
            className="absolute right-3 p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
            title="Salvar busca"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Filtros de tipo */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              "patients",
              "appointments",
              "medical_records",
              "insights",
              "timeline_events",
            ] as SearchType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTypes.includes(type)
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <span>{getTypeIcon(type)}</span>
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      )}

      {/* Histórico e buscas salvas */}
      {showHistory && !query && !showResults && (
        <div className="mt-4 space-y-3">
          {searchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Buscas recentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                Buscas salvas
              </h3>
              <div className="space-y-1">
                {savedSearches.slice(0, 3).map((saved, index) => (
                  <button
                    key={index}
                    onClick={() => loadSavedSearch(saved.query)}
                    className="flex justify-between items-center w-full p-2 text-left rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium">{saved.name}</span>
                    <span className="text-xs text-gray-500">{saved.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          {searchStats && (
            <div className="p-3 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>
                {searchStats.totalCount} resultados em {searchStats.executionTime.toFixed(0)}ms
              </span>
              {searchStats.suggestions && searchStats.suggestions.length > 0 && (
                <span className="text-blue-600">
                  Você quis dizer: {searchStats.suggestions[0]}?
                </span>
              )}
            </div>
          )}

          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {loading ? "Buscando..." : "Nenhum resultado encontrado"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{result.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${result.relevanceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {(result.relevanceScore * 100).toFixed(0)}% relevante
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar resultados */}
      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
    </div>
  );
}
