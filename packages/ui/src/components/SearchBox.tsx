import { Filter, Search, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';

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
      placeholder = 'Buscar...',
      value = '',
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
    ref
  ) => {
    const [searchValue, setSearchValue] = React.useState(value);
    const [showFilters, setShowFilters] = React.useState(false);
    const debounceRef = React.useRef<NodeJS.Timeout>();

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
      setSearchValue('');
      onValueChange?.('');
    };

    const activeFilterCount = activeFilters.length;
    const hasActiveFilters = activeFilterCount > 0;

    return (
      <div className={cn('space-y-3', className)} ref={ref} {...props}>
        {/* Search Input */}
        <div className="relative">
          <div className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>

          <input
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background py-2 pr-20 pl-10 text-sm ring-offset-background',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            disabled={loading}
            onChange={handleSearchChange}
            placeholder={placeholder}
            type="text"
            value={searchValue}
          />

          <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-1">
            {searchValue && (
              <Button
                className="h-6 w-6 p-0"
                onClick={handleClearSearch}
                size="sm"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {filters.length > 0 && (
              <Button
                className={cn(
                  'relative h-6 w-6 p-0',
                  hasActiveFilters && 'text-primary',
                  showFilters && 'bg-accent'
                )}
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
                variant="ghost"
              >
                <Filter className="h-3 w-3" />
                {hasActiveFilters && (
                  <span className="-top-1 -right-1 absolute flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}

            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </div>
        </div>{' '}
        {/* Filters Panel */}
        {filters.length > 0 && showFilters && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros</h4>
              {hasActiveFilters && (
                <Button
                  className="h-6 text-xs"
                  onClick={onClearFilters}
                  size="sm"
                  variant="ghost"
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const isActive = activeFilters.includes(filter.id);

                return (
                  <Button
                    className="h-8 text-xs"
                    key={filter.id}
                    onClick={() => onFilterToggle?.(filter.id)}
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                  >
                    {filter.label}
                    {filter.count !== undefined && (
                      <span
                        className={cn(
                          'ml-1 rounded-full px-1.5 py-0.5 text-[10px]',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {filter.count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Filtros ativos:
            </span>
            {activeFilters.map((filterId) => {
              const filter = filters.find((f) => f.id === filterId);
              if (!filter) {
                return null;
              }

              return (
                <Badge
                  className="cursor-pointer text-xs hover:bg-secondary/80"
                  key={filterId}
                  onClick={() => onFilterToggle?.(filterId)}
                  variant="secondary"
                >
                  {filter.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

SearchBox.displayName = 'SearchBox';

export { SearchBox };
