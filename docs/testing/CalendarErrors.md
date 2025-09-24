# Calendar Error Handling Catalog

## Overview

This comprehensive error handling catalog covers common issues, solutions, and best practices for working with NeonPro's calendar components. Each error includes identification patterns, root causes, and resolution strategies.

## Error Categories

### 1. Initialization Errors

#### Error: CalendarContextNotAvailable

```typescript
// Error Message
"Calendar context not available. Make sure to wrap your calendar with CalendarProvider."

// When it occurs
- Using calendar components outside CalendarProvider
- Missing context provider in component tree
- Incorrect context import

// Solution
import { CalendarProvider } from '@/components/event-calendar/calendar-context';

function App() {
  return (
    <CalendarProvider>
      <EventCalendar />
    </CalendarProvider>
  );
}
```

#### Error: InvalidDateFormat

```typescript
// Error Message
"Invalid date format. Expected Date object or ISO string."

// When it occurs
- Passing string dates instead of Date objects
- Invalid ISO date strings
- Mixed timezone handling

// Solution
const handleEventCreate = (startTime: string | Date) => {
  const date = typeof startTime === 'string' ? new Date(startTime) : startTime;

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  // Continue with valid date
};
```

### 2. Event Management Errors

#### Error: EventConflict

```typescript
// Error Message
"Event conflicts with existing appointment(s)."

// Identification
- Overlapping time slots
- Resource double-booking
- Practitioner schedule conflicts

// Root Causes
- Missing conflict detection logic
- Concurrent booking attempts
- Insufficient validation

// Solutions
// 1. Implement conflict detection
const checkForConflicts = (newEvent: CalendarEvent, existingEvents: CalendarEvent[]) => {
  return existingEvents.filter(event =>
    event.id !== newEvent.id &&
    !(event.end <= newEvent.start || event.start >= newEvent.end) &&
    (event.resourceId === newEvent.resourceId || !event.resourceId)
  );
};

// 2. Handle conflicts gracefully
const handleEventCreate = async (event: CalendarEvent) => {
  const conflicts = checkForConflicts(event, existingEvents);

  if (conflicts.length > 0) {
    showConflictDialog({
      newEvent: event,
      conflictingEvents: conflicts,
      onResolve: handleConflictResolution
    });
    return;
  }

  await createEvent(event);
};

// 3. Add optimistic UI updates
const [optimisticEvents, setOptimisticEvents] = useState<CalendarEvent[]>([]);

const handleOptimisticCreate = (event: CalendarEvent) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticEvent = { ...event, id: tempId, status: 'optimistic' };

  setOptimisticEvents(prev => [...prev, optimisticEvent]);

  createEvent(event)
    .then(savedEvent => {
      setOptimisticEvents(prev =>
        prev.filter(e => e.id !== tempId)
      );
      setEvents(prev => [...prev, savedEvent]);
    })
    .catch(error => {
      setOptimisticEvents(prev =>
        prev.filter(e => e.id !== tempId)
      );
      showErrorToast('Failed to create event');
    });
};
```

#### Error: InvalidEventDuration

```typescript
// Error Message
"Event duration must be positive and within allowed limits."

// When it occurs
- End time before start time
- Duration exceeds maximum allowed
- Negative duration calculations

// Solution
const validateEventDuration = (event: CalendarEvent) => {
  if (event.start >= event.end) {
    throw new Error('Event end time must be after start time');
  }

  const duration = event.end.getTime() - event.start.getTime();
  const maxDuration = 12 * 60 * 60 * 1000; // 12 hours max

  if (duration > maxDuration) {
    throw new Error('Event duration cannot exceed 12 hours');
  }

  if (duration < 15 * 60 * 1000) { // 15 minutes minimum
    throw new Error('Event duration must be at least 15 minutes');
  }
};
```

### 3. API Integration Errors

#### Error: NetworkError

