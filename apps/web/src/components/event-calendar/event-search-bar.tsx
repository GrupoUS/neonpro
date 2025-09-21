'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useEventSearch } from './hooks/use-event-search';

interface EventSearchBarProps {
  className?: string;
  placeholder?: string;
  onResultSelect?: (event: any) => void;
  showFilters?: boolean;
}

/**
 * Event Search Bar - Advanced search functionality for calendar events
 */
export function EventSearchBar({
  className,
  placeholder = 'Search events...',
  onResultSelect,
  showFilters = true,
}: EventSearchBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    performSearch,
    quickSearch,
    clearSearch,
    searchSuggestions,
    isEmpty,
  } = useEventSearch({ debounceMs: 300 });

  const [showResults, setShowResults] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleSearchChange = (_value: any) => {
    setSearchQuery(value);

    if (value.trim()) {
      performSearch({
        _query: value,
        limit: 8,
        offset: 0,
      });
    } else {
      clearSearch();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string, index: number) => {
    setSelectedSuggestion(index);
    handleSearchChange(suggestion);
  };

  // Handle result selection
  const handleResultSelect = (_event: any) => {
    onResultSelect?.(event);
    setShowResults(false);
    clearSearch();
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = searchSuggestions;
    const totalItems = suggestions.length + searchResults.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          if (selectedSuggestion < suggestions.length) {
            handleSuggestionSelect(suggestions[selectedSuggestion], selectedSuggestion);
          } else {
            const resultIndex = selectedSuggestion - suggestions.length;
            handleResultSelect(searchResults[resultIndex]);
          }
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  // Close results when clicking outside
  useEffect(_() => {
    const handleClickOutside = (_event: any) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node)
        && resultsRef.current && !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show results when searching
  useEffect(_() => {
    setShowResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // Reset selection when results change
  useEffect(_() => {
    setSelectedSuggestion(-1);
  }, [searchResults, searchSuggestions]);

  // Format date for display
  const formatDate = (_date: any) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Get event status color
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          ref={inputRef}
          type='text'
          placeholder={placeholder}
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className='pl-10 pr-10'
        />

        {/* Clear button */}
        {searchQuery && (_<Button
            variant='ghost'
            size='sm'
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
            onClick={() => {
              clearSearch();
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        )}

        {/* Filter button */}
        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-10 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
              >
                <Filter className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80' align='end'>
              <div className='p-4'>
                <h4 className='font-medium mb-3'>Search Filters</h4>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium'>Search in</label>
                    <div className='mt-1 space-y-2'>
                      {['title', 'description', 'notes', 'patient', 'professional'].map(field => (
                        <label key={field} className='flex items-center space-x-2'>
                          <input type='checkbox' className='rounded' defaultChecked />
                          <span className='text-sm capitalize'>{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchQuery.trim().length > 0) && (
        <div
          ref={resultsRef}
          className='absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden'
        >
          {/* Loading State */}
          {isSearching && (
            <div className='p-4 text-center'>
              <div className='flex items-center justify-center space-x-2 text-muted-foreground'>
                <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full' />
                <span className='text-sm'>Searching...</span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!isSearching && searchSuggestions.length > 0 && searchResults.length === 0 && (_<div className='p-2'>
              <p className='text-xs font-medium text-muted-foreground px-2 py-1'>Suggestions</p>
              {searchSuggestions.map((suggestion, _index) => (
                <button
                  key={index}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors',
                    selectedSuggestion === index && 'bg-accent',
                  )}
                  onClick={() => handleSuggestionSelect(suggestion, index)}
                >
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-3 w-3 text-muted-foreground' />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isSearching && searchResults.length > 0 && (_<div className='p-2'>
              <div className='flex items-center justify-between px-3 py-1'>
                <p className='text-xs font-medium text-muted-foreground'>
                  Search Results
                </p>
                <Badge variant='outline' className='text-xs'>
                  {searchResults.length} found
                </Badge>
              </div>

              <div className='max-h-64 overflow-y-auto'>
                {searchResults.map((event, _index) => {
                  const suggestionIndex = searchSuggestions.length + index;
                  return (
                    <button
                      key={event.id}
                      className={cn(
                        'w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors border-b last:border-b-0',
                        selectedSuggestion === suggestionIndex && 'bg-accent',
                      )}
                      onClick={() => handleResultSelect(event)}
                    >
                      <div className='space-y-1'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-sm truncate'>
                            {event.title}
                          </span>
                          {event.status && (
                            <Badge
                              variant='outline'
                              className={cn('text-xs', getStatusColor(event.status))}
                            >
                              {event.status}
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                          <div className='flex items-center space-x-1'>
                            <Calendar className='h-3 w-3' />
                            <span>{formatDate(event.start)}</span>
                          </div>

                          {event.priority && (
                            <Badge variant='outline' className='text-xs'>
                              Priority {event.priority}
                            </Badge>
                          )}

                          {event.color && (
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                `bg-${event.color}-500`,
                              )}
                            />
                          )}
                        </div>

                        {event.description && (
                          <p className='text-xs text-muted-foreground truncate'>
                            {event.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isSearching && isEmpty && hasSearched && (
            <div className='p-4 text-center'>
              <p className='text-sm text-muted-foreground'>
                No events found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
