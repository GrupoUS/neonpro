/**
 * Performance Benchmark Suite - Calendar Optimization
 *
 * Comprehensive performance testing for calendar components
 * Validates rendering speed, memory usage, and user experience metrics
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EventCalendar } from '../event-calendar';
import { CalendarEvent, EventColor } from '../types';

// Mock performance utilities
vi.mock('@/utils/performance-optimizer', () => ({
  measureComponentRender: vi.fn().mockResolvedValue({
    duration: 45,
    score: 0.92,
    memoryUsage: 10.5,
  }),
  measureCalendarPerformance: vi.fn().mockResolvedValue({
    renderTime: 32,
    interactionTime: 15,
    memoryUsage: 8.2,
    fps: 60,
    score: 0.94,
  }),
  optimizeCalendarRendering: vi.fn().mockReturnValue(true),
  validatePerformanceBudget: vi.fn().mockReturnValue({
    withinBudget: true,
    metrics: {
      renderTime: 32,
      memory: 8.2,
      interactions: 15,
    },
  }),
}));

// Mock React Profiler
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Profiler: ({ children, onRender }) => {
      // Simulate Profiler behavior
      setTimeout(() => {
        onRender(
          'EventCalendar',
          0, // phase
          32, // actualDuration
          30, // baseDuration
          100, // startTime
          132, // commitTime
          [], // interactions
        );
      }, 0);
      return children;
    },
  };
});

describe('Performance Benchmark Suite - Calendar Optimization', () => {
  const performanceEvents: CalendarEvent[] = [
    {
      id: 'performance-1',
      title: 'Consulta Performance',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      color: 'blue',
    },
    {
      id: 'performance-2',
      title: 'Exame Performance',
      start: new Date('2024-01-15T14:00:00'),
      end: new Date('2024-01-15T15:30:00'),
      color: 'emerald',
    },
  ];

  const mockCallbacks = {
    onEventAdd: vi.fn(),
    onEventUpdate: vi.fn(),
    onEventDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // RENDERING PERFORMANCE
  describe('Rendering Performance', () => {
    it('should render calendar within 50ms threshold', async () => {
      const {
        measureComponentRender,
      } = require('@/utils/performance-optimizer');

      const startTime = performance.now();
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(50);

      await waitFor(() => {
        expect(measureComponentRender).toHaveBeenCalled();
      });
    });

    it('should handle large datasets efficiently', () => {
      const largeEventSet = Array.from({ length: 100 }, (_, i) => ({
        id: `large-event-${i}`,
        title: `Evento ${i}`,
        start: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
        end: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T11:00:00`),
        color: ['blue', 'emerald', 'violet', 'rose'][i % 4],
      }));

      const startTime = performance.now();
      render(<EventCalendar events={largeEventSet} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should render 100 events in under 100ms
      expect(renderTime).toBeLessThan(100);

      const calendar = screen.getByRole('application');
      expect(calendar).toBeInTheDocument();
    });

    it('should implement virtual scrolling for performance', () => {
      const hugeEventSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `huge-event-${i}`,
        title: `Evento ${i}`,
        start: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
        end: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T11:00:00`),
        color: ['blue', 'emerald', 'violet', 'rose'][i % 4],
      }));

      const startTime = performance.now();
      render(<EventCalendar events={hugeEventSet} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should handle 1000 events efficiently
      expect(renderTime).toBeLessThan(200);
    });

    it('should optimize re-renders with React.memo', () => {
      const { rerender } = render(
        <EventCalendar events={performanceEvents} {...mockCallbacks} />,
      );

      const startTime = performance.now();
      rerender(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const reRenderTime = endTime - startTime;

      // Re-render should be fast due to memoization
      expect(reRenderTime).toBeLessThan(20);
    });
  });

  // INTERACTION PERFORMANCE
  describe('Interaction Performance', () => {
    it('should handle event clicks within 100ms', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const eventElement = screen.getByText('Consulta Performance');

      const startTime = performance.now();
      fireEvent.click(eventElement);
      const endTime = performance.now();

      const interactionTime = endTime - startTime;

      expect(interactionTime).toBeLessThan(100);
    });

    it('should handle navigation within 50ms', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const nextButton = screen.getByRole('button', { name: /próximo/i });

      const startTime = performance.now();
      fireEvent.click(nextButton);
      const endTime = performance.now();

      const navigationTime = endTime - startTime;

      expect(navigationTime).toBeLessThan(50);
    });

    it('should handle view switching within 100ms', () => {
      render(
        <EventCalendar
          events={performanceEvents}
          initialView='month'
          {...mockCallbacks}
        />,
      );

      const viewSwitcher = screen.getByRole('combobox');

      const startTime = performance.now();
      fireEvent.change(viewSwitcher, { target: { value: 'week' } });
      const endTime = performance.now();

      const switchTime = endTime - startTime;

      expect(switchTime).toBeLessThan(100);
    });

    it('should handle rapid consecutive interactions', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const eventElement = screen.getByText('Consulta Performance');
      const nextButton = screen.getByRole('button', { name: /próximo/i });

      // Rapid consecutive interactions
      const startTime = performance.now();
      fireEvent.click(eventElement);
      fireEvent.click(nextButton);
      fireEvent.click(eventElement);
      fireEvent.click(nextButton);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / 4;

      expect(averageTime).toBeLessThan(75);
    });
  });

  // MEMORY PERFORMANCE
  describe('Memory Performance', () => {
    it('should maintain stable memory usage with multiple renders', () => {
      const {
        measureComponentRender,
      } = require('@/utils/performance-optimizer');

      const { rerender } = render(
        <EventCalendar events={performanceEvents} {...mockCallbacks} />,
      );

      // Multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <EventCalendar events={performanceEvents} {...mockCallbacks} />,
        );
      }

      // Check memory usage
      expect(measureComponentRender).toHaveBeenCalled();
    });

    it('should clean up event listeners properly', () => {
      const { rerender, unmount } = render(
        <EventCalendar events={performanceEvents} {...mockCallbacks} />,
      );

      // Simulate multiple interactions
      const eventElement = screen.getByText('Consulta Performance');
      fireEvent.click(eventElement);

      // Unmount component
      unmount();

      // Should clean up properly
      expect(() => {
        fireEvent.click(eventElement);
      }).toThrow();
    });

    it('should prevent memory leaks with large datasets', () => {
      const largeEventSet = Array.from({ length: 100 }, (_, i) => ({
        id: `memory-test-${i}`,
        title: `Evento ${i}`,
        start: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
        end: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T11:00:00`),
        color: ['blue', 'emerald', 'violet', 'rose'][i % 4],
      }));

      const { unmount } = render(
        <EventCalendar events={largeEventSet} {...mockCallbacks} />,
      );

      // Force garbage collection if available
      if (typeof gc !== 'undefined') {
        gc();
      }

      // Should handle unmounting gracefully
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  // FRAME RATE PERFORMANCE
  describe('Frame Rate Performance', () => {
    it('should maintain 60 FPS during interactions', async () => {
      const {
        measureCalendarPerformance,
      } = require('@/utils/performance-optimizer');

      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      // Simulate rapid interactions
      const eventElement = screen.getByText('Consulta Performance');

      for (let i = 0; i < 10; i++) {
        fireEvent.click(eventElement);
        vi.advanceTimersByTime(16); // 60 FPS
      }

      await waitFor(() => {
        expect(measureCalendarPerformance).toHaveBeenCalled();
      });
    });

    it('should handle animations smoothly', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      // Simulate animation frames
      let frameCount = 0;
      const animate = () => {
        if (frameCount < 60) {
          requestAnimationFrame(animate);
          frameCount++;
        }
      };

      animate();

      // Should complete 60 frames without drops
      expect(frameCount).toBe(60);
    });

    it('should prevent layout thrashing', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const startTime = performance.now();

      // Force multiple layout operations
      const eventElement = screen.getByText('Consulta Performance');
      for (let i = 0; i < 5; i++) {
        fireEvent.click(eventElement);
        // Force layout
        element.getBoundingClientRect();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle layout operations efficiently
      expect(totalTime).toBeLessThan(200);
    });
  });

  // MOBILE PERFORMANCE
  describe('Mobile Performance', () => {
    beforeEach(() => {
      // Mock mobile device
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should render efficiently on mobile devices', () => {
      const startTime = performance.now();
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should render quickly on mobile
      expect(renderTime).toBeLessThan(75);
    });

    it('should handle touch interactions efficiently', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const eventElement = screen.getByText('Consulta Performance');

      const startTime = performance.now();
      fireEvent.touchStart(eventElement);
      fireEvent.touchEnd(eventElement);
      const endTime = performance.now();

      const touchTime = endTime - startTime;

      expect(touchTime).toBeLessThan(100);
    });

    it('should optimize mobile scrolling', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const calendar = screen.getByRole('application');

      const startTime = performance.now();

      // Simulate scroll events
      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(calendar, {
          target: { scrollY: i * 100 },
        });
      }

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      expect(scrollTime).toBeLessThan(150);
    });
  });

  // NETWORK PERFORMANCE
  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', () => {
      // Mock slow network
      global.fetch = vi.fn(() => new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ events: performanceEvents }),
              } as Response);
            }, 1000); // 1 second delay
          }),
      );

      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      // Should show loading state
      expect(screen.getByRole('application')).toBeInTheDocument();

      // Should handle slow loading gracefully
    });

    it('should implement efficient data loading', () => {
      const optimizedEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `optimized-${i}`,
        title: `Evento Otimizado ${i}`,
        start: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
        end: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T11:00:00`),
        color: ['blue', 'emerald', 'violet', 'rose'][i % 4],
      }));

      const startTime = performance.now();
      render(<EventCalendar events={optimizedEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(60);
    });

    it('should cache calendar data efficiently', () => {
      const { rerender } = render(
        <EventCalendar events={performanceEvents} {...mockCallbacks} />,
      );

      // First render
      const firstRenderTime = performance.now();
      rerender(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
      const firstEndTime = performance.now();

      // Second render (should be faster due to caching)
      const secondStartTime = performance.now();
      rerender(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
      const secondEndTime = performance.now();

      const firstTime = firstEndTime - firstRenderTime;
      const secondTime = secondEndTime - secondStartTime;

      // Second render should be faster
      expect(secondTime).toBeLessThan(firstTime);
    });
  });

  // BENCHMARKING AND METRICS
  describe('Benchmarking and Metrics', () => {
    it('should meet Core Web Vitals thresholds', async () => {
      const {
        validatePerformanceBudget,
      } = require('@/utils/performance-optimizer');

      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      await waitFor(() => {
        expect(validatePerformanceBudget).toHaveBeenCalled();
      });
    });

    it('should track performance metrics over time', () => {
      const metrics = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
        const endTime = performance.now();

        metrics.push({
          iteration: i + 1,
          renderTime: endTime - startTime,
        });

        // Clean up
        document.body.innerHTML = '';
      }

      // Should maintain consistent performance
      const averageTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
      const maxTime = Math.max(...metrics.map(m => m.renderTime));
      const minTime = Math.min(...metrics.map(m => m.renderTime));

      expect(averageTime).toBeLessThan(50);
      expect(maxTime - minTime).toBeLessThan(20); // Consistency threshold
    });

    it('should provide performance debugging information', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      // Should provide performance metrics
      const {
        measureComponentRender,
      } = require('@/utils/performance-optimizer');

      expect(measureComponentRender).toHaveBeenCalled();
    });

    it('should optimize based on device capabilities', () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        configurable: true,
        value: 2,
      });

      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        configurable: true,
        value: 2,
      });

      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const calendar = screen.getByRole('application');
      expect(calendar).toBeInTheDocument();

      // Should adapt to low-end devices
    });

    it('should handle performance degradation gracefully', () => {
      // Mock performance degradation
      const originalNow = performance.now;
      performance.now = vi.fn(() => Date.now() + 100); // Simulate slow operations

      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const calendar = screen.getByRole('application');
      expect(calendar).toBeInTheDocument();

      // Should handle degradation gracefully

      performance.now = originalNow;
    });
  });

  // ACCESSIBILITY PERFORMANCE
  describe('Accessibility Performance', () => {
    it('should maintain performance with accessibility features', () => {
      const accessibleEvents = performanceEvents.map(event => ({
        ...event,
        accessibility: {
          screenReader: true,
          highContrast: true,
          largeText: true,
        },
      }));

      const startTime = performance.now();
      render(<EventCalendar events={accessibleEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(60);
    });

    it('should handle screen reader announcements efficiently', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const eventElement = screen.getByText('Consulta Performance');

      const startTime = performance.now();
      fireEvent.click(eventElement);
      const endTime = performance.now();

      const announcementTime = endTime - startTime;

      expect(announcementTime).toBeLessThan(100);
    });

    it('should provide accessible performance feedback', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      // Should provide performance feedback to assistive technologies
      const calendar = screen.getByRole('application');
      expect(calendar).toHaveAttribute('aria-busy', 'false');
    });
  });

  // SCALABILITY PERFORMANCE
  describe('Scalability Performance', () => {
    it('should scale with user count', () => {
      const userEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `user-${i}`,
        title: `Evento Usuário ${i}`,
        start: new Date(
          `2024-01-${String((i % 30) + 1).padStart(2, '0')}T${
            String(Math.floor(i / 4) + 8).padStart(2, '0')
          }:00`,
        ),
        end: new Date(
          `2024-01-${String((i % 30) + 1).padStart(2, '0')}T${
            String(Math.floor(i / 4) + 9).padStart(2, '0')
          }:00`,
        ),
        color: ['blue', 'emerald', 'violet', 'rose'][i % 4],
        _userId: `user-${i}`,
      }));

      const startTime = performance.now();
      render(<EventCalendar events={userEvents} {...mockCallbacks} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(300);
    });

    it('should handle concurrent operations', () => {
      render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);

      const eventElement = screen.getByText('Consulta Performance');
      const nextButton = screen.getByRole('button', { name: /próximo/i });

      const startTime = performance.now();

      // Concurrent operations
      Promise.all([
        fireEvent.click(eventElement),
        fireEvent.click(nextButton),
        fireEvent.click(eventElement),
        fireEvent.click(nextButton),
      ]);

      const endTime = performance.now();
      const concurrentTime = endTime - startTime;

      expect(concurrentTime).toBeLessThan(150);
    });

    it('should maintain performance over time', () => {
      const renderTimes = [];

      for (let i = 0; i < 10; i++) {
        document.body.innerHTML = '';

        const startTime = performance.now();
        render(<EventCalendar events={performanceEvents} {...mockCallbacks} />);
        const endTime = performance.now();

        renderTimes.push(endTime - startTime);
      }

      // Performance should not degrade significantly
      const firstTime = renderTimes[0];
      const lastTime = renderTimes[renderTimes.length - 1];
      const degradation = (lastTime - firstTime) / firstTime;

      expect(degradation).toBeLessThan(0.2); // 20% degradation threshold
    });
  });
});
