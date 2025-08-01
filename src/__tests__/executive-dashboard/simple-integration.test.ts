/**
 * Executive Dashboard Simple Integration Test
 * Story 7.1: Executive Dashboard Implementation
 * 
 * Simplified test to validate the basic functionality works
 */

import { ExecutiveDashboardService } from '../../lib/services/executive-dashboard'

// Mock the Supabase client
jest.mock('../../app/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnValue({
      data: [
        {
          id: '1',
          kpi_name: 'total_revenue',
          kpi_value: 85000,
          unit: 'BRL'
        }
      ],
      error: null
    })
  }))
}))

describe('ExecutiveDashboard Integration Test', () => {
  it('should create service instance', () => {
    const service = new ExecutiveDashboardService()
    expect(service).toBeDefined()
  })

  it('should have all required methods', () => {
    const service = new ExecutiveDashboardService()
    expect(typeof service.getKPIs).toBe('function')
    expect(typeof service.getAlerts).toBe('function')
    expect(typeof service.getWidgetConfiguration).toBe('function')
    expect(typeof service.saveWidgetConfiguration).toBe('function')
    expect(typeof service.getReports).toBe('function')
    expect(typeof service.generateReport).toBe('function')
    expect(typeof service.comparePerformance).toBe('function')
  })

  it('should fetch KPIs with mocked data', async () => {
    const service = new ExecutiveDashboardService()
    const result = await service.getKPIs('clinic-1', 'monthly', '2024-01-01', '2024-01-31')
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })
})