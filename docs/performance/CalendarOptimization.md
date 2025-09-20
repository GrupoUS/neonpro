# Calendar Performance Optimization Guide

## Overview

This guide provides comprehensive performance optimization strategies for NeonPro's calendar components. Learn how to achieve smooth, responsive calendar interfaces even with large datasets and complex scheduling scenarios.

## Performance Metrics

### Target Benchmarks
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Interaction to Next Paint (INP)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s

### Calendar-Specific Metrics
- **Event Rendering**: < 16ms per 100 events
- **View Switching**: < 500ms
- **Search/Filter**: < 300ms
- **Memory Usage**: < 50MB for 10,000 events

## Core Optimization Strategies

### 1. Virtual Scrolling for Large Datasets

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedCalendarProps {
  events: CalendarEvent[];
  height: number;
  itemSize: number;
}

function VirtualizedCalendar({ events, height, itemSize }: VirtualizedCalendarProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan: 5 // Render 5 extra items above/below viewport
  });
  
  const virtualEvents = virtualizer.getVirtualItems();
  
  return (
    <div 
      ref={parentRef} 
      style={{ height, overflow: 'auto' }}
      data-testid="virtualized-calendar"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualEvents.map(virtualEvent => (
          <div
            key={virtualEvent.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualEvent.size}px`,
              transform: `translateY(${virtualEvent.start}px)`
            }}
          >
            <EventItem event={events[virtualEvent.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Efficient Event Data Management

```typescript
// Event store with optimized indexing
interface EventStore {
  events: Map<string, CalendarEvent>;
  byDate: Map<string, string[]>; // date string -> event IDs
  byResource: Map<string, string[]>; // resource ID -> event IDs
  byType: Map<string, string[]>; // event type -> event IDs
}

class OptimizedEventStore {
  private store: EventStore = {
    events: new Map(),
    byDate: new Map(),
    byResource: new Map(),
    byType: new Map()
  };
  
  addEvent(event: CalendarEvent) {
    // Add to main store
    this.store.events.set(event.id, event);
    
    // Index by date
    const dateKey = format(event.start, 'yyyy-MM-dd');
    if (!this.store.byDate.has(dateKey)) {
      this.store.byDate.set(dateKey, []);
    }
    this.store.byDate.get(dateKey)!.push(event.id);
    
    // Index by resource
    if (event.resourceId) {
      if (!this.store.byResource.has(event.resourceId)) {
        this.store.byResource.set(event.resourceId, []);
      }
      this.store.byResource.get(event.resourceId)!.push(event.id);
    }
    
    // Index by type
    if (event.type) {
      if (!this.store.byType.has(event.type)) {
        this.store.byType.set(event.type, []);
      }
      this.store.byType.get(event.type)!.push(event.id);
    }
  }
  
  getEventsByDateRange(start: Date, end: Date): CalendarEvent[] {
    const eventIds = new Set<string>();
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const ids = this.store.byDate.get(dateKey) || [];
      ids.forEach(id => eventIds.add(id));
      currentDate = addDays(currentDate, 1);
    }
    
    return Array.from(eventIds).map(id => this.store.events.get(id)!);
  }
  
  getEventsByResource(resourceId: string): CalendarEvent[] {
    const eventIds = this.store.byResource.get(resourceId) || [];
    return eventIds.map(id => this.store.events.get(id)!);
  }
}
```

### 3. Memoization and React Optimization

```typescript
// Optimized event list component
const OptimizedEventList = React.memo(({ 
  events, 
  onSelect 
}: { 
  events: CalendarEvent[]; 
  onSelect: (event: CalendarEvent) => void; 
}) => {
  return (
    <div className="event-list">
      {events.map(event => (
        <MemoizedEventItem 
          key={event.id} 
          event={event} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  );
});

// Memoized individual event item
const MemoizedEventItem = React.memo(({ 
  event, 
  onSelect 
}: { 
  event: CalendarEvent; 
  onSelect: (event: CalendarEvent) => void; 
}) => {
  const handleClick = useCallback(() => {
    onSelect(event);
  }, [event, onSelect]);
  
  return (
    <div 
      className="event-item"
      onClick={handleClick}
      data-event-id={event.id}
    >
      <EventContent event={event} />
    </div>
  );
});

// Optimized event content
const EventContent = React.memo(({ event }: { event: CalendarEvent }) => {
  const timeRange = useMemo(() => {
    const start = format(event.start, 'h:mm a');
    const end = format(event.end, 'h:mm a');
    return `${start} - ${end}`;
  }, [event.start, event.end]);
  
  return (
    <div className="event-content">
      <div className="event-time">{timeRange}</div>
      <div className="event-title">{event.title}</div>
      {event.location && (
        <div className="event-location">{event.location}</div>
      )}
    </div>
  );
});
```

### 4. Efficient Date Operations

```typescript
// Pre-computed date utilities
const dateUtils = {
  // Cache common date calculations
  weekStartCache: new Map<string, Date>(),
  weekEndCache: new Map<string, Date>(),
  
  getWeekStart(date: Date): Date {
    const key = format(date, 'yyyy-MM-dd');
    if (!this.weekStartCache.has(key)) {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      this.weekStartCache.set(key, start);
    }
    return this.weekStartCache.get(key)!;
  },
  
  getWeekEnd(date: Date): Date {
    const key = format(date, 'yyyy-MM-dd');
    if (!this.weekEndCache.has(key)) {
      const end = endOfWeek(date, { weekStartsOn: 0 });
      this.weekEndCache.set(key, end);
    }
    return this.weekEndCache.get(key)!;
  },
  
  // Efficient date range operations
  getDateRangeEvents(events: CalendarEvent[], start: Date, end: Date): CalendarEvent[] {
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    return events.filter(event => {
      const eventStart = event.start.getTime();
      const eventEnd = event.end.getTime();
      
      // Event overlaps with date range
      return eventStart <= endTime && eventEnd >= startTime;
    });
  },
  
  // Optimized date formatting
  formatDate: memoize((date: Date, formatString: string) => {
    return format(date, formatString);
  })
};
```

### 5. Smart Data Loading and Caching

```typescript
// Intelligent event loader with caching
class EventLoader {
  private cache = new Map<string, { events: CalendarEvent[]; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<CalendarEvent[]>>();
  
  private generateCacheKey(start: Date, end: Date, filters: any): string {
    return `${start.toISOString()}-${end.toISOString()}-${JSON.stringify(filters)}`;
  }
  
  async loadEvents(start: Date, end: Date, filters: any = {}): Promise<CalendarEvent[]> {
    const cacheKey = this.generateCacheKey(start, end, filters);
    const now = Date.now();
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
      return cached.events;
    }
    
    // Check for pending request
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }
    
    // Make new request
    const request = this.fetchEvents(start, end, filters);
    this.pendingRequests.set(cacheKey, request);
    
    try {
      const events = await request;
      this.cache.set(cacheKey, { events, timestamp: now });
      return events;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  private async fetchEvents(start: Date, end: Date, filters: any): Promise<CalendarEvent[]> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end, filters })
    });
    
    if (!response.ok) {
      throw new Error('Failed to load events');
    }
    
    return response.json();
  }
  
  // Prefetch upcoming events
  prefetchUpcomingEvents() {
    const now = new Date();
    const nextWeek = addWeeks(now, 1);
    this.loadEvents(now, nextWeek);
  }
  
  // Clear old cache entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 10 * 60 * 1000) { // 10 minute TTL
        this.cache.delete(key);
      }
    }
  }
}
```

### 6. Optimized Rendering with Web Workers

```typescript
// Worker for heavy computations
// calendar.worker.ts
self.onmessage = (e) => {
  const { type, data } = e.data;
  
  switch (type) {
    case 'calculate-positions':
      const positions = calculateEventPositions(data.events, data.containerSize);
      self.postMessage({ type: 'positions', data: positions });
      break;
      
    case 'filter-events':
      const filtered = filterEvents(data.events, data.filters);
      self.postMessage({ type: 'filtered', data: filtered });
      break;
      
    case 'search-events':
      const searchResults = searchEvents(data.events, data.query);
      self.postMessage({ type: 'search-results', data: searchResults });
      break;
  }
};

