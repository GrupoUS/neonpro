import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Set timezone to UTC for consistent date testing across all environments
process.env.TZ = 'UTC';

// React 19 compatibility fix for Jest environment
(global as any).IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  writable: true,
  value: true,
});

// Mock scheduler for React hooks in Jest
jest.mock('scheduler', () => require('scheduler/unstable_mock'));

// Add global polyfills for WebAuthn dependencies
(global as any).TextDecoder = TextDecoder;
(global as any).TextEncoder = TextEncoder;

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next/navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Extend global environment for tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveErrorMessage(message: string): R
    }
  }
}

// Custom Jest matchers
expect.extend({
  toHaveErrorMessage(received, message) {
    const pass = received?.message === message
    return {
      pass,
      message: () =>
        pass
          ? `Expected error not to have message: ${message}`
          : `Expected error to have message: ${message}, but received: ${received?.message}`,
    }
  },
})