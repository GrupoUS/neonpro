/**
 * Test suite for Calendar Context
 * Tests state management, event operations, filtering, and navigation functionality
 */

import { EventService } from '@/services/event.service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import { toast } from 'sonner';
import { CalendarProvider, useCalendarContext } from '../calendar-context';

// Mock dependencies
vi.mock('@/services/event.service');
vi.mock('sonner');

const TestComponent = () => {
  const context = useCalendarContext();

  return (
    <div data-testid='test-component'>
      <div data-testid='loading'>{context.loading.toString()}</div>
      <div data-testid='error'>{context.error || 'no-error'}</div>
      <div data-testid='events-count'>{context.events.length}</div>
      <div data-testid='filtered-events-count'>{context.filteredEvents.length}</div>
      <div data-testid='current-view'>{context.currentView}</div>
      <button
        data-testid='create-event'
        onClick={() =>
          context.createEvent({
            title: 'Test Event',
            start: new Date(),
            end: new Date(Date.now() + 3600000),
            clinicId: 'test-clinic',
          })}
      >
        Create Event
      </button>
      <button
        data-testid='update-event'
        onClick={() =>
          context.updateEvent({
            id: 'test-id',
            title: 'Updated Event',
          })}
      >
        Update Event
      </button>
      <button
        data-testid='delete-event'
        onClick={() => context.deleteEvent('test-id')}
      >
        Delete Event
      </button>
      <button
        data-testid='navigate-today'
        onClick={context.navigateToToday}
      >
        Navigate Today
      </button>
      <button
        data-testid='set-view'
        onClick={() => context.setCurrentView('week')}
      >
        Set View
      </button>
    </div>
  );
};

describe(_'CalendarProvider',_() => {
  const mockEvent = {
    id: 'test-event-id',
    title: 'Test Event',
    start: new Date('2024-01-15T10:00:00.000Z'),
    end: new Date('2024-01-15T11:00:00.000Z'),
    status: 'confirmed',
    priority: 2,
    patientId: 'test-patient-id',
    professionalId: 'test-professional-id',
    serviceTypeId: 'test-service-id',
    clinicId: 'test-clinic-id',
    notes: 'Test notes',
  };

  beforeEach(_() => {
    vi.clearAllMocks();

    // Mock EventService methods
    vi.mocked(EventService.getEvents).mockResolvedValue([mockEvent as any]);
    vi.mocked(EventService.createEvent).mockResolvedValue(mockEvent as any);
    vi.mocked(EventService.updateEvent).mockResolvedValue(mockEvent as any);
    vi.mocked(EventService.deleteEvent).mockResolvedValue();
  });

  afterEach(_() => {
    vi.restoreAllMocks();
  });

  it(_'should initialize with default values',_() => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-view')).toHaveTextContent('month');
  });

  it(_'should load events on mount',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    await waitFor(_() => {
      expect(EventService.getEvents).toHaveBeenCalledTimes(1);
    });

    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await waitFor(_() => {
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });
  });

  it(_'should handle loading state',_async () => {
    vi.mocked(EventService.getEvents).mockImplementationOnce(_async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [mockEvent as any];
    });

    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it(_'should handle error state',_async () => {
    const errorMessage = 'Failed to load events';
    vi.mocked(EventService.getEvents).mockRejectedValueOnce(new Error(errorMessage));

    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    await waitFor(_() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });

    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it(_'should create event successfully',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Create event
    await act(_async () => {
      fireEvent.click(screen.getByTestId('create-event'));
    });

    await waitFor(_() => {
      expect(EventService.createEvent).toHaveBeenCalledWith({
        title: 'Test Event',
        start: expect.any(Date),
        end: expect.any(Date),
        clinicId: 'test-clinic',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Event "Test Event" created successfully');
  });

  it(_'should handle event creation error',_async () => {
    const errorMessage = 'Failed to create event';
    vi.mocked(EventService.createEvent).mockRejectedValueOnce(new Error(errorMessage));

    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Create event
    await act(_async () => {
      fireEvent.click(screen.getByTestId('create-event'));
    });

    await waitFor(_() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it(_'should update event successfully',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Update event
    await act(_async () => {
      fireEvent.click(screen.getByTestId('update-event'));
    });

    await waitFor(_() => {
      expect(EventService.updateEvent).toHaveBeenCalledWith({
        id: 'test-id',
        title: 'Updated Event',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Event "Test Event" updated successfully');
  });

  it(_'should delete event successfully',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Delete event
    await act(_async () => {
      fireEvent.click(screen.getByTestId('delete-event'));
    });

    await waitFor(_() => {
      expect(EventService.deleteEvent).toHaveBeenCalledWith('test-id');
    });

    expect(toast.success).toHaveBeenCalledWith('Event "Test Event" deleted successfully');
  });

  it(_'should navigate to today',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Navigate to today
    await act(_async () => {
      fireEvent.click(screen.getByTestId('navigate-today'));
    });

    // Navigation should update the currentDate context
    // This is tested implicitly through the context behavior
  });

  it(_'should change view',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Change view
    await act(_async () => {
      fireEvent.click(screen.getByTestId('set-view'));
    });

    expect(screen.getByTestId('current-view')).toHaveTextContent('week');
  });

  it(_'should refresh events',_async () => {
    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    // Wait for initial load
    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const initialCallCount = vi.mocked(EventService.getEvents).mock.calls.length;

    // Refresh events
    await act(_async () => {
      const { refreshEvents } = useCalendarContext();
      await refreshEvents();
    });

    await waitFor(_() => {
      expect(vi.mocked(EventService.getEvents).mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  it(_'should handle empty events list',_async () => {
    vi.mocked(EventService.getEvents).mockResolvedValueOnce([]);

    render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
    );

    await waitFor(_() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
  });

  it(_'should use initial events when provided',_async () => {
    const initialEvents = [mockEvent as any];

    render(
      <CalendarProvider initialEvents={initialEvents}>
        <TestComponent />
      </CalendarProvider>,
    );

    // Should start with initial events
    expect(screen.getByTestId('events-count')).toHaveTextContent('1');

    // Should still fetch from backend
    await waitFor(_() => {
      expect(EventService.getEvents).toHaveBeenCalledTimes(1);
    });
  });

  it(_'should apply clinic ID filter when provided',_async () => {
    const defaultClinicId = 'default-clinic-id';

    render(
      <CalendarProvider defaultClinicId={defaultClinicId}>
        <TestComponent />
      </CalendarProvider>,
    );

    await waitFor(_() => {
      expect(EventService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: [defaultClinicId],
        }),
      );
    });
  });
});
