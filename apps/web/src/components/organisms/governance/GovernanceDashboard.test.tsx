import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { GovernanceDashboard } from './GovernanceDashboard'

describe('GovernanceDashboard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('renders without crashing', () => {
    renderWithProviders(<GovernanceDashboard />)
    expect(screen.getByText(/governance dashboard/i)).toBeInTheDocument()
  })

  it('displays dashboard components', () => {
    renderWithProviders(<GovernanceDashboard />)
    
    // Check for key dashboard elements
    const dashboard = screen.getByRole('main')
    expect(dashboard).toBeInTheDocument()
  })
})