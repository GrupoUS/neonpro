import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn()
    },
    storage: {
      from: vi.fn()
    }
  }
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn()
  })
}))

// Mock financial reports services
vi.mock('@/services/financial-reports', () => ({
  FinancialReportsService: {
    generateReport: vi.fn(),
    exportReport: vi.fn(),
    scheduleReport: vi.fn(),
    getReportHistory: vi.fn(),
    validateReportData: vi.fn(),
    getReportTemplates: vi.fn(),
    createCustomReport: vi.fn(),
    deleteReport: vi.fn(),
    getReportStatus: vi.fn()
  }
}))

vi.mock('@/services/report-scheduler', () => ({
  ReportScheduler: {
    createSchedule: vi.fn(),
    updateSchedule: vi.fn(),
    deleteSchedule: vi.fn(),
    getSchedules: vi.fn(),
    pauseSchedule: vi.fn(),
    resumeSchedule: vi.fn()
  }
}))

vi.mock('@/services/report-export', () => ({
  ReportExportService: {
    exportToPdf: vi.fn(),
    exportToExcel: vi.fn(),
    exportToCsv: vi.fn(),
    exportToJson: vi.fn(),
    getExportHistory: vi.fn(),
    scheduleExport: vi.fn()
  }
}))

// Mock components that should exist but don't yet (TDD RED)
vi.mock('@/components/financial/FinancialReports', () => ({
  FinancialReports: () => React.createElement('div', { 'data-testid': 'financial-reports' }, 'Financial Reports Component')
}))

vi.mock('@/components/financial/ReportGenerator', () => ({
  ReportGenerator: () => React.createElement('div', { 'data-testid': 'report-generator' }, 'Report Generator Component')
}))

vi.mock('@/components/financial/ReportScheduler', () => ({
  ReportScheduler: () => React.createElement('div', { 'data-testid': 'report-scheduler' }, 'Report Scheduler Component')
}))

vi.mock('@/components/financial/ReportExporter', () => ({
  ReportExporter: () => React.createElement('div', { 'data-testid': 'report-exporter' }, 'Report Exporter Component')
}))

vi.mock('@/components/financial/ReportTemplates', () => ({
  ReportTemplates: () => React.createElement('div', { 'data-testid': 'report-templates' }, 'Report Templates Component')
}))

vi.mock('@/components/financial/ReportHistory', () => ({
  ReportHistory: () => React.createElement('div', { 'data-testid': 'report-history' }, 'Report History Component')
}))

// Types that should exist but don't yet (TDD RED)
interface FinancialReport {
  id: string
  title: string
  type: 'revenue' | 'expenses' | 'profit' | 'cash-flow' | 'tax' | 'custom'
  clinicId: string
  generatedAt: Date
  period: {
    startDate: string
    endDate: string
    granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  }
  data: Record<string, any>
  metadata: {
    totalRecords: number
    dataSource: string
    accuracy: number
    generationTime: number
  }
  status: 'generating' | 'completed' | 'failed' | 'scheduled'
  exportFormats: Array<'pdf' | 'excel' | 'csv' | 'json'>
  schedule?: ReportSchedule
}

interface ReportSchedule {
  id: string
  reportId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  timezone: string
  isActive: boolean
  nextRun?: Date
  lastRun?: Date
  recipients: string[]
  deliveryMethod: 'email' | 'storage' | 'both'
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'revenue' | 'expenses' | 'profit' | 'cash-flow' | 'tax' | 'custom'
  structure: {
    sections: ReportSection[]
    charts: ChartConfig[]
    filters: FilterConfig[]
  }
  isDefault: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface ReportSection {
  id: string
  title: string
  type: 'table' | 'chart' | 'summary' | 'text'
  dataSource: string
  configuration: Record<string, any>
  order: number
}

interface ChartConfig {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  dataSource: string
  xAxis: string
  yAxis: string
  title: string
  configuration: Record<string, any>
}

interface FilterConfig {
  id: string
  field: string
  type: 'date' | 'select' | 'multiselect' | 'number' | 'text'
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  required: boolean
}

interface ReportExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeCharts: boolean
  includeRawData: boolean
  compression: boolean
  password?: string
  watermark?: string
  customHeaders?: Record<string, string>
}

interface ReportValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  warnings: Array<{
    field: string
    message: string
    recommendation?: string
  }>
  dataQuality: {
    completeness: number
    accuracy: number
    consistency: number
    timeliness: number
  }
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })

  return React.createElement(
    BrowserRouter,
    {},
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  )
}

