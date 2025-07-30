/**
 * Test Setup Configuration
 * Configures testing environment for React Testing Library and Jest
 */

import '@testing-library/jest-dom';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client with correct structure
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
  },
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
};

jest.mock('../app/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
  createLegacyClient: jest.fn(() => mockSupabaseClient),
  createOptimizedClient: jest.fn(() => mockSupabaseClient),
}));

// Mock @supabase/supabase-js directly
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock AuditLogger to prevent audit log warnings
const mockAuditLog = jest.fn().mockResolvedValue(undefined);
jest.mock('../lib/auth/audit/audit-logger', () => ({
  AuditLogger: jest.fn().mockImplementation(() => ({
    log: mockAuditLog,
  })),
}));

// Export mock for test access
global.mockAuditLog = mockAuditLog;

// Mock React Query client
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  QueryClient: jest.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date) => date.toISOString()),
  parseISO: jest.fn((str: string) => new Date(str)),
  isValid: jest.fn(() => true),
  addDays: jest.fn((date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfMonth: jest.fn((date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: jest.fn((date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  BarChart: ({ children }: { children: React.ReactNode }) => ({ type: 'div', props: { 'data-testid': 'bar-chart', children } }),
  LineChart: ({ children }: { children: React.ReactNode }) => ({ type: 'div', props: { 'data-testid': 'line-chart', children } }),
  PieChart: ({ children }: { children: React.ReactNode }) => ({ type: 'div', props: { 'data-testid': 'pie-chart', children } }),
  Bar: () => ({ type: 'div', props: { 'data-testid': 'bar' } }),
  Line: () => ({ type: 'div', props: { 'data-testid': 'line' } }),
  Pie: () => ({ type: 'div', props: { 'data-testid': 'pie' } }),
  XAxis: () => ({ type: 'div', props: { 'data-testid': 'x-axis' } }),
  YAxis: () => ({ type: 'div', props: { 'data-testid': 'y-axis' } }),
  CartesianGrid: () => ({ type: 'div', props: { 'data-testid': 'cartesian-grid' } }),
  Tooltip: () => ({ type: 'div', props: { 'data-testid': 'tooltip' } }),
  Legend: () => ({ type: 'div', props: { 'data-testid': 'legend' } }),
  Cell: () => ({ type: 'div', props: { 'data-testid': 'cell' } }),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn();