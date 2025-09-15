import '@testing-library/jest-dom';

// Mock matchMedia globally
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Quiet jsdom navigation not implemented warnings during tests
// This prevents noisy errors from anchor auto-navigation in timers
// and won't affect application logic in our unit tests.
Object.defineProperty(globalThis, 'navigation', {
  configurable: true,
  value: {
    navigate: vi.fn(),
  },
}) as any;
