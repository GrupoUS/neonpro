'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, Calendar, Clock, History, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  cn,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@/components/ui';

import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSearchPerformance } from '@/hooks/usePerformanceMonitor';

// Brazilian search result types
interface PatientSearchResult {
  id: string;
  fullName: string;
  cpf: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: {
    city: string;
    state: string;
  };
  status: 'active' | 'inactive' | 'pending';
  lastVisit?: string;
  totalAppointments: number;
  matchScore: number;
  matchReasons: string[];
  highlightedFields: {
    name?: string;
    cpf?: string;
    phone?: string;
    email?: string;
  };
}

// Search history type
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  results: number;
  timestamp_iso: string;
}

// Search analytics type
interface SearchAnalytics {
  totalSearches: number;
  averageResults: number;
  averageTime: number;
  topQueries: Array<{ query: string; count: number }>;
  conversionRate: number;
}

interface GlobalPatientSearchProps {
  clinicId: string;
  onPatientSelect?: (patient: PatientSearchResult) => void;
  placeholder?: string;
  className?: string;
  showAnalytics?: boolean;
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook for search history
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (_error) {
      console.warn(`Error reading localStorage key "${key}":`, _error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}

// Highlight matching text
function highlightMatch(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
  );
}

// Calculate search relevance score
function calculateRelevanceScore(patient: any, query: string): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase();

  // Name match (highest weight)
  if (patient.fullName?.toLowerCase().includes(normalizedQuery)) {
    score += 0.4;
  }

  // CPF match (high weight)
  if (patient.cpf?.includes(query)) {
    score += 0.3;
  }

  // Phone match (medium weight)
  if (patient.phone?.includes(query)) {
    score += 0.2;
  }

  // Email match (medium weight)
  if (patient.email?.toLowerCase().includes(normalizedQuery)) {
    score += 0.15;
  }

  // Address match (low weight)
  if (patient.address?.city?.toLowerCase().includes(normalizedQuery)) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

// Generate match reasons
function generateMatchReasons(patient: any, query: string): string[] {
  const reasons: string[] = [];
  const normalizedQuery = query.toLowerCase();

  if (patient.fullName?.toLowerCase().includes(normalizedQuery)) {
    reasons.push('Nome');
  }
  if (patient.cpf?.includes(query)) {
    reasons.push('CPF');
  }
  if (patient.phone?.includes(query)) {
    reasons.push('Telefone');
  }
  if (patient.email?.toLowerCase().includes(normalizedQuery)) {
    reasons.push('Email');
  }
  if (patient.address?.city?.toLowerCase().includes(normalizedQuery)) {
    reasons.push('Cidade');
  }

  return reasons;
}

export function GlobalPatientSearch({
  clinicId,
  onPatientSelect,
  placeholder = 'Buscar pacientes por nome, CPF, telefone ou email...',
  className,
  showAnalytics = false,
}: GlobalPatientSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [_isFocused, _setIsFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const { measureSearch: _measureSearch, searchResponseTime, searchStatus, isSearchHealthy } =
    useSearchPerformance();

  // Search history
  const [searchHistory, setSearchHistory] = useLocalStorage<
    SearchHistoryItem[]
  >('patient-search-history', []);

  // Analytics
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  // Search query
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patient-search', clinicId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const startTime = performance.now();

      try {
        // Mock API call - replace with actual search endpoint
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

        // Mock results - replace with actual API response
        const mockResults = [
          {
            id: '1',
            fullName: 'Maria Silva Santos',
            cpf: '123.456.789-00',
            phone: '(11) 99999-9999',
            email: 'maria.silva@email.com',
            birthDate: '1985-03-15',
            address: { city: 'São Paulo', state: 'SP' },
            status: 'active' as const,
            lastVisit: '2024-01-15',
            totalAppointments: 12,
          },
          {
            id: '2',
            fullName: 'João Carlos Oliveira',
            cpf: '987.654.321-00',
            phone: '(11) 88888-8888',
            email: 'joao.oliveira@email.com',
            birthDate: '1975-08-22',
            address: { city: 'São Paulo', state: 'SP' },
            status: 'active' as const,
            lastVisit: '2024-01-10',
            totalAppointments: 8,
          },
        ].filter(
          patient =>
            patient.fullName
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
            || patient.cpf.includes(debouncedQuery)
            || patient.phone?.includes(debouncedQuery)
            || patient.email?.toLowerCase().includes(debouncedQuery.toLowerCase()),
        );

        const endTime = performance.now();
        const searchTime = endTime - startTime;

        // Update search history
        const historyItem: SearchHistoryItem = {
          query: debouncedQuery,
          timestamp: Date.now(),
          results: mockResults.length,
          timestamp_iso: new Date().toISOString(),
        };

        setSearchHistory(prev => {
          const updated = [historyItem, ...prev].slice(0, 10); // Keep last 10 searches
          return updated;
        });

        // Update analytics
        setAnalytics(prev => ({
          totalSearches: (prev?.totalSearches || 0) + 1,
          averageResults: prev
            ? (prev.averageResults * prev.totalSearches + mockResults.length)
              / (prev.totalSearches + 1)
            : mockResults.length,
          averageTime: prev
            ? (prev.averageTime * prev.totalSearches + searchTime)
              / (prev.totalSearches + 1)
            : searchTime,
          topQueries: updateTopQueries(prev?.topQueries || [], debouncedQuery),
          conversionRate: prev ? prev.conversionRate : 0.15, // Mock conversion rate
        }));

        return mockResults.map(patient => ({
          ...patient,
          matchScore: calculateRelevanceScore(patient, debouncedQuery),
          matchReasons: generateMatchReasons(patient, debouncedQuery),
          highlightedFields: {
            name: highlightMatch(patient.fullName, debouncedQuery),
            cpf: highlightMatch(patient.cpf, debouncedQuery),
            phone: patient.phone
              ? highlightMatch(patient.phone, debouncedQuery)
              : undefined,
            email: patient.email
              ? highlightMatch(patient.email, debouncedQuery)
              : undefined,
          },
        }));
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!searchResults) return [];

    return searchResults
      .filter(result => result.matchScore > 0.1) // Minimum relevance threshold
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by relevance
  }, [searchResults]);