```typescript
// Error Message
"Failed to connect to calendar service. Please check your network connection."

// Identification
- HTTP 5xx errors
- Connection timeouts
- CORS issues

// Solutions
// 1. Implement retry logic with exponential backoff
const createEventWithRetry = async (event: CalendarEvent, maxRetries = 3) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await calendarApi.createEvent(event);
    } catch (error) {
      lastError = error;

      if (i === maxRetries - 1) break;

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// 2. Add network status detection
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

// 3. Implement offline mode
const useOfflineCalendar = () => {
  const [offlineEvents, setOfflineEvents] = useState<CalendarEvent[]>([]);

  const syncOfflineEvents = async () => {
    for (const event of offlineEvents) {
      try {
        await calendarApi.createEvent(event);
        setOfflineEvents(prev => prev.filter(e => e.id !== event.id));
      } catch (error) {
        console.error('Failed to sync offline event:', error);
      }
    }
  };

  return { offlineEvents, syncOfflineEvents };
};
```

#### Error: AuthenticationError

```typescript
// Error Message
"Authentication required. Please log in to access calendar features."

// When it occurs
- Expired tokens
- Invalid credentials
- Missing permissions

// Solution
const useCalendarAuth = () => {
  const { user, token, refreshAuth } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const authenticatedRequest = async (request: () => Promise<any>) => {
    if (!token) {
      setAuthError('Authentication required');
      throw new Error('Authentication required');
    }

    try {
      return await request();
    } catch (error: any) {
      if (error.status === 401) {
        // Try to refresh token
        try {
          await refreshAuth();
          return await request();
        } catch (refreshError) {
          setAuthError('Session expired. Please log in again.');
          throw refreshError;
        }
      }
      throw error;
    }
  };

  return { authenticatedRequest, authError };
};
```

### 4. Performance Errors

#### Error: TooManyEvents

```typescript
// Error Message
"Too many events to display. Please filter your view or use a different time range."

// When it occurs
- Loading more than 1000 events
- Memory usage spikes
- UI becomes unresponsive

// Solutions
// 1. Implement virtual scrolling
const VirtualizedEventList = ({ events }: { events: CalendarEvent[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const visibleEvents = useMemo(() =>
    events.slice(visibleRange.start, visibleRange.end),
    [events, visibleRange]
  );

  return (
    <div className="virtualized-container">
      {visibleEvents.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
};

// 2. Add pagination
const usePaginatedEvents = (events: CalendarEvent[], pageSize = 50) => {
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedEvents = useMemo(() => {
    const start = currentPage * pageSize;
    return events.slice(start, start + pageSize);
  }, [events, currentPage, pageSize]);

  const totalPages = Math.ceil(events.length / pageSize);

  return {
    events: paginatedEvents,
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0
  };
};

// 3. Implement lazy loading
const useLazyEventLoading = (initialEvents: CalendarEvent[]) => {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreEvents = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const newEvents = await calendarApi.getEvents(
        events[events.length - 1].end,
        addDays(events[events.length - 1].end, 7)
      );

      if (newEvents.length === 0) {
        setHasMore(false);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }
    } catch (error) {
      console.error('Failed to load more events:', error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, hasMore, loadMoreEvents };
};
```

#### Error: MemoryLeak

```typescript
// Error Message
"Memory leak detected in calendar component."

// Identification
- Increasing memory usage over time
- Unnecessary re-renders
- Unclosed event listeners

// Solutions
// 1. Proper cleanup
function CalendarComponent() {
  useEffect(() => {
    const handleResize = () => {
      // Handle window resize
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <EventCalendar />;
}

// 2. Memoization
const MemoizedCalendar = React.memo(EventCalendar);

// 3. Debounced handlers
const useDebouncedHandler = (handler: Function, delay: number) => {
  const debouncedHandler = useMemo(
    () => debounce(handler, delay),
    [handler, delay]
  );

  return debouncedHandler;
};
```

### 5. Healthcare Compliance Errors

#### Error: LGPDComplianceViolation

```typescript
// Error Message
"LGPD compliance violation detected. Action cannot be completed."

// When it occurs
- Unauthorized data access
- Missing consent
- Improper data handling

// Solutions
// 1. Implement compliance checks
const checkLGPDCompliance = async (action: string, data: any) => {
  const complianceCheck = await complianceService.validate({
    action,
    data,
    user: currentUser,
    timestamp: new Date()
  });

  if (!complianceCheck.valid) {
    throw new Error(`LGPD violation: ${complianceCheck.reason}`);
  }

  return complianceCheck;
};

// 2. Add audit logging
const auditLog = async (action: string, details: any) => {
  await auditService.log({
    action,
    userId: currentUser.id,
    timestamp: new Date(),
    details,
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent
  });
};

// 3. Implement data minimization
const minimizeEventData = (event: CalendarEvent): Partial<CalendarEvent> => {
  const { id, title, start, end, allDay } = event;
  return { id, title, start, end, allDay };
};
```

