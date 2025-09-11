import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GovernanceDashboard } from './GovernanceDashboard'

describe('GovernanceDashboard', () => {
  it('renders without crashing', () => {
    render(<GovernanceDashboard />)
    expect(screen.getByText(/governance/i)).toBeInTheDocument()
  })

  it('displays dashboard components', () => {
    render(<GovernanceDashboard />)
    
    // Check for key dashboard elements
    const dashboard = screen.getByRole('main') || screen.getByTestId('governance-dashboard')
    expect(dashboard).toBeInTheDocument()
  })
})