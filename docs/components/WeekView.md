# WeekView Component

## Overview

The `WeekView` component provides a detailed weekly calendar interface optimized for healthcare appointment scheduling. It displays a 7-day week view with hourly time slots, drag-and-drop functionality, and smart event positioning for overlapping appointments.

## Installation

```bash
import { WeekView } from '@/components/event-calendar/week-view';
```

## Props

### WeekViewProps

```typescript
interface WeekViewProps {
  currentDate: Date; // Current date to display
  events: CalendarEvent[]; // Array of events to display
  onEventSelect: (event: CalendarEvent) => void; // Callback when event is selected
  onEventCreate: (startTime: Date) => void; // Callback when creating new event
}
```

## Usage Examples

### Basic Implementation

```typescript
import { CalendarEvent } from '@/components/event-calendar/types';
import { WeekView } from '@/components/event-calendar/week-view';

function WeeklySchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleEventSelect = (event: CalendarEvent) => {
    console.log('Selected event:', event);
    // Open event details dialog
  };

  const handleEventCreate = (startTime: Date) => {
    // Create new appointment at selected time
    const newEvent: CalendarEvent = {
      id: '',
      title: 'New Appointment',
      start: startTime,
      end: addHours(startTime, 1),
      allDay: false,
      color: 'primary',
    };
    setEvents(prev => [...prev, newEvent]);
  };

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Weekly Schedule</h2>
        <button onClick={() => setCurrentDate(new Date())}>
          Today
        </button>
      </div>
      <WeekView
        currentDate={currentDate}
        events={events}
        onEventSelect={handleEventSelect}
        onEventCreate={handleEventCreate}
      />
    </div>
  );
}
```

### with Navigation Controls

```typescript
function WeeklyScheduleWithNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className='flex gap-2'>
          <button onClick={goToPreviousWeek} className='px-3 py-1 border rounded'>
            ← Previous
          </button>
          <button onClick={goToToday} className='px-3 py-1 bg-blue-500 text-white rounded'>
            Today
          </button>
          <button onClick={goToNextWeek} className='px-3 py-1 border rounded'>
            Next →
          </button>
        </div>
      </div>

      <WeekView
        currentDate={currentDate}
        events={weeklyEvents}
        onEventSelect={handleEventSelect}
        onEventCreate={handleEventCreate}
      />
    </div>
  );
}
```

## Features

### 🎯 Core Functionality

- **7-Day Week Display**: Complete week overview with day headers
- **Hourly Time Slots**: 24-hour time grid with 30-minute intervals
- **Drag & Drop**: Interactive event rescheduling
- **Event Overlapping**: Smart positioning for concurrent appointments
- **Click-to-Create**: Create events by clicking on time slots

### 🏥 Healthcare Optimizations

- **15-Minute Snapping**: Events automatically snap to clinical time intervals
- **Appointment Blocks**: Visual distinction for different appointment types
- **Practitioner View**: Optimized for healthcare provider workflows
- **Time Slot Validation**: Prevents conflicting appointments

### 💻 User Experience

- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Touch Support**: Mobile-friendly interactions
- **Visual Feedback**: Clear hover and selection states

## Event Positioning

The WeekView uses intelligent positioning algorithm for overlapping events:

```typescript
interface PositionedEvent {
  event: CalendarEvent;
  top: number; // Position from top of time grid
  left: number; // Position from left of day column
  width: number; // Width based on overlapping events
  height: number; // Height based on event duration
  zIndex: number; // Z-index for stacking order
}
```

### Overlapping Event Logic

```typescript
// Calculate position for overlapping events
const calculateEventPositions = (events: CalendarEvent[]) => {
  const positionedEvents = events.map(event => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const duration = endMinutes - startMinutes;

    // Find overlapping events
    const overlapping = events.filter(
      other =>
        other.id !== event.id
        && !(other.end <= event.start || other.start >= event.end),
    );

    // Calculate width based on number of overlapping events
    const width = 100 / (overlapping.length + 1);

    return {
      event,
      top: (startMinutes / 1440) * 100, // 1440 minutes in a day
      height: (duration / 1440) * 100,
      width,
      zIndex: overlapping.length + 1,
    };
  });

  return positionedEvents;
};
```

