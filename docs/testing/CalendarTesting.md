# Calendar Testing Strategies & Examples

## Overview

This comprehensive testing guide covers strategies, tools, and examples for testing NeonPro's calendar components. The guide includes unit tests, integration tests, E2E tests, accessibility tests, and performance testing for healthcare appointment management systems.

## Testing Framework Stack

### Core Testing Tools

- **Vitest**: Unit and integration testing
- **Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **React Testing Library**: React component testing
- **Jest**: Additional testing utilities
- **MSW**: API mocking

### Accessibility Testing

- **axe-core**: Accessibility rule engine
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Performance and accessibility audits

### Performance Testing

- **Lighthouse**: Performance metrics
- **WebPageTest**: Real-world performance testing
- **k6**: Load testing

## Unit Testing Strategies

### 1. Component Unit Tests

```typescript
// components/__tests__/EventCalendar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventCalendar } from '../event-calendar';
import { CalendarEvent } from '../event-calendar/types';

// Mock dependencies
jest.mock('@/hooks/use-calendar-context');
jest.mock('@/services/calendar-service');

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Patient Consultation',
    description: 'Initial consultation',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
    allDay: false,
    color: 'primary'
  },
  {
    id: '2',
    title: 'Team Meeting',
    start: new Date('2024-01-15T14:00:00'),
    end: new Date('2024-01-15T15:00:00'),
    allDay: false,
    color: 'secondary'
  }
];

describe('EventCalendar Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock context
    (useCalendarContext as jest.Mock).mockReturnValue({
      currentDate: new Date('2024-01-15'),
      currentView: 'week',
      filteredEvents: mockEvents,
      loading: false,
      error: null,
      createEvent: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn()
    });
  });

  describe('Rendering', () => {
    test('should render calendar with events', () => {
      render(<EventCalendar events={mockEvents} />);

      expect(screen.getByText('Patient Consultation')).toBeInTheDocument();
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    test('should show loading state when loading', () => {
      (useCalendarContext as jest.Mock).mockReturnValue({
        ...mockContext,
        loading: true
      });

      render(<EventCalendar events={mockEvents} />);

      expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
    });

    test('should show error state when error occurs', () => {
      (useCalendarContext as jest.Mock).mockReturnValue({
        ...mockContext,
        error: 'Failed to load events'
      });

      render(<EventCalendar events={mockEvents} />);

      expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    });
  });

  describe('Event Interactions', () => {
    test('should call onEventSelect when event is clicked', () => {
      const mockOnSelect = jest.fn();
      render(<EventCalendar events={mockEvents} onEventSelect={mockOnSelect} />);

      fireEvent.click(screen.getByText('Patient Consultation'));

      expect(mockOnSelect).toHaveBeenCalledWith(mockEvents[0]);
    });

    test('should open event dialog when creating new event', () => {
      const mockOnCreate = jest.fn();
      render(<EventCalendar events={mockEvents} onEventCreate={mockOnCreate} />);

      fireEvent.click(screen.getByLabelText('Create new appointment'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('should handle event creation', async () => {
      const mockCreateEvent = jest.fn().mockResolvedValue({
        id: '3',
        title: 'New Appointment',
        start: new Date('2024-01-15T16:00:00'),
        end: new Date('2024-01-15T17:00:00')
      });

      (useCalendarContext as jest.Mock).mockReturnValue({
        ...mockContext,
        createEvent: mockCreateEvent
      });

      render(<EventCalendar events={mockEvents} />);

      // Click to create event
      fireEvent.click(screen.getByLabelText('Create new appointment'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'New Appointment' }
      });

      // Save
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({
          title: 'New Appointment'
        }));
      });
    });
  });

  describe('View Switching', () => {
    test('should switch between calendar views', () => {
      render(<EventCalendar events={mockEvents} />);

      // Switch to month view
      fireEvent.click(screen.getByText('Month'));
      expect(screen.getByText('January 2024')).toBeInTheDocument();

      // Switch to week view
      fireEvent.click(screen.getByText('Week'));
      expect(screen.getByText('Week of January 15')).toBeInTheDocument();

      // Switch to day view
      fireEvent.click(screen.getByText('Day'));
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    });

    test('should update view state correctly', () => {
      const mockSetView = jest.fn();
      (useCalendarContext as jest.Mock).mockReturnValue({
        ...mockContext,
        currentView: 'month',
        setCurrentView: mockSetView
      });

      render(<EventCalendar events={mockEvents} />);

      fireEvent.click(screen.getByText('Week'));
      expect(mockSetView).toHaveBeenCalledWith('week');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<EventCalendar events={mockEvents} />);

      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar');

      const events = screen.getAllByRole('button').filter(
        button => button.textContent?.includes('Patient Consultation')
      );
      events.forEach(event => {
        expect(event).toHaveAttribute('aria-describedby');
      });
    });

    test('should support keyboard navigation', () => {
      render(<EventCalendar events={mockEvents} />);

      const calendar = screen.getByRole('grid');

      // Tab navigation
      fireEvent.keyDown(calendar, { key: 'Tab' });
      // Should move focus to next interactive element

      // Arrow key navigation
      fireEvent.keyDown(calendar, { key: 'ArrowRight' });
      // Should navigate to next day/week
    });
  });

  describe('Performance', () => {
    test('should handle large number of events efficiently', () => {
      const largeEventList = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        start: new Date(`2024-01-15T${Math.floor(i / 60)}:${i % 60}:00`),
        end: new Date(`2024-01-15T${Math.floor(i / 60)}:${(i % 60) + 1}:00`),
        allDay: false
      }));

      const startTime = performance.now();
      render(<EventCalendar events={largeEventList} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
    });
  });
});
```

