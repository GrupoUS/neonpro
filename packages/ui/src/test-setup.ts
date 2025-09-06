/**
 * Test Setup for @neonpro/ui
 * Configures jest-dom matchers and global test utilities
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Extend expect with jest-dom matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {}
  }
}

// Mock IntersectionObserver for components that use it
(global as any).IntersectionObserver = class MockIntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown;

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
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

// Mock navigator.userAgent for LGPD compliance components
Object.defineProperty(navigator, "userAgent", {
  writable: true,
  value: "Mozilla/5.0 (Test Environment)",
});