## Time Grid Structure

### Day Headers

```typescript
// Week starts on Sunday (0) by default
const weekDays = [
  { date: startOfWeek(currentDate), label: 'Sun' },
  { date: addDays(startOfWeek(currentDate), 1), label: 'Mon' },
  { date: addDays(startOfWeek(currentDate), 2), label: 'Tue' },
  { date: addDays(startOfWeek(currentDate), 3), label: 'Wed' },
  { date: addDays(startOfWeek(currentDate), 4), label: 'Thu' },
  { date: addDays(startOfWeek(currentDate), 5), label: 'Fri' },
  { date: addDays(startOfWeek(currentDate), 6), label: 'Sat' },
];
```

### Time Slots

```typescript
// Generate 24-hour time slots
const timeSlots = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  label: format(new Date().setHours(hour, 0, 0, 0), 'h a'),
  time: new Date().setHours(hour, 0, 0, 0),
}));
```

## Accessibility

### Keyboard Navigation

| Key          | Action                                |
| ------------ | ------------------------------------- |
| `Tab`        | Navigate between interactive elements |
| `Enter`      | Select event or create new event      |
| `Space`      | Toggle event selection                |
| `Escape`     | Close dialogs or cancel actions       |
| `Arrow Keys` | Navigate within time grid             |

### ARIA Attributes

```typescript
<div
  role='grid'
  aria-label='Weekly calendar view'
  aria-rowcount={25} // 24 hours + header row
  aria-colcount={7} // 7 days
>
  {/* Time column header */}
  <div role='columnheader' aria-label='Time'>Time</div>

  {/* Day headers */}
  {weekDays.map((day, index) => (
    <div
      key={day.date.toString()}
      role='columnheader'
      aria-label={`${format(day.date, 'EEEE, MMMM d')}`}
    >
      {format(day.date, 'EEE MM/d')}
    </div>
  ))}

  {/* Time slots */}
  {timeSlots.map((slot, hourIndex) => (
    <React.Fragment key={hourIndex}>
      {/* Time label */}
      <div role='rowheader' aria-label={`${slot.label}`}>
        {slot.label}
      </div>

      {/* Day cells */}
      {weekDays.map((day, dayIndex) => (
        <div
          key={`${hourIndex}-${dayIndex}`}
          role='gridcell'
          aria-label={`${format(day.date, 'EEEE')} at ${slot.label}`}
          tabIndex={0}
          onClick={() => handleTimeSlotClick(day.date, slot.time)}
          onKeyDown={e => handleKeydown(e, day.date, slot.time)}
        >
          {/* Event content */}
        </div>
      ))}
    </React.Fragment>
  ))}
</div>;
```

## Styling

### Custom CSS Classes

```typescript
<WeekView
  currentDate={currentDate}
  events={events}
  onEventSelect={handleEventSelect}
  onEventCreate={handleEventCreate}
  className='custom-week-view'
/>;
```

```css
/* Custom WeekView styling */
.custom-week-view {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.custom-week-view .time-header {
  background-color: #f9fafb;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.custom-week-view .day-header {
  background-color: #f3f4f6;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
}

.custom-week-view .time-slot {
  border-bottom: 1px solid #f3f4f6;
  border-right: 1px solid #e5e7eb;
  min-height: 60px;
}

.custom-week-view .time-slot:hover {
  background-color: #f9fafb;
  cursor: pointer;
}

.custom-week-view .event {
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin: 0.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-week-view .event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-week-view .event.primary {
  background-color: #3b82f6;
  color: white;
}

.custom-week-view .event.secondary {
  background-color: #6b7280;
  color: white;
}

.custom-week-view .event.success {
  background-color: #10b981;
  color: white;
}

.custom-week-view .now-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ef4444;
  z-index: 10;
}
```