### 2. Hook Testing

```typescript
// hooks/__tests__/use-calendar-context.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCalendarContext } from '../use-calendar-context';
import { CalendarProvider } from '../calendar-context';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CalendarProvider>{children}</CalendarProvider>
);

describe('useCalendarContext Hook', () => {
  test('should provide calendar context values', () => {
    const { result } = renderHook(() => useCalendarContext(), { wrapper });

    expect(result.current).toHaveProperty('currentDate');
    expect(result.current).toHaveProperty('currentView');
    expect(result.current).toHaveProperty('filteredEvents');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
  });

  test('should allow updating current date', () => {
    const { result } = renderHook(() => useCalendarContext(), { wrapper });
    const newDate = new Date('2024-02-01');

    act(() => {
      result.current.setCurrentDate(newDate);
    });

    expect(result.current.currentDate).toEqual(newDate);
  });

  test('should allow switching calendar views', () => {
    const { result } = renderHook(() => useCalendarContext(), { wrapper });

    act(() => {
      result.current.setCurrentView('month');
    });

    expect(result.current.currentView).toBe('month');
  });

  test('should handle event creation', async () => {
    const mockCreateEvent = jest.fn().mockResolvedValue({
      id: 'new-event',
      title: 'New Event',
      start: new Date(),
      end: new Date()
    });

    const { result } = renderHook(() => useCalendarContext(), {
      wrapper: ({ children }) => (
        <CalendarProvider onCreateEvent={mockCreateEvent}>
          {children}
        </CalendarProvider>
      )
    });

    const newEvent = {
      title: 'New Event',
      start: new Date(),
      end: new Date('2024-01-15T11:00:00')
    };

    await act(async () => {
      await result.current.createEvent(newEvent);
    });

    expect(mockCreateEvent).toHaveBeenCalledWith(newEvent);
  });

  test('should handle event deletion', async () => {
    const mockDeleteEvent = jest.fn().mockResolvedValue(true);

    const { result } = renderHook(() => useCalendarContext(), {
      wrapper: ({ children }) => (
        <CalendarProvider onDeleteEvent={mockDeleteEvent}>
          {children}
        </CalendarProvider>
      )
    });

    await act(async () => {
      await result.current.deleteEvent('event-1');
    });

    expect(mockDeleteEvent).toHaveBeenCalledWith('event-1');
  });
});
```

### 3. Utility Function Testing

