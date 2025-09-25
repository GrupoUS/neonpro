# BigCalendar Component

## Overview

The `BigCalendar` component is a comprehensive calendar interface for managing appointments, events, and scheduling in the NeonPro aesthetic clinic management platform. It provides multiple view modes (day, week, month, agenda) with full event management capabilities.

## Installation

```bash
import { BigCalendar } from '@/components/big-calendar';
```

## Props

### BigCalendarProps

```typescript
interface BigCalendarProps {
  events?: CalendarEvent[] // Array of calendar events to display
  onEventUpdate?: (event: CalendarEvent) => void // Callback when event is updated
  onEventDelete?: (eventId: string) => void // Callback when event is deleted
  onEventCreate?: (event: CalendarEvent) => void // Callback when new event is created
  className?: string // Additional CSS classes
  initialView?: 'day' | 'week' | 'month' | 'agenda' // Initial calendar view
}
```

## CalendarEvent Interface

```typescript
interface CalendarEvent {
  id: string // Unique event identifier
  title: string // Event title
  description?: string // Event description (optional)
  start: Date // Event start time
  end: Date // Event end time
  allDay?: boolean // Is this an all-day event?
  color?: EventColor // Event color for visual distinction
  label?: string // Event label/category
  location?: string // Event location (optional)
}
```

## EventColor Type

```typescript
type EventColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
```

## CalendarView Type

```typescript
type CalendarView = 'month' | 'week' | 'day' | 'agenda'
```

## Usage Examples

### Basic Usage

```typescript
import { BigCalendar } from '@/components/big-calendar'
import { CalendarEvent } from '@/components/event-calendar/types'

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Patient Consultation',
    description: 'Initial consultation with new patient',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
    color: 'primary',
    location: 'Consultation Room A',
  },
  {
    id: '2',
    title: 'Team Meeting',
    start: new Date('2024-01-15T14:00:00'),
    end: new Date('2024-01-15T15:00:00'),
    color: 'secondary',
  },
]

function AppointmentsPage() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Appointments</h1>
      <BigCalendar
        events={sampleEvents}
        initialView='week'
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  )
}
```

### With Custom Styling

```typescript
function AppointmentsPage() {
  return (
    <div className='p-6'>
      <BigCalendar
        events={events}
        className='bg-white rounded-lg shadow-lg border border-gray-200'
        initialView='month'
        onEventCreate={handleEventCreate}
      />
    </div>
  )
}
```

### Agenda View

```typescript
function AgendaPage() {
  return (
    <div className='p-6'>
      <BigCalendar
        events={todayEvents}
        initialView='agenda'
        className='max-h-96 overflow-y-auto'
      />
    </div>
  )
}
```

## Event Management

### Creating Events

Events are created through the calendar's built-in UI. The `onEventCreate` callback is triggered when a user creates a new event:

```typescript
const handleEventCreate = (event: CalendarEvent) => {
  // Save event to database
  await saveEvent(event)
  // Update local state
  setEvents(prev => [...prev, event])
}
```

### Updating Events

When existing events are modified (dragged, resized, or edited), the `onEventUpdate` callback is triggered:

```typescript
const handleEventUpdate = (updatedEvent: CalendarEvent) => {
  // Update event in database
  await updateEvent(updatedEvent.id, updatedEvent)
  // Update local state
  setEvents(prev => prev.map(event => (event.id === updatedEvent.id ? updatedEvent : event)))
}
```

### Deleting Events

Events can be deleted through the calendar UI, triggering the `onEventDelete` callback:

```typescript
const handleEventDelete = (eventId: string) => {
  // Remove event from database
  await deleteEvent(eventId)
  // Update local state
  setEvents(prev => prev.filter(event => event.id !== eventId))
}
```

## Accessibility

The BigCalendar component includes:

- **Keyboard Navigation**: Full keyboard support for navigating between dates and events
- **Screen Reader Support**: ARIA labels and roles for calendar elements
- **Focus Management**: Proper focus handling for interactive elements
- **Color Contrast**: WCAG 2.1 AA compliant color schemes
- **Responsive Design**: Mobile-friendly layout that adapts to screen size

## Performance Optimization

### Large Event Sets

For calendars with many events, consider these optimizations:

```typescript
// Use memoization for event data
const memoizedEvents = useMemo(() => events, [events])

// Implement virtualization for large datasets
const visibleEvents = useMemo(() => {
  const start = getCurrentViewStart()
  const end = getCurrentViewEnd()
  return events.filter(event => event.start >= start && event.end <= end)
}, [events, currentView])
```

### Lazy Loading

```typescript
// Load events on demand when view changes
const loadEventsForView = async (view: CalendarView, date: Date) => {
  const start = getViewStart(view, date)
  const end = getViewEnd(view, date)
  const events = await fetchEvents(start, end)
  setEvents(events)
}
```

## Error Handling

### Common Error Scenarios

```typescript
// Handle invalid event data
const handleEventCreate = (event: CalendarEvent) => {
  try {
    // Validate event data
    if (!event.title || !event.start || !event.end) {
      throw new Error('Event must have title, start, and end times')
    }

    if (event.start >= event.end) {
      throw new Error('Event end time must be after start time')
    }

    await saveEvent(event)
  } catch (error) {
    console.error('Failed to create event:', error)
    // Show user-friendly error message
    showErrorToast('Failed to create event. Please check your input.')
  }
}
```

## Integration with Backend

### API Integration Example

```typescript
// Service for calendar operations
class CalendarService {
  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const response = await fetch(
      `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`,
    )
    return response.json()
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    return response.json()
  }

  async updateEvent(
    id: string,
    event: Partial<CalendarEvent>,
  ): Promise<CalendarEvent> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    return response.json()
  }

  async deleteEvent(id: string): Promise<void> {
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
  }
}
```

## Security Considerations

- **Input Validation**: All event data is validated before processing
- **Authorization**: Users can only modify events they have permission to access
- **Data Sanitization**: Event titles and descriptions are sanitized to prevent XSS
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- TypeScript 4.5+
- date-fns (for date utilities)
- Lucide React (for icons)

## Contributing

When contributing to the BigCalendar component:

1. Follow the established code patterns and TypeScript conventions
2. Ensure all new features include proper TypeScript types
3. Add appropriate tests for new functionality
4. Consider accessibility implications for all changes
5. Performance test with large datasets

## Changelog

### v1.0.0

- Initial release with basic calendar functionality
- Support for day, week, month, and agenda views
- Event creation, update, and deletion capabilities
- Full accessibility support