#### Error: HealthcareDataValidation

```typescript
// Error Message
'Invalid healthcare data. Please check appointment details.'

// Solutions
// 1. Validate healthcare-specific fields
const validateHealthcareEvent = (event: CalendarEvent) => {
  const requiredFields = ['patientId', 'practitionerId', 'appointmentType']

  for (const field of requiredFields) {
    if (!event[field as keyof CalendarEvent]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Validate appointment type
  const validTypes = ['consultation', 'follow-up', 'procedure', 'emergency']
  if (!validTypes.includes(event.appointmentType as string)) {
    throw new Error('Invalid appointment type')
  }
}

// 2. Add business rules validation
const validateBusinessRules = (event: CalendarEvent) => {
  // Check if practitioner is available
  const practitionerAvailable = checkPractitionerAvailability(
    event.practitionerId,
    event.start,
    event.end,
  )

  if (!practitionerAvailable) {
    throw new Error('Practitioner is not available at selected time')
  }

  // Check if patient has required documentation
  const patientDocumentation = getPatientDocumentation(event.patientId)
  if (!patientDocumentation.complete) {
    throw new Error('Patient documentation is incomplete')
  }
}
```

### 6. Browser Compatibility Errors

#### Error: BrowserNotSupported

```typescript
// Error Message
'Your browser is not supported. Please upgrade to a modern browser.'

// Detection and Handling
const useBrowserCompatibility = () => {
  const [isCompatible, setIsCompatible] = useState(true)
  const [browserInfo, setBrowserInfo] = useState<any>(null)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const browser = detectBrowser(userAgent)

    setBrowserInfo(browser)

    const supportedBrowsers = {
      chrome: { minVersion: 90 },
      firefox: { minVersion: 88 },
      safari: { minVersion: 14 },
      edge: { minVersion: 90 },
    }

    const isSupported =
      supportedBrowsers[browser.name as keyof typeof supportedBrowsers]?.minVersion
        <= browser.version

    setIsCompatible(isSupported)

    if (!isSupported) {
      console.warn(`Browser ${browser.name} ${browser.version} is not supported`)
    }
  }, [])

  return { isCompatible, browserInfo }
}

// Usage
function CalendarWrapper() {
  const { isCompatible, browserInfo } = useBrowserCompatibility()

  if (!isCompatible) {
    return (
      <div className='browser-unsupported'>
        <h2>Browser Not Supported</h2>
        <p>
          Your browser ({browserInfo.name}{' '}
          {browserInfo.version}) is not supported. Please upgrade to a modern browser.
        </p>
        <div className='supported-browsers'>
          <a href='https://www.google.com/chrome/'>Chrome 90+</a>
          <a href='https://www.mozilla.org/firefox/'>Firefox 88+</a>
          <a href='https://www.apple.com/safari/'>Safari 14+</a>
          <a href='https://www.microsoft.com/edge/'>Edge 90+</a>
        </div>
      </div>
    )
  }

  return <EventCalendar />
}
```

## Error Recovery Patterns

### 1. Retry Pattern

```typescript
const useRetry = (fn: Function, maxRetries = 3) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = async (...args: any[]) => {
    setIsLoading(true)
    setError(null)

    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn(...args)
        setIsLoading(false)
        return result
      } catch (err) {
        lastError = err

        if (i === maxRetries - 1) break

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }

    setIsLoading(false)
    setError(lastError)
    throw lastError
  }

  return { execute, isLoading, error }
}
```

### 2. Fallback Pattern

```typescript
const CalendarWithFallback = () => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <SimpleCalendarFallback />
  }

  return (
    <ErrorBoundary
      fallback={<SimpleCalendarFallback />}
      onError={() => setHasError(true)}
    >
      <EventCalendar />
    </ErrorBoundary>
  )
}
```

### 3. Degraded Mode Pattern