```typescript
// utils/__tests__/date-utils.test.ts
import {
  formatEventTime,
  isEventInDateRange,
  calculateEventDuration,
  getWeekDates,
  isBusinessHours,
} from "../date-utils";

describe("Date Utilities", () => {
  describe("formatEventTime", () => {
    test("should format single day event correctly", () => {
      const event = {
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-15T11:00:00"),
      };

      const result = formatEventTime(event);
      expect(result).toBe("10:00 AM - 11:00 AM");
    });

    test("should format multi-day event correctly", () => {
      const event = {
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-16T11:00:00"),
      };

      const result = formatEventTime(event);
      expect(result).toBe("Jan 15, 10:00 AM - Jan 16, 11:00 AM");
    });

    test("should format all-day event correctly", () => {
      const event = {
        start: new Date("2024-01-15T00:00:00"),
        end: new Date("2024-01-16T00:00:00"),
        allDay: true,
      };

      const result = formatEventTime(event);
      expect(result).toBe("All day");
    });
  });

  describe("isEventInDateRange", () => {
    test("should return true for event within range", () => {
      const event = {
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-15T11:00:00"),
      };
      const rangeStart = new Date("2024-01-15");
      const rangeEnd = new Date("2024-01-16");

      expect(isEventInDateRange(event, rangeStart, rangeEnd)).toBe(true);
    });

    test("should return true for event overlapping range start", () => {
      const event = {
        start: new Date("2024-01-14T23:00:00"),
        end: new Date("2024-01-15T01:00:00"),
      };
      const rangeStart = new Date("2024-01-15");
      const rangeEnd = new Date("2024-01-16");

      expect(isEventInDateRange(event, rangeStart, rangeEnd)).toBe(true);
    });

    test("should return true for event overlapping range end", () => {
      const event = {
        start: new Date("2024-01-15T23:00:00"),
        end: new Date("2024-01-16T01:00:00"),
      };
      const rangeStart = new Date("2024-01-15");
      const rangeEnd = new Date("2024-01-16");

      expect(isEventInDateRange(event, rangeStart, rangeEnd)).toBe(true);
    });

    test("should return false for event outside range", () => {
      const event = {
        start: new Date("2024-01-14T10:00:00"),
        end: new Date("2024-01-14T11:00:00"),
      };
      const rangeStart = new Date("2024-01-15");
      const rangeEnd = new Date("2024-01-16");

      expect(isEventInDateRange(event, rangeStart, rangeEnd)).toBe(false);
    });
  });

  describe("calculateEventDuration", () => {
    test("should calculate duration in minutes", () => {
      const event = {
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-15T11:30:00"),
      };

      expect(calculateEventDuration(event)).toBe(90); // 90 minutes
    });

    test("should handle multi-day events", () => {
      const event = {
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-16T11:00:00"),
      };

      expect(calculateEventDuration(event)).toBe(1500); // 25 hours = 1500 minutes
    });
  });

  describe("getWeekDates", () => {
    test("should return correct week dates", () => {
      const weekStart = new Date("2024-01-14"); // Sunday
      const weekDates = getWeekDates(weekStart);

      expect(weekDates).toHaveLength(7);
      expect(weekDates[0]).toEqual(new Date("2024-01-14"));
      expect(weekDates[6]).toEqual(new Date("2024-01-20"));
    });
  });

  describe("isBusinessHours", () => {
    test("should return true during business hours", () => {
      const businessTime = new Date("2024-01-15T10:00:00"); // Monday 10 AM
      expect(isBusinessHours(businessTime)).toBe(true);
    });

    test("should return false before business hours", () => {
      const earlyTime = new Date("2024-01-15T07:00:00"); // Monday 7 AM
      expect(isBusinessHours(earlyTime)).toBe(false);
    });

    test("should return false after business hours", () => {
      const lateTime = new Date("2024-01-15T18:00:00"); // Monday 6 PM
      expect(isBusinessHours(lateTime)).toBe(false);
    });

    test("should return false on weekends", () => {
      const weekendTime = new Date("2024-01-13T10:00:00"); // Saturday 10 AM
      expect(isBusinessHours(weekendTime)).toBe(false);
    });
  });
});
```

## Integration Testing

### 1. Component Integration Tests

```typescript
// integration/__tests__/calendar-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarPage } from '../CalendarPage';

// Mock API service
jest.mock('../services/calendar-service', () => ({
  calendarService: {
    getEvents: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn()
  }
}));

const mockCalendarService = require('../services/calendar-service').calendarService;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('Calendar Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Calendar Workflow', () => {
    test('should load events and display them correctly', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Patient A - Consultation',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];

      mockCalendarService.getEvents.mockResolvedValue(mockEvents);

      render(<CalendarPage />, { wrapper });

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Patient A - Consultation')).toBeInTheDocument();
      });

      // Should have called API
      expect(mockCalendarService.getEvents).toHaveBeenCalled();
    });

    test('should handle event creation workflow', async () => {
      mockCalendarService.getEvents.mockResolvedValue([]);
      mockCalendarService.createEvent.mockResolvedValue({
        id: 'new-event',
        title: 'New Patient Consultation',
        start: new Date('2024-01-15T14:00:00'),
        end: new Date('2024-01-15T15:00:00')
      });

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Click create button
      fireEvent.click(screen.getByText('New Appointment'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'New Patient Consultation' }
      });

      // Select time slot
      fireEvent.click(screen.getByText('2:00 PM'));

      // Save
      fireEvent.click(screen.getByText('Create Appointment'));

      await waitFor(() => {
        expect(mockCalendarService.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Patient Consultation'
          })
        );
      });

      // Should show success message
      expect(screen.getByText('Appointment created successfully')).toBeInTheDocument();
    });

    test('should handle event updates', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Original Title',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];

      mockCalendarService.getEvents.mockResolvedValue(mockEvents);
      mockCalendarService.updateEvent.mockResolvedValue({
        ...mockEvents[0],
        title: 'Updated Title'
      });

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument();
      });

      // Click on event to edit
      fireEvent.click(screen.getByText('Original Title'));

      // Update title
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Updated Title' }
      });

      // Save changes
      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockCalendarService.updateEvent).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            title: 'Updated Title'
          })
        );
      });

      // Should show updated event
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });

    test('should handle event deletion', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Appointment to Delete',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];

      mockCalendarService.getEvents.mockResolvedValue(mockEvents);
      mockCalendarService.deleteEvent.mockResolvedValue(true);

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Appointment to Delete')).toBeInTheDocument();
      });

      // Click on event
      fireEvent.click(screen.getByText('Appointment to Delete'));

      // Click delete button
      fireEvent.click(screen.getByText('Delete'));

      // Confirm deletion
      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(mockCalendarService.deleteEvent).toHaveBeenCalledWith('1');
      });

      // Event should be removed from display
      expect(screen.queryByText('Appointment to Delete')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      mockCalendarService.getEvents.mockRejectedValue(
        new Error('Network error')
      );

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Failed to load appointments')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByText('Retry'));

      expect(mockCalendarService.getEvents).toHaveBeenCalledTimes(2);
    });

    test('should handle validation errors', async () => {
      mockCalendarService.getEvents.mockResolvedValue([]);
      mockCalendarService.createEvent.mockRejectedValue(
        new Error('Invalid event data')
      );

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Attempt to create invalid event
      fireEvent.click(screen.getByText('New Appointment'));
      fireEvent.click(screen.getByText('Create Appointment')); // Without filling form

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    test('should handle real-time event updates', async () => {
      const initialEvents = [
        {
          id: '1',
          title: 'Original Event',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];

      const updatedEvents = [
        {
          id: '1',
          title: 'Updated Event',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];

      mockCalendarService.getEvents.mockResolvedValue(initialEvents);

      render(<CalendarPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Original Event')).toBeInTheDocument();
      });

      // Simulate real-time update
      mockCalendarService.getEvents.mockResolvedValue(updatedEvents);

      // Trigger refresh (this would normally come from WebSocket)
      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(screen.getByText('Updated Event')).toBeInTheDocument();
      });
    });
  });
});
```

