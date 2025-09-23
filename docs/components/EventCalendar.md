# EventCalendar Component

## Overview

The `EventCalendar` component is an advanced calendar system designed for healthcare appointment management. It provides a rich, interactive interface with drag-and-drop functionality, keyboard shortcuts, and comprehensive event management capabilities optimized for clinical workflows.

## Installation

```bash
import { EventCalendar } from '@/components/event-calendar';
```

## Props

### EventCalendarProps

```typescript
interface EventCalendarProps {
  events?: CalendarEvent[]; // Array of calendar events to display
  onEventAdd?: (event: CalendarEvent) => void; // Callback when event is added
  onEventUpdate?: (event: CalendarEvent) => void; // Callback when event is updated
  onEventDelete?: (eventId: string) => void; // Callback when event is deleted
  className?: string; // Additional CSS classes
  initialView?: CalendarView; // Initial calendar view (default: "month")
}
```

## Core Types

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string; // Unique event identifier
  title: string; // Event title
  description?: string; // Event description (optional)
  start: Date; // Event start time
  end: Date; // Event end time
  allDay?: boolean; // Is this an all-day event?
  color?: EventColor; // Event color for visual distinction
  label?: string; // Event label/category
  location?: string; // Event location (optional)
}
```

### CalendarView

```typescript
type CalendarView = "month" | "week" | "day" | "agenda";
```

### EventColor

```typescript
type EventColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";
```

## Features

### 🎯 Core Functionality

- **Multiple View Modes**: Month, Week, Day, and Agenda views
- **Drag & Drop**: Interactive event rescheduling and duration adjustment
- **Keyboard Shortcuts**: Quick navigation and view switching
- **Real-time Updates**: Live event synchronization
- **Responsive Design**: Mobile-friendly interface

### ⚡ Performance Optimizations

- **Virtual Scrolling**: Efficient rendering of large event sets
- **Lazy Loading**: Events loaded on demand based on view
- **Memoization**: Optimized re-rendering performance
- **Debounced Input**: Efficient search and filtering

### 🔧 Healthcare-Specific Features

- **Time Snapping**: Events snap to 15-minute intervals
- **Overlapping Detection**: Smart handling of concurrent appointments
- **Clinic Context**: Integration with clinic management system
- **Compliance Ready**: Built for healthcare regulation compliance

## Usage Examples

### Basic Implementation

```typescript
import { EventCalendar } from '@/components/event-calendar';
import { CalendarEvent } from '@/components/event-calendar/types';

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Dr. Smith - Patient Consultation",
    description: "Initial consultation for new patient",
    start: new Date("2024-01-15T10:00:00"),
    end: new Date("2024-01-15T11:00:00"),
    color: "primary",
    location: "Consultation Room A"
  },
  {
    id: "2",
    title: "Team Meeting",
    start: new Date("2024-01-15T14:00:00"),
    end: new Date("2024-01-15T15:00:00"),
    color: "secondary"
  }
];

function AppointmentsPage() {
  const handleEventAdd = async (event: CalendarEvent) => {
    // Save to backend
    const savedEvent = await saveEvent(event);
    return savedEvent;
  };

  const handleEventUpdate = async (event: CalendarEvent) => {
    await updateEvent(event.id, event);
  };

  const handleEventDelete = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <EventCalendar
        events={sampleEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="week"
      />
    </div>
  );
}
```

### With Custom Styling

```typescript
function ClinicCalendar() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <EventCalendar
        events={clinicEvents}
        className="border border-gray-200 rounded-lg"
        initialView="week"
        onEventAdd={handleAppointmentCreate}
      />
    </div>
  );
}
```

### Agenda View for Daily Schedule

```typescript
function DailySchedule() {
  return (
    <div className="max-h-96 overflow-y-auto">
      <EventCalendar
        events={todayAppointments}
        initialView="agenda"
        className="bg-gray-50"
      />
    </div>
  );
}
```

## Keyboard Shortcuts

The EventCalendar includes comprehensive keyboard navigation:

| Shortcut | Action                      |
| -------- | --------------------------- |
| `M`      | Switch to Month view        |
| `W`      | Switch to Week view         |
| `D`      | Switch to Day view          |
| `A`      | Switch to Agenda view       |
| `←`      | Navigate to previous period |
| `→`      | Navigate to next period     |
| `T`      | Navigate to today           |
| `Esc`    | Close dialogs/menus         |

## Event Management

### Creating Events

Events can be created by clicking on time slots or through the dedicated create button:

```typescript
const handleEventCreate = async (startTime: Date) => {
  // Time is automatically snapped to 15-minute intervals
  const newEvent: CalendarEvent = {
    id: "",
    title: "New Appointment",
    start: startTime,
    end: addHours(startTime, 1),
    allDay: false,
    color: "primary",
  };

  // The calendar automatically opens the event dialog
  return await createEvent(newEvent);
};
```

### Updating Events

Events can be updated through:

- **Drag & Drop**: Change event time by dragging
- **Resize**: Adjust duration by dragging event edges
- **Edit Dialog**: Click event to open details

```typescript
const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
  // Update event in backend
  await updateEvent(updatedEvent.id, updatedEvent);

  // Calendar automatically updates the display
  showSuccessToast("Appointment updated successfully");
};
```

### Deleting Events

```typescript
const handleEventDelete = async (eventId: string) => {
  if (confirm("Are you sure you want to delete this appointment?")) {
    await deleteEvent(eventId);
    showSuccessToast("Appointment deleted");
  }
};
```

## Context Integration

The EventCalendar uses a powerful context system for state management:

```typescript
// Using the calendar context
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
```

## Healthcare-Specific Features

### Time Snapping

All events automatically snap to 15-minute intervals for clinical scheduling:

```typescript
// Automatic time snapping logic
const minutes = startTime.getMinutes();
const remainder = minutes % 15;
if (remainder !== 0) {
  if (remainder < 7.5) {
    startTime.setMinutes(minutes - remainder); // Round down
  } else {
    startTime.setMinutes(minutes + (15 - remainder)); // Round up
  }
}
```

### Clinic Integration

```typescript
// Events include clinic context
const clinicEvent: CalendarEvent = {
  id: "clinic-123",
  title: "Patient Consultation",
  start: new Date(),
  end: addHours(new Date(), 1),
  clinicId: currentClinic.id, // From clinic context
  practitionerId: currentPractitioner.id,
  patientId: selectedPatient?.id,
};
```

## Performance Optimization

### Large Dataset Handling

```typescript
// Memoize events to prevent unnecessary re-renders
const memoizedEvents = useMemo(() => events, [events]);

