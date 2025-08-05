/**
 * Executive Dashboard Service Tests
 * Story 7.1: Executive Dashboard Implementation
 * 
 * Tests for the backend service layer of the executive dashboard
 */

import { createMockSupabaseClient } from '../../utils/test-helpers'
import { ExecutiveDashboardService } from '../../lib/services/executive-dashboard'

// Mock the Supabase client
jest.mock('../../app/utils/supabase/server', () => ({
  createClient: jest.fn()
}))

const mockSupabase = createMockSupabaseClient()

describe('ExecutiveDashboardService', () => {
  let service: ExecutiveDashboardService

  beforeEach(() => {
    service = new ExecutiveDashboardService()
    jest.clearAllMocks()
    ;(require('../../app/utils/supabase/server').createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getKPIs', () => {
    it('should fetch KPIs for a clinic and period', async () => {
      const mockKPIs = [
        {
          id: '1',
          clinic_id: 'clinic-1',
          kpi_name: 'total_revenue',
          kpi_value: 85000,
          unit: 'BRL',
          period_type: 'monthly',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: mockKPIs,
                    error: null
                  })
                })
              })
            })
          })
        })
      })

      const result = await service.getKPIs(
        'clinic-1',
        'monthly',
        '2024-01-01',
        '2024-01-31'
      )

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockKPIs)
      expect(mockSupabase.from).toHaveBeenCalledWith('executive_kpi_values')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                  })
                })
              })
            })
          })
        })
      })

      const result = await service.getKPIs(
        'clinic-1',
        'monthly',
        '2024-01-01',
        '2024-01-31'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('getAlerts', () => {
    it('should fetch active alerts for a clinic', async () => {
      const mockAlerts = [
        {
          id: '1',
          clinic_id: 'clinic-1',
          alert_type: 'revenue_drop',
          severity: 'high',
          title: 'Revenue Alert',
          message: 'Revenue is below threshold',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockAlerts,
                error: null
              })
            })
          })
        })
      })

      const result = await service.getAlerts('clinic-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAlerts)
      expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_alerts')
    })
  })

  describe('getWidgetConfiguration', () => {
    it('should fetch widget configuration for a user', async () => {
      const mockWidgets = [
        {
          id: '1',
          clinic_id: 'clinic-1',
          user_id: 'user-1',
          widget_type: 'revenue_chart',
          position_x: 0,
          position_y: 0,
          width: 6,
          height: 4,
          configuration: { chart_type: 'line' }
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockWidgets,
                error: null
              })
            })
          })
        })
      })

      const result = await service.getWidgetConfiguration('clinic-1', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockWidgets)
    })
  })

  describe('saveWidgetConfiguration', () => {
    it('should save widget configuration', async () => {
      const widgetData = {
        clinic_id: 'clinic-1',
        user_id: 'user-1',
        widget_type: 'revenue_chart',
        position_x: 0,
        position_y: 0,
        width: 6,
        height: 4,
        configuration: { chart_type: 'line' }
      }

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...widgetData, id: '1' }],
            error: null
          })
        })
      })

      const result = await service.saveWidgetConfiguration(widgetData)

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_widgets')
    })
  })

  describe('getReports', () => {
    it('should fetch reports for a clinic', async () => {
      const mockReports = [
        {
          id: '1',
          clinic_id: 'clinic-1',
          report_name: 'Executive Summary',
          report_type: 'executive_summary',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockReports,
              error: null
            })
          })
        })
      })

      const result = await service.getReports('clinic-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockReports)
    })
  })

  describe('generateReport', () => {
    it('should create a new report request', async () => {
      const reportData = {
        clinic_id: 'clinic-1',
        report_name: 'Monthly Report',
        report_type: 'executive_summary',
        period_type: 'monthly',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        format: 'pdf',
        requested_by: 'user-1'
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...reportData, id: '1', status: 'generating' }],
            error: null
          })
        })
      })

      const result = await service.generateReport(reportData)

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_reports')
    })
  })

  describe('comparePerformance', () => {
    it('should calculate performance comparison between periods', async () => {
      const currentPeriodKPIs = [
        { kpi_name: 'total_revenue', kpi_value: 100000 },
        { kpi_name: 'total_appointments', kpi_value: 350 }
      ]

      const previousPeriodKPIs = [
        { kpi_name: 'total_revenue', kpi_value: 85000 },
        { kpi_name: 'total_appointments', kpi_value: 300 }
      ]

      // Mock two separate calls for current and previous periods
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                      data: currentPeriodKPIs,
                      error: null
                    })
                  })
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                      data: previousPeriodKPIs,
                      error: null
                    })
                  })
                })
              })
            })
          })
        })

      const result = await service.comparePerformance(
        'clinic-1',
        'monthly',
        '2024-02-01',
        '2024-02-29',
        '2024-01-01',
        '2024-01-31'
      )

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('total_revenue')
      expect(result.data?.total_revenue).toEqual({
        current: 100000,
        previous: 85000,
        change: 15000,
        changePercent: 17.65
      })
    })
  })
})
