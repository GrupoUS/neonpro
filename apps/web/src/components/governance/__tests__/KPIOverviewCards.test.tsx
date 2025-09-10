import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import { KPIOverviewCards } from '../KPIOverviewCards'

describe('KPIOverviewCards', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('renders KPI overview cards', () => {
    renderWithProviders(<KPIOverviewCards />)
    expect(screen.getByText('Total KPIs')).toBeInTheDocument()
  })

  it('displays critical alerts card', () => {
    renderWithProviders(<KPIOverviewCards />)
    expect(screen.getByText('Critical Alerts')).toBeInTheDocument()
  })

  it('shows compliance score card', () => {
    renderWithProviders(<KPIOverviewCards />)
    expect(screen.getByText('Compliance Score')).toBeInTheDocument()
  })

  it('displays data quality score card', () => {
    renderWithProviders(<KPIOverviewCards />)
    expect(screen.getByText('Data Quality Score')).toBeInTheDocument()
  })
})