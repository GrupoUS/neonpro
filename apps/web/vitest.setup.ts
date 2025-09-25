import { vi } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Mock console methods in test environment
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

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
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch API for tRPC calls
global.fetch = vi.fn()

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: null }, error: null })),
      signIn: vi.fn(() => ({ data: { user: null }, error: null })),
      signOut: vi.fn(() => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          data: vi.fn(() => ({ data: [], error: null })),
        })),
        data: vi.fn(() => ({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ data: null, error: null })),
      delete: vi.fn(() => ({ data: null, error: null })),
    })),
  })),
}))

// Mock tRPC client
vi.mock('@trpc/react-query', () => ({
  createTRPCReact: vi.fn(() => ({
    Provider: ({ children }: { children: React.ReactNode }) => children,
    useQuery: vi.fn(() => ({ data: null, isLoading: false, error: null })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, error: null })),
    useInfiniteQuery: vi.fn(() => ({ data: null, isLoading: false, error: null, fetchNextPage: vi.fn() })),
  })),
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  useSearch: vi.fn(() => ({})),
  useParams: vi.fn(() => ({})),
  createRoute: vi.fn(),
  createRouter: vi.fn(),
  RouterProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useQuery: vi.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, error: null })),
  useInfiniteQuery: vi.fn(() => ({ data: null, isLoading: false, error: null, fetchNextPage: vi.fn() })),
}))

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    control: {},
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
  })),
  Controller: ({ render }: any) => render({ field: {} }),
}))

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
  Toaster: () => React.createElement('div', null, 'Mock Toaster'),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  parseISO: vi.fn(() => new Date()),
  addDays: vi.fn(() => new Date()),
  subDays: vi.fn(() => new Date()),
  isToday: vi.fn(() => true),
  isTomorrow: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
}))

// Healthcare compliance mocks
vi.mock('../src/config/healthcare', () => ({
  LGPD_CONFIG: {
    enabled: true,
    dataRetentionDays: 365,
    anonymizationEnabled: true,
    consentRequired: true,
  },
  HEALTHCARE_REGIONS: {
    BR: {
      timezone: 'America/Sao_Paulo',
      dateFormat: 'dd/MM/yyyy',
      language: 'pt-BR',
    },
  },
}))

// Mock healthcare services
vi.mock('../src/services/healthcare', () => ({
  usePatientData: vi.fn(() => ({ data: null, isLoading: false })),
  useMedicalRecords: vi.fn(() => ({ data: null, isLoading: false })),
  useAppointments: vi.fn(() => ({ data: null, isLoading: false })),
  useConsent: vi.fn(() => ({ data: null, isLoading: false })),
}))

// Setup global test utilities
global.describe = describe
global.it = it
global.test = test
global.expect = expect
global.vi = vi

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Setup global test timeout
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000,
})

export {}