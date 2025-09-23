# Calendar Integration Guide

## Overview

This guide provides comprehensive instructions for integrating NeonPro's calendar components into your applications. The calendar system is designed specifically for healthcare appointment management with built-in compliance, accessibility, and performance optimizations.

## Prerequisites

- Node.js 18+ and npm/pnpm
- React 18+ with TypeScript
- Basic understanding of React hooks and state management
- Healthcare domain knowledge (for compliance requirements)

## Quick Start

### 1. Installation

```bash
# Install dependencies
pnpm add @neonpro/web

# Or if using individual packages
pnpm add date-fns lucide-react @radix-ui/react-slot
```

### 2. Basic Setup

```typescript
// pages/appointments.tsx
import { EventCalendar } from '@/components/event-calendar';
import { CalendarEvent } from '@/components/event-calendar/types';

export default function AppointmentsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
```

## Component Integration Patterns

### Pattern 1: Simple Calendar with Local State

```typescript
import { useState, useCallback } from 'react';
import { BigCalendar } from '@/components/big-calendar';
import { CalendarEvent } from '@/components/event-calendar/types';

function SimpleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleEventCreate = useCallback((event: CalendarEvent) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      color: 'primary' as const
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const handleEventUpdate = useCallback((updatedEvent: CalendarEvent) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }, []);

  const handleEventDelete = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <BigCalendar
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="week"
      />
    </div>
  );
}
```

### Pattern 2: Calendar with API Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventCalendar } from '@/components/event-calendar';

// API service
const calendarApi = {
  getEvents: async (start: Date, end: Date) => {
    const response = await fetch(`/api/events?start=${start.toISOString()}&end=${end.toISOString()}`);
    return response.json();
  },

  createEvent: async (event: Omit<CalendarEvent, 'id'>) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return response.json();
  },

  updateEvent: async (id: string, event: Partial<CalendarEvent>) => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return response.json();
  },

  deleteEvent: async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
  }
};