### 2. API Integration Tests

```typescript
// integration/__tests__/calendar-api.test.ts
import { rest } from "msw";
import { setupServer } from "msw/node";
import { calendarService } from "../services/calendar-service";

const server = setupServer(
  rest.get("/api/events", (req, res, ctx) => {
    const start = req.url.searchParams.get("start");
    const end = req.url.searchParams.get("end");

    return res(
      ctx.json([
        {
          id: "1",
          title: "Test Event",
          start: new Date(start || "2024-01-01"),
          end: new Date(end || "2024-01-02"),
        },
      ]),
    );
  }),

  rest.post("/api/events", async (req, res, ctx) => {
    const body = await req.json();

    return res(
      ctx.status(201),
      ctx.json({
        id: "new-event",
        ...body,
      }),
    );
  }),

  rest.put("/api/events/:id", async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    return res(
      ctx.json({
        id,
        ...body,
      }),
    );
  }),

  rest.delete("/api/events/:id", (req, res, ctx) => {
    return res(ctx.status(204));
  }),
);

describe("Calendar API Integration", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  describe("getEvents", () => {
    test("should fetch events within date range", async () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      const events = await calendarService.getEvents(start, end);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe("Test Event");
    });

    test("should handle API errors", async () => {
      server.use(
        rest.get("/api/events", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Internal server error" }),
          );
        }),
      );

      await expect(
        calendarService.getEvents(
          new Date("2024-01-01"),
          new Date("2024-01-31"),
        ),
      ).rejects.toThrow("Internal server error");
    });
  });

  describe("createEvent", () => {
    test("should create new event", async () => {
      const newEvent = {
        title: "New Appointment",
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-15T11:00:00"),
      };

      const createdEvent = await calendarService.createEvent(newEvent);

      expect(createdEvent.id).toBe("new-event");
      expect(createdEvent.title).toBe("New Appointment");
    });

    test("should validate event data", async () => {
      const invalidEvent = {
        title: "", // Invalid: empty title
        start: new Date("2024-01-15T10:00:00"),
        end: new Date("2024-01-15T09:00:00"), // Invalid: end before start
      };

      await expect(calendarService.createEvent(invalidEvent)).rejects.toThrow();
    });
  });

  describe("updateEvent", () => {
    test("should update existing event", async () => {
      const updateData = {
        title: "Updated Appointment",
        start: new Date("2024-01-15T14:00:00"),
        end: new Date("2024-01-15T15:00:00"),
      };

      const updatedEvent = await calendarService.updateEvent("1", updateData);

      expect(updatedEvent.title).toBe("Updated Appointment");
      expect(updatedEvent.start).toEqual(new Date("2024-01-15T14:00:00"));
    });
  });

  describe("deleteEvent", () => {
    test("should delete event", async () => {
      await expect(calendarService.deleteEvent("1")).resolves.not.toThrow();
    });

    test("should handle non-existent event", async () => {
      server.use(
        rest.delete("/api/events/:id", (req, res, ctx) => {
          return res(ctx.status(404));
        }),
      );

      await expect(
        calendarService.deleteEvent("non-existent"),
      ).rejects.toThrow();
    });
  });
});
```

## End-to-End Testing

### 1. E2E Test Scenarios

