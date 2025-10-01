import { cleanup } from '@testing-library/react'
import * as React from 'react'
import { vi } from 'vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupMockApi } from './mocks/handlers'
import { setupDOMEnvironment } from './setup/environment'

// Setup DOM environment for tests
const { dom: _dom } = setupDOMEnvironment()

import '@testing-library/jest-dom'

// Mock console methods in test environment to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList)),
})

// Mock IntersectionObserver for scroll and visibility tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch API for tRPC and API calls
global.fetch = vi.fn()

// Setup global test configurations for healthcare compliance
let mockApiCleanup: (() => void) | null = null

beforeAll(() => {
  console.warn('🧪 Test environment setup complete - Healthcare compliance enabled')

  // Setup simplified mock API server
  const { cleanup } = setupMockApi()
  mockApiCleanup = cleanup
  console.warn('🌐 Mock API server started (simplified approach)')

  // Mock performance API for healthcare timing measurements
  if (global.performance) {
    // Define/override individual methods without replacing the Performance prototype
    Object.defineProperty(global.performance, 'now', {
      configurable: true,
      writable: true,
      value: vi.fn(() => Date.now()),
    })
    Object.defineProperty(global.performance, 'mark', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    Object.defineProperty(global.performance, 'measure', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    Object.defineProperty(global.performance, 'getEntriesByName', {
      configurable: true,
      writable: true,
      value: vi.fn(() => []),
    })
    Object.defineProperty(global.performance, 'getEntriesByType', {
      configurable: true,
      writable: true,
      value: vi.fn(() => []),
    })
  } else {
    // If no global.performance exists (unlikely in JSDOM), create a minimal one
    Object.defineProperty(global, 'performance', {
      configurable: true,
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => []),
      } as unknown as Performance,
    })
  }

  // Mock crypto API for healthcare data encryption
  const mockCrypto = {
    getRandomValues: vi.fn(arr => arr),
    randomUUID: vi.fn(() =>
      'test-uuid-1234-5678-9abc-def012345678' as `${string}-${string}-${string}-${string}-${string}`
    ),
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      deriveBits: vi.fn(),
      deriveKey: vi.fn(),
      exportKey: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
      sign: vi.fn(),
      unwrapKey: vi.fn(),
      verify: vi.fn(),
      wrapKey: vi.fn(),
    },
  }

  if (global.crypto) {
    // Use defineProperty to override the getter
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true,
      configurable: true,
    })
  } else {
    global.crypto = mockCrypto
  }

  // Setup healthcare-specific global mocks
  global.HEALTHCARE_TEST_MODE = true
  global.LGPD_COMPLIANCE_ENABLED = true

  // Mock healthcare-specific APIs
  global.HealthcareDataEncoder = vi.fn((data: unknown) => JSON.stringify(data))
  global.HealthcareDataDecoder = vi.fn((encoded: string) => JSON.parse(encoded))

  // Mock healthcare audit trail
  global.AuditTrail = {
    log: vi.fn((event: unknown) => {
      // Safely convert unknown event to string for logging
      const serialized = (() => {
        try {
          if (typeof event === 'string') return event
          if (typeof event === 'number' || typeof event === 'boolean' || event == null) {
            return String(event)
          }
          return JSON.stringify(event)
        } catch {
          return String(event)
        }
      })()
      console.warn('🏥 Audit: ' + serialized)
    }),
    getEvents: vi.fn(() => []),
    clear: vi.fn(),
  }

  console.warn('🧪 Global setup complete - Healthcare test environment ready')
})

// Mock common dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: null }, error: null })),
      signIn: vi.fn(() => ({ data: { user: null }, error: null })),
      signOut: vi.fn(() => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
        error: null,
      })),
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

vi.mock('@/lib/trpcClient', () => ({
  trpcClient: {
    mutation: vi.fn(),
    query: vi.fn(),
    subscription: vi.fn(),
  },
}))

vi.mock('@trpc/react-query', () => ({
  createTRPCReact: vi.fn(() => ({
    Provider: ({ children }: { children: React.ReactNode }) => children,
    useQuery: vi.fn(() => ({ data: null, isLoading: false, error: null, isPending: false })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isLoading: false,
      isPending: false,
      error: null,
    })),
    useInfiniteQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
    })),
  })),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', props, children),
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  useSearch: vi.fn(() => ({})),
  useParams: vi.fn(() => ({})),
  createRoute: vi.fn(),
  createRouter: vi.fn(),
  createRootRoute: vi.fn(),
  createMemoryRouter: vi.fn(routes => ({
    routes,
    state: { location: { pathname: '/' }, matches: [] },
    subscribe: vi.fn(),
    navigate: vi.fn(),
  })),
  // Changed to destructure incoming `router` prop into local `_router` to avoid unused param warning
  RouterProvider: (
    { router: _router, children }: { router?: unknown; children: React.ReactNode },
  ) => React.createElement('div', { 'data-testid': 'router-provider' }, children),
  createFileRoute: vi.fn(),
  createLazyRoute: vi.fn(),
  createLazyFileRoute: vi.fn(),
  getRouteApi: vi.fn(),
  lazyRouteComponent: vi.fn(),
  Outlet: () => React.createElement('div', null, 'Outlet'),
  Match: () => React.createElement('div', null, 'Match'),
  defer: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
  isRedirect: vi.fn(() => false),
  isNotFound: vi.fn(() => false),
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useQuery: vi.fn(() => ({ data: null, isLoading: false, isPending: false, error: null })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, isPending: false, error: null })),
  useInfiniteQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
  })),
}))

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {}, isValid: true, isDirty: false },
    control: {},
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    trigger: vi.fn(),
  })),
  Controller: ({ render }: { render: (props: unknown) => React.ReactNode }) =>
    render({ field: {} }),
}))

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

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  parseISO: vi.fn(() => new Date()),
  addDays: vi.fn(() => new Date()),
  subDays: vi.fn(() => new Date()),
  isToday: vi.fn(() => true),
  isTomorrow: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
  formatISO: vi.fn(() => '2024-01-01T00:00:00.000Z'),
}))