function ApiIntegratedCalendar() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get events for current view
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', currentDate],
    queryFn: () => {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return calendarApi.getEvents(start, end);
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccessToast('Appointment created successfully');
    },
    onError: (error) => {
      showErrorToast('Failed to create appointment');
      console.error('Create error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...event }: CalendarEvent) =>
      calendarApi.updateEvent(id, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccessToast('Appointment updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccessToast('Appointment deleted successfully');
    }
  });

  const handleEventCreate = (event: CalendarEvent) => {
    createMutation.mutate(event);
  };

  const handleEventUpdate = (event: CalendarEvent) => {
    updateMutation.mutate(event);
  };

  const handleEventDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteMutation.mutate(eventId);
    }
  };

  if (isLoading) return <CalendarLoading />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointment Schedule</h2>
        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>

      <EventCalendar
        events={events || []}
        onEventAdd={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
```

### Pattern 3: Healthcare-Specific Calendar with Compliance

```typescript
import { useClinicContext } from '@/contexts/clinic-context';
import { useCompliance } from '@/hooks/use-compliance';
import { EventCalendar } from '@/components/event-calendar';

function HealthcareCalendar() {
  const { currentClinic, currentPractitioner } = useClinicContext();
  const { validateLGPD, logAudit } = useCompliance();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleEventCreate = async (eventData: CalendarEvent) => {
    try {
      // Validate healthcare compliance
      const complianceCheck = await validateLGPD({
        action: 'create_appointment',
        data: eventData,
        patientId: selectedPatient?.id,
        clinicId: currentClinic.id
      });

      if (!complianceCheck.valid) {
        throw new Error(complianceCheck.error);
      }

      // Create healthcare-specific event
      const healthcareEvent: CalendarEvent = {
        ...eventData,
        clinicId: currentClinic.id,
        practitionerId: currentPractitioner.id,
        patientId: selectedPatient?.id,
        appointmentType: 'consultation',
        status: 'scheduled',
        // Healthcare-specific metadata
        metadata: {
          requiresConsent: selectedPatient?.requiresConsent || false,
          specialInstructions: eventData.description,
          estimatedDuration: calculateDuration(eventData.start, eventData.end)
        }
      };

      // Log audit trail
      await logAudit({
        action: 'APPOINTMENT_CREATED',
        userId: currentPractitioner.id,
        clinicId: currentClinic.id,
        details: {
          appointmentId: healthcareEvent.id,
          patientId: selectedPatient?.id,
          timestamp: new Date().toISOString()
        }
      });

      // Save to backend
      const savedEvent = await createHealthcareAppointment(healthcareEvent);

      showSuccessToast('Appointment created successfully');
      return savedEvent;

    } catch (error) {
      console.error('Healthcare compliance error:', error);
      showErrorToast(error.message || 'Failed to create appointment');

      // Log compliance failure
      await logAudit({
        action: 'COMPLIANCE_VIOLATION',
        userId: currentPractitioner.id,
        clinicId: currentClinic.id,
        details: {
          error: error.message,
          attemptedAction: 'create_appointment'
        }
      });

      throw error;
    }
  };

  return (
    <div className="healthcare-calendar-container">
      <PatientSelector
        selectedPatient={selectedPatient}
        onPatientSelect={setSelectedPatient}
      />

      <EventCalendar
        events={clinicAppointments}
        onEventAdd={handleEventCreate}
        onEventUpdate={handleHealthcareEventUpdate}
        onEventDelete={handleHealthcareEventDelete}
        className="healthcare-calendar"
      />
    </div>
  );
}
```

## Advanced Integration Patterns

### Pattern 4: Multi-Resource Calendar

```typescript
import { useState, useMemo } from 'react';
import { EventCalendar } from '@/components/event-calendar';

interface Resource {
  id: string;
  name: string;
  type: 'practitioner' | 'room' | 'equipment';
  color: string;
}

function MultiResourceCalendar() {
  const [resources] = useState<Resource[]>([
    { id: 'dr-smith', name: 'Dr. Smith', type: 'practitioner', color: '#3b82f6' },
    { id: 'dr-jones', name: 'Dr. Jones', type: 'practitioner', color: '#10b981' },
    { id: 'room-a', name: 'Consultation Room A', type: 'room', color: '#f59e0b' },
    { id: 'room-b', name: 'Consultation Room B', type: 'room', color: '#ef4444' }
  ]);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Filter events by selected resource
  const filteredEvents = useMemo(() => {
    if (!selectedResource) return allEvents;
    return allEvents.filter(event =>
      event.resourceId === selectedResource.id
    );
  }, [allEvents, selectedResource]);

  const handleEventCreate = (startTime: Date) => {
    if (!selectedResource) {
      showErrorToast('Please select a resource first');
      return;
    }

    const newEvent: CalendarEvent = {
      id: '',
      title: `Appointment - ${selectedResource.name}`,
      start: startTime,
      end: addHours(startTime, 1),
      resourceId: selectedResource.id,
      color: selectedResource.color as EventColor
    };

    onEventCreate(newEvent);
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Resource selector */}
      <div className="col-span-1">
        <h3 className="font-semibold mb-4">Resources</h3>
        <div className="space-y-2">
          {resources.map(resource => (
            <button
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedResource?.id === resource.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: resource.color }}
                />
                <span>{resource.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="col-span-3">
        <EventCalendar
          events={filteredEvents}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          className={`${!selectedResource ? 'opacity-50 pointer-events-none' : ''}`}
        />
      </div>
    </div>
  );
}
```

### Pattern 5: Real-time Synchronization Calendar

```typescript
import { useEffect, useState } from 'react';
import { EventCalendar } from '@/components/event-calendar';
import { useWebSocket } from '@/hooks/use-websocket';

function RealTimeCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { socket, connected } = useWebSocket('calendar-updates');

  useEffect(() => {
    // Load initial events
    loadInitialEvents();

    // Set up real-time listeners
    socket.on('event-created', handleEventCreated);
    socket.on('event-updated', handleEventUpdated);
    socket.on('event-deleted', handleEventDeleted);
    socket.on('event-conflict', handleEventConflict);

    return () => {
      socket.off('event-created');
      socket.off('event-updated');
      socket.off('event-deleted');
      socket.off('event-conflict');
    };
  }, [socket]);

  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents(prev => {
      // Check for conflicts before adding
      const hasConflict = checkForConflicts(newEvent, prev);
      if (hasConflict) {
        showWarningToast('Potential scheduling conflict detected');
      }
      return [...prev, newEvent];
    });
  };

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleEventConflict = (conflictData: {
    eventId: string;
    conflictingEvents: CalendarEvent[];
  }) => {
    showConflictDialog(conflictData);
  };

  return (
    <div className="relative">
      {/* Connection status indicator */}
      <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
        connected
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {connected ? 'Live' : 'Disconnected'}
      </div>

      <EventCalendar
        events={events}
        onEventCreate={handleLocalEventCreate}
        onEventUpdate={handleLocalEventUpdate}
        onEventDelete={handleLocalEventDelete}
      />
    </div>
  );
}
```

## Customization and Theming

### Custom Event Rendering

```typescript
import { EventCalendar } from '@/components/event-calendar';

