'use client';

import type { EventSearchOptions } from '@/services/event.service';
import { debounce } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useCalendarContext } from '../calendar-context';

interface UseEventSearchOptions {
  debounceMs?: number;
  defaultLimit?: number;
}

/**
 * Hook for searching events with debouncing and pagination
 */
export function useEventSearch(options: UseEventSearchOptions = {}) {
  const { debounceMs = 300, defaultLimit = 10 } = options;
  const { searchEvents } = useCalendarContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchOptions, setSearchOptions] = useState<EventSearchOptions | null>(null);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (options: EventSearchOptions) => {
        try {
          setIsSearching(true);
          const result = await searchEvents(options);
          setSearchResults(result.events);
          setTotalCount(result.totalCount);
          setHasMore(result.hasMore);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
          setTotalCount(0);
          setHasMore(false);
        } finally {
          setIsSearching(false);
        }
      }, debounceMs),
    [searchEvents, debounceMs],
  );

  // Perform search
  const performSearch = useCallback(async (options: EventSearchOptions) => {
    setSearchOptions(options);
    setCurrentPage(0);
    await debouncedSearch(options);
  }, [debouncedSearch]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isSearching || !searchOptions) return;

    const newPage = currentPage + 1;
    const newOffset = newPage * defaultLimit;

    const moreOptions: EventSearchOptions = {
      ...searchOptions,
      offset: newOffset,
      limit: defaultLimit,
    };

    try {
      setIsSearching(true);
      const result = await searchEvents(moreOptions);
      setSearchResults(prev => [...prev, ...result.events]);
      setCurrentPage(newPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more results:', error);
    } finally {
      setIsSearching(false);
    }
  }, [hasMore, isSearching, searchOptions, currentPage, defaultLimit, searchEvents]);

  // Quick search with common search patterns
  const quickSearch = useCallback(
    async (
      query: string,
      searchIn?: ('title' | 'description' | 'notes' | 'patient' | 'professional')[],
    ) => {
      const searchOptions: EventSearchOptions = {
        query,
        searchIn,
        limit: defaultLimit,
        offset: 0,
      };
      await performSearch(searchOptions);
    },
    [performSearch, defaultLimit],
  );

  // Search by date range
  const searchByDateRange = useCallback(async (
    query: string,
    startDate: Date,
    endDate: Date,
    searchIn?: ('title' | 'description' | 'notes' | 'patient' | 'professional')[],
  ) => {
    const searchOptions: EventSearchOptions = {
      query,
      searchIn,
      dateRange: { start: startDate, end: endDate },
      limit: defaultLimit,
      offset: 0,
    };
    await performSearch(searchOptions);
  }, [performSearch, defaultLimit]);

  // Search with custom filters
  const searchWithFilters = useCallback(async (options: EventSearchOptions) => {
    await performSearch({
      ...options,
      limit: options.limit || defaultLimit,
      offset: options.offset || 0,
    });
  }, [performSearch, defaultLimit]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setTotalCount(0);
    setHasMore(false);
    setCurrentPage(0);
    setSearchOptions(null);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Search suggestions based on query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    // Simple suggestions based on common search patterns
    const query = searchQuery.toLowerCase();
    const suggestions: string[] = [];

    // Date-based suggestions
    if (query.includes('today') || query.includes('hoje')) {
      suggestions.push('Today\'s events', 'Events scheduled for today');
    }

    if (query.includes('tomorrow') || query.includes('amanhã')) {
      suggestions.push('Tomorrow\'s events', 'Events scheduled for tomorrow');
    }

    if (query.includes('week') || query.includes('semana')) {
      suggestions.push('This week\'s events', 'Events for the current week');
    }

    if (query.includes('month') || query.includes('mês')) {
      suggestions.push('This month\'s events', 'Events for the current month');
    }

    // Status-based suggestions
    if (query.includes('cancel') || query.includes('cancel')) {
      suggestions.push('Cancelled events', 'Events with cancelled status');
    }

    if (query.includes('complete') || query.includes('concl')) {
      suggestions.push('Completed events', 'Events with completed status');
    }

    if (query.includes('pending') || query.includes('pendente')) {
      suggestions.push('Pending events', 'Events with pending status');
    }

    // Priority-based suggestions
    if (query.includes('high') || query.includes('alta')) {
      suggestions.push('High priority events', 'Events with high priority');
    }

    if (query.includes('low') || query.includes('baixa')) {
      suggestions.push('Low priority events', 'Events with low priority');
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }, [searchQuery]);

  // Search statistics
  const searchStats = useMemo(() => ({
    totalResults: totalCount,
    displayedResults: searchResults.length,
    hasMoreResults: hasMore,
    currentPage,
    totalPages: Math.ceil(totalCount / defaultLimit),
    searchTime: isSearching ? 'Searching...' : 'Ready',
  }), [totalCount, searchResults.length, hasMore, currentPage, defaultLimit, isSearching]);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched: searchOptions !== null,

    // Search results info
    totalCount,
    hasMore,
    currentPage,
    searchStats,

    // Search actions
    performSearch,
    quickSearch,
    searchByDateRange,
    searchWithFilters,
    loadMore,
    clearSearch,

    // Search suggestions
    searchSuggestions,

    // Helpers
    isEmpty: searchResults.length === 0 && !isSearching,
    isLoading: isSearching,
  };
}

/**
 * Hook for advanced event search with multiple criteria
 */
export function useAdvancedEventSearch() {
  const { searchEvents } = useCalendarContext();

  const [advancedFilters, setAdvancedFilters] = useState({
    title: '',
    description: '',
    notes: '',
    patientId: '',
    professionalId: '',
    status: '',
    priority: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    color: '',
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  const performAdvancedSearch = useCallback(async () => {
    setIsSearching(true);

    try {
      // Build search query from advanced filters
      const searchTerms: string[] = [];
      if (advancedFilters.title) searchTerms.push(advancedFilters.title);
      if (advancedFilters.description) searchTerms.push(advancedFilters.description);
      if (advancedFilters.notes) searchTerms.push(advancedFilters.notes);

      const searchOptions: any = {
        query: searchTerms.join(' '),
        limit: 50,
      };

      // Add date range if provided
      if (advancedFilters.startDate && advancedFilters.endDate) {
        searchOptions.dateRange = {
          start: advancedFilters.startDate,
          end: advancedFilters.endDate,
        };
      }

      const result = await searchEvents(searchOptions);
      setSearchResults(result.events);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Advanced search failed:', error);
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  }, [advancedFilters, searchEvents]);

  const updateFilter = useCallback((key: keyof typeof advancedFilters, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setAdvancedFilters({
      title: '',
      description: '',
      notes: '',
      patientId: '',
      professionalId: '',
      status: '',
      priority: '',
      startDate: null,
      endDate: null,
      color: '',
    });
    setSearchResults([]);
    setTotalCount(0);
  }, []);

  return {
    // Filters
    filters: advancedFilters,
    updateFilter,
    resetFilters,

    // Results
    searchResults,
    totalCount,
    isSearching,

    // Actions
    performAdvancedSearch,

    // Helpers
    hasActiveFilters: Object.values(advancedFilters).some(value =>
      value !== null && value !== undefined && value !== ''
    ),
  };
}
