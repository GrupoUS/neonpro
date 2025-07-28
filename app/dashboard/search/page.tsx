// app/dashboard/search/page.tsx
"use client";

import SearchResults from "@/components/search/search-results";
import { SmartSearchInterface } from "@/components/search/smart-search-interface";
import UnifiedSearch from "@/components/search/unified-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchClient } from "@/lib/search/search-client";
import {
  GlobalSearchStats,
  SearchResponse,
  SearchResult,
} from "@/lib/search/types";
import {
  Clock,
  Filter,
  MessageCircle,
  Search,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const [currentResults, setCurrentResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchStats, setSearchStats] = useState<GlobalSearchStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Carrega estatísticas na inicialização
  useEffect(() => {
    loadSearchStatistics();
  }, []);

  const loadSearchStatistics = async () => {
    try {
      const stats = await searchClient.getStatistics();
      setSearchStats(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleSearchResult = (response: SearchResponse) => {
    setCurrentResults(response.results);
    setCurrentQuery(response.query.term);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    }
  };

  const handleAdvancedSearch = async (criteria: any) => {
    setLoading(true);
    try {
      const response = await searchClient.advancedSearch(criteria);
      setCurrentResults(response.results);
      setCurrentQuery(JSON.stringify(criteria));
    } catch (error) {
      console.error("Erro na busca avançada:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Busca Inteligente
          </h1>
          <p className="text-gray-600">
            Sistema unificado com IA: busque usando linguagem natural ou filtros
            avançados
          </p>
        </div>

        {/* Search Interface Tabs */}
        <div className="mb-8">
          <Tabs defaultValue="smart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="smart"
                className="flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Busca Inteligente</span>
              </TabsTrigger>
              <TabsTrigger
                value="traditional"
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Busca Tradicional</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smart" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Busca com IA e Linguagem Natural</span>
                    <Badge variant="secondary" className="ml-2">
                      Novo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SmartSearchInterface
                    userId="current-user" // This should be passed from auth context
                    userRole="user"
                    maxResults={50}
                    enableFilters={true}
                    enableNLP={true}
                    onResultSelect={handleResultClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traditional" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Busca com Filtros Avançados</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UnifiedSearch
                    onResultSelect={handleResultClick}
                    showFilters={true}
                    showHistory={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Estatísticas rápidas */}
        {searchStats && !currentResults.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Buscas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchStats.totalSearches.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média de Resultados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchStats.averageResultsPerSearch.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchStats.averageExecutionTime.toFixed(0)}ms
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Termo Mais Buscado</p>
                  <p className="text-lg font-bold text-gray-900">
                    {searchStats.mostSearchedTerms[0]?.term || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Busca avançada */}
        {!currentResults.length && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Filter className="h-4 w-4" />
                Busca Avançada
              </button>
            </div>

            {showAdvanced && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Paciente
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Digite o nome do paciente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="date"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de Evento
                    </label>
                    <select
                      multiple
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="appointment">Consultas</option>
                      <option value="lab">Exames</option>
                      <option value="medication">Medicamentos</option>
                      <option value="procedure">Procedimentos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissionais
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Nome do profissional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palavras-chave
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Digite palavras-chave separadas por vírgula"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAdvanced(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAdvancedSearch({})}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Termos mais buscados */}
        {searchStats && !currentResults.length && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Termos Mais Buscados
              </h3>
              <div className="space-y-3">
                {searchStats.mostSearchedTerms
                  .slice(0, 5)
                  .map((term, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-900">{term.term}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (term.count /
                                  searchStats.mostSearchedTerms[0].count) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {term.count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscas por Tipo
              </h3>
              <div className="space-y-3">
                {Object.entries(searchStats.searchesByType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-900 capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (count /
                                  Math.max(
                                    ...Object.values(searchStats.searchesByType)
                                  )) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Resultados da busca */}
        {currentResults.length > 0 && (
          <SearchResults
            results={currentResults}
            totalCount={currentResults.length}
            query={currentQuery}
            onResultClick={handleResultClick}
          />
        )}
      </div>
    </div>
  );
}
