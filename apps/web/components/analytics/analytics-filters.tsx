/**
 * Analytics Filters Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Provides comprehensive filtering capabilities for analytics data including:
 * - Time range selection (preset and custom ranges)
 * - Patient demographic filters
 * - Procedure type and category filters
 * - Outcome severity and status filters
 * - Provider and location filters
 * - Data source and model version filters
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

'use client';

import {
  Activity,
  Brain,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Analytics Engine
import { type AnalyticsFilter, AnalyticsUtils } from '@/lib/analytics';

// Types
interface AnalyticsFiltersProps {
  filters: AnalyticsFilter[];
  onFiltersChange: (filters: AnalyticsFilter[]) => void;
  clinicId: string;
}

interface FilterCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
}

interface ActiveFilter {
  category: string;
  values: string[];
  label: string;
}

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  clinicId,
}: AnalyticsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterCategory[]>([]);
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  /**
   * Load filter options from analytics engine
   */
  const loadFilterOptions = useCallback(async () => {
    if (!clinicId) return;

    try {
      const options = await AnalyticsUtils.getFilterOptions(clinicId);

      const categories: FilterCategory[] = [
        {
          id: 'timeframe',
          label: 'Time Range',
          icon: <Clock className="h-4 w-4" />,
          options: [
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'last_7_days', label: 'Last 7 days' },
            { value: 'last_30_days', label: 'Last 30 days' },
            { value: 'this_month', label: 'This month' },
            { value: 'last_month', label: 'Last month' },
            { value: 'this_quarter', label: 'This quarter' },
            { value: 'last_quarter', label: 'Last quarter' },
            { value: 'this_year', label: 'This year' },
            { value: 'custom', label: 'Custom range' },
          ],
        },
        {
          id: 'demographics',
          label: 'Demographics',
          icon: <User className="h-4 w-4" />,
          options: [
            {
              value: 'age_18_25',
              label: '18-25 years',
              count: options.demographics?.age_ranges?.['18-25'],
            },
            {
              value: 'age_26_35',
              label: '26-35 years',
              count: options.demographics?.age_ranges?.['26-35'],
            },
            {
              value: 'age_36_45',
              label: '36-45 years',
              count: options.demographics?.age_ranges?.['36-45'],
            },
            {
              value: 'age_46_55',
              label: '46-55 years',
              count: options.demographics?.age_ranges?.['46-55'],
            },
            {
              value: 'age_56_plus',
              label: '56+ years',
              count: options.demographics?.age_ranges?.['56+'],
            },
            {
              value: 'gender_female',
              label: 'Female',
              count: options.demographics?.gender?.female,
            },
            {
              value: 'gender_male',
              label: 'Male',
              count: options.demographics?.gender?.male,
            },
            {
              value: 'gender_other',
              label: 'Other',
              count: options.demographics?.gender?.other,
            },
          ],
        },
        {
          id: 'procedures',
          label: 'Procedures',
          icon: <Stethoscope className="h-4 w-4" />,
          options: [
            {
              value: 'facial_aesthetics',
              label: 'Facial Aesthetics',
              count: options.procedures?.facial,
            },
            {
              value: 'body_contouring',
              label: 'Body Contouring',
              count: options.procedures?.body,
            },
            {
              value: 'skin_treatments',
              label: 'Skin Treatments',
              count: options.procedures?.skin,
            },
            {
              value: 'injectables',
              label: 'Injectables',
              count: options.procedures?.injectables,
            },
            {
              value: 'laser_treatments',
              label: 'Laser Treatments',
              count: options.procedures?.laser,
            },
            {
              value: 'surgical',
              label: 'Surgical',
              count: options.procedures?.surgical,
            },
            {
              value: 'non_surgical',
              label: 'Non-Surgical',
              count: options.procedures?.non_surgical,
            },
          ],
        },
        {
          id: 'outcomes',
          label: 'Outcomes',
          icon: <Activity className="h-4 w-4" />,
          options: [
            {
              value: 'excellent',
              label: 'Excellent',
              count: options.outcomes?.excellent,
            },
            {
              value: 'very_good',
              label: 'Very Good',
              count: options.outcomes?.very_good,
            },
            { value: 'good', label: 'Good', count: options.outcomes?.good },
            { value: 'fair', label: 'Fair', count: options.outcomes?.fair },
            { value: 'poor', label: 'Poor', count: options.outcomes?.poor },
            {
              value: 'complications',
              label: 'With Complications',
              count: options.outcomes?.complications,
            },
            {
              value: 'no_complications',
              label: 'No Complications',
              count: options.outcomes?.no_complications,
            },
          ],
        },
        {
          id: 'providers',
          label: 'Providers',
          icon: <User className="h-4 w-4" />,
          options:
            options.providers?.map((provider) => ({
              value: provider.id,
              label: provider.name,
              count: provider.procedure_count,
              description: provider.specialization,
            })) || [],
        },
        {
          id: 'locations',
          label: 'Locations',
          icon: <MapPin className="h-4 w-4" />,
          options:
            options.locations?.map((location) => ({
              value: location.id,
              label: location.name,
              count: location.procedure_count,
            })) || [],
        },
        {
          id: 'ai_models',
          label: 'AI Models',
          icon: <Brain className="h-4 w-4" />,
          options: [
            { value: 'face_detection_v2', label: 'Face Detection v2.0' },
            {
              value: 'aesthetic_analysis_v1',
              label: 'Aesthetic Analysis v1.5',
            },
            {
              value: 'complication_detector_v1',
              label: 'Complication Detection v1.0',
            },
            { value: 'outcome_predictor_v1', label: 'Outcome Predictor v1.2' },
            { value: 'risk_assessment_v1', label: 'Risk Assessment v1.0' },
          ],
        },
      ];

      setFilterOptions(categories);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  }, [clinicId]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  /**
   * Get active filters grouped by category
   */
  const activeFilters = React.useMemo(() => {
    const grouped: ActiveFilter[] = [];

    filters.forEach((filter) => {
      const category = filterOptions.find((cat) => cat.id === filter.category);
      if (category) {
        const labels = filter.values.map((value) => {
          const option = category.options.find((opt) => opt.value === value);
          return option?.label || value;
        });

        grouped.push({
          category: filter.category,
          values: filter.values,
          label: `${category.label}: ${labels.join(', ')}`,
        });
      }
    });

    return grouped;
  }, [filters, filterOptions]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback(
    (category: string, values: string[]) => {
      const updatedFilters = filters.filter((f) => f.category !== category);

      if (values.length > 0) {
        updatedFilters.push({
          category,
          values,
          operator: 'in',
        });
      }

      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange]
  );

  /**
   * Handle custom date range
   */
  const handleCustomDateRange = useCallback(() => {
    if (customDateRange.start && customDateRange.end) {
      const updatedFilters = filters.filter(
        (f) => f.category !== 'custom_date_range'
      );
      updatedFilters.push({
        category: 'custom_date_range',
        values: [
          customDateRange.start.toISOString(),
          customDateRange.end.toISOString(),
        ],
        operator: 'between',
      });
      onFiltersChange(updatedFilters);
    }
  }, [customDateRange, filters, onFiltersChange]);

  /**
   * Remove specific filter
   */
  const removeFilter = useCallback(
    (category: string) => {
      const updatedFilters = filters.filter((f) => f.category !== category);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange]
  );

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    onFiltersChange([]);
    setCustomDateRange({ start: null, end: null });
  }, [onFiltersChange]);

  /**
   * Filter category component
   */
  const FilterCategory: React.FC<{ category: FilterCategory }> = ({
    category,
  }) => {
    const currentFilter = filters.find((f) => f.category === category.id);
    const selectedValues = currentFilter?.values || [];

    const filteredOptions = category.options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {category.icon}
          <Label className="font-medium text-sm">{category.label}</Label>
        </div>

        {category.id === 'timeframe' && (
          <div className="space-y-2">
            <Select
              onValueChange={(value) =>
                handleFilterChange(category.id, value ? [value] : [])
              }
              value={selectedValues[0] || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {category.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedValues.includes('custom') && (
              <div className="space-y-2 rounded border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <DatePicker
                      date={customDateRange.start}
                      onDateChange={(date) =>
                        setCustomDateRange((prev) => ({ ...prev, start: date }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <DatePicker
                      date={customDateRange.end}
                      onDateChange={(date) =>
                        setCustomDateRange((prev) => ({ ...prev, end: date }))
                      }
                    />
                  </div>
                </div>
                <Button
                  disabled={!(customDateRange.start && customDateRange.end)}
                  onClick={handleCustomDateRange}
                  size="sm"
                >
                  Apply Date Range
                </Button>
              </div>
            )}
          </div>
        )}

        {category.id !== 'timeframe' && (
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div className="flex items-center space-x-2" key={option.value}>
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  id={`${category.id}-${option.value}`}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilterChange(category.id, [
                        ...selectedValues,
                        option.value,
                      ]);
                    } else {
                      handleFilterChange(
                        category.id,
                        selectedValues.filter((v) => v !== option.value)
                      );
                    }
                  }}
                />
                <label
                  className="flex-1 cursor-pointer text-sm"
                  htmlFor={`${category.id}-${option.value}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-gray-500 text-xs">
                        ({option.count})
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <div className="text-gray-400 text-xs">
                      {option.description}
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover onOpenChange={setIsOpen} open={isOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {activeFilters.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-96 p-0">
              <div className="border-b p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Analytics Filters</h4>
                  {activeFilters.length > 0 && (
                    <Button onClick={clearAllFilters} size="sm" variant="ghost">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search filters..."
                    value={searchTerm}
                  />
                </div>
              </div>

              <div className="max-h-96 space-y-6 overflow-y-auto p-4">
                {filterOptions.map((category) => (
                  <FilterCategory category={category} key={category.id} />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filter count */}
        {activeFilters.length > 0 && (
          <div className="text-gray-600 text-sm">
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}{' '}
            applied
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge className="pr-1 pl-2" key={index} variant="secondary">
              {filter.label}
              <Button
                className="ml-1 h-auto p-0 text-gray-500 hover:text-gray-700"
                onClick={() => removeFilter(filter.category)}
                size="sm"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
