'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useEventFilters } from './hooks/use-event-filters';

interface EventFilterPanelProps {
  className?: string;
}

/**
 * Event Filter Panel - Comprehensive filtering UI for calendar events
 */
export function EventFilterPanel({ className }: EventFilterPanelProps) {
  const {
    filters,
    filterOptions,
    hasActiveFilters,
    filteredEvents,
    applyFilters,
    clearFilters,
    applyQuickFilter,
  } = useEventFilters();

  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters?.dateRange?.start,
    to: filters?.dateRange?.end,
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filters?.status || []);
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>(filters?.priority || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(filters?.color || []);

  // Apply all filters
  const applyAllFilters = () => {
    const newFilters: any = {
      searchTerm: searchTerm.trim() || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      color: selectedColors.length > 0 ? selectedColors : undefined,
    };

    if (dateRange.from && dateRange.to) {
      newFilters.dateRange = {
        start: dateRange.from,
        end: dateRange.to,
      };
    }

    applyFilters(newFilters);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedColors([]);
    clearFilters();
  };

  // Quick filter buttons
  const quickFilters = [
    { key: 'today', label: 'Today', icon: Calendar },
    { key: 'week', label: 'This Week', icon: Calendar },
    { key: 'month', label: 'This Month', icon: Calendar },
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
  ] as const;

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'confirmed', label: 'Confirmed', color: 'emerald' },
    { value: 'completed', label: 'Completed', color: 'blue' },
    { value: 'cancelled', label: 'Cancelled', color: 'rose' },
    { value: 'no_show', label: 'No Show', color: 'violet' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 1, label: 'Low', color: 'gray' },
    { value: 2, label: 'Medium', color: 'blue' },
    { value: 3, label: 'High', color: 'orange' },
    { value: 4, label: 'Urgent', color: 'red' },
  ];

  // Color options
  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
    { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { value: 'sky', label: 'Sky', class: 'bg-sky-500' },
  ];

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedStatuses.length > 0) count++;
    if (selectedPriorities.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (dateRange.from && dateRange.to) count++;
    return count;
  }, [searchTerm, selectedStatuses, selectedPriorities, selectedColors, dateRange]);

  return (
    <div className={cn('space-y-4 p-4 bg-card border rounded-lg', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          <h3 className='font-semibold'>Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant='secondary' className='text-xs'>
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={resetAllFilters}
            className='h-8 px-2 text-xs'
          >
            <X className='h-3 w-3 mr-1' />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Search</label>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search events...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Quick Filters</label>
        <div className='flex flex-wrap gap-2'>
          {quickFilters.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant='outline'
              size='sm'
              onClick={() => applyQuickFilter(key as any)}
              className='h-8 px-3 text-xs'
            >
              <Icon className='h-3 w-3 mr-1' />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Date Range</label>
        <div className='grid grid-cols-2 gap-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'justify-start text-left font-normal h-8',
                  !dateRange.from && 'text-muted-foreground',
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='single'
                selected={dateRange.from}
                onSelect={date => {
                  setDateRange(prev => ({ ...prev, from: date }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'justify-start text-left font-normal h-8',
                  !dateRange.to && 'text-muted-foreground',
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='single'
                selected={dateRange.to}
                onSelect={date => {
                  setDateRange(prev => ({ ...prev, to: date }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status Filter */}
      {filterOptions.statuses.length > 0 && (
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Status</label>
          <div className='flex flex-wrap gap-2'>
            {statusOptions.map(({ value, label, color }) => (
              <Badge
                key={value}
                variant={selectedStatuses.includes(value) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer text-xs',
                  selectedStatuses.includes(value)
                    && `bg-${color}-100 text-${color}-800 border-${color}-300`,
                )}
                onClick={() => {
                  setSelectedStatuses(prev =>
                    prev.includes(value)
                      ? prev.filter(s => s !== value)
                      : [...prev, value]
                  );
                }}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Priority Filter */}
      {filterOptions.priorities.length > 0 && (
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Priority</label>
          <div className='flex flex-wrap gap-2'>
            {priorityOptions.map(({ value, label, color }) => (
              <Badge
                key={value}
                variant={selectedPriorities.includes(value) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer text-xs',
                  selectedPriorities.includes(value)
                    && `bg-${color}-100 text-${color}-800 border-${color}-300`,
                )}
                onClick={() => {
                  setSelectedPriorities(prev =>
                    prev.includes(value)
                      ? prev.filter(p => p !== value)
                      : [...prev, value]
                  );
                }}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {filterOptions.colors.length > 0 && (
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Color</label>
          <div className='flex flex-wrap gap-2'>
            {colorOptions.map(({ value, label, class: colorClass }) => (
              <Badge
                key={value}
                variant={selectedColors.includes(value) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer text-xs flex items-center gap-1',
                  selectedColors.includes(value) && 'bg-primary text-primary-foreground',
                )}
                onClick={() => {
                  setSelectedColors(prev =>
                    prev.includes(value)
                      ? prev.filter(c => c !== value)
                      : [...prev, value]
                  );
                }}
              >
                <div className={cn('w-2 h-2 rounded-full', colorClass)} />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <Button
        onClick={applyAllFilters}
        className='w-full'
        disabled={activeFilterCount === 0}
      >
        Apply Filters
      </Button>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className='pt-2 border-t'>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredEvents.length} of {filterOptions.statuses.length} events
          </p>
        </div>
      )}
    </div>
  );
}