```typescript
const useDegradedMode = () => {
  const [mode, setMode] = useState<'full' | 'basic' | 'offline'>('full')

  useEffect(() => {
    const handleConnectionChange = () => {
      if (!navigator.onLine) {
        setMode('offline')
      } else {
        // Check if we can recover to full mode
        checkApiHealth().then((isHealthy) => {
          setMode(isHealthy ? 'full' : 'basic')
        })
      }
    }

    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    return () => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
    }
  }, [])

  return { mode }
}

function DegradedCalendar() {
  const { mode } = useDegradedMode()

  switch (mode) {
    case 'offline':
      return <OfflineCalendar />
    case 'basic':
      return <BasicCalendar />
    default:
      return <EventCalendar />
  }
}
```

## Debugging Tools

### 1. Calendar Debug Panel

```typescript
const CalendarDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      browser: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      eventsCount: events.length,
      view: currentView,
      performance: performance.getEntriesByType('measure'),
    }

    setDebugInfo(info)
  }, [events, currentView])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className='debug-panel'>
      <h3>Calendar Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )
}
```

### 2. Performance Monitor

```typescript
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    eventCount: 0,
    memoryUsage: 0,
  })

  useEffect(() => {
    const measurePerformance = () => {
      const start = performance.now()

      // Measure render performance
      const end = performance.now()

      setMetrics((prev) => ({
        ...prev,
        renderTime: end - start,
        eventCount: events.length,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      }))
    }

    const interval = setInterval(measurePerformance, 5000)

    return () => clearInterval(interval)
  }, [events])

  return metrics
}
```

## Prevention Strategies

### 1. Input Validation

```typescript
const validateCalendarEvent = (event: Partial<CalendarEvent>) => {
  const errors: string[] = []

  if (!event.title || event.title.trim().length === 0) {
    errors.push('Event title is required')
  }

  if (!event.start || !(event.start instanceof Date)) {
    errors.push('Valid start time is required')
  }

  if (!event.end || !(event.end instanceof Date)) {
    errors.push('Valid end time is required')
  }

  if (event.start && event.end && event.start >= event.end) {
    errors.push('End time must be after start time')
  }

  return errors
}
```

### 2. Type Safety

```typescript
// Use strict TypeScript
type StrictCalendarEvent =
  & Required<
    Pick<CalendarEvent, 'id' | 'title' | 'start' | 'end'>
  >
  & Partial<Omit<CalendarEvent, 'id' | 'title' | 'start' | 'end'>>

const createStrictEvent = (event: StrictCalendarEvent) => {
  // TypeScript will enforce required fields
  return event
}
```

### 3. Error Boundaries

```typescript
class CalendarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Calendar Error:', error, errorInfo)

    // Log error to monitoring service
    errorMonitoringService.captureException(error, {
      component: 'Calendar',
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className='calendar-error'>
          <h3>Calendar Error</h3>
          <p>Something went wrong with the calendar. Please refresh the page.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Best Practices

### 1. Always Validate Input

```typescript
const handleEventCreate = (eventData: any) => {
  try {
    const validatedEvent = validateAndNormalizeEvent(eventData)
    await createEvent(validatedEvent)
  } catch (error) {
    handleValidationError(error)
  }
}
```

### 2. Provide User Feedback

```typescript
const useToast = () => {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
  ) => {
    // Implementation depends on your toast library
  }

  return { showToast }
}
```

### 3. Log Everything

```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[Calendar] ${message}`, data)
    // Send to logging service
  },
  error: (error: Error, context?: any) => {
    console.error(`[Calendar Error] ${error.message}`, { error, context })
    // Send to error monitoring
  },
  warn: (message: string, data?: any) => {
    console.warn(`[Calendar Warning] ${message}`, data)
  },
}
```

### 4. Test Error Scenarios

```typescript
describe('Calendar Error Handling', () => {
  test('handles network errors gracefully', async () => {
    // Mock network error
    jest
      .spyOn(calendarApi, 'createEvent')
      .mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCalendar())

    await act(async () => {
      await expect(result.current.createEvent(mockEvent)).rejects.toThrow()
    })

    expect(result.current.error).toBe(
      'Failed to create event. Please try again.',
    )
  })
})
```

This comprehensive error handling catalog provides developers with the tools and knowledge to effectively manage and prevent calendar-related errors in their applications.
