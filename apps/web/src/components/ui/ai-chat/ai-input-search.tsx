"use client";

import { useState, useEffect, useCallback } from 'react'; // React import not needed
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInputSearchProps } from './types';

/**
 * AI Input Search Component for NeonPro Aesthetic Clinic
 * Features debounced search with aesthetic clinic styling
 */
export default function AIInputSearch({
  onSearch,
  suggestions = [],
  placeholder = "Buscar tratamentos, procedimentos...",
  debounceMs = 300,
  className,
}: AIInputSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    onSearch?.(suggestion);
  }, [onSearch]);  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B4AC9C]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-[#D2D0C8] bg-white px-10 py-3",
            "text-[#112031] placeholder:text-[#B4AC9C]",
            "transition-all duration-200",
            "focus:border-[#294359] focus:outline-none focus:ring-2 focus:ring-[#294359]/20",
            "hover:border-[#AC9469]"
          )}
          aria-label="Buscar na clínica estética"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2",
              "text-[#B4AC9C] hover:text-[#112031]",
              "transition-colors duration-200"
            )}
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={cn(
          "absolute top-full z-50 mt-1 w-full",
          "rounded-lg border border-[#D2D0C8] bg-white shadow-lg",
          "max-h-48 overflow-y-auto"
        )}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full px-4 py-2 text-left text-[#112031]",
                "hover:bg-[#D2D0C8] focus:bg-[#D2D0C8]",
                "focus:outline-none",
                "first:rounded-t-lg last:rounded-b-lg"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}