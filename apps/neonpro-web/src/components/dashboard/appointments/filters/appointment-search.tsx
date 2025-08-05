// components/dashboard/appointments/filters/appointment-search.tsx
// Search component with debounce for appointments
// Story 1.1 Task 6 - Appointment Filtering and Search

"use client";

import type { useState, useEffect, useCallback } from "react";
import type { Input } from "@/components/ui/input";
import type { Search, X, Loader2 } from "lucide-react";
import type { Button } from "@/components/ui/button";

interface AppointmentSearchProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function AppointmentSearch({
  value,
  onSearch,
  placeholder = "Buscar agendamentos...",
  debounceMs = 500,
}: AppointmentSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
      setIsSearching(false);
    }, debounceMs),
    [onSearch, debounceMs],
  );

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);

    if (newValue.trim() !== value.trim()) {
      setIsSearching(true);
      debouncedSearch(newValue);
    }
  };

  // Clear search
  const handleClear = () => {
    setLocalValue("");
    onSearch("");
    setIsSearching(false);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      debouncedSearch(localValue);
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {localValue && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search suggestions could go here in future */}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