// Worker hook
function useCalendarWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  
  useEffect(() => {
    const worker = new Worker(new URL('./calendar.worker.ts', import.meta.url));
    setWorker(worker);
    
    return () => worker.terminate();
  }, []);
  
  return worker;
}

// Optimized calendar with worker
function OptimizedCalendar({ events }: { events: CalendarEvent[] }) {
  const worker = useCalendarWorker();
  const [positions, setPositions] = useState<any[]>([]);
  
  useEffect(() => {
    if (!worker) return;
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'positions') {
        setPositions(e.data.data);
      }
    };
    
    worker.onmessage = handleMessage;
    
    // Calculate positions in worker
    worker.postMessage({
      type: 'calculate-positions',
      data: {
        events,
        containerSize: { width: 800, height: 600 }
      }
    });
    
    return () => {
      worker.onmessage = null;
    };
  }, [worker, events]);
  
  return (
    <div className="optimized-calendar">
      {positions.map(pos => (
        <EventComponent
          key={pos.event.id}
          event={pos.event}
          style={{
            position: 'absolute',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`
          }}
        />
      ))}
    </div>
  );
}
```

### 7. Debounced and Throttled Operations

```typescript
// Optimized search with debouncing
const useDebouncedSearch = (delay: number = 300) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [searchQuery, delay]);
  
  return { searchQuery, setSearchQuery, debouncedQuery };
};

// Throttled resize handler
const useThrottledResize = (callback: Function, delay: number = 100) => {
  useEffect(() => {
    let lastCall = 0;
    
    const handleResize = () => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        callback();
        lastCall = now;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [callback, delay]);
};
```

### 8. Image and Asset Optimization

```typescript
// Lazy loading for event images
const LazyEventImage = ({ src, alt, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img) {
            img.src = src;
            observer.unobserve(img);
          }
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);
  
  return (
    <div className="lazy-image-container">
      {!isLoaded && !hasError && (
        <div className="image-placeholder">Loading...</div>
      )}
      <img
        ref={imgRef}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{ display: isLoaded ? 'block' : 'none' }}
        {...props}
      />
      {hasError && (
        <div className="image-error">Failed to load image</div>
      )}
    </div>
  );
};
```

## Performance Monitoring

### 1. Real-time Performance Metrics

```typescript
// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    renderTime: 0,
    eventCount: 0
  });
  
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measurePerformance = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memory: (performance as any).memory?.usedJSHeapSize || 0
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measurePerformance);
    };
    
    animationFrameId = requestAnimationFrame(measurePerformance);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return metrics;
};

// Performance dashboard
const PerformanceDashboard = () => {
  const metrics = usePerformanceMonitor();
  
  return (
    <div className="performance-dashboard">
      <h3>Performance Metrics</h3>
      <div className="metric">
        <span>FPS:</span>
        <span className={metrics.fps < 30 ? 'warning' : ''}>
          {metrics.fps}
        </span>
      </div>
      <div className="metric">
        <span>Memory:</span>
        <span>{(metrics.memory / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </div>
  );
};
```

### 2. Web Vitals Tracking

```typescript
// Web vitals monitoring
const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    console.log(metric);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_delta: metric.delta
      });
    }
  }
};

// Integration with next/script or custom implementation
function WebVitalsTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals);
        getFID(reportWebVitals);
        getFCP(reportWebVitals);
        getLCP(reportWebVitals);
        getTTFB(reportWebVitals);
      });
    }
  }, []);
  
  return null;
}
```

## Testing Performance

### 1. Performance Testing with Playwright

```typescript
// performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Calendar Performance', () => {
  test('should load within performance budgets', async ({ page }) => {
    // Start performance tracing
    await page.goto('/calendar');
    
    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar"]');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        lcp: paint.find(p => p.name === 'largest-contentful-paint')?.startTime,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart
      };
    });
    
    // Assert performance budgets
    expect(metrics.fcp).toBeLessThan(1500);
    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.loadTime).toBeLessThan(3000);
    expect(metrics.domInteractive).toBeLessThan(1000);
  });
  
  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/calendar');
    
    // Simulate large dataset
    await page.evaluate(() => {
      const events = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        start: new Date(Date.now() + i * 60000),
        end: new Date(Date.now() + i * 60000 + 3600000)
      }));
      
      // @ts-ignore
      window.testEvents = events;
    });
    
    // Load events
    await page.click('[data-testid="load-test-events"]');
    
    // Measure rendering time
    const renderTime = await page.evaluate(() => {
      const start = performance.now();
      
      // Trigger render
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });
    
    expect(renderTime).toBeLessThan(100); // Should render in < 100ms
  });
});
```

### 2. Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

export default function () {
  // Test calendar page load
  const res = http.get('http://localhost:3000/calendar');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Test event loading
  const eventRes = http.get('http://localhost:3000/api/events?start=2024-01-01&end=2024-01-31');
  
  check(eventRes, {
    'events loaded successfully': (r) => r.status === 200,
    'response has events': (r) => JSON.parse(r.body).length > 0,
  });
  
  sleep(1);
}
```

## Deployment Optimization

### 1. Bundle Optimization

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split calendar components into separate chunk
          calendar: [
            './src/components/event-calendar/EventCalendar.tsx',
            './src/components/event-calendar/WeekView.tsx',
            './src/components/event-calendar/MonthView.tsx',
          ],
          // Split date utilities
          'date-utils': [
            'date-fns',
            './src/utils/date.ts',
          ],
          // Split UI components
          ui: [
            '@radix-ui/react-slot',
            './src/components/ui/',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'date-fns',
      'lucide-react',
      '@radix-ui/react-slot',
    ],
  },
});
```

### 2. CDN and Caching Strategy

```typescript
// Cache headers configuration
export const cacheHeaders = {
  // Calendar components - hashed, long cache
  '/build/assets/calendar-*.js': 'public, max-age=31536000, immutable',
  
  // Static assets - long cache
  '/build/assets/*.png': 'public, max-age=31536000',
  '/build/assets/*.svg': 'public, max-age=31536000',
  
  // API responses - short cache for dynamic content
  '/api/events': 'public, max-age=60, s-maxage=300',
  
  // HTML - no cache for dynamic pages
  '/calendar': 'no-cache, no-store, must-revalidate',
};

// Service worker for offline support
// public/sw.js
const CACHE_NAME = 'calendar-v1';
const urlsToCache = [
  '/calendar',
  '/build/assets/calendar.js',
  '/build/assets/styles.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

## Best Practices Summary

### 1. Code Level
- **Memoize** expensive computations and components
- **Virtualize** large lists and grids
- **Debounce** user inputs and resize events
- **Lazy load** images and non-critical components
- **Use React.memo** for pure components

### 2. Data Level
- **Index** event data for efficient lookups
- **Cache** API responses with appropriate TTL
- **Paginate** large datasets
- **Prefetch** likely-to-be-needed data
- **Compress** data transfers

### 3. Rendering Level
- **Optimize** paint operations
- **Reduce** layout thrashing
- **Use CSS transforms** for animations
- **Implement** shouldComponentUpdate logic
- **Avoid** inline styles for dynamic content

### 4. Infrastructure Level
- **Use CDN** for static assets
- **Implement** proper caching headers
- **Optimize** bundle size with code splitting
- **Monitor** performance metrics
- **Scale** horizontally for high traffic

## Troubleshooting Performance Issues

### Common Issues and Solutions

1. **Slow Initial Load**
   - Check bundle size and implement code splitting
   - Optimize images and assets
   - Implement lazy loading

2. **Poor Scroll Performance**
   - Implement virtual scrolling
   - Reduce DOM nodes
   - Use CSS will-change property

3. **High Memory Usage**
   - Implement proper cleanup
   - Use object pooling for reusable objects
   - Monitor memory leaks

4. **Janky Animations**
   - Use requestAnimationFrame
   - Avoid layout thrashing
   - Use CSS transforms instead of position changes

5. **Slow Search/Filter**
   - Implement debouncing
   - Use Web Workers for heavy computations
   - Optimize search algorithms

By following these optimization strategies and monitoring performance metrics, you can ensure your calendar implementation provides a smooth, responsive experience even with complex scheduling requirements and large datasets.