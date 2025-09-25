import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { render, RenderOptions } from '@testing-library/react'
import { createElement as ReactCreateElement, ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'
import { routeTree } from '../routeTree.gen'
import '@testing-library/jest-dom'

// Note: DOM setup is now handled in individual test files

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  // Create QueryClient for each test to prevent cross-test contamination
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
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress errors in tests
    },
  })

  // Create router for navigation testing
  const router = createRouter({ routeTree })

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return ReactCreateElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
    router,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      data: [],
      error: null,
    }),
    insert: vi.fn().mockReturnValue({
      data: null,
      error: null,
    }),
    update: vi.fn().mockReturnValue({
      data: null,
      error: null,
    }),
    delete: vi.fn().mockReturnValue({
      data: null,
      error: null,
    }),
  }),
})

// Wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock localStorage
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: Object.keys(store).length,
  }
}

// Test data generators
export const generateMockPatient = (overrides = {}) => ({
  id: 'test-patient-id',
  fullName: 'Test Patient',
  phonePrimary: '+55 11 9999-8888',
  email: 'test@example.com',
  birthDate: '1990-01-01',
  gender: 'F',
  isActive: true,
  lgpdConsentGiven: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockAppointment = (overrides = {}) => ({
  id: 'test-appointment-id',
  patientId: 'test-patient-id',
  professionalId: 'test-professional-id',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  status: 'SCHEDULED',
  title: 'Test Appointment',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})