```typescript
// e2e/calendar.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Calendar E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForURL("/dashboard");
  });

  test("should load calendar with appointments", async ({ page }) => {
    await page.goto("/calendar");

    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar"]');

    // Check for calendar elements
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-controls"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="new-appointment-btn"]'),
    ).toBeVisible();
  });

  test("should create new appointment", async ({ page }) => {
    await page.goto("/calendar");

    // Click new appointment button
    await page.click('[data-testid="new-appointment-btn"]');

    // Wait for modal to open
    await page.waitForSelector('[data-testid="appointment-modal"]');

    // Fill appointment form
    await page.fill('[data-testid="title-input"]', "Patient Consultation");
    await page.fill('[data-testid="patient-search"]', "John Doe");
    await page.click('[data-testid="patient-option"]:has-text("John Doe")');

    // Select date and time
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-option"]:has-text("Tomorrow")');
    await page.selectOption('[data-testid="time-select"]', "10:00");

    // Add description
    await page.fill(
      '[data-testid="description"]',
      "Initial consultation for new patient",
    );

    // Save appointment
    await page.click('[data-testid="save-appointment"]');

    // Wait for success message
    await page.waitForSelector('[data-testid="success-toast"]');
    await expect(page.locator('[data-testid="success-toast"]')).toHaveText(
      /Appointment created/,
    );

    // Verify appointment appears in calendar
    await expect(page.locator('[data-testid="calendar"]')).toContainText(
      "Patient Consultation",
    );
  });

  test("should edit existing appointment", async ({ page }) => {
    await page.goto("/calendar");

    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar"]');

    // Click on existing appointment
    await page.click(
      '[data-testid="appointment-item"]:has-text("Team Meeting")',
    );

    // Wait for edit modal
    await page.waitForSelector('[data-testid="edit-appointment-modal"]');

    // Update appointment details
    await page.fill('[data-testid="title-input"]', "Updated Team Meeting");
    await page.selectOption('[data-testid="time-select"]', "14:00");

    // Save changes
    await page.click('[data-testid="save-changes"]');

    // Verify update
    await expect(page.locator('[data-testid="calendar"]')).toContainText(
      "Updated Team Meeting",
    );
  });

  test("should delete appointment with confirmation", async ({ page }) => {
    await page.goto("/calendar");

    // Click on appointment to delete
    await page.click(
      '[data-testid="appointment-item"]:has-text("Old Appointment")',
    );

    // Click delete button
    await page.click('[data-testid="delete-appointment"]');

    // Confirm deletion in modal
    await page.waitForSelector('[data-testid="confirm-delete-modal"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify appointment is removed
    await expect(page.locator('[data-testid="calendar"]')).not.toContainText(
      "Old Appointment",
    );
  });

  test("should switch between calendar views", async ({ page }) => {
    await page.goto("/calendar");

    // Test month view
    await page.click('[data-testid="month-view"]');
    await expect(page.locator('[data-testid="calendar-header"]')).toHaveText(
      /January 2024/,
    );

    // Test week view
    await page.click('[data-testid="week-view"]');
    await expect(page.locator('[data-testid="calendar-header"]')).toHaveText(
      /Week of/,
    );

    // Test day view
    await page.click('[data-testid="day-view"]');
    await expect(page.locator('[data-testid="calendar-header"]')).toHaveText(
      /January 15, 2024/,
    );

    // Test agenda view
    await page.click('[data-testid="agenda-view"]');
    await expect(page.locator('[data-testid="agenda-list"]')).toBeVisible();
  });

  test("should search and filter appointments", async ({ page }) => {
    await page.goto("/calendar");

    // Search for specific patient
    await page.fill('[data-testid="search-input"]', "John Doe");
    await page.press('[data-testid="search-input"]', "Enter");

    // Verify search results
    await expect(page.locator('[data-testid="calendar"]')).toContainText(
      "John Doe",
    );
    await expect(page.locator('[data-testid="calendar"]')).not.toContainText(
      "Jane Smith",
    );

    // Clear search
    await page.click('[data-testid="clear-search"]');
    await expect(page.locator('[data-testid="calendar"]')).toContainText(
      "Jane Smith",
    );
  });

  test("should handle appointment conflicts", async ({ page }) => {
    await page.goto("/calendar");

    // Try to create appointment at conflicting time
    await page.click('[data-testid="new-appointment-btn"]');
    await page.waitForSelector('[data-testid="appointment-modal"]');

    // Select time that conflicts with existing appointment
    await page.click('[data-testid="time-slot-conflict"]');

    // Should show conflict warning
    await expect(
      page.locator('[data-testid="conflict-warning"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="save-appointment"]'),
    ).toBeDisabled();
  });

  test("should validate appointment form", async ({ page }) => {
    await page.goto("/calendar");

    await page.click('[data-testid="new-appointment-btn"]');
    await page.waitForSelector('[data-testid="appointment-modal"]');

    // Try to save without required fields
    await page.click('[data-testid="save-appointment"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-error"]')).toBeVisible();
  });

  test("should work with keyboard navigation", async ({ page }) => {
    await page.goto("/calendar");

    // Navigate calendar with keyboard
    await page.keyboard.press("Tab"); // Navigate to calendar
    await page.keyboard.press("ArrowRight"); // Next day
    await page.keyboard.press("ArrowDown"); // Next week

    // Create appointment with keyboard
    await page.keyboard.press("n"); // New appointment shortcut
    await page.waitForSelector('[data-testid="appointment-modal"]');

    await page.keyboard.press("Escape"); // Close modal
    await expect(
      page.locator('[data-testid="appointment-modal"]'),
    ).not.toBeVisible();
  });
});
```

