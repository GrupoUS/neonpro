import * as React from "react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  count?: number;
}

export interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: string[];
  onFilterToggle?: (filterId: string) => void;
  onClearFilters?: () => void;
  loading?: boolean;
  debounceMs?: number;
  className?: string;
}

const SearchBox = React.forwardRef<HTMLDivElement, SearchBoxProps>(
  (
    {
      placeholder = "Buscar...",
      value = "",
      onValueChange,
      filters = [],
      activeFilters = [],
      onFilterToggle,
      onClearFilters,
      loading = false,
      debounceMs = 300,
      className,
      ...props
    },
    ref,
  ) => {
    const [searchValue, setSearchValue] = React.useState(value);
    const [showFilters, setShowFilters] = React.useState(false);
    const debounceRef = React.useRef<
      ReturnType<typeof setTimeout> | undefined
    >(undefined);

    React.useEffect(() => {
      setSearchValue(value);
    }, [value]);

    React.useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onValueChange?.(searchValue);
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [searchValue, debounceMs, onValueChange]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    };

    const handleClearSearch = () => {
      setSearchValue("");
      onValueChange?.("");
    };

    const handleFilterToggle = (filterId: string) => {
      onFilterToggle?.(filterId);
    };

    const hasActiveFilters = activeFilters && activeFilters.length > 0;
    const hasFilters = filters && filters.length > 0;

    return (
      <div {...props} className={cn("space-y-3", className)} ref={ref}>
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>

          <input
            className="block w-full rounded-md border border-input bg-background p-2 pr-8 pl-10 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            onChange={handleSearchChange}
            placeholder={placeholder}
            type="search"
            value={searchValue}
          />

          {searchValue && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          )}

          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>

        {/* Filter Toggle and Clear */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="outline"
            >
              Filtros
              {hasActiveFilters && (
                <Badge className="ml-2" variant="secondary">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button onClick={onClearFilters} size="sm" variant="ghost">
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Filter Options */}
        {hasFilters && showFilters && (
          <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3">
            {filters.map((filter) => {
              const isActive = activeFilters?.includes(filter.id);
              return (
                <Button
                  className={cn(
                    "justify-start",
                    isActive && "bg-primary text-primary-foreground",
                  )}
                  key={filter.id}
                  onClick={() => handleFilterToggle(filter.id)}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <Badge className="ml-2" variant="secondary">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filterId) => {
              const filter = filters.find((f) => f.id === filterId);
              if (!filter) {
                return;
              }

              return (
                <Badge
                  className="cursor-pointer"
                  key={filterId}
                  onClick={() => handleFilterToggle(filterId)}
                  variant="secondary"
                >
                  {filter.label}
                  <svg
                    className="ml-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

SearchBox.displayName = "SearchBox";

export { SearchBox };
