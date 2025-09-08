/**
 * Comprehensive Test Utilities
 * NeonPro Healthcare System Test Suite
 *
 * @description Unified test utilities combining React Testing Library,
 *              subscription context, providers, and mock factories
 * @version 2.0.0
 * @created 2025-08-20
 */

import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { render, } from '@testing-library/react'
import type { RenderOptions, } from '@testing-library/react'
import type React from 'react'
import { vi, } from 'vitest'

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionStatus {
  id: string
  userId: string
  tier: string
  status: string
  startDate: Date
  endDate: Date
  autoRenew: boolean
  features: string[]
  limits: {
    maxUsers: number
    maxProjects: number
    maxStorage: number
  }
  usage: {
    users: number
    projects: number
    storage: number
  }
  metadata: {
    source: string
    environment: string
  }
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Factory for creating mock user profiles
 */
export const createMockUserProfile = (
  overrides: Partial<UserProfile> = {},
): UserProfile => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date('2025-01-01',),
  updatedAt: new Date('2025-07-22',),
  ...overrides,
})

/**
 * Factory for creating mock subscription statuses
 */
export const createMockSubscription = (
  overrides: Partial<SubscriptionStatus> = {},
): SubscriptionStatus => ({
  id: 'test-subscription-123',
  userId: 'test-user-123',
  tier: 'premium',
  status: 'active',
  startDate: new Date('2025-01-01',),
  endDate: new Date('2025-12-31',),
  autoRenew: true,
  features: ['feature1', 'feature2', 'premium-feature',],
  limits: {
    maxUsers: 100,
    maxProjects: 50,
    maxStorage: 10_000,
  },
  usage: {
    users: 10,
    projects: 5,
    storage: 1000,
  },
  metadata: {
    source: 'test',
    environment: 'testing',
  },
  ...overrides,
})

// ============================================================================
// Mock Providers
// ============================================================================

/**
 * Creates a mock QueryClient with disabled retries for testing
 */
export const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  },)
}

/**
 * Test wrapper component that provides all necessary contexts
 */
interface AllTheProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  queryClient = createTestQueryClient(),
},) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// ============================================================================
// Custom Render Function
// ============================================================================

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) => {
  const { queryClient, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children, },) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions, },)
}

// Legacy custom render (for backward compatibility)
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options, },)

// ============================================================================
// Test Helpers and Utilities
// ============================================================================

/**
 * Creates a mock implementation for subscription hooks
 */
export const createMockSubscriptionHook = (
  overrides: Partial<{
    data: SubscriptionStatus
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
  }> = {},
) => ({
  data: overrides.data || createMockSubscription(),
  isLoading: overrides.isLoading ?? false,
  isError: overrides.isError ?? false,
  error: overrides.error || undefined,
  refetch: overrides.refetch || vi.fn(),
})

/**
 * Waits for specified time in milliseconds (for async testing)
 */
export const waitFor = (ms: number,): Promise<void> =>
  new Promise((resolve,) => setTimeout(resolve, ms,))

/**
 * Creates mock server responses for fetch requests
 */
export const createMockResponse = (data: unknown, status = 200,) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => {
    if (typeof data === 'string') return data
    if (data === null || data === undefined) return ''
    return JSON.stringify(data,)
  },
})

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent, } from '@testing-library/user-event'
export { customRender as render, }
