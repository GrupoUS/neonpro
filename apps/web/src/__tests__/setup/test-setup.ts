/**
 * General Test Setup
 * 
 * Global setup for all test types including:
 * - Test environment configuration
 * - Global test utilities
 * - Common mock configurations
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Test utilities
import { TestDataManager } from './test-data';

// Global test configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
  
  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
};

// Re-export everything from RTL
export * from '@testing-library/react';

// Global test setup
beforeAll(() => {
  // Setup global test configurations
  console.log('🧪 Test environment setup complete');
  
  // Mock window.matchMedia
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
  
  // Mock scrollTo
  window.scrollTo = vi.fn();
  
  // Mock console methods in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  }
});

afterAll(() => {
  // Cleanup global configurations
  console.log('🧹 Test environment cleanup complete');
});

beforeEach(() => {
  // Reset query client before each test
  queryClient.clearQueries();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage
  localStorage.clear();
  
  // Reset sessionStorage
  sessionStorage.clear();
});

afterEach(() => {
  // Additional cleanup if needed
});

// Export global test utilities
export const TestUtils = {
  renderWithProviders,
  queryClient,
  
  // Common test data utilities
  testDataManager: new TestDataManager(),
  
  // Async utilities
  async waitFor(condition: () => boolean, timeout: number = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (condition()) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
  
  // Event simulation utilities
  async simulateUserInteraction(element: HTMLElement) {
    // Focus element
    element.focus();
    
    // Simulate hover
    const mouseEnter = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(mouseEnter);
    
    // Simulate click
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(click);
  },
  
  // Form utilities
  async fillForm(form: HTMLFormElement, data: Record<string, string>) {
    for (const [name, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    // Submit form
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
  }
};

// Make utilities available globally
(globalThis as any).TestUtils = TestUtils;

// Custom matchers
expect.extend({
  toHaveValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    const message = () => `Expected ${received} to be a valid email address`;
    return { pass, message };
  },
  
  toHaveValidPhone(received: string) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const pass = phoneRegex.test(received) && received.length >= 10;
    const message = () => `Expected ${received} to be a valid phone number`;
    return { pass, message };
  },
  
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    const message = () => `Expected ${received} to be within range ${min}-${max}`;
    return { pass, message };
  }
});

console.log('🔧 Test utilities initialized');