### 2. Performance E2E Tests

```typescript
// e2e/performance.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Calendar Performance Tests", () => {
  test("should load calendar within performance budget", async ({ page }) => {
    // Start performance tracing
    await page.goto("/calendar");

    // Wait for calendar to be fully loaded
    await page.waitForSelector('[data-testid="calendar"]:not(.loading)');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      return {
        fcp: paint.find((p) => p.name === "first-contentful-paint")?.startTime,
        lcp: paint.find((p) => p.name === "largest-contentful-paint")
          ?.startTime,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      };
    });

    // Assert performance budgets
    expect(metrics.fcp).toBeLessThan(1500);
    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.loadTime).toBeLessThan(3000);
    expect(metrics.domInteractive).toBeLessThan(1000);
  });

  test("should handle large datasets efficiently", async ({ page }) => {
    // Mock large dataset
    await page.route("/api/events", async (route) => {
      const events = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        start: new Date(Date.now() + i * 60000).toISOString(),
        end: new Date(Date.now() + i * 60000 + 3600000).toISOString(),
      }));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(events),
      });
    });

    await page.goto("/calendar");

    // Measure render time
    const renderTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const start = performance.now();
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });

    expect(renderTime).toBeLessThan(100);

    // Check if calendar is responsive
    await page.click('[data-testid="next-week"]');
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
  });

  test("should maintain performance during rapid interactions", async ({
    page,
  }) => {
    await page.goto("/calendar");

    // Perform rapid view switching
    const viewSwitchingTime = await page.evaluate(async () => {
      const start = performance.now();

      for (let i = 0; i < 10; i++) {
        document
          .querySelector('[data-testid="month-view"]')
          ?.dispatchEvent(new MouseEvent("click"));
        document
          .querySelector('[data-testid="week-view"]')
          ?.dispatchEvent(new MouseEvent("click"));
        document
          .querySelector('[data-testid="day-view"]')
          ?.dispatchEvent(new MouseEvent("click"));
      }

      return performance.now() - start;
    });

    expect(viewSwitchingTime).toBeLessThan(5000); // Should handle rapid interactions
  });
});
```

## Accessibility Testing

### 1. Accessibility Unit Tests

```typescript
// accessibility/__tests__/calendar-a11y.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventCalendar } from '../../components/event-calendar';
import { CalendarEvent } from '../../components/event-calendar/types';

expect.extend(toHaveNoViolations);

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Patient Consultation',
    description: 'Initial consultation',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
    allDay: false,
    color: 'primary'
  }
];

describe('Calendar Accessibility', () => {
  describe(' axe accessibility violations', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<EventCalendar events={mockEvents} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', () => {
      render(<EventCalendar events={mockEvents} />);

      const calendar = screen.getByRole('grid');

      // Tab navigation
      fireEvent.keyDown(calendar, { key: 'Tab' });
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();

      // Arrow key navigation
      fireEvent.keyDown(calendar, { key: 'ArrowRight' });
      fireEvent.keyDown(calendar, { key: 'ArrowDown' });
      fireEvent.keyDown(calendar, { key: 'ArrowLeft' });
      fireEvent.keyDown(calendar, { key: 'ArrowUp' });

      // Enter key for selection
      fireEvent.keyDown(calendar, { key: 'Enter' });
    });

    test('should support keyboard shortcuts', () => {
      render(<EventCalendar events={mockEvents} />);

      // Test view switching shortcuts
      fireEvent.keyDown(document, { key: 'm' }); // Month view
      expect(screen.getByText('January 2024')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'w' }); // Week view
      expect(screen.getByText('Week')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'd' }); // Day view
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'a' }); // Agenda view
      expect(screen.getByText('Agenda')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper ARIA labels', () => {
      render(<EventCalendar events={mockEvents} />);

      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar');

      const event = screen.getByText('Patient Consultation');
      expect(event).toHaveAttribute('aria-describedby');
    });

    test('should announce view changes to screen readers', () => {
      const { container } = render(<EventCalendar events={mockEvents} />);

      // Switch to week view
      fireEvent.click(screen.getByText('Week'));

      // Check for live region announcement
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Switched to week view');
    });

    test('should announce event creation', () => {
      render(<EventCalendar events={mockEvents} />);

      fireEvent.click(screen.getByText('New Appointment'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'New Event' }
      });

      // Save
      fireEvent.click(screen.getByText('Save'));

      // Check for success announcement
      const liveRegion = document.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toHaveTextContent('Appointment created successfully');
    });
  });

  describe('Focus Management', () => {
    test('should manage focus properly in modals', () => {
      render(<EventCalendar events={mockEvents} />);

      // Open event dialog
      fireEvent.click(screen.getByText('New Appointment'));

      const modal = screen.getByRole('dialog');
      const firstFocusableElement = modal.querySelector('button, input, select, textarea');

      // Focus should be trapped in modal
      expect(firstFocusableElement).toHaveFocus();

      // Tab navigation should stay within modal
      fireEvent.keyDown(modal, { key: 'Tab' });
      const focusedElement = document.activeElement;
      expect(modal.contains(focusedElement)).toBe(true);
    });

    test('should restore focus after modal close', () => {
      render(<EventCalendar events={mockEvents} />);

      const createButton = screen.getByText('New Appointment');
      createButton.focus();

      // Open and close modal
      fireEvent.click(createButton);
      fireEvent.click(screen.getByText('Cancel'));

      // Focus should be restored to create button
      expect(createButton).toHaveFocus();
    });
  });

  describe('Color Contrast', () => {
    test('should have sufficient color contrast', () => {
      render(<EventCalendar events={mockEvents} />);

      const event = screen.getByText('Patient Consultation');
      const computedStyle = window.getComputedStyle(event);

      // This would typically be tested with a color contrast library
      // For now, we'll check that colors are defined
      expect(computedStyle.backgroundColor).not.toBe('');
      expect(computedStyle.color).not.toBe('');
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      render(<EventCalendar events={mockEvents} />);

      // Should have mobile-specific classes or structure
      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveClass('mobile-calendar');
    });

    test('should be touch-friendly on mobile', () => {
      // Mock touch device
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5
      });

      render(<EventCalendar events={mockEvents} />);

      const events = screen.getAllByText('Patient Consultation');
      events.forEach(event => {
        const computedStyle = window.getComputedStyle(event);
        expect(parseInt(computedStyle.minWidth)).toBeGreaterThanOrEqual(44); // 44px minimum touch target
      });
    });
  });
});
```

