'use client';

import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCalendarContext } from './calendar-context';

import {
  AgendaView,
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView,
} from '@/components/event-calendar/index';
import Participants from '@/components/participants';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = 'month',
}: EventCalendarProps) {
  // Use the enhanced calendar context
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    filteredEvents,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    navigateToDate,
    navigateToToday,
    navigatePrevious,
    navigateNext,
  } = useCalendarContext();

  // Initialize view state
  const [view, setView] = useState<CalendarView>(currentView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { open } = useSidebar();

  // Sync view state with context
  React.useEffect(() => {
    setView(currentView);
  }, [currentView]);

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen
        || e.target instanceof HTMLInputElement
        || e.target instanceof HTMLTextAreaElement
        || (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          setView('month');
          break;
        case 'w':
          setView('week');
          break;
        case 'd':
          setView('day');
          break;
        case 'a':
          setView('agenda');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEventDialogOpen]);

  const handlePrevious = () => {
    navigatePrevious();
  };

  const handleNext = () => {
    navigateNext();
  };

  const handleToday = () => {
    navigateToToday();
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    const newEvent: CalendarEvent = {
      id: '',
      title: '',
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      if (event.id) {
        await updateEvent({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          allDay: event.allDay,
          color: event.color,
          location: event.location,
        } as any);
      } else {
        await createEvent({
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          allDay: event.allDay,
          color: event.color,
          location: event.location,
          clinicId: '', // This should come from context or user session
        } as any);
      }
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
    } catch (_error) {
      console.error('Failed to save event:', error);
      // Error is already handled by the context with toast
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
    } catch (_error) {
      console.error('Failed to delete event:', error);
      // Error is already handled by the context with toast
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      await updateEvent({
        id: updatedEvent.id,
        start: updatedEvent.start,
        end: updatedEvent.end,
      } as any);
    } catch (_error) {
      console.error('Failed to update event:', error);
      // Error is already handled by the context with toast
    }
  };

  const viewTitle = useMemo(() => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, 'MMMM yyyy');
      } else {
        return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
      }
    } else if (view === 'day') {
      return (
        <>
          <span className='min-sm:hidden' aria-hidden='true'>
            {format(currentDate, 'MMM d, yyyy')}
          </span>
          <span className='max-sm:hidden min-md:hidden' aria-hidden='true'>
            {format(currentDate, 'MMMM d, yyyy')}
          </span>
          <span className='max-md:hidden'>
            {format(currentDate, 'EEE MMMM d, yyyy')}
          </span>
        </>
      );
    } else if (view === 'agenda') {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, 'MMMM yyyy');
      } else {
        return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
      }
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, view]);

  return (
    <div
      className='flex has-data-[slot=month-view]:flex-1 flex-col rounded-lg'
      style={{
        '--event-height': `${EventHeight}px`,
        '--event-gap': `${EventGap}px`,
        '--week-cells-height': `${WeekCellsHeight}px`,
      } as React.CSSProperties}
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-5 sm:px-4',
            className,
          )}
        >
          <div className='flex sm:flex-col max-sm:items-center justify-between gap-1.5'>
            <div className='flex items-center gap-1.5'>
              <SidebarTrigger
                data-state={open ? 'invisible' : 'visible'}
                className='peer size-7 text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent! sm:-ms-1.5 lg:data-[state=invisible]:opacity-0 lg:data-[state=invisible]:pointer-events-none transition-opacity ease-in-out duration-200'
                isOutsideSidebar
              />
              <h2 className='font-semibold text-xl lg:peer-data-[state=invisible]:-translate-x-7.5 transition-transform ease-in-out duration-300'>
                {viewTitle}
              </h2>
            </div>
            <Participants />
          </div>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center sm:gap-2 max-sm:order-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='max-sm:size-8'
                  onClick={handlePrevious}
                  aria-label='Previous'
                >
                  <ChevronLeftIcon size={16} aria-hidden='true' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='max-sm:size-8'
                  onClick={handleNext}
                  aria-label='Next'
                >
                  <ChevronRightIcon size={16} aria-hidden='true' />
                </Button>
              </div>
              <Button
                className='max-sm:h-8 max-sm:px-2.5!'
                onClick={handleToday}
              >
                Today
              </Button>
            </div>
            <div className='flex items-center justify-between gap-2'>
              <Button
                variant='outline'
                className='max-sm:h-8 max-sm:px-2.5!'
                onClick={() => {
                  setSelectedEvent(null); // Ensure we're creating a new event
                  setIsEventDialogOpen(true);
                }}
              >
                New Event
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='gap-1.5 max-sm:h-8 max-sm:px-2! max-sm:gap-1'
                  >
                    <span className='capitalize'>{view}</span>
                    <ChevronDownIcon
                      className='-me-1 opacity-60'
                      size={16}
                      aria-hidden='true'
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-32'>
                  <DropdownMenuItem onClick={() => setCurrentView('month')}>
                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('week')}>
                    Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('day')}>
                    Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('agenda')}>
                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className='flex flex-1 flex-col'>
          {loading && (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full' />
              <span className='ml-2 text-sm text-muted-foreground'>Loading events...</span>
            </div>
          )}

          {error && (
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <p className='text-sm text-muted-foreground mb-2'>Error loading events</p>
                <p className='text-xs text-muted-foreground'>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                  onEventCreate={handleEventCreate}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                  onEventCreate={handleEventCreate}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                  onEventCreate={handleEventCreate}
                />
              )}
              {view === 'agenda' && (
                <AgendaView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                />
              )}
            </>
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  );
}
