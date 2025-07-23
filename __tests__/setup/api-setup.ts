/**
 * Jest Setup for API Routes and Next.js Environment
 * Configures global polyfills, mocks, and test environment for Next.js 15 + TypeScript
 */

// Polyfill for Next.js API routes testing
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
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

// Mock Supabase client
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
}

global.__TEST_ENV__ = true;

export {};