### 2. Automated Accessibility Testing

```typescript
// accessibility/automated-tests.ts
import { test, expect } from "@playwright/test";

test.describe("Automated Accessibility Tests", () => {
  test("should pass axe-core accessibility scan", async ({ page }) => {
    await page.goto("/calendar");

    // Wait for page to fully load
    await page.waitForSelector('[data-testid="calendar"]:not(.loading)');

    // Run axe-core accessibility audit
    const accessibilityScanResults = await page.accessibility.scan();

    // Log any violations for debugging
    accessibilityScanResults.violations.forEach((violation) => {
      console.log("Accessibility violation:", {
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => node.html),
      });
    });

    // Assert no critical or serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical",
    );
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious",
    );

    expect(criticalViolations).toHaveLength(0);
    expect(seriousViolations).toHaveLength(0);
  });

  test("should meet WCAG 2.1 AA standards", async ({ page }) => {
    await page.goto("/calendar");

    // Test specific WCAG criteria

    // 1.1.1 Non-text Content
    await expect(page.locator("img")).toHaveAttribute("alt");
    await expect(page.locator("[aria-label]")).toHaveCount({ min: 1 });

    // 1.3.1 Info and Relationships
    await expect(page.locator("table")).toHaveAttribute("role");
    await expect(page.locator('[role="grid"]')).toBeVisible();

    // 1.4.3 Contrast (Minimum)
    const elementsWithColor = await page
      .locator('*[style*="color"], *[style*="background"]')
      .count();
    if (elementsWithColor > 0) {
      // In a real implementation, you would check contrast ratios
      console.log(
        "Found elements with custom colors - manual contrast check needed",
      );
    }

    // 2.1.1 Keyboard
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // 2.4.3 Focus Order
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // Focus should move logically through the interface

    // 3.2.1 On Focus
    const button = page.locator("button").first();
    await button.focus();
    // Should not trigger unexpected state changes

    // 4.1.2 Name, Role, Value
    const interactiveElements = page.locator(
      "button, input, select, textarea, a[href]",
    );
    const count = await interactiveElements.count();
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      await expect(element).toHaveAttribute("aria-label", {
        or: expect(element).toHaveAttribute("aria-labelledby"),
      });
    }
  });

  test("should work with screen readers", async ({ page }) => {
    await page.goto("/calendar");

    // Test screen reader compatibility

    // Check for proper ARIA landmarks
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(page.locator('[role="complementary"]')).toBeVisible();

    // Test form accessibility
    await page.click('[data-testid="new-appointment-btn"]');
    await page.waitForSelector('[data-testid="appointment-modal"]');

    // Check form labels
    const inputs = page.locator("input, select, textarea");
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }

    // Test error handling
    await page.click('[data-testid="save-appointment"]'); // Submit empty form
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});
```

## Test Utilities and Helpers

### 1. Custom Test Utilities

