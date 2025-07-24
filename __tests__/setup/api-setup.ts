/**
 * Jest Setup for API Testing
 * Configures all necessary mocks for testing API routes and authentication flows
 */

import React from 'react';

// Setup testing environment
import '@testing-library/jest-dom';

// Polyfills for Node.js testing environment
try {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
} catch {
  // Fallback if util polyfills not available
  global.TextEncoder = class TextEncoder {
    encode(input: string) {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  };
  global.TextDecoder = class TextDecoder {
    decode(input: Uint8Array) {
      return Buffer.from(input).toString('utf8');
    }
  };
}

// Setup HTTP polyfills
try {
  const { Request, Response, Headers } = require('undici');
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
} catch {
  // Fallback to global fetch polyfill if undici not available
  global.Request = class MockRequest {};
  global.Response = class MockResponse {};
  global.Headers = class MockHeaders {};
}

// Polyfill fetch for Node.js testing environment
try {
  global.fetch = require('node-fetch');
} catch {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }));
}

// Mock Next.js modules that are not compatible with Jest
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/dashboard',
    searchParams: new URLSearchParams(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
  permanentRedirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(() => ({ value: 'test-session' })),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
  }),
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return (fn: () => any) => {
    const Component = fn();
    if (Component.then) {
      return Component;
    }
    return Component;
  };
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

// Mock Supabase client (legacy client)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      returns: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user' } } }, error: null })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: {} },
        unsubscribe: jest.fn(),
      })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
      })),
    },
  })),
}));

// Enhanced Mock for @supabase/ssr with complete query builder chain support
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => {
    // Create a comprehensive query builder mock
    const createQueryBuilder = (table?: string) => {
      const queryBuilder = {
        // Query methods
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        
        // Filter methods
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        containedBy: jest.fn().mockReturnThis(),
        rangeGt: jest.fn().mockReturnThis(),
        rangeGte: jest.fn().mockReturnThis(),
        rangeLt: jest.fn().mockReturnThis(),
        rangeLte: jest.fn().mockReturnThis(),
        rangeAdjacent: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        
        // Transform methods
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        csv: jest.fn().mockReturnThis(),
        explain: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        
        // Promise interface
        then: jest.fn((resolve) => {
          const mockData = table === 'user_sessions' 
            ? [{ id: 'session-1', user_id: 'mock-user-id', active: true, created_at: new Date().toISOString() }]
            : table === 'security_alerts'
            ? [{ id: 'alert-1', type: 'failed_login', severity: 'medium', created_at: new Date().toISOString() }]
            : table === 'compliance_violations'
            ? [{ id: 'violation-1', type: 'data_access', status: 'resolved', created_at: new Date().toISOString() }]
            : [{ id: 'mock-id', created_at: new Date().toISOString() }];
          
          return resolve({ data: mockData, error: null });
        }),
        catch: jest.fn().mockReturnThis(),
      };
      
      return queryBuilder;
    };

    return {
      auth: {
        getUser: jest.fn(async () => ({
          data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
          error: null,
        })),
        getSession: jest.fn(async () => ({
          data: { session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } },
          error: null,
        })),
        signOut: jest.fn(async () => ({ error: null })),
        onAuthStateChange: jest.fn((callback) => {
          setTimeout(() => {
            callback('SIGNED_IN', { 
              access_token: 'mock-token', 
              refresh_token: 'mock-refresh',
              user: { id: 'mock-user-id', email: 'test@example.com' }
            });
          }, 0);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
        signInWithPassword: jest.fn(async () => ({
          data: { user: { id: 'mock-user-id' }, session: { access_token: 'mock-token' } },
          error: null,
        })),
        signUp: jest.fn(async () => ({
          data: { user: { id: 'mock-user-id' }, session: null },
          error: null,
        })),
        resetPasswordForEmail: jest.fn(async () => ({ error: null })),
        updateUser: jest.fn(async () => ({
          data: { user: { id: 'mock-user-id' } },
          error: null,
        })),
      },
      from: jest.fn((table: string) => createQueryBuilder(table)),
      rpc: jest.fn(async () => ({ data: null, error: null })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ data: null, error: null })),
          download: jest.fn(async () => ({ data: null, error: null })),
          list: jest.fn(async () => ({ data: [], error: null })),
          remove: jest.fn(async () => ({ data: null, error: null })),
        })),
      },
    };
  }),
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
        error: null,
      })),
      getSession: jest.fn(async () => ({
        data: { session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } },
        error: null,
      })),
      signOut: jest.fn(async () => ({ error: null })),
      onAuthStateChange: jest.fn((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', { 
            access_token: 'mock-token', 
            refresh_token: 'mock-refresh',
            user: { id: 'mock-user-id', email: 'test@example.com' }
          });
        }, 0);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn(async (resolve) => resolve({ data: [], error: null })),
    })),
  })),
}));

// Mock PerformanceTracker as a named export
jest.mock('@/lib/auth/performance-tracker', () => ({
  PerformanceTracker: {
    recordMetric: jest.fn(),
    getMetrics: jest.fn(() => ({})),
    reset: jest.fn(),
    getInstance: jest.fn(() => ({
      recordMetric: jest.fn(),
      getMetrics: jest.fn(() => ({})),
      reset: jest.fn(),
    })),
  },
}));

// Mock createServerClient as global function for direct imports
global.createServerClient = jest.fn(() => {
  const createQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    raw: jest.fn().mockReturnThis(),
    then: jest.fn(async (resolve) => resolve({ data: [], error: null })),
  });

  return {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: { id: 'mock-user-id' } },
        error: null,
      })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => createQueryBuilder()),
  };
});

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      list: jest.fn(() => Promise.resolve({ data: [] })),
      retrieve: jest.fn(() => Promise.resolve({ id: 'cus_test' })),
      create: jest.fn(() => Promise.resolve({ id: 'cus_test' })),
    },
    subscriptions: {
      list: jest.fn(() => Promise.resolve({ data: [] })),
      retrieve: jest.fn(() => Promise.resolve({ id: 'sub_test', status: 'active' })),
      create: jest.fn(() => Promise.resolve({ id: 'sub_test' })),
    },
    products: {
      list: jest.fn(() => Promise.resolve({ data: [] })),
    },
    prices: {
      list: jest.fn(() => Promise.resolve({ data: [] })),
    },
    invoices: {
      list: jest.fn(() => Promise.resolve({ data: [] })),
    },
    webhooks: {
      constructEvent: jest.fn(() => ({
        type: 'invoice.payment_succeeded',
        data: { object: { id: 'in_test' } },
      })),
    },
  }));
});

// Mock React Query (conditional mock)
try {
  require.resolve('@tanstack/react-query');
  jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(() => ({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })),
    useMutation: jest.fn(() => ({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isLoading: false,
      error: null,
    })),
    QueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    })),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  }));
} catch {
  // @tanstack/react-query not installed, skip mocking
}

// Mock Recharts for analytics components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'line-chart' }, children);
  },
  BarChart: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'bar-chart' }, children);
  },
  PieChart: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'pie-chart' }, children);
  },
  Line: () => React.createElement('div', { 'data-testid': 'line' }),
  Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
  Cell: () => React.createElement('div', { 'data-testid': 'cell' }),
  XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
  YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
  CartesianGrid: () => React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
}));

// Mock jsPDF for export functionality
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addPage: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: { width: 210, height: 297 },
    },
  }));
});

// Mock xlsx for Excel export
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    sheet_to_csv: jest.fn(() => 'test,csv,data'),
  },
  write: jest.fn(() => Buffer.from('test')),
  writeFile: jest.fn(),
}));

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15';
    if (formatStr === 'MMM dd, yyyy') return 'Jan 15, 2024';
    return '2024-01-15';
  }),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  startOfYear: jest.fn(() => new Date('2024-01-01')),
  endOfYear: jest.fn(() => new Date('2024-12-31')),
  subMonths: jest.fn(() => new Date('2023-12-15')),
  subYears: jest.fn(() => new Date('2023-01-15')),
  addDays: jest.fn(() => new Date('2024-01-16')),
  differenceInDays: jest.fn(() => 30),
  isAfter: jest.fn(() => true),
  isBefore: jest.fn(() => false),
  parseISO: jest.fn((dateStr) => new Date(dateStr)),
}));

// Mock lodash functions
jest.mock('lodash', () => ({
  groupBy: jest.fn((arr, key) => ({ group1: arr })),
  sumBy: jest.fn(() => 100),
  orderBy: jest.fn((arr) => arr),
  chunk: jest.fn((arr, size) => [arr.slice(0, size)]),
  debounce: jest.fn((fn) => fn),
  throttle: jest.fn((fn) => fn),
  isEmpty: jest.fn(() => false),
  isEqual: jest.fn(() => true),
}));

// Console silence for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: React.createFactory is deprecated'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
declare global {
  var __TEST_ENV__: boolean;
  var createServerClient: any;
}

global.__TEST_ENV__ = true;

export {};