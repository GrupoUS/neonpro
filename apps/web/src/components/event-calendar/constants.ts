import { type EventColor } from './types';

export const _EventHeight = 24;

// Etiquettes for calendar filtering
export const _etiquettes = [
  {
    id: 'my-events',
    name: 'My Events',
    color: 'emerald' as EventColor,
    isActive: true,
  },
  {
    id: 'marketing-team',
    name: 'Marketing Team',
    color: 'orange' as EventColor,
    isActive: true,
  },
  {
    id: 'interviews',
    name: 'Interviews',
    color: 'violet' as EventColor,
    isActive: true,
  },
  {
    id: 'events-planning',
    name: 'Events Planning',
    color: 'blue' as EventColor,
    isActive: true,
  },
  {
    id: 'holidays',
    name: 'Holidays',
    color: 'rose' as EventColor,
    isActive: true,
  },
];

// Vertical gap between events in pixels - controls spacing in month view
export const _EventGap = 4;

// Height of hour cells in week and day views - controls the scale of time display
export const _WeekCellsHeight = 72;

// Number of days to show in the agenda view
export const _AgendaDaysToShow = 30;

// Start and end hours for the week and day views
export const _StartHour = 7; // Start at 7 AM
export const _EndHour = 20; // End at 8 PM

// Default start and end times
export const _DefaultStartHour = 9; // 9 AM
export const _DefaultEndHour = 10; // 10 AM
