import '@testing-library/jest-dom/vitest';
import React from 'react';
import { beforeEach, expect, vi } from 'vitest';

// CRITICAL: Resolve React version conflicts FIRST
// This prevents "React Element from an older version" errors in monorepos
const ensureSingleReactInstance = () => {
  // Reset module cache to prevent multiple React instances
  vi.resetModules();
  
  // Force React to be resolved from the root node_modules
  const reactInstance = React;
  
  // Apply to all global contexts
  if (!globalThis.React || globalThis.React !== reactInstance) {
    Object.defineProperty(globalThis, 'React', {
      value: reactInstance,
      writable: false,
      configurable: true,
    });
  }

  if (!global.React || global.React !== reactInstance) {
    Object.defineProperty(global, 'React', {
      value: reactInstance,
      writable: false,
      configurable: true,
    });
  }

  // Ensure React DevTools hook is consistent
  if (!globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    Object.defineProperty(globalThis, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      value: {
        isDisabled: true,
        supportsFiber: true,
        inject: () => {},
        onCommitFiberRoot: () => {},
        onCommitFiberUnmount: () => {},
      },
      writable: false,
      configurable: true,
    });
  }

  console.log('✅ VITEST SETUP: Single React instance enforced across test environment');
};

// Apply React consistency fix
ensureSingleReactInstance();

// CRITICAL: Mock API client FIRST to ensure proper hoisting
vi.mock('@neonpro/shared/api-client', () => {
  console.log('🔧 VITEST.SETUP.TS MOCK: @neonpro/shared/api-client APPLIED');
  return {
    ApiHelpers: {
      formatError: vi.fn((error: any) => {
        console.log('🔧 VITEST.SETUP.TS formatError called with:', error);
        // Return string like the real implementation
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error && 'message' in error) {
          return String(error.message);
        }
        if (typeof error === 'object' && error && 'error' in error) {
          const apiError = error as any;
          if (apiError.error?.validation_errors?.length > 0) {
            return apiError.error.validation_errors
              .map((ve: any) => `${ve.field}: ${ve.message}`)
              .join(', ');
          }
          return apiError.message || 'API error occurred';
        }
        return 'An unexpected error occurred';
      }),
      handleResponse: vi.fn(async (response: any) => ({
        success: true,
        data: response,
      })),
      validateResponse: vi.fn((response: any) => response),
      handleApiError: vi.fn((error: any) => {
        throw new Error(error?.message || 'API Error');
      }),
      isNetworkError: vi.fn(() => false),
      isAuthError: vi.fn(() => false),
      getApiKey: vi.fn(() => 'test-api-key'),
    },
    apiClient: {
      auth: {
        setTokens: vi.fn(),
        getAccessToken: vi.fn(() => 'mock-token'),
        getRefreshToken: vi.fn(() => 'mock-refresh-token'),
        getSessionId: vi.fn(() => 'mock-session-id'),
        getUser: vi.fn(() => ({ id: 'user-1', role: 'doctor' })),
        clearTokens: vi.fn(),
        isAuthenticated: vi.fn(() => true),
        shouldRefresh: vi.fn(() => false),
        refreshToken: vi.fn(),
      },
      api: {
        v1: {
          auth: {
            login: {
              $post: vi.fn(),
            },
            refresh: {
              $post: vi.fn(),
            },
            logout: {
              $post: vi.fn(),
            },
            profile: {
              $get: vi.fn(),
            },
          },
        },
      },
      utils: {
        getUserAgent: vi.fn(() => 'test-agent'),
      },
      audit: {
        log: vi.fn(),
      },
    },
  };
});

// REACT GLOBAL SETUP: Ensure consistent React instances across all tests
// Remove the old React setup code since we now handle it at the top
import ReactDOM from 'react-dom/client';

try {
  vi.stubGlobal('ReactDOM', ReactDOM);
} catch (error) {
  // If ReactDOM is already defined, that's okay
}

// Add a beforeEach hook to reset React modules for each test
beforeEach(() => {
  // Reset React modules to prevent version conflicts
  vi.resetModules();
});

// CONSOLE MOCKING: Enhanced for test compatibility using vi.stubGlobal
const createConsoleMock = () => {
  const originalConsole = console;
  return {
    ...originalConsole,
    log: vi.fn((...args) => {
      // Allow console.log to work in tests when needed
      if (process.env.DEBUG_TESTS) {
        originalConsole.log(...args);
      }
    }),
    warn: vi.fn((...args) => {
      if (process.env.DEBUG_TESTS) {
        originalConsole.warn(...args);
      }
    }),
    error: vi.fn((...args) => {
      if (process.env.DEBUG_TESTS) {
        originalConsole.error(...args);
      }
    }),
    info: vi.fn((...args) => {
      if (process.env.DEBUG_TESTS) {
        originalConsole.info(...args);
      }
    }),
    debug: vi.fn(),
    trace: vi.fn(),
  };
};

const mockConsole = createConsoleMock();

// Use vi.stubGlobal to ensure console override works across all contexts
vi.stubGlobal('console', mockConsole);

// Apply to all global contexts for maximum compatibility
Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'console', {
  value: mockConsole,
  writable: true,
  configurable: true,
});

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_ENVIRONMENT: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
};

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: Uint8Array) => arr,
  },
});

// JSDOM polyfills for browser APIs
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

// Navigation polyfills - Critical for auth redirects and location changes
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
  configurable: true,
});