  // Handle patient selection
  const handlePatientSelect = useCallback(
    (patient: any) => {
      onPatientSelect?.(patient);

      // Navigate to patient details if no handler provided
      if (!onPatientSelect) {
        navigate({
          to: '/patients/$patientId',
          params: { patientId: patient.id },
        });
      }

      // Reset search state
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(-1);

      toast.success(`Paciente selecionado: ${patient.fullName}`);
    },
    [onPatientSelect, navigate],
  );

  // Handle search history item click
  const handleHistoryClick = useCallback((historyItem: any) => {
    setQuery(historyItem.query);
    inputRef.current?.focus();
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    toast.success('Histórico de busca limpo');
  }, [setSearchHistory]);

  // Update top queries for analytics
  function updateTopQueries(
    current: Array<{ query: string; count: number }>,
    newQuery: string,
  ) {
    const existing = current.find(item => item.query === newQuery);
    if (existing) {
      existing.count += 1;
    } else {
      current.push({ query: newQuery, count: 1 });
    }
    return current.sort((a, b) => b.count - a.count).slice(0, 5);
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className='space-y-2 p-4'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='flex items-center space-x-3'>
          <div className='h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'></div>
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4'></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Search result item
  const SearchResultItem = ({
    patient,
    index,
  }: {
    patient: PatientSearchResult;
    index: number;
  }) => (
    <div
      className={cn(
        'flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        selectedIndex === index
          && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
      )}
      onClick={() => handlePatientSelect(patient)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      <div className='flex-shrink-0'>
        <div className='h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
          <span className='text-sm font-medium text-blue-600 dark:text-blue-300'>
            {patient.fullName.charAt(0)}
          </span>
        </div>
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <p
            className='text-sm font-medium text-gray-900 dark:text-white truncate'
            dangerouslySetInnerHTML={{
              __html: patient.highlightedFields.name || patient.fullName,
            }}
          />
          <Badge
            variant={patient.status === 'active' ? 'default' : 'secondary'}
            className='text-xs'
          >
            {patient.status === 'active'
              ? 'Ativo'
              : patient.status === 'inactive'
              ? 'Inativo'
              : 'Pendente'}
          </Badge>
        </div>

        <div className='flex items-center space-x-4 mt-1'>
          <p className='text-xs text-gray-500 dark:text-gray-400 font-mono'>
            {patient.highlightedFields.cpf || patient.cpf}
          </p>
          {patient.phone && (
            <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center'>
              <Search className='h-3 w-3 mr-1' />
              {patient.highlightedFields.phone || patient.phone}
            </p>
          )}
        </div>

        {patient.matchReasons.length > 0 && (
          <div className='flex items-center space-x-1 mt-2'>
            {patient.matchReasons.slice(0, 3).map((reason, i) => (
              <Badge key={i} variant='outline' className='text-xs'>
                {reason}
              </Badge>
            ))}
            {patient.matchReasons.length > 3 && (
              <span className='text-xs text-gray-500'>
                +{patient.matchReasons.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className='flex-shrink-0 text-right'>
        <div className='flex items-center space-x-1'>
          <Star className='h-3 w-3 text-yellow-500' />
          <span className='text-xs text-gray-500'>
            {Math.round(patient.matchScore * 100)}%
          </span>
        </div>
        {patient.totalAppointments > 0 && (
          <p className='text-xs text-gray-500 mt-1'>
            {patient.totalAppointments} consultas
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              ref={inputRef}
              type='text'
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className='pl-10 pr-10'
              aria-label='Busca global de pacientes'
            />
            {query && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
                onClick={() => setQuery('')}
              >
                <X className='h-3 w-3' />
              </Button>
            )}

            {/* Search performance indicator */}
            {searchResponseTime > 0 && (
              <div className='absolute -bottom-6 right-0'>
                <span
                  className={cn(
                    'text-xs',
                    searchStatus === 'excellent' && 'text-green-600',
                    searchStatus === 'good' && 'text-green-500',
                    searchStatus === 'fair' && 'text-yellow-600',
                    searchStatus === 'poor' && 'text-red-600',
                  )}
                >
                  {searchResponseTime.toFixed(0)}ms
                </span>
              </div>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className='w-[600px] p-0' align='start' sideOffset={4}>
          <div className='border-b'>
            <div className='flex items-center justify-between p-3'>
              <h3 className='text-sm font-medium'>
                {query ? 'Resultados da busca' : 'Busca rápida'}
              </h3>

              {/* Analytics toggle */}
              {showAnalytics && analytics && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toast.info('Analytics em desenvolvimento')}
                >
                  <Calendar className='h-4 w-4 mr-1' />
                  Analytics
                </Button>
              )}
            </div>

            {/* Performance metrics */}
            {searchResponseTime > 0 && (
              <div className='px-3 pb-2'>
                <div className='flex items-center space-x-4 text-xs text-gray-500'>
                  <span className='flex items-center'>
                    <Clock className='h-3 w-3 mr-1' />
                    {searchResponseTime.toFixed(0)}ms
                    {!isSearchHealthy && <AlertCircle className='h-3 w-3 ml-1 text-yellow-500' />}
                  </span>
                  {filteredResults.length > 0 && <span>{filteredResults.length} resultados</span>}
                </div>
              </div>
            )}
          </div>

          <ScrollArea className='max-h-[400px]'>
            {isLoading && debouncedQuery.length >= 2
              ? <LoadingSkeleton />
              : error
              ? (
                <div className='p-4 text-center'>
                  <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
                  <p className='text-sm text-gray-500'>
                    Erro na busca. Tente novamente.
                  </p>
                </div>
              )
              : query && query.length >= 2
              ? (filteredResults.length > 0
                ? (
                  <div className='divide-y'>
                    {filteredResults.map((patient, index) => (
                      <SearchResultItem
                        key={patient.id}
                        patient={patient}
                        index={index}
                      />
                    ))}
                  </div>
                )
                : (
                  <div className='p-8 text-center'>
                    <Search className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                    <h3 className='text-sm font-medium mb-2'>
                      Nenhum paciente encontrado
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Tente buscar por nome, CPF, telefone ou email
                    </p>
                  </div>
                ))
              : searchHistory.length > 0
              ? (
                <div className='divide-y'>
                  <div className='p-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-xs font-medium text-gray-500'>
                        Buscas recentes
                      </h4>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs h-6 px-2'
                        onClick={clearSearchHistory}
                      >
                        Limpar
                      </Button>
                    </div>
                    <div className='space-y-1'>
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer'
                          onClick={() => handleHistoryClick(item)}
                        >
                          <div className='flex items-center space-x-2'>
                            <History className='h-3 w-3 text-gray-400' />
                            <span className='text-sm'>{item.query}</span>
                          </div>
                          <div className='flex items-center space-x-2 text-xs text-gray-500'>
                            <span>{item.results} resultados</span>
                            <span>•</span>
                            <span>
                              {new Date(item.timestamp).toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
              : (
                <div className='p-8 text-center'>
                  <Search className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                  <h3 className='text-sm font-medium mb-2'>
                    Busca inteligente de pacientes
                  </h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Digite pelo menos 2 caracteres para buscar pacientes
                  </p>
                  <div className='space-y-2 text-left max-w-xs mx-auto'>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                      <span>Busque por nome, CPF, telefone ou email</span>
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                      <span>Resultados em menos de 300ms</span>
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <span className='w-2 h-2 bg-yellow-500 rounded-full'></span>
                      <span>Histórico de buscas recentes</span>
                    </div>
                  </div>
                </div>
              )}
          </ScrollArea>

          {/* Keyboard shortcuts help */}
          <div className='border-t p-2 bg-gray-50 dark:bg-gray-800'>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>
                Pressione{' '}
                <kbd className='px-1 py-0.5 bg-white dark:bg-gray-700 rounded'>
                  /
                </kbd>{' '}
                para focar
              </span>
              <span>
                <kbd className='px-1 py-0.5 bg-white dark:bg-gray-700 rounded'>
                  ↑↓
                </kbd>{' '}
                navegar
              </span>
              <span>
                <kbd className='px-1 py-0.5 bg-white dark:bg-gray-700 rounded'>
                  Enter
                </kbd>{' '}
                selecionar
              </span>
              <span>
                <kbd className='px-1 py-0.5 bg-white dark:bg-gray-700 rounded'>
                  Esc
                </kbd>{' '}
                fechar
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default GlobalPatientSearch;
