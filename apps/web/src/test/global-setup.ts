import { beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW server for API mocking
export const server = setupServer(...handlers);

beforeAll(() => {
  // Enable API mocking before all tests
  server.listen({ onUnhandledRequest: 'error' });
  
  // Setup global test configurations
  console.log('🧪 Test environment setup complete');
  
  // Mock global APIs for consistent testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
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
  
  // Mock performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
  };
});

// Mock vi if not available
if (typeof vi === 'undefined') {
  global.vi = {
    fn: (impl?: Function) => {
      const mockFn = impl || (() => {});
      mockFn.mock = {
        calls: [],
        instances: [],
        invocationCallOrder: [],
        results: [],
        reset: () => {
          mockFn.mock.calls = [];
          mockFn.mock.instances = [];
          mockFn.mock.invocationCallOrder = [];
          mockFn.mock.results = [];
        },
        mockClear: () => {
          mockFn.mock.calls = [];
          mockFn.mock.instances = [];
        },
        mockImplementation: (newImpl: Function) => {
          return Object.assign(mockFn, newImpl);
        },
        mockReturnValue: (value: any) => {
          return Object.assign(mockFn, () => value);
        },
        mockResolvedValue: (value: any) => {
          return Object.assign(mockFn, async () => value);
        },
        mockRejectedValue: (value: any) => {
          return Object.assign(mockFn, async () => { throw value; });
        },
      };
      return mockFn;
    },
    clearAllMocks: () => {},
    resetAllMocks: () => {},
    restoreAllMocks: () => {},
    spyOn: () => vi.fn(),
  };
}