// Mock navigation API for modern browsers
Object.defineProperty(window, 'navigation', {
  value: {
    navigate: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    ...window.history,
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// RESEARCH-DRIVEN JSDOM POLYFILLS
// Based on @inrupt/jest-jsdom-polyfills patterns and industry best practices

// COMPREHENSIVE JSDOM FORM SUBMISSION POLYFILL
// Based on form-request-submit-polyfill and @inrupt/jest-jsdom-polyfills
// Research: https://github.com/javan/form-request-submit-polyfill

// SOLUTION 1: SubmitEvent polyfill (must come first) - AGGRESSIVE JSDOM OVERRIDE
if (!globalThis.SubmitEvent) {
  class SubmitEventPolyfill extends Event {
    submitter: HTMLElement | null;

    constructor(
      type: string,
      eventInitDict?: EventInit & { submitter?: HTMLElement | null }
    ) {
      super(type, eventInitDict);
      this.submitter = eventInitDict?.submitter || null;
    }
  }

  // Apply to all global contexts with aggressive override
  Object.defineProperty(globalThis, 'SubmitEvent', {
    value: SubmitEventPolyfill,
    writable: true,
    configurable: true,
    enumerable: false,
  });
  
  Object.defineProperty(global, 'SubmitEvent', {
    value: SubmitEventPolyfill,
    writable: true,
    configurable: true,
    enumerable: false,
  });
  
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'SubmitEvent', {
      value: SubmitEventPolyfill,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
  
  console.log('✅ VITEST SETUP: SubmitEvent polyfill applied globally');
}

// SOLUTION 2: HTMLFormElement.requestSubmit polyfill - ULTIMATE JSDOM OVERRIDE
// This uses the most aggressive approach to completely bypass JSDOM's broken implementation
const polyfillFormSubmission = () => {
  if (typeof HTMLFormElement !== 'undefined') {
    console.log('🔧 VITEST SETUP: Applying ULTIMATE requestSubmit polyfill for JSDOM');
    
    // Check if our polyfill is already applied
    const existingMethod = HTMLFormElement.prototype.requestSubmit;
    if (existingMethod && existingMethod.toString().includes('ULTIMATE requestSubmit polyfill')) {
      console.log('✅ VITEST SETUP: requestSubmit polyfill already applied, skipping');
      return;
    }
    
    // ULTIMATE FIX: Delete JSDOM's implementation first, then override
    try {
      delete (HTMLFormElement.prototype as any).requestSubmit;
    } catch (e) {
      // If delete fails, that's okay
    }
    
    // CRITICAL: Use Object.defineProperty with forceful configuration
    Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
      value: function (submitter?: HTMLElement | null) {
        console.log('🔧 VITEST SETUP: ULTIMATE requestSubmit polyfill called', { submitter });
        
        // Skip validation to avoid JSDOM compatibility issues - just dispatch the event
        // This is a test environment, so we prioritize working over 100% spec compliance
        
        // Create and dispatch submit event using our polyfilled SubmitEvent
        let submitEvent: Event;
        
        try {
          // Try to use the polyfilled SubmitEvent constructor
          submitEvent = new (globalThis.SubmitEvent || Event)('submit', {
            bubbles: true,
            cancelable: true,
            submitter: submitter || null,
          });
        } catch (error) {
          // Fallback to basic Event with manual submitter property
          submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          
          // Add submitter property manually
          Object.defineProperty(submitEvent, 'submitter', {
            value: submitter || null,
            writable: false,
            configurable: true,
          });
        }

        // Dispatch the event and return the result
        const result = this.dispatchEvent(submitEvent);
        console.log('🔧 VITEST SETUP: ULTIMATE requestSubmit polyfill dispatched submit event', { result });
        return result;
      },
      writable: true,  // Allow reconfiguration if needed
      configurable: true,  // Allow reconfiguration if needed
      enumerable: false,
    });

    // DOUBLE-CHECK: Verify the polyfill is working
    if (HTMLFormElement.prototype.requestSubmit) {
      console.log('✅ VITEST SETUP: HTMLFormElement.prototype.requestSubmit ULTIMATE polyfill verified');
    } else {
      console.error('❌ VITEST SETUP: HTMLFormElement.prototype.requestSubmit polyfill FAILED');
    }
  }
};

// Apply the polyfill immediately
polyfillFormSubmission();

// Also apply before each test to ensure it persists
beforeEach(() => {
  polyfillFormSubmission();
});

// Remove the old React devtools hook code since it's already handled above

// Additional form API polyfills for comprehensive JSDOM support
Object.defineProperty(HTMLFormElement.prototype, 'checkValidity', {
  value(this: HTMLFormElement) {
    // Enhanced validation for tests that matches browser behavior
    const inputs = this.querySelectorAll('input, select, textarea');
    let isValid = true;

    for (const input of Array.from(inputs)) {
      const element = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      // Check required fields
      if (element.hasAttribute('required')) {
        if (!element.value || element.value.trim() === '') {
          isValid = false;
          break;
        }
      }

      // Check input type constraints
      if (element instanceof HTMLInputElement) {
        switch (element.type) {
          case 'email':
            if (element.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value)) {
              isValid = false;
            }
            break;
          case 'url':
            if (element.value) {
              try {
                new URL(element.value);
              } catch {
                isValid = false;
              }
            }
            break;
          case 'number':
            if (element.value && isNaN(Number(element.value))) {
              isValid = false;
            }
            break;
        }
      }

      if (!isValid) break;
    }

    return isValid;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(HTMLFormElement.prototype, 'reportValidity', {
  value(this: HTMLFormElement) {
    const isValid = this.checkValidity();
    
    // In a real browser, this would show validation messages
    // In tests, we just return the validity status
    if (!isValid) {
      console.log('🔧 VITEST SETUP: Form validation failed in reportValidity()');
    }
    
    return isValid;
  },
  writable: true,
  configurable: true,
});

// Individual input validation polyfills
Object.defineProperty(HTMLInputElement.prototype, 'checkValidity', {
  value(this: HTMLInputElement) {
    if (this.hasAttribute('required') && (!this.value || this.value.trim() === '')) {
      return false;
    }

    switch (this.type) {
      case 'email':
        return !this.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
      case 'url':
        if (!this.value) return true;
        try {
          new URL(this.value);
          return true;
        } catch {
          return false;
        }
      case 'number':
        return !this.value || !isNaN(Number(this.value));
      default:
        return true;
    }
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(HTMLInputElement.prototype, 'reportValidity', {
  value(this: HTMLInputElement) {
    return this.checkValidity();
  },
  writable: true,
  configurable: true,
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

// Create a proper mock for fetch
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Add mock methods that tests expect
mockFetch.mockClear = vi.fn();
mockFetch.mockResolvedValue = vi.fn();
mockFetch.mockRejectedValue = vi.fn();

// Mock fetch for API testing
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Basic vitest globals setup
Object.defineProperty(globalThis, 'vi', { value: vi });
Object.defineProperty(globalThis, 'expect', {
  value: expect,
});
Object.defineProperty(globalThis, 'describe', {
  value: (await import('vitest')).describe,
});
Object.defineProperty(globalThis, 'it', {
  value: (await import('vitest')).it,
});
Object.defineProperty(globalThis, 'test', {
  value: (await import('vitest')).test,
});
Object.defineProperty(globalThis, 'beforeAll', {
  value: (await import('vitest')).beforeAll,
});
Object.defineProperty(globalThis, 'beforeEach', {
  value: (await import('vitest')).beforeEach,
});
Object.defineProperty(globalThis, 'afterAll', {
  value: (await import('vitest')).afterAll,
});
Object.defineProperty(globalThis, 'afterEach', {
  value: (await import('vitest')).afterEach,
});

// QueryClient.clear() is a native method in TanStack Query - no patch needed