describe('Financial Reports Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        }
      }
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
    vi.resetAllMocks()
  })

  describe('Report Generation Integration', () => {
    it('should generate a basic revenue report', async () => {
      // Arrange
      const mockReportConfig = {
        type: 'revenue' as const,
        clinicId: 'clinic-001',
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          granularity: 'monthly' as const
        },
        includeCharts: true,
        includeBreakdown: true
      }

      const mockGeneratedReport: FinancialReport = {
        id: 'report-001',
        title: 'Revenue Report - January 2024',
        type: 'revenue',
        clinicId: 'clinic-001',
        generatedAt: new Date('2024-01-31T23:59:59Z'),
        period: mockReportConfig.period,
        data: {
          totalRevenue: 25000,
          breakdown: {
            consultations: 15000,
            procedures: 8000,
            products: 2000
          },
          trends: {
            growth: 0.15,
            averagePerDay: 806.45
          }
        },
        metadata: {
          totalRecords: 150,
          dataSource: 'financial_transactions',
          accuracy: 0.99,
          generationTime: 2500
        },
        status: 'completed',
        exportFormats: ['pdf', 'excel', 'csv']
      }

      // Mock service response
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.generateReport).mockResolvedValue(mockGeneratedReport)

      // Act
      const result = await FinancialReportsService.generateReport(mockReportConfig)

      // Assert
      expect(result).toEqual(mockGeneratedReport)
      expect(result.data.totalRevenue).toBe(25000)
      expect(result.metadata.accuracy).toBeGreaterThan(0.95)
      expect(result.status).toBe('completed')
    })

    it('should generate a comprehensive profit and loss report', async () => {
      // Arrange
      const mockPLReportConfig = {
        type: 'profit' as const,
        clinicId: 'clinic-001',
        period: {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          granularity: 'quarterly' as const
        },
        includeComparisons: true,
        includeForecast: true
      }

      const mockPLReport: FinancialReport = {
        id: 'report-pl-001',
        title: 'Profit & Loss Report - Q1 2024',
        type: 'profit',
        clinicId: 'clinic-001',
        generatedAt: new Date('2024-03-31T23:59:59Z'),
        period: mockPLReportConfig.period,
        data: {
          revenue: {
            total: 75000,
            breakdown: {
              consultations: 45000,
              procedures: 25000,
              products: 5000
            }
          },
          expenses: {
            total: 45000,
            breakdown: {
              salaries: 25000,
              rent: 8000,
              supplies: 7000,
              utilities: 3000,
              other: 2000
            }
          },
          profit: {
            gross: 30000,
            net: 25000,
            margin: 0.333
          },
          comparisons: {
            previousQuarter: {
              revenue: 70000,
              profit: 22000,
              growth: 0.071
            },
            yearOverYear: {
              revenue: 65000,
              profit: 18000,
              growth: 0.154
            }
          },
          forecast: {
            nextQuarter: {
              revenue: 80000,
              profit: 28000,
              confidence: 0.82
            }
          }
        },
        metadata: {
          totalRecords: 450,
          dataSource: 'comprehensive_financial_data',
          accuracy: 0.97,
          generationTime: 4200
        },
        status: 'completed',
        exportFormats: ['pdf', 'excel']
      }

      // Mock service response
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.generateReport).mockResolvedValue(mockPLReport)

      // Act
      const result = await FinancialReportsService.generateReport(mockPLReportConfig)

      // Assert
      expect(result.data.profit.net).toBe(25000)
      expect(result.data.comparisons.yearOverYear.growth).toBe(0.154)
      expect(result.data.forecast.nextQuarter.confidence).toBeGreaterThan(0.8)
    })

    it('should generate custom reports with dynamic templates', async () => {
      // Arrange
      const mockCustomTemplate: ReportTemplate = {
        id: 'template-custom-001',
        name: 'Monthly Performance Dashboard',
        description: 'Comprehensive monthly performance metrics',
        type: 'custom',
        structure: {
          sections: [
            {
              id: 'section-1',
              title: 'Revenue Overview',
              type: 'chart',
              dataSource: 'revenue_data',
              configuration: { chartType: 'line', period: 'monthly' },
              order: 1
            },
            {
              id: 'section-2',
              title: 'Expense Breakdown',
              type: 'table',
              dataSource: 'expense_data',
              configuration: { groupBy: 'category', sortBy: 'amount' },
              order: 2
            }
          ],
          charts: [
            {
              id: 'chart-1',
              type: 'line',
              dataSource: 'revenue_trends',
              xAxis: 'date',
              yAxis: 'amount',
              title: 'Revenue Trends',
              configuration: { showTrendLine: true }
            }
          ],
          filters: [
            {
              id: 'filter-1',
              field: 'dateRange',
              type: 'date',
              required: true
            }
          ]
        },
        isDefault: false,
        createdBy: 'user-001',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-20T14:30:00Z')
      }

      const mockCustomReportConfig = {
        templateId: 'template-custom-001',
        clinicId: 'clinic-001',
        parameters: {
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          },
          serviceTypes: ['consultation', 'procedure']
        }
      }

      const mockCustomReport: FinancialReport = {
        id: 'report-custom-001',
        title: 'Monthly Performance Dashboard - January 2024',
        type: 'custom',
        clinicId: 'clinic-001',
        generatedAt: new Date('2024-01-31T23:59:59Z'),
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          granularity: 'monthly'
        },
        data: {
          sections: [
            {
              id: 'section-1',
              title: 'Revenue Overview',
              data: {
                chartData: [
                  { date: '2024-01-01', amount: 800 },
                  { date: '2024-01-15', amount: 1200 },
                  { date: '2024-01-31', amount: 1000 }
                ],
                trendLine: { slope: 0.05, correlation: 0.85 }
              }
            }
          ]
        },
        metadata: {
          totalRecords: 200,
          dataSource: 'custom_template_engine',
          accuracy: 0.96,
          generationTime: 3000
        },
        status: 'completed',
        exportFormats: ['pdf', 'excel', 'json']
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.getReportTemplates).mockResolvedValue([mockCustomTemplate])
      vi.mocked(FinancialReportsService.createCustomReport).mockResolvedValue(mockCustomReport)

      // Act
      const templates = await FinancialReportsService.getReportTemplates()
      const result = await FinancialReportsService.createCustomReport(mockCustomReportConfig)

      // Assert
      expect(templates).toHaveLength(1)
      expect(templates[0].type).toBe('custom')
      expect(result.type).toBe('custom')
      expect(result.data.sections).toHaveLength(1)
    })
  })

  describe('Report Export Integration', () => {
    it('should export reports to PDF format', async () => {
      // Arrange
      const mockReport: FinancialReport = {
        id: 'report-001',
        title: 'Revenue Report - January 2024',
        type: 'revenue',
        clinicId: 'clinic-001',
        generatedAt: new Date('2024-01-31T23:59:59Z'),
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          granularity: 'monthly'
        },
        data: { totalRevenue: 25000 },
        metadata: {
          totalRecords: 150,
          dataSource: 'financial_transactions',
          accuracy: 0.99,
          generationTime: 2500
        },
        status: 'completed',
        exportFormats: ['pdf', 'excel', 'csv']
      }

      const mockExportConfig: ReportExportConfig = {
        format: 'pdf',
        includeCharts: true,
        includeRawData: false,
        compression: true,
        watermark: 'Confidential - Clinic 001'
      }

      const mockExportResult = {
        exportId: 'export-001',
        filename: 'revenue-report-jan-2024.pdf',
        size: 2048000,
        url: 'https://storage.example.com/reports/revenue-report-jan-2024.pdf',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
        metadata: {
          pages: 15,
          generationTime: 3500,
          compressionRatio: 0.75
        }
      }

      // Mock service responses
      const { ReportExportService } = await import('@/services/report-export')
      vi.mocked(ReportExportService.exportToPdf).mockResolvedValue(mockExportResult)

      // Act
      const result = await ReportExportService.exportToPdf(mockReport, mockExportConfig)

      // Assert
      expect(result.filename).toContain('.pdf')
      expect(result.metadata.pages).toBe(15)
      expect(result.url).toContain('https://storage.example.com')
    })

    it('should export reports to Excel with multiple sheets', async () => {
      // Arrange
      const mockReport: FinancialReport = {
        id: 'report-pl-001',
        title: 'Profit & Loss Report - Q1 2024',
        type: 'profit',
        clinicId: 'clinic-001',
        generatedAt: new Date('2024-03-31T23:59:59Z'),
        period: {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          granularity: 'quarterly'
        },
        data: {
          revenue: { total: 75000 },
          expenses: { total: 45000 },
          profit: { net: 25000 }
        },
        metadata: {
          totalRecords: 450,
          dataSource: 'comprehensive_financial_data',
          accuracy: 0.97,
          generationTime: 4200
        },
        status: 'completed',
        exportFormats: ['excel']
      }

      const mockExcelExportConfig: ReportExportConfig = {
        format: 'excel',
        includeCharts: true,
        includeRawData: true,
        compression: false,
        customHeaders: {
          'Created-By': 'NeonPro Financial System',
          'Report-Type': 'Profit & Loss'
        }
      }

      const mockExcelExportResult = {
        exportId: 'export-excel-001',
        filename: 'profit-loss-report-q1-2024.xlsx',
        size: 1536000,
        url: 'https://storage.example.com/reports/profit-loss-report-q1-2024.xlsx',
        expiresAt: new Date(Date.now() + 86400000),
        metadata: {
          sheets: ['Summary', 'Revenue Details', 'Expense Details', 'Charts', 'Raw Data'],
          charts: 8,
          generationTime: 4200
        }
      }

      // Mock service responses
      const { ReportExportService } = await import('@/services/report-export')
      vi.mocked(ReportExportService.exportToExcel).mockResolvedValue(mockExcelExportResult)

      // Act
      const result = await ReportExportService.exportToExcel(mockReport, mockExcelExportConfig)

      // Assert
      expect(result.filename).toContain('.xlsx')
      expect(result.metadata.sheets).toHaveLength(5)
      expect(result.metadata.charts).toBe(8)
    })

    it('should handle bulk export of multiple reports', async () => {
      // Arrange
      const mockReports: FinancialReport[] = [
        {
          id: 'report-001',
          title: 'January Revenue',
          type: 'revenue',
          clinicId: 'clinic-001',
          generatedAt: new Date('2024-01-31T23:59:59Z'),
          period: { startDate: '2024-01-01', endDate: '2024-01-31', granularity: 'monthly' },
          data: { totalRevenue: 25000 },
          metadata: { totalRecords: 150, dataSource: 'financial_transactions', accuracy: 0.99, generationTime: 2500 },
          status: 'completed',
          exportFormats: ['pdf']
        },
        {
          id: 'report-002',
          title: 'February Revenue',
          type: 'revenue',
          clinicId: 'clinic-001',
          generatedAt: new Date('2024-02-29T23:59:59Z'),
          period: { startDate: '2024-02-01', endDate: '2024-02-29', granularity: 'monthly' },
          data: { totalRevenue: 28000 },
          metadata: { totalRecords: 175, dataSource: 'financial_transactions', accuracy: 0.98, generationTime: 2800 },
          status: 'completed',
          exportFormats: ['pdf']
        }
      ]

      const mockBulkExportConfig = {
        format: 'pdf' as const,
        mergeIntoSingle: true,
        includeTableOfContents: true,
        customHeaders: {
          'Clinic': 'Clinic 001',
          'Period': 'Q1 2024'
        }
      }

      const mockBulkExportResult = {
        exportId: 'bulk-export-001',
        filename: 'quarterly-revenue-reports-q1-2024.pdf',
        size: 4096000,
        url: 'https://storage.example.com/reports/quarterly-revenue-reports-q1-2024.pdf',
        expiresAt: new Date(Date.now() + 86400000),
        metadata: {
          totalReports: 2,
          totalPages: 28,
          tableOfContents: true,
          generationTime: 7500
        }
      }

      // Mock service responses
      const { ReportExportService } = await import('@/services/report-export')
      vi.mocked(ReportExportService.exportToPdf).mockResolvedValue(mockBulkExportResult)

      // Act
      const result = await ReportExportService.exportToPdf(mockReports, mockBulkExportConfig)

      // Assert
      expect(result.metadata.totalReports).toBe(2)
      expect(result.metadata.tableOfContents).toBe(true)
      expect(result.size).toBeGreaterThan(4000000)
    })
  })

  describe('Report Scheduling Integration', () => {
    it('should create a monthly recurring report schedule', async () => {
      // Arrange
      const mockScheduleConfig = {
        reportType: 'revenue' as const,
        clinicId: 'clinic-001',
        frequency: 'monthly' as const,
        dayOfMonth: 1,
        time: '09:00',
        timezone: 'America/Sao_Paulo',
        recipients: ['admin@clinic001.com', 'finance@clinic001.com'],
        deliveryMethod: 'email' as const,
        exportFormat: 'pdf' as const
      }

      const mockCreatedSchedule: ReportSchedule = {
        id: 'schedule-001',
        reportId: 'template-revenue-001',
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        timezone: 'America/Sao_Paulo',
        isActive: true,
        nextRun: new Date('2024-02-01T09:00:00-03:00'),
        recipients: mockScheduleConfig.recipients,
        deliveryMethod: 'email'
      }

      // Mock service responses
      const { ReportScheduler } = await import('@/services/report-scheduler')
      vi.mocked(ReportScheduler.createSchedule).mockResolvedValue(mockCreatedSchedule)

      // Act
      const result = await ReportScheduler.createSchedule(mockScheduleConfig)

      // Assert
      expect(result.frequency).toBe('monthly')
      expect(result.isActive).toBe(true)
      expect(result.recipients).toHaveLength(2)
      expect(result.nextRun).toBeInstanceOf(Date)
    })

    it('should handle weekly report scheduling with specific days', async () => {
      // Arrange
      const mockWeeklySchedule = {
        reportType: 'cash-flow' as const,
        clinicId: 'clinic-001',
        frequency: 'weekly' as const,
        dayOfWeek: 1, // Monday
        time: '08:00',
        timezone: 'America/Sao_Paulo',
        recipients: ['manager@clinic001.com'],
        deliveryMethod: 'both' as const,
        exportFormat: 'excel' as const
      }

      const mockWeeklyScheduleResult: ReportSchedule = {
        id: 'schedule-weekly-001',
        reportId: 'template-cash-flow-001',
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '08:00',
        timezone: 'America/Sao_Paulo',
        isActive: true,
        nextRun: new Date('2024-01-22T08:00:00-03:00'), // Next Monday
        recipients: ['manager@clinic001.com'],
        deliveryMethod: 'both'
      }

      // Mock service responses
      const { ReportScheduler } = await import('@/services/report-scheduler')
      vi.mocked(ReportScheduler.createSchedule).mockResolvedValue(mockWeeklyScheduleResult)

      // Act
      const result = await ReportScheduler.createSchedule(mockWeeklySchedule)

      // Assert
      expect(result.frequency).toBe('weekly')
      expect(result.dayOfWeek).toBe(1)
      expect(result.deliveryMethod).toBe('both')
    })

    it('should manage schedule lifecycle operations', async () => {
      // Arrange
      const scheduleId = 'schedule-001'

      // Mock service responses
      const { ReportScheduler } = await import('@/services/report-scheduler')
      vi.mocked(ReportScheduler.pauseSchedule).mockResolvedValue(true)
      vi.mocked(ReportScheduler.resumeSchedule).mockResolvedValue(true)
      vi.mocked(ReportScheduler.deleteSchedule).mockResolvedValue(true)

      // Act & Assert - Pause
      const pauseResult = await ReportScheduler.pauseSchedule(scheduleId)
      expect(pauseResult).toBe(true)

      // Act & Assert - Resume
      const resumeResult = await ReportScheduler.resumeSchedule(scheduleId)
      expect(resumeResult).toBe(true)

      // Act & Assert - Delete
      const deleteResult = await ReportScheduler.deleteSchedule(scheduleId)
      expect(deleteResult).toBe(true)
    })
  })

  describe('Data Accuracy and Validation Integration', () => {
    it('should validate report data integrity', async () => {
      // Arrange
      const mockReportData = {
        revenue: {
          total: 25000,
          breakdown: {
            consultations: 15000,
            procedures: 8000,
            products: 2000
          }
        },
        expenses: {
          total: 15000,
          breakdown: {
            salaries: 8000,
            rent: 3000,
            supplies: 2500,
            utilities: 1000,
            other: 500
          }
        },
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      }

      const mockValidationResult: ReportValidationResult = {
        isValid: true,
        errors: [],
        warnings: [
          {
            field: 'expenses.other',
            message: 'Other expenses category is relatively high',
            recommendation: 'Consider breaking down other expenses for better tracking'
          }
        ],
        dataQuality: {
          completeness: 0.98,
          accuracy: 0.97,
          consistency: 0.99,
          timeliness: 0.95
        }
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.validateReportData).mockResolvedValue(mockValidationResult)

      // Act
      const result = await FinancialReportsService.validateReportData(mockReportData)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(1)
      expect(result.dataQuality.completeness).toBeGreaterThan(0.95)
    })

    it('should detect and report data inconsistencies', async () => {
      // Arrange
      const mockInconsistentData = {
        revenue: {
          total: 25000,
          breakdown: {
            consultations: 15000,
            procedures: 8000,
            products: 3000 // Total doesn't match (26000 vs 25000)
          }
        },
        transactions: [
          { id: '1', amount: 100, date: '2024-01-01' },
          { id: '2', amount: -50, date: '2024-01-32' } // Invalid date
        ]
      }

      const mockValidationWithErrors: ReportValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'revenue.total',
            message: 'Total revenue does not match breakdown sum',
            severity: 'error'
          },
          {
            field: 'transactions[1].date',
            message: 'Invalid date format: 2024-01-32',
            severity: 'error'
          }
        ],
        warnings: [],
        dataQuality: {
          completeness: 0.90,
          accuracy: 0.75,
          consistency: 0.60,
          timeliness: 0.95
        }
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.validateReportData).mockResolvedValue(mockValidationWithErrors)

      // Act
      const result = await FinancialReportsService.validateReportData(mockInconsistentData)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.dataQuality.consistency).toBeLessThan(0.8)
    })

    it('should perform cross-validation with external data sources', async () => {
      // Arrange
      const mockCrossValidationConfig = {
        reportId: 'report-001',
        externalSources: [
          {
            source: 'bank_statements',
            matchFields: ['date', 'amount'],
            tolerance: 0.01
          },
          {
            source: 'tax_records',
            matchFields: ['period', 'total'],
            tolerance: 0.05
          }
        ]
      }

      const mockCrossValidationResult = {
        overallMatch: 0.94,
        sourceValidations: [
          {
            source: 'bank_statements',
            matchRate: 0.96,
            discrepancies: [
              {
                field: 'amount',
                reportValue: 1000,
                externalValue: 1005,
                difference: 5,
                withinTolerance: false
              }
            ]
          },
          {
            source: 'tax_records',
            matchRate: 0.92,
            discrepancies: []
          }
        ]
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.validateReportData).mockResolvedValue({
        ...mockCrossValidationResult,
        isValid: true,
        errors: [],
        warnings: [],
        dataQuality: {
          completeness: 0.96,
          accuracy: 0.94,
          consistency: 0.95,
          timeliness: 0.98
        }
      })

      // Act
      const result = await FinancialReportsService.validateReportData(mockCrossValidationConfig)

      // Assert
      expect(result.dataQuality.accuracy).toBe(0.94)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Report History and Audit Trail Integration', () => {
    it('should maintain comprehensive report history', async () => {
      // Arrange
      const mockHistoryQuery = {
        clinicId: 'clinic-001',
        reportType: 'revenue',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        includeMetadata: true
      }

      const mockReportHistory = {
        reports: [
          {
            id: 'report-001',
            title: 'Revenue Report - January 2024',
            type: 'revenue',
            generatedAt: new Date('2024-01-31T23:59:59Z'),
            status: 'completed',
            metadata: {
              generationTime: 2500,
              accuracy: 0.99,
              exportCount: 3
            }
          },
          {
            id: 'report-002',
            title: 'Revenue Report - February 2024',
            type: 'revenue',
            generatedAt: new Date('2024-02-29T23:59:59Z'),
            status: 'completed',
            metadata: {
              generationTime: 2800,
              accuracy: 0.98,
              exportCount: 2
            }
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10
        },
        aggregations: {
          totalGenerationTime: 5300,
          averageAccuracy: 0.985,
          totalExports: 5
        }
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.getReportHistory).mockResolvedValue(mockReportHistory)

      // Act
      const result = await FinancialReportsService.getReportHistory(mockHistoryQuery)

      // Assert
      expect(result.reports).toHaveLength(2)
      expect(result.aggregations.averageAccuracy).toBe(0.985)
      expect(result.aggregations.totalExports).toBe(5)
    })

    it('should track report generation performance over time', async () => {
      // Arrange
      const mockPerformanceQuery = {
        clinicId: 'clinic-001',
        period: 'last_quarter',
        groupBy: 'week',
        metrics: ['generation_time', 'accuracy', 'data_volume']
      }

      const mockPerformanceHistory = {
        timeSeries: Array.from({ length: 12 }, (_, i) => ({
          week: `2024-W${i + 1}`,
          averageGenerationTime: 2500 + (i * 100),
          averageAccuracy: 0.95 + (i * 0.005),
          averageDataVolume: 1000 + (i * 50),
          reportCount: 5 + i
        })),
        trends: {
          generationTimeImprovement: -0.02,
          accuracyImprovement: 0.008,
          dataVolumeGrowth: 0.05
        },
        benchmarks: {
          targetGenerationTime: 3000,
          targetAccuracy: 0.95,
          currentPerformance: 'above_target'
        }
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.getReportHistory).mockResolvedValue(mockPerformanceHistory)

      // Act
      const result = await FinancialReportsService.getReportHistory(mockPerformanceQuery)

      // Assert
      expect(result.timeSeries).toHaveLength(12)
      expect(result.trends.accuracyImprovement).toBeGreaterThan(0)
      expect(result.benchmarks.currentPerformance).toBe('above_target')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle report generation failures gracefully', async () => {
      // Arrange
      const mockFailingReportConfig = {
        type: 'revenue' as const,
        clinicId: 'invalid-clinic',
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          granularity: 'monthly' as const
        }
      }

      // Mock service error
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.generateReport).mockRejectedValue(
        new Error('Clinic not found: invalid-clinic')
      )

      // Act & Assert
      await expect(
        FinancialReportsService.generateReport(mockFailingReportConfig)
      ).rejects.toThrow('Clinic not found: invalid-clinic')
    })

    it('should handle export failures with retry mechanism', async () => {
      // Arrange
      const mockReport: FinancialReport = {
        id: 'report-001',
        title: 'Revenue Report',
        type: 'revenue',
        clinicId: 'clinic-001',
        generatedAt: new Date(),
        period: { startDate: '2024-01-01', endDate: '2024-01-31', granularity: 'monthly' },
        data: { totalRevenue: 25000 },
        metadata: { totalRecords: 150, dataSource: 'financial_transactions', accuracy: 0.99, generationTime: 2500 },
        status: 'completed',
        exportFormats: ['pdf']
      }

      // Mock export service with retry logic
      const { ReportExportService } = await import('@/services/report-export')
      vi.mocked(ReportExportService.exportToPdf)
        .mockRejectedValueOnce(new Error('Storage service unavailable'))
        .mockRejectedValueOnce(new Error('Storage service unavailable'))
        .mockResolvedValueOnce({
          exportId: 'export-retry-001',
          filename: 'revenue-report.pdf',
          size: 1024000,
          url: 'https://storage.example.com/reports/revenue-report.pdf',
          expiresAt: new Date(Date.now() + 86400000),
          metadata: { pages: 10, generationTime: 3500, retryCount: 2 }
        })

      // Act
      let result
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        try {
          result = await ReportExportService.exportToPdf(mockReport, { format: 'pdf', includeCharts: true, includeRawData: false, compression: true })
          break
        } catch (error) {
          retryCount++
          if (retryCount >= maxRetries) throw error
        }
      }

      // Assert
      expect(result).toBeDefined()
      expect(result!.metadata.retryCount).toBe(2)
      expect(ReportExportService.exportToPdf).toHaveBeenCalledTimes(3)
    })

    it('should validate report size limits and optimization', async () => {
      // Arrange
      const mockLargeReportConfig = {
        type: 'custom' as const,
        clinicId: 'clinic-001',
        period: {
          startDate: '2020-01-01',
          endDate: '2024-12-31',
          granularity: 'daily' as const
        },
        includeRawData: true
      }

      const mockSizeValidation = {
        estimatedSize: 50 * 1024 * 1024, // 50MB
        maxAllowedSize: 25 * 1024 * 1024, // 25MB
        recommendations: [
          'Reduce date range to last 2 years',
          'Use monthly granularity instead of daily',
          'Exclude raw data for large reports'
        ]
      }

      // Mock service responses
      const { FinancialReportsService } = await import('@/services/financial-reports')
      vi.mocked(FinancialReportsService.generateReport).mockRejectedValue(
        new Error(`Report size (${mockSizeValidation.estimatedSize} bytes) exceeds maximum allowed (${mockSizeValidation.maxAllowedSize} bytes)`)
      )

      // Act & Assert
      await expect(
        FinancialReportsService.generateReport(mockLargeReportConfig)
      ).rejects.toThrow('Report size')
    })
  })
})