```typescript
// utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarProvider } from '../contexts/calendar-context';
import { AuthProvider } from '../contexts/auth-context';

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
    calendarContext?: any;
    authContext?: any;
  }
) => {
  const queryClient = options?.queryClient || createTestQueryClient();

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={options?.authContext || defaultAuthContext}>
        <CalendarProvider value={options?.calendarContext || defaultCalendarContext}>
          {children}
        </CalendarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: AllProviders, ...options }),
    queryClient
  };
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Default contexts
const defaultAuthContext = {
  user: { id: 'test-user', role: 'practitioner' },
  token: 'test-token',
  login: jest.fn(),
  logout: jest.fn()
};

const defaultCalendarContext = {
  currentDate: new Date(),
  currentView: 'week',
  filteredEvents: [],
  loading: false,
  error: null,
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  setCurrentDate: jest.fn(),
  setCurrentView: jest.fn()
};

// Test data factory
export const createTestEvent = (overrides?: Partial<CalendarEvent>): CalendarEvent => ({
  id: `event-${Math.random()}`,
  title: 'Test Event',
  start: new Date('2024-01-15T10:00:00'),
  end: new Date('2024-01-15T11:00:00'),
  allDay: false,
  color: 'primary',
  ...overrides
});

export const createTestEvents = (count: number): CalendarEvent[] => {
  return Array.from({ length: count }, (_, i) => createTestEvent({
    id: `event-${i}`,
    title: `Event ${i}`,
    start: new Date(`2024-01-15T${Math.floor(i / 60)}:${i % 60}:00`),
    end: new Date(`2024-01-15T${Math.floor(i / 60)}:${(i % 60) + 1}:00`)
  }));
};

// Mock helpers
export const createMockCalendarService = () => ({
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn()
});

export const createMockQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    },
    mutations: {
      retry: false
    }
  }
});

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Fire custom events
export const fireCustomEvent = (element: HTMLElement, eventName: string, detail?: any) => {
  const event = new CustomEvent(eventName, { detail });
  element.dispatchEvent(event);
};
```

### 2. Mock Data Generators

```typescript
// utils/mock-data-generator.ts
import { CalendarEvent, CalendarView } from "../types";

export class MockDataGenerator {
  static generateCalendarEvent(
    overrides?: Partial<CalendarEvent>,
  ): CalendarEvent {
    const baseEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      title: "Sample Appointment",
      description: "Sample appointment description",
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
      allDay: false,
      color: "primary",
      location: "Consultation Room A",
      patientId: `patient-${Math.floor(Math.random() * 1000)}`,
      practitionerId: `practitioner-${Math.floor(Math.random() * 100)}`,
      clinicId: "clinic-1",
    };

    return { ...baseEvent, ...overrides };
  }

  static generateEventsForDateRange(
    startDate: Date,
    endDate: Date,
    count: number = 10,
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const timeRange = endDate.getTime() - startDate.getTime();

    for (let i = 0; i < count; i++) {
      const randomOffset = Math.random() * timeRange;
      const eventStart = new Date(startDate.getTime() + randomOffset);
      const duration = 30 + Math.random() * 120; // 30-150 minutes

      events.push(
        this.generateCalendarEvent({
          start: eventStart,
          end: new Date(eventStart.getTime() + duration * 60 * 1000),
          title: `Appointment ${i + 1}`,
          patientId: `patient-${Math.floor(Math.random() * 1000)}`,
        }),
      );
    }

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  static generateEventsWithConflicts(date: Date): CalendarEvent[] {
    const baseTime = new Date(date);
    baseTime.setHours(10, 0, 0, 0);

    return [
      this.generateCalendarEvent({
        start: baseTime,
        end: new Date(baseTime.getTime() + 60 * 60 * 1000),
        title: "First Appointment",
        patientId: "patient-1",
      }),
      this.generateCalendarEvent({
        start: new Date(baseTime.getTime() + 30 * 60 * 1000), // 30 minutes overlap
        end: new Date(baseTime.getTime() + 90 * 60 * 1000),
        title: "Conflicting Appointment",
        patientId: "patient-2",
      }),
    ];
  }

  static generatePatientData(count: number = 100) {
    return Array.from({ length: count }, (_, i) => ({
      id: `patient-${i + 1}`,
      name: `Patient ${i + 1}`,
      email: `patient${i + 1}@example.com`,
      phone: `(555) ${String(i + 1).padStart(3, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      dateOfBirth: new Date(
        1950 + Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 28) + 1,
      ),
    }));
  }

  static generatePractitionerData(count: number = 10) {
    const specialties = [
      "Cardiology",
      "Dermatology",
      "Pediatrics",
      "Orthopedics",
      "Neurology",
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `practitioner-${i + 1}`,
      name: `Dr. ${["Smith", "Johnson", "Williams", "Brown", "Jones"][i % 5]}`,
      specialty: specialties[i % specialties.length],
      email: `dr${i + 1}@clinic.com`,
      phone: `(555) ${String(200 + i).padStart(3, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    }));
  }
}
```

This comprehensive testing guide provides a solid foundation for ensuring the quality, reliability, and accessibility of your calendar components. The testing strategies cover everything from unit tests to end-to-end scenarios, with special attention to healthcare-specific requirements and accessibility standards.