vi.mock('@/config/healthcare', () => ({
  LGPD_CONFIG: {
    enabled: true,
    dataRetentionDays: 365,
    anonymizationEnabled: true,
    consentRequired: true,
    auditTrailEnabled: true,
  },
  HEALTHCARE_REGIONS: {
    BR: {
      timezone: 'America/Sao_Paulo',
      dateFormat: 'dd/MM/yyyy',
      language: 'pt-BR',
      currency: 'BRL',
    },
  },
}))

vi.mock('@/lib/api', () => ({
  api: {
    appointments: {
      list: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: vi.fn(() => Promise.resolve({ data: { id: 'appointment-123' } })),
      update: vi.fn(() => Promise.resolve({ data: { id: 'appointment-123' } })),
      delete: vi.fn(() => Promise.resolve({ success: true })),
    },
    patients: {
      list: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: vi.fn(() => Promise.resolve({ data: { id: 'patient-123' } })),
      update: vi.fn(() => Promise.resolve({ data: { id: 'patient-123' } })),
      delete: vi.fn(() => Promise.resolve({ success: true })),
      getById: vi.fn(() => Promise.resolve({ data: { id: 'patient-123' } })),
    },
    professionals: {
      list: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: vi.fn(() => Promise.resolve({ data: { id: 'professional-123' } })),
      update: vi.fn(() => Promise.resolve({ data: { id: 'professional-123' } })),
      delete: vi.fn(() => Promise.resolve({ success: true })),
    },
    inventory: {
      list: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: vi.fn(() => Promise.resolve({ data: { id: 'product-123' } })),
      update: vi.fn(() => Promise.resolve({ data: { id: 'product-123' } })),
      delete: vi.fn(() => Promise.resolve({ success: true })),
    },
    aiClinicalSupport: {
      getPatientTreatmentHistory: vi.fn(() => Promise.resolve({ treatments: [] })),
      createPatientAssessment: vi.fn(() => Promise.resolve({ success: true })),
    },
    healthcare: {
      assessments: {
        create: vi.fn(() => Promise.resolve({ data: { id: 'assessment-123' } })),
        update: vi.fn(() => Promise.resolve({ data: { id: 'assessment-123' } })),
        delete: vi.fn(() => Promise.resolve({ success: true })),
      },
      compliance: {
        check: vi.fn(() => Promise.resolve({ valid: true, issues: [] })),
        audit: vi.fn(() => Promise.resolve({ id: 'audit-123' })),
      },
    },
  },
  createApiClient: vi.fn(() => ({
    appointments: {
      list: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: vi.fn(() => Promise.resolve({ data: { id: 'appointment-123' } })),
    },
  })),
}))

vi.mock('@/services/healthcare', () => ({
  usePatientData: vi.fn(() => ({ data: null, isLoading: false, isPending: false })),
  useMedicalRecords: vi.fn(() => ({ data: null, isLoading: false, isPending: false })),
  useAppointments: vi.fn(() => ({ data: null, isLoading: false, isPending: false })),
  useConsent: vi.fn(() => ({ data: null, isLoading: false, isPending: false })),
  useLGPDCompliance: vi.fn(() => ({ data: null, isLoading: false, isPending: false })),
}))

vi.mock('@/utils/healthcare', () => ({
  validateCPF: vi.fn(() => true),
  validatePhone: vi.fn(() => true),
  formatHealthcareDate: vi.fn(() => '01/01/2024'),
  anonymizePatientData: vi.fn((data: unknown) => data),
  generateAuditTrail: vi.fn(() => ({ id: 'audit-123', timestamp: new Date().toISOString() })),
}))

// Setup global test utilities following tools/tests patterns
beforeAll(() => {
  Object.assign(global, {
    describe: vi.fn(),
    it: vi.fn(),
    test: vi.fn(),
  })
})

// Setup global test timeout for healthcare operations
// Note: Test timeout is configured in vitest.config.ts

// Cleanup after each test to prevent cross-test contamination
afterEach(() => {
  // Remove DOM rendered nodes and cleanup side-effects from @testing-library/react
  cleanup()

  // Clear mocks created with vitest to avoid cross-test leakage
  vi.clearAllMocks()
})

// Ensure any started mock servers are stopped after the whole suite
afterAll(() => {
  if (mockApiCleanup) {
    try {
      mockApiCleanup()
    } catch {
      /* ignore cleanup errors */
    } finally {
      mockApiCleanup = null
    }
  }
})