// Virtual scrolling for large event sets
const visibleEvents = useMemo(() => {
  if (events.length > 1000) {
    return getEventsForCurrentView(events, currentDate, currentView);
  }
  return events;
}, [events, currentDate, currentView]);
```

### Lazy Loading

```typescript
// Load events on demand
const loadEventsForDateRange = async (start: Date, end: Date) => {
  setLoading(true);
  try {
    const events = await calendarService.getEvents(start, end);
    setEvents(events);
  } catch (error) {
    console.error("Failed to load events:", error);
  } finally {
    setLoading(false);
  }
};
```

## Error Handling

### Comprehensive Error Management

```typescript
const handleEventSave = async (event: CalendarEvent) => {
  try {
    // Validate event data
    if (!event.title || !event.start || !event.end) {
      throw new Error("Event must have title, start, and end times");
    }

    if (event.start >= event.end) {
      throw new Error("Event end time must be after start time");
    }

    // Check for overlapping appointments
    const overlapping = checkForOverlappingEvents(event);
    if (overlapping.length > 0) {
      throw new Error("This time slot conflicts with existing appointments");
    }

    // Save event
    if (event.id) {
      await updateEvent(event);
    } else {
      await createEvent(event);
    }

    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  } catch (error) {
    console.error("Failed to save event:", error);
    // Error is automatically handled by context with user-friendly toast
  }
};
```

## Accessibility

### WCAG 2.1 AA+ Compliance

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Comprehensive ARIA labels and roles
- **Focus Management**: Proper focus handling for modal dialogs
- **Color Contrast**: WCAG-compliant color schemes
- **Responsive Design**: Mobile-first approach with touch support

### ARIA Implementation

```typescript
// Example ARIA attributes
<div
  role="grid"
  aria-label="Calendar"
  aria-rowcount={7}
  aria-colcount={7}
>
  {days.map((day, index) => (
    <div
      key={day.toString()}
      role="gridcell"
      aria-label={format(day, 'MMMM d, yyyy')}
      aria-selected={isSameDay(day, selectedDate)}
      tabIndex={0}
    >
      {/* Day content */}
    </div>
  ))}
</div>
```

## Integration Examples

### with React Query

```typescript
function CalendarWithQuery() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', currentDate, currentView],
    queryFn: () => calendarService.getEvents(
      getViewStart(currentView, currentDate),
      getViewEnd(currentView, currentDate)
    )
  });

  if (isLoading) return <CalendarLoading />;
  if (error) return <CalendarError error={error} />;

  return (
    <EventCalendar
      events={events || []}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  );
}
```

### with Redux

```typescript
function CalendarWithRedux() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventsLoading);

  const handleEventAdd = (event: CalendarEvent) => {
    dispatch(addEvent(event));
  };

  return (
    <EventCalendar
      events={events}
      loading={loading}
      onEventAdd={handleEventAdd}
      onEventUpdate={(event) => dispatch(updateEvent(event))}
      onEventDelete={(id) => dispatch(deleteEvent(id))}
    />
  );
}
```

## Security Considerations

- **Input Validation**: All event data validated before processing
- **XSS Prevention**: Event content sanitized and escaped
- **Authorization**: Users can only access events they have permission for
- **Rate Limiting**: API calls protected against abuse
- **Audit Logging**: All event changes logged for compliance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- TypeScript 4.5+
- date-fns 2.29+
- Lucide React (icons)
- Radix UI (primitives)

## Contributing

1. Follow TypeScript conventions and existing patterns
2. Ensure new features include accessibility support
3. Add comprehensive tests for new functionality
4. Performance test with large datasets
5. Consider healthcare compliance requirements

## Changelog

### v2.0.0

- Complete rewrite with enhanced performance
- Added drag-and-drop functionality
- Improved keyboard navigation
- Healthcare-specific time snapping
- Enhanced accessibility support

### v1.0.0

- Initial release with basic calendar functionality
- Multiple view modes support
- Event CRUD operations