function CustomEventCalendar() {
  const renderEvent = (event: CalendarEvent) => {
    return (
      <div className="custom-event">
        <div className="event-time">
          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
        </div>
        <div className="event-title">{event.title}</div>
        {event.location && (
          <div className="event-location">
            <MapPin className="w-3 h-3 inline mr-1" />
            {event.location}
          </div>
        )}
        {event.patientName && (
          <div className="event-patient">
            <User className="w-3 h-3 inline mr-1" />
            {event.patientName}
          </div>
        )}
      </div>
    );
  };

  return (
    <EventCalendar
      events={events}
      onEventCreate={handleEventCreate}
      eventRenderer={renderEvent}
    />
  );
}
```

### Custom Time Grid

```typescript
import { WeekView } from '@/components/event-calendar/week-view';

function CustomWeekView() {
  const renderTimeSlot = (date: Date, hour: number) => {
    const isBusinessHours = hour >= 9 && hour < 17;
    const isCurrentHour = isSameHour(date, new Date());

    return (
      <div
        className={`
          time-slot-custom
          ${isBusinessHours ? 'business-hours' : 'after-hours'}
          ${isCurrentHour ? 'current-hour' : ''}
        `}
      >
        <div className="time-label">
          {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
        </div>
        <div className="slot-content">
          {/* Custom slot content */}
        </div>
      </div>
    );
  };

  return (
    <WeekView
      currentDate={currentDate}
      events={events}
      onEventSelect={handleEventSelect}
      onEventCreate={handleEventCreate}
      timeSlotRenderer={renderTimeSlot}
    />
  );
}
```

## Performance Optimization

### Large Dataset Handling

```typescript
import { useMemo, useCallback } from 'react';
import { EventCalendar } from '@/components/event-calendar';

function OptimizedCalendar() {
  // Memoize events to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => events, [events]);

  // Virtual scrolling for large datasets
  const getVisibleEvents = useCallback((view: CalendarView, date: Date) => {
    if (events.length < 1000) return events;

    const start = getViewStart(view, date);
    const end = getViewEnd(view, date);

    return events.filter(event =>
      event.start >= start && event.end <= end
    );
  }, [events]);

  // Debounced search and filtering
  const debouncedFilter = useMemo(
    () => debounce((query: string) => {
      setFilterQuery(query);
    }, 300),
    []
  );

  return (
    <div className="optimized-calendar">
      <SearchInput onSearch={debouncedFilter} />
      <EventCalendar
        events={getVisibleEvents(currentView, currentDate)}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        virtualScrolling={events.length > 1000}
      />
    </div>
  );
}
```

## Testing Integration

### Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventCalendar } from '@/components/event-calendar';

describe('Calendar Integration', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Appointment',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      allDay: false
    }
  ];

  test('integrates with event handlers', () => {
    const mockOnCreate = jest.fn();
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <EventCalendar
        events={mockEvents}
        onEventAdd={mockOnCreate}
        onEventUpdate={mockOnUpdate}
        onEventDelete={mockOnDelete}
      />
    );

    // Test event creation
    fireEvent.click(screen.getByLabelText('Create new appointment'));
    expect(mockOnCreate).toHaveBeenCalled();

    // Test event selection
    fireEvent.click(screen.getByText('Test Appointment'));
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  test('handles loading states', () => {
    render(
      <EventCalendar
        events={[]}
        loading={true}
        onEventAdd={jest.fn()}
        onEventUpdate={jest.fn()}
        onEventDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles error states', () => {
    render(
      <EventCalendar
        events={[]}
        error="Failed to load events"
        onEventAdd={jest.fn()}
        onEventUpdate={jest.fn()}
        onEventDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Failed to load events')).toBeInTheDocument();
  });
});
```

### E2E Testing

```typescript
// cypress/support/commands.ts
Cypress.Commands.add(
  "createAppointment",
  (title: string, startTime: string) => {
    cy.get('[data-testid="calendar"]').within(() => {
      cy.contains(startTime).click();
      cy.get('[data-testid="event-title-input"]').type(title);
      cy.get('[data-testid="save-event-btn"]').click();
    });
  },
);

// cypress/e2e/calendar.cy.ts
describe("Calendar E2E", () => {
  beforeEach(() => {
    cy.visit("/appointments");
    cy.login("test-user", "password");
  });

  it("creates and views appointments", () => {
    // Create appointment
    cy.createAppointment("Patient Consultation", "10:00 AM");

    // Verify appointment appears
    cy.contains("Patient Consultation").should("be.visible");

    // Navigate to different views
    cy.get('[data-testid="week-view-btn"]').click();
    cy.contains("Patient Consultation").should("be.visible");

    cy.get('[data-testid="month-view-btn"]').click();
    cy.contains("Patient Consultation").should("be.visible");
  });

  it("handles appointment conflicts", () => {
    // Create overlapping appointments
    cy.createAppointment("First Appointment", "10:00 AM");
    cy.createAppointment("Second Appointment", "10:00 AM");

    // Should show conflict warning
    cy.get('[data-testid="conflict-warning"]').should("be.visible");
  });
});
```

## Deployment Considerations

### Environment Configuration

```typescript
// config/calendar.ts
export const calendarConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: parseInt(process.env.API_TIMEOUT || "30000"),
    retries: parseInt(process.env.API_RETRIES || "3"),
  },
  features: {
    enableRealTime: process.env.ENABLE_REAL_TIME === "true",
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === "true",
    enableExport: process.env.ENABLE_EXPORT === "true",
  },
  limits: {
    maxEventsPerView: parseInt(process.env.MAX_EVENTS_PER_VIEW || "1000"),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || "5"),
  },
  healthcare: {
    enableCompliance: process.env.ENABLE_COMPLIANCE !== "false",
    lgpdEnabled: process.env.LGPD_ENABLED !== "false",
    auditLogging: process.env.AUDIT_LOGGING !== "false",
  },
};
```

### Performance Monitoring

```typescript
// utils/calendar-analytics.ts
export const trackCalendarPerformance = (eventName: string, metrics: any) => {
  // Track custom performance metrics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      custom_parameter_1: metrics.loadTime,
      custom_parameter_2: metrics.eventCount,
      custom_parameter_3: metrics.viewType,
    });
  }

  // Log to analytics service
  analytics.track(eventName, metrics);
};

// Usage in calendar component
const handleViewChange = (view: CalendarView) => {
  const startTime = performance.now();

  setCurrentView(view);

  const endTime = performance.now();
  trackCalendarPerformance("calendar_view_change", {
    loadTime: endTime - startTime,
    viewType: view,
    eventCount: events.length,
  });
};
```

## Troubleshooting

### Common Issues

1. **Events not displaying**
   - Check if events are in the correct date format
   - Verify timezone handling
   - Ensure events array is not empty

2. **Performance issues with many events**
   - Implement virtual scrolling
   - Use memoization for event data
   - Consider pagination for large datasets

3. **Real-time updates not working**
   - Verify WebSocket connection
   - Check event listener setup
   - Ensure server is sending updates correctly

4. **Styling issues**
   - Check CSS import order
   - Verify Tailwind CSS configuration
   - Ensure custom styles are properly scoped

### Debug Mode

```typescript
// Enable debug mode for troubleshooting
const debugMode = process.env.NODE_ENV === 'development';

function DebugCalendar() {
  return (
    <EventCalendar
      events={events}
      onEventCreate={handleEventCreate}
      debug={debugMode}
      onDebug={(debugInfo) => {
        if (debugMode) {
          console.log('Calendar Debug:', debugInfo);
        }
      }}
    />
  );
}
```

## Support and Resources

- **Documentation**: Full API documentation and component references
- **Examples**: Complete working examples in the `/examples` directory
- **Community**: Join our Discord community for support
- **Issues**: Report bugs and request features on GitHub
- **Changelog**: Stay updated with the latest releases and changes

## Conclusion

The NeonPro calendar system provides a robust, healthcare-optimized solution for appointment management. By following the integration patterns in this guide, you can quickly implement powerful calendar functionality while maintaining compliance, performance, and accessibility standards.

For advanced use cases or custom requirements, refer to the individual component documentation or contact our support team.
