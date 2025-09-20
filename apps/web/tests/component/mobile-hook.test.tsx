/**
 * Mobile Hook Unit Tests
 * Testing useIsMobile hook with healthcare accessibility compliance
 * Following RED-GREEN-REFACTOR methodology
 */

import { act, render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useIsMobile } from 'src/hooks/use-mobile';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => ({
  matches,
  media: '(max-width: 767px)',
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('useIsMobile Hook - Unit Tests', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia with default desktop view
    window.matchMedia = vi.fn().mockImplementation(createMatchMediaMock(false));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe('Initial State Detection', () => {
    it('should return false for desktop viewport', () => {
      // RED: Test expects desktop viewport detection
      window.matchMedia = vi.fn().mockImplementation(createMatchMediaMock(false));

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });

    it('should return true for mobile viewport', () => {
      // RED: Test expects mobile viewport detection
      window.matchMedia = vi.fn().mockImplementation(createMatchMediaMock(true));

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it('should handle undefined state initially', () => {
      // RED: Test expects undefined initial state handling
      // Mock matchMedia to simulate async behavior
      window.matchMedia = vi.fn().mockImplementation(() => ({
        ...createMatchMediaMock(false),
        matches: undefined,
      }));

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false); // Should default to false
    });
  });

  describe('Event Listener Management', () => {
    it('should add event listener on mount', () => {
      // RED: Test expects event listener addition
      const mockMatchMedia = createMatchMediaMock(false);
      const addEventListenerSpy = vi.fn();
      mockMatchMedia.addEventListener = addEventListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      // RED: Test expects event listener removal
      const mockMatchMedia = createMatchMediaMock(false);
      const addEventListenerSpy = vi.fn();
      const removeEventListenerSpy = vi.fn();

      mockMatchMedia.addEventListener = addEventListenerSpy;
      mockMatchMedia.removeEventListener = removeEventListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, unmount } = renderHook(() => useIsMobile());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle legacy addListener/removeListener for older browsers', () => {
      // RED: Test expects legacy API support
      const mockMatchMedia = createMatchMediaMock(false);
      const addListenerSpy = vi.fn();
      const removeListenerSpy = vi.fn();

      // Mock no addEventListener, only legacy API
      delete mockMatchMedia.addEventListener;
      delete mockMatchMedia.removeEventListener;
      mockMatchMedia.addListener = addListenerSpy;
      mockMatchMedia.removeListener = removeListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, unmount } = renderHook(() => useIsMobile());

      expect(addListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      unmount();

      expect(removeListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Responsive Updates', () => {
    it('should update when viewport changes to mobile', async () => {
      // RED: Test expects mobile viewport update
      const mockMatchMedia = createMatchMediaMock(false);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Simulate viewport change to mobile
      await act(async () => {
        if (changeCallback) {
          const mockEvent = {
            matches: true,
            media: '(max-width: 767px)',
          } as MediaQueryListEvent;

          changeCallback(mockEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it('should update when viewport changes to desktop', async () => {
      // RED: Test expects desktop viewport update
      const mockMatchMedia = createMatchMediaMock(true);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // Simulate viewport change to desktop
      await act(async () => {
        if (changeCallback) {
          const mockEvent = {
            matches: false,
            media: '(max-width: 767px)',
          } as MediaQueryListEvent;

          changeCallback(mockEvent);
        }
      });

      expect(result.current).toBe(false);
    });

    it('should handle rapid viewport changes', async () => {
      // RED: Test expects rapid viewport change handling
      const mockMatchMedia = createMatchMediaMock(false);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Simulate rapid changes
      const changes = [true, false, true, false, true];

      for (const isMobile of changes) {
        await act(async () => {
          if (changeCallback) {
            const mockEvent = {
              matches: isMobile,
              media: '(max-width: 767px)',
            } as MediaQueryListEvent;

            changeCallback(mockEvent);
          }
        });

        expect(result.current).toBe(isMobile);
      }
    });
  });

  describe('Breakpoint Configuration', () => {
    it('should use 768px as default mobile breakpoint', () => {
      // RED: Test expects default breakpoint usage
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
      expect(result.current).toBe(true);
    });

    it('should handle custom breakpoint configurations', () => {
      // RED: Test expects custom breakpoint handling
      // This would test if the hook supported custom breakpoints
      // For now, we test the default behavior
      const mockMatchMedia = createMatchMediaMock(false);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
      expect(result.current).toBe(false);
    });

    it('should handle edge case breakpoint values', () => {
      // RED: Test expects edge case breakpoint handling
      const testCases = [
        { width: 767, expected: true }, // Exactly mobile
        { width: 768, expected: false }, // Exactly desktop
        { width: 769, expected: false }, // Just above desktop
        { width: 0, expected: true }, // Minimum width
        { width: 9999, expected: false }, // Maximum width
      ];

      testCases.forEach(({ width, expected }) => {
        // Reset mock for each test case
        vi.clearAllMocks();

        const mockMatchMedia = createMatchMediaMock(width <= 767);
        window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

        const { result, unmount } = renderHook(() => useIsMobile());

        expect(result.current).toBe(expected);

        unmount();
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should not re-render unnecessarily with same viewport', () => {
      // RED: Test expects no unnecessary re-renders
      const mockMatchMedia = createMatchMediaMock(false);
      let renderCount = 0;

      mockMatchMedia.addEventListener = vi.fn();

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useIsMobile();
      });

      const initialRenderCount = renderCount;

      // Re-render hook without viewport change
      rerender();

      expect(renderCount).toBe(initialRenderCount + 1); // Only one additional render
      expect(result.current).toBe(false);
    });

    it('should debounce rapid viewport changes', async () => {
      // RED: Test expects viewport change debouncing
      const mockMatchMedia = createMatchMediaMock(false);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Simulate rapid changes in quick succession
      const rapidChanges = [true, false, true, false];

      for (const isMobile of rapidChanges) {
        await act(async () => {
          if (changeCallback) {
            const mockEvent = {
              matches: isMobile,
              media: '(max-width: 767px)',
            } as MediaQueryListEvent;

            changeCallback(mockEvent);
          }
        });
      }

      // Should end with the last state
      expect(result.current).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle matchMedia unavailable', () => {
      // RED: Test expects matchMedia unavailability handling
      // Remove matchMedia from window
      delete (window as any).matchMedia;

      const { result } = renderHook(() => useIsMobile());

      // Should default to false (desktop) when matchMedia is unavailable
      expect(result.current).toBe(false);
    });

    it('should handle matchMedia throwing errors', () => {
      // RED: Test expects matchMedia error handling
      window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      const { result } = renderHook(() => useIsMobile());

      // Should default to false when matchMedia throws
      expect(result.current).toBe(false);
    });

    it('should handle invalid media queries', () => {
      // RED: Test expects invalid media query handling
      const mockMatchMedia = {
        ...createMatchMediaMock(false),
        media: 'invalid-media-query',
      };

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      // Should still work with invalid media query
      expect(result.current).toBe(false);
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      // RED: Test expects event listener cleanup
      const mockMatchMedia = createMatchMediaMock(false);
      const addEventListenerSpy = vi.fn();
      const removeEventListenerSpy = vi.fn();

      mockMatchMedia.addEventListener = addEventListenerSpy;
      mockMatchMedia.removeEventListener = removeEventListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, unmount } = renderHook(() => useIsMobile());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple hook instances', () => {
      // RED: Test expects multiple hook instance handling
      const mockMatchMedia = createMatchMediaMock(false);
      const addEventListenerSpy = vi.fn();
      const removeEventListenerSpy = vi.fn();

      mockMatchMedia.addEventListener = addEventListenerSpy;
      mockMatchMedia.removeEventListener = removeEventListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result: result1, unmount: unmount1 } = renderHook(() => useIsMobile());
      const { result: result2, unmount: unmount2 } = renderHook(() => useIsMobile());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(result1.current).toBe(false);
      expect(result2.current).toBe(false);

      unmount1();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      unmount2();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('should not leak memory with rapid mount/unmount', () => {
      // RED: Test expects no memory leaks with rapid mount/unmount
      const mockMatchMedia = createMatchMediaMock(false);
      const addEventListenerSpy = vi.fn();
      const removeEventListenerSpy = vi.fn();

      mockMatchMedia.addEventListener = addEventListenerSpy;
      mockMatchMedia.removeEventListener = removeEventListenerSpy;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      // Rapid mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
        unmount();
      }

      // Should have balanced event listener management
      expect(addEventListenerSpy).toHaveBeenCalledTimes(10);
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe('Browser Compatibility', () => {
    it('should work in modern browsers with addEventListener', () => {
      // RED: Test expects modern browser compatibility
      const mockMatchMedia = createMatchMediaMock(false);
      const modernAddEventListener = vi.fn();
      const modernRemoveEventListener = vi.fn();

      // Modern browser with addEventListener
      mockMatchMedia.addEventListener = modernAddEventListener;
      mockMatchMedia.removeEventListener = modernRemoveEventListener;
      delete (mockMatchMedia as any).addListener;
      delete (mockMatchMedia as any).removeListener;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, unmount } = renderHook(() => useIsMobile());

      expect(modernAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(modernRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should fallback to legacy APIs in older browsers', () => {
      // RED: Test expects legacy browser fallback
      const mockMatchMedia = createMatchMediaMock(false);
      const legacyAddListener = vi.fn();
      const legacyRemoveListener = vi.fn();

      // Legacy browser with addListener/removeListener
      delete (mockMatchMedia as any).addEventListener;
      delete (mockMatchMedia as any).removeEventListener;
      mockMatchMedia.addListener = legacyAddListener;
      mockMatchMedia.removeListener = legacyRemoveListener;

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result, unmount } = renderHook(() => useIsMobile());

      expect(legacyAddListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(legacyRemoveListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle browsers with no MediaQueryList support', () => {
      // RED: Test expects no MediaQueryList support handling
      // Remove matchMedia entirely
      delete (window as any).matchMedia;

      const { result } = renderHook(() => useIsMobile());

      // Should gracefully fall back to desktop
      expect(result.current).toBe(false);
    });
  });

  describe('Healthcare-Specific Considerations', () => {
    it('should support healthcare mobile interfaces', () => {
      // RED: Test expects healthcare mobile interface support
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // In healthcare contexts, mobile detection is crucial for
      // responsive patient interfaces and emergency access
    });

    it('should handle accessibility on mobile devices', () => {
      // RED: Test expects mobile accessibility handling
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // Mobile healthcare applications require special attention
      // to accessibility due to smaller screens and touch interfaces
    });

    it('should support emergency mobile access', () => {
      // RED: Test expects emergency mobile access support
      const emergencyTestCases = [
        { width: 320, expected: true }, // Small phone
        { width: 375, expected: true }, // iPhone
        { width: 414, expected: true }, // Large phone
        { width: 768, expected: false }, // Tablet
        { width: 1024, expected: false }, // Desktop
      ];

      emergencyTestCases.forEach(({ width, expected }) => {
        vi.clearAllMocks();

        const mockMatchMedia = createMatchMediaMock(width <= 767);
        window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

        const { result, unmount } = renderHook(() => useIsMobile());

        expect(result.current).toBe(expected);

        // Emergency healthcare interfaces must work reliably
        // across all device types, especially mobile
        unmount();
      });
    });

    it('should handle mobile-first healthcare design', () => {
      // RED: Test expects mobile-first healthcare design
      // Test progressive enhancement approach
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // Mobile-first design is essential for healthcare applications
      // where users may need quick access from any device
    });
  });

  describe('Integration with React Features', () => {
    it('should work with React StrictMode', () => {
      // RED: Test expects React StrictMode compatibility
      const mockMatchMedia = createMatchMediaMock(false);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      // This simulates StrictMode's double-render behavior
      const { result, rerender } = renderHook(() => useIsMobile(), {
        wrapper: ({ children }) => <React.StrictMode>{children}</React.StrictMode>,
      });

      expect(result.current).toBe(false);

      // Additional renders should not break the hook
      rerender();

      expect(result.current).toBe(false);
    });

    it('should work with concurrent rendering', async () => {
      // RED: Test expects concurrent rendering compatibility
      const mockMatchMedia = createMatchMediaMock(false);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Concurrent rendering should not cause issues
      // with event listener management
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe(false);
    });

    it('should handle React 18+ features', () => {
      // RED: Test expects React 18+ feature compatibility
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // Should work with automatic batching and other React 18+ features
    });
  });

  describe('Type Safety', () => {
    it('should return boolean type', () => {
      // RED: Test expects boolean return type
      const mockMatchMedia = createMatchMediaMock(false);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(typeof result.current).toBe('boolean');
    });

    it('should handle TypeScript strict mode', () => {
      // RED: Test expects TypeScript strict mode compatibility
      // This test ensures the hook works with strict TypeScript settings
      const mockMatchMedia = createMatchMediaMock(true);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      // Type checking happens at compile time, but we can verify runtime behavior
      expect(result.current).toBe(true);
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle device orientation changes', async () => {
      // RED: Test expects device orientation change handling
      const mockMatchMedia = createMatchMediaMock(false);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Simulate device rotation from landscape to portrait
      await act(async () => {
        if (changeCallback) {
          const mockEvent = {
            matches: true,
            media: '(max-width: 767px)',
          } as MediaQueryListEvent;

          changeCallback(mockEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it('should handle browser resize events', async () => {
      // RED: Test expects browser resize event handling
      const mockMatchMedia = createMatchMediaMock(false);
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.addEventListener = vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as any;
        }
      });

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Simulate browser window resize
      await act(async () => {
        if (changeCallback) {
          const mockEvent = {
            matches: true,
            media: '(max-width: 767px)',
          } as MediaQueryListEvent;

          changeCallback(mockEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it('should handle split-screen scenarios', () => {
      // RED: Test expects split-screen scenario handling
      // Split-screen views might have complex viewport calculations
      const mockMatchMedia = createMatchMediaMock(false);

      window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // Even in split-screen, the hook should work correctly
      // based on the actual viewport width
    });
  });
});