## Performance Optimization

### Large Event Sets

```typescript
// Memoize events to prevent unnecessary re-renders
const memoizedEvents = useMemo(() => events, [events]);

// Virtual scrolling for performance
const visibleTimeSlots = useMemo(() => {
  const scrollPosition = getScrollPosition();
  const viewportHeight = getViewportHeight();
  return getTimeSlotsInView(scrollPosition, viewportHeight);
}, [scrollPosition, viewportHeight]);
```

### Event Filtering

```typescript
// Filter events for current week view
const weekEvents = useMemo(() => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  return events.filter(
    event => event.start >= weekStart && event.end <= weekEnd,
  );
}, [events, currentDate]);
```

## Error Handling

### Common Error Scenarios

```typescript
const handleEventCreate = (startTime: Date) => {
  try {
    // Validate time slot
    if (isWeekend(startTime)) {
      throw new Error('Cannot create appointments on weekends');
    }

    if (isOutsideBusinessHours(startTime)) {
      throw new Error('Appointment must be during business hours');
    }

    // Check for conflicts
    const conflictingEvents = checkForConflicts(startTime);
    if (conflictingEvents.length > 0) {
      throw new Error('This time slot conflicts with existing appointments');
    }

    // Create event
    onEventCreate(startTime);
  } catch (error) {
    console.error('Failed to create event:', error);
    showErrorToast(error.message);
  }
};
```

## Integration with State Management

### React Query Integration

```typescript
function WeekViewWithQuery() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'week', currentDate],
    queryFn: () => fetchWeekEvents(currentDate),
  });

  if (isLoading) return <WeekViewLoading />;

  return (
    <WeekView
      currentDate={currentDate}
      events={events || []}
      onEventSelect={handleEventSelect}
      onEventCreate={handleEventCreate}
    />
  );
}
```

### Redux Integration

```typescript
function WeekViewWithRedux() {
  const dispatch = useDispatch();
  const events = useSelector(selectWeekEvents(currentDate));
  const loading = useSelector(selectEventsLoading);

  const handleEventCreate = (startTime: Date) => {
    dispatch(createEvent({
      start: startTime,
      end: addHours(startTime, 1),
      title: 'New Appointment',
    }));
  };

  return (
    <WeekView
      currentDate={currentDate}
      events={events}
      loading={loading}
      onEventSelect={event => dispatch(selectEvent(event))}
      onEventCreate={handleEventCreate}
    />
  );
}
```

## Testing

### Unit Test Example

```typescript
import { WeekView } from '@/components/event-calendar/week-view';
import { fireEvent, render, screen } from '@testing-library/react';

describe('WeekView', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      allDay: false,
    },
  ];

  test('renders week view with events', () => {
    render(
      <WeekView
        currentDate={new Date('2024-01-15')}
        events={mockEvents}
        onEventSelect={jest.fn()}
        onEventCreate={jest.fn()}
      />,
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  test('calls onEventCreate when time slot is clicked', () => {
    const mockOnCreate = jest.fn();
    render(
      <WeekView
        currentDate={new Date('2024-01-15')}
        events={[]}
        onEventSelect={jest.fn()}
        onEventCreate={mockOnCreate}
      />,
    );

    const timeSlot = screen.getByLabelText('Monday at 10:00 AM');
    fireEvent.click(timeSlot);

    expect(mockOnCreate).toHaveBeenCalledWith(
      expect.any(Date),
    );
  });
});
```

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

## Contributing

When contributing to WeekView:

1. Follow existing TypeScript patterns and conventions
2. Ensure new features include proper accessibility support
3. Add comprehensive tests for new functionality
4. Consider performance implications for large event sets
5. Test with healthcare-specific use cases

## Changelog

### v1.0.0

- Initial release with basic week view functionality
- Drag-and-drop event positioning
- Smart overlapping event handling
- Full keyboard navigation support
