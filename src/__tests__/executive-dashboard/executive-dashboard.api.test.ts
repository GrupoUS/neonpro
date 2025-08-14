/**
 * Executive Dashboard API Integration Tests
 * Story 7.1: Executive Dashboard Implementation
 * 
 * Tests for the API routes of the executive dashboard
 */

import { NextRequest } from 'next/server'
import { GET as getKPIs } from '../../../app/api/executive-dashboard/kpis/route'
import { GET as getAlerts } from '../../../app/api/executive-dashboard/alerts/route'
import { GET as getWidgets, POST as saveWidgets } from '../../../app/api/executive-dashboard/widgets/route'
import { GET as getReports, POST as generateReport } from '../../../app/api/executive-dashboard/reports/route'
import { GET as getComparison } from '../../../app/api/executive-dashboard/comparison/route'

// Mock the services
jest.mock('../../../lib/services/executive-dashboard')
jest.mock('../../../app/utils/supabase/server')

const mockExecutiveDashboardService = {
  getKPIs: jest.fn(),
  getAlerts: jest.fn(),
  getWidgetConfiguration: jest.fn(),
  saveWidgetConfiguration: jest.fn(),
  getReports: jest.fn(),
  generateReport: jest.fn(),
  comparePerformance: jest.fn()
}

const mockAuth = {
  getUser: jest.fn(),
  getSession: jest.fn()
}

describe('Executive Dashboard API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful authentication
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null
    })
    
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null
    })
    
    // Mock Supabase client
    ;(require('../../../app/utils/supabase/server').createClient as jest.Mock).mockResolvedValue({
      auth: mockAuth
    })
    
    // Mock service
    ;(require('../../../lib/services/executive-dashboard').ExecutiveDashboardService as jest.Mock).mockImplementation(() => mockExecutiveDashboardService)
  })

  describe('/api/executive-dashboard/kpis', () => {
    it('should return KPIs for valid request', async () => {
      const mockKPIs = [
        {
          id: '1',
          kpi_name: 'total_revenue',
          kpi_value: 85000,
          unit: 'BRL'
        }
      ]

      mockExecutiveDashboardService.getKPIs.mockResolvedValue({
        success: true,
        data: mockKPIs
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/kpis?clinic_id=clinic-1&period_type=monthly&period_start=2024-01-01&period_end=2024-01-31')
      
      const response = await getKPIs(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockKPIs)
      expect(mockExecutiveDashboardService.getKPIs).toHaveBeenCalledWith(
        'clinic-1',
        'monthly',
        '2024-01-01',
        '2024-01-31'
      )
    })

    it('should return 400 for missing parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/kpis')
      
      const response = await getKPIs(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Missing required parameters')
    })

    it('should return 401 for unauthorized request', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/kpis?clinic_id=clinic-1&period_type=monthly&period_start=2024-01-01&period_end=2024-01-31')
      
      const response = await getKPIs(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
    })
  })

  describe('/api/executive-dashboard/alerts', () => {
    it('should return alerts for valid request', async () => {
      const mockAlerts = [
        {
          id: '1',
          alert_type: 'revenue_drop',
          severity: 'high',
          title: 'Revenue Alert',
          is_active: true
        }
      ]

      mockExecutiveDashboardService.getAlerts.mockResolvedValue({
        success: true,
        data: mockAlerts
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/alerts?clinic_id=clinic-1')
      
      const response = await getAlerts(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockAlerts)
    })
  })

  describe('/api/executive-dashboard/widgets', () => {
    it('should get widget configuration', async () => {
      const mockWidgets = [
        {
          id: '1',
          widget_type: 'revenue_chart',
          position_x: 0,
          position_y: 0,
          configuration: { chart_type: 'line' }
        }
      ]

      mockExecutiveDashboardService.getWidgetConfiguration.mockResolvedValue({
        success: true,
        data: mockWidgets
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/widgets?clinic_id=clinic-1&user_id=user-1')
      
      const response = await getWidgets(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockWidgets)
    })

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

      mockExecutiveDashboardService.saveWidgetConfiguration.mockResolvedValue({
        success: true,
        data: { ...widgetData, id: '1' }
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetData)
      })
      
      const response = await saveWidgets(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(mockExecutiveDashboardService.saveWidgetConfiguration).toHaveBeenCalledWith(widgetData)
    })
  })

  describe('/api/executive-dashboard/reports', () => {
    it('should get reports list', async () => {
      const mockReports = [
        {
          id: '1',
          report_name: 'Executive Summary',
          report_type: 'executive_summary',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockExecutiveDashboardService.getReports.mockResolvedValue({
        success: true,
        data: mockReports
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/reports?clinic_id=clinic-1')
      
      const response = await getReports(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockReports)
    })

    it('should generate new report', async () => {
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

      mockExecutiveDashboardService.generateReport.mockResolvedValue({
        success: true,
        data: { ...reportData, id: '1', status: 'generating' }
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })
      
      const response = await generateReport(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(mockExecutiveDashboardService.generateReport).toHaveBeenCalledWith(reportData)
    })
  })

  describe('/api/executive-dashboard/comparison', () => {
    it('should return performance comparison', async () => {
      const mockComparison = {
        total_revenue: {
          current: 100000,
          previous: 85000,
          change: 15000,
          changePercent: 17.65
        }
      }

      mockExecutiveDashboardService.comparePerformance.mockResolvedValue({
        success: true,
        data: mockComparison
      })

      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/comparison?clinic_id=clinic-1&period_type=monthly&current_start=2024-02-01&current_end=2024-02-29&previous_start=2024-01-01&previous_end=2024-01-31')
      
      const response = await getComparison(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockComparison)
    })

    it('should return 400 for missing comparison parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/executive-dashboard/comparison?clinic_id=clinic-1')
      
      const response = await getComparison(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Missing required parameters')
    })
  })
})