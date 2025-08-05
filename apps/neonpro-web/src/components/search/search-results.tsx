// components/search/search-results.tsx
"use client";

import type { SearchResult, SearchType } from "@/lib/search/unified-search";
import type {
  Activity,
  Brain,
  Calendar,
  Camera,
  Download,
  FileText,
  Grid,
  List,
  Share2,
  User,
  Users,
} from "lucide-react";
import type { useState } from "react";

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  query: string;
  onResultClick: (result: SearchResult) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export default function SearchResults({
  results,
  totalCount,
  query,
  onResultClick,
  onLoadMore,
  hasMore = false,
  loading = false,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "type">("relevance");
  const [filterByType, setFilterByType] = useState<SearchType | "all">("all");

  const getTypeIcon = (type: SearchType) => {
    const iconMap = {
      patients: User,
      appointments: Calendar,
      medical_records: FileText,
      lab_results: Activity,
      medications: FileText,
      documents: FileText,
      insights: Brain,
      timeline_events: Activity,
      duplicates: Users,
      photos: Camera,
    };

    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeColor = (type: SearchType) => {
    const colorMap = {
      patients: "bg-blue-100 text-blue-800",
      appointments: "bg-green-100 text-green-800",
      medical_records: "bg-purple-100 text-purple-800",
      lab_results: "bg-orange-100 text-orange-800",
      medications: "bg-pink-100 text-pink-800",
      documents: "bg-gray-100 text-gray-800",
      insights: "bg-indigo-100 text-indigo-800",
      timeline_events: "bg-teal-100 text-teal-800",
      duplicates: "bg-red-100 text-red-800",
      photos: "bg-yellow-100 text-yellow-800",
    };

    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  const filteredResults = results.filter(
    (result) => filterByType === "all" || result.type === filterByType,
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return b.relevanceScore - a.relevanceScore;
      case "date":
        // Assumindo que temos data no metadata
        return (
          new Date(b.metadata?.date || 0).getTime() - new Date(a.metadata?.date || 0).getTime()
        );
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const typeGroups = results.reduce(
    (groups, result) => {
      groups[result.type] = (groups[result.type] || 0) + 1;
      return groups;
    },
    {} as Record<SearchType, number>,
  );

  const exportResults = () => {
    const csvContent = [
      ["Tipo", "Título", "Descrição", "Relevância"],
      ...sortedResults.map((result) => [
        result.type,
        result.title,
        result.description,
        (result.relevanceScore * 100).toFixed(1) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-results-${query}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resultados da busca: ${query}`,
          text: `${totalCount} resultados encontrados`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados para "{query}"</h1>
            <p className="text-gray-600">{totalCount} resultados encontrados</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={shareResults}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Distribuição por tipo */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeGroups).map(([type, count]) => (
            <span
              key={type}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                type as SearchType,
              )}`}
            >
              {type}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Controles de visualização */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {/* Filtro por tipo */}
            <select
              value={filterByType}
              onChange={(e) => setFilterByType(e.target.value as SearchType | "all")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="patients">Pacientes</option>
              <option value="appointments">Consultas</option>
              <option value="medical_records">Registros</option>
              <option value="insights">Insights</option>
              <option value="timeline_events">Timeline</option>
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "relevance" | "date" | "type")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="relevance">Relevância</option>
              <option value="date">Data</option>
              <option value="type">Tipo</option>
            </select>
          </div>

          {/* Modo de visualização */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-600"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-600"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-sm border">
        {sortedResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum resultado encontrado com os filtros aplicados
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="divide-y divide-gray-100">
                {sortedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onResultClick(result)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              result.type,
                            )}`}
                          >
                            {result.type}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{result.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${result.relevanceScore * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {(result.relevanceScore * 100).toFixed(0)}% relevante
                            </span>
                          </div>

                          {result.actions && (
                            <div className="flex gap-2">
                              {result.actions.slice(0, 2).map((action) => (
                                <button
                                  key={action.id}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (action.url) {
                                      window.open(action.url, "_blank");
                                    }
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onResultClick(result)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          result.type,
                        )}`}
                      >
                        {result.type}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {result.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{result.description}</p>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${result.relevanceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {(result.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão carregar mais */}
            {hasMore && (
              <div className="p-6 border-t border-gray-100 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Carregando..." : "Carregar mais resultados"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
