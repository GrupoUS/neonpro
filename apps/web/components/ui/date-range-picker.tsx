'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = 'Pick a date range',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) {
      return placeholder;
    }

    if (dateRange.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    }

    return dateRange.from.toLocaleDateString();
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              onDateChange?.(range as DateRange);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Export alias for compatibility
export { DateRangePicker as DatePickerWithRange };
