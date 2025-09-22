import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock global APIs that might be used in components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Web APIs
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock crypto.randomUUID if not available
if (!window.crypto?.randomUUID) {
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  });
}

// Mock fetch API for consistent testing
global.fetch = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Setup test utilities
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.vi = vi;