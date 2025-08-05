'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, Clock, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  gender: string;
  age: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastVisit: string;
  appointmentStatus: string;
  treatmentType: string;
  hasPhotos: boolean;
  consentStatus: boolean;
  tags: string[];
}

interface SearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  gender?: string;
  riskLevel?: string;
  treatmentType?: string;
  appointmentStatus?: string;
  hasPhotos?: boolean;
  consentStatus?: boolean;
  minAge?: number;
  maxAge?: number;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  tags?: string[];
}

interface SearchResults {
  patients: Patient[];
  suggestions: string[];
  totalCount: number;
  searchTime: number;
}

interface AdvancedSearchProps {
  onPatientSelect?: (patient: Patient) => void;
  onCreateSegment?: (patients: Patient[]) => void;
}

export function AdvancedSearch({ onPatientSelect, onCreateSegment }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('q', searchQuery);
        
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'ageRange' && typeof value === 'object') {
              params.append('minAge', value.min.toString());
              params.append('maxAge', value.max.toString());
            } else if (key === 'lastVisit' && typeof value === 'object') {
              params.append('lastVisitFrom', value.from.toISOString());
              params.append('lastVisitTo', value.to.toISOString());
            } else if (key === 'tags' && Array.isArray(value)) {
              params.append('tags', value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        const response = await fetch(`/api/patients/integration/search?${params}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
          setSuggestions(data.data.suggestions || []);
        } else {
          toast.error(data.error || 'Erro na busca');
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Erro ao realizar busca');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Effect to trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setResults(null);
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAllPatients = () => {
    if (!results) return;
    setSelectedPatients(results.patients.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPatients([]);
  };

  const handleCreateSegment = () => {
    if (!results || selectedPatients.length === 0) return;
    
    const selectedPatientData = results.patients.filter(p => 
      selectedPatients.includes(p.id)
    );
    
    onCreateSegment?.(selectedPatientData);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Busca Avançada de Pacientes</h2>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, email, telefone, CPF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Sugestões:</span>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setQuery(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div>
                <Label>Gênero</Label>
                <Select
                  value={filters.gender || ''}
                  onValueChange={(value) => handleFilterChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <Label>Nível de Risco</Label>
                <Select
                  value={filters.riskLevel || ''}
                  onValueChange={(value) => handleFilterChange('riskLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Treatment Type Filter */}
              <div>
                <Label>Tipo de Tratamento</Label>
                <Select
                  value={filters.treatmentType || ''}
                  onValueChange={(value) => handleFilterChange('treatmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tratamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consulta</SelectItem>
                    <SelectItem value="surgery">Cirurgia</SelectItem>
                    <SelectItem value="therapy">Terapia</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range */}
              <div>
                <Label>Idade Mínima</Label>
                <Input
                  type="number"
                  placeholder="Ex: 18"
                  value={filters.minAge || ''}
                  onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value) || undefined)}
                />
              </div>

              <div>
                <Label>Idade Máxima</Label>
                <Input
                  type="number"
                  placeholder="Ex: 65"
                  value={filters.maxAge || ''}
                  onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPhotos"
                  checked={filters.hasPhotos || false}
                  onCheckedChange={(checked) => handleFilterChange('hasPhotos', checked)}
                />
                <Label htmlFor="hasPhotos">Possui fotos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consentStatus"
                  checked={filters.consentStatus || false}
                  onCheckedChange={(checked) => handleFilterChange('consentStatus', checked)}
                />
                <Label htmlFor="consentStatus">Consentimento LGPD</Label>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Buscando pacientes...</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {results.totalCount} pacientes encontrados em {results.searchTime}ms
              </span>
              {selectedPatients.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedPatients.length} selecionados
                </span>
              )}
            </div>
            
            {results.patients.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllPatients}
                >
                  Selecionar Todos
                </Button>
                {selectedPatients.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Limpar Seleção
                    </Button>
                    {onCreateSegment && (
                      <Button
                        size="sm"
                        onClick={handleCreateSegment}
                      >
                        Criar Segmento ({selectedPatients.length})
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Patient Results */}
          <div className="space-y-2">
            {results.patients.map((patient) => (
              <Card
                key={patient.id}
                className={`cursor-pointer transition-colors ${
                  selectedPatients.includes(patient.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => togglePatientSelection(patient.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => togglePatientSelection(patient.id)}
                      />
                      <div>
                        <h3 className="font-medium">{patient.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{patient.email}</span>
                          <span>•</span>
                          <span>{patient.phone}</span>
                          <span>•</span>
                          <span>{patient.age} anos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getRiskLevelColor(patient.riskLevel)}>
                        {patient.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {patient.riskLevel === 'high' ? 'Alto Risco' : 
                         patient.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                      </Badge>
                      
                      {patient.hasPhotos && (
                        <Badge variant="outline">
                          📸 Fotos
                        </Badge>
                      )}
                      
                      {patient.consentStatus && (
                        <Badge variant="outline">
                          ✓ LGPD
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatientSelect?.(patient);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                  
                  {patient.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {patient.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {results.patients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum paciente encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
