import { GET, POST, } from '@/app/api/export/route'
import { createClient, } from '@/utils/supabase/server'
import { NextRequest, } from 'next/server'
import { afterEach, beforeEach, describe, expect, test, vi, } from 'vitest'

// Mock Supabase client
vi.mock('@/utils/supabase/server',)
const mockCreateClient = createClient as vi.MockedFunction<typeof createClient>

// Mock file system operations
vi.mock('fs/promises',)
vi.mock('path',)

// Mock jsPDF and ExcelJS
vi.mock<typeof import('jspdf')>('jspdf', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue('mock-pdf-data',),
  })),
}),)

const mockWorkbook = {
  addWorksheet: vi.fn().mockReturnValue({
    addRow: vi.fn(),
    getRow: vi.fn().mockReturnValue({
      font: {},
      fill: {},
    },),
    columns: [],
    getCell: vi.fn().mockReturnValue({
      value: undefined,
      font: {},
      fill: {},
    },),
    mergeCells: vi.fn(),
  },),
  xlsx: {
    writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-excel-data',),),
  },
}

vi.mock<typeof import('exceljs')>('exceljs', () => ({
  __esModule: true,
  default: {
    Workbook: vi.fn(() => mockWorkbook),
  },
  Workbook: vi.fn(() => mockWorkbook),
}),)

describe('export API Routes', () => {
  let mockSupabase: unknown

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase,)
  },)

  afterEach(() => {
    vi.clearAllMocks()
  },)

  describe('gET /api/export', () => {
    it('should export subscription data as CSV', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const mockSubscriptions = [
        {
          id: 'sub_123',
          user_id: 'user_456',
          plan_id: 'plan_basic',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          amount: 2900,
          currency: 'usd',
        },
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockSubscriptions,
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)

      // Assert
      expect(response.status,).toBe(200,)
      expect(response.headers.get('content-type',),).toBe('text/csv',)
      expect(response.headers.get('content-disposition',),).toContain(
        'attachment',
      )
      expect(mockSupabase.from,).toHaveBeenCalledWith('subscriptions',)
    })

    it('should export analytics data as PDF', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const mockAnalytics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
        trialMetrics: {
          totalTrials: 500,
          conversionRate: 0.25,
        },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: undefined,
      },)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=analytics&format=pdf',
        { method: 'GET', },
      )

      // Act
      const response = await GET(request,)

      // Assert
      expect(response.status,).toBe(200,)
      expect(response.headers.get('content-type',),).toBe('application/pdf',)
      expect(response.headers.get('content-disposition',),).toContain(
        'attachment',
      )
    })

    it('should export trial data as Excel', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const mockTrials = [
        {
          id: 'trial_123',
          user_id: 'user_456',
          plan_id: 'plan_premium',
          status: 'active',
          started_at: '2024-01-01T00:00:00Z',
          expires_at: '2024-01-15T00:00:00Z',
          converted: false,
        },
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockTrials,
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=trials&format=xlsx',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)

      // Assert
      expect(response.status,).toBe(200,)
      expect(response.headers.get('content-type',),).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      expect(response.headers.get('content-disposition',),).toContain(
        'attachment',
      )
    })

    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: undefined, },
        error: { message: 'Invalid token', },
      },)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(401,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.message,).toBe('Unauthorized',)
    })

    it('should return 403 for non-admin users', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'user', }, // Not admin
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(403,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.message,).toBe('Insufficient permissions',)
    })

    it('should validate query parameters', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=invalid&format=unknown',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(400,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.message,).toContain('Invalid export type or format',)
    })

    it('should handle date range filters', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv&start_date=2024-01-01&end_date=2024-01-31',
        { method: 'GET', },
      )

      // Act
      const response = await GET(request,)

      // Assert
      expect(response.status,).toBe(200,)
      expect(mockFrom.gte,).toHaveBeenCalledWith('created_at', '2024-01-01',)
      expect(mockFrom.lte,).toHaveBeenCalledWith('created_at', '2024-01-31',)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: undefined,
          error: { message: 'Database connection failed', },
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(500,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.message,).toBe('Export failed',)
    })
  })

  describe('pOST /api/export', () => {
    it('should schedule bulk export job', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const exportRequest = {
        types: ['subscriptions', 'trials', 'analytics',],
        format: 'csv',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        email: 'admin@example.com',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'job_123', status: 'queued', },],
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest,),
      },)

      // Act
      const response = await POST(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(202,)
      expect(responseData.success,).toBeTruthy()
      expect(responseData.data.jobId,).toBe('job_123',)
      expect(responseData.data.status,).toBe('queued',)
      expect(mockSupabase.from,).toHaveBeenCalledWith('export_jobs',)
    })

    it('should validate bulk export request', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const invalidRequest = {
        types: [], // Empty array
        format: 'invalid',
        email: 'invalid-email',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidRequest,),
      },)

      // Act
      const response = await POST(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(400,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.errors,).toBeDefined()
    })
  })

  describe('performance and limits', () => {
    it('should respect export size limits', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      // Simulate large dataset
      const largeDataset = new Array(100_000,).fill().map((_, i,) => ({
        id: `sub_${i}`,
        user_id: `user_${i}`,
        status: 'active',
      }))

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: largeDataset,
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)
      const responseData = await response.json()

      // Assert
      expect(response.status,).toBe(413,)
      expect(responseData.success,).toBeFalsy()
      expect(responseData.message,).toBe('Export size exceeds limit',)
    })

    it('should handle concurrent export requests', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const requests = new Array(5,).fill().map(
        () =>
          new NextRequest(
            'http://localhost:3000/api/export?type=subscriptions&format=csv',
            {
              method: 'GET',
            },
          ),
      )

      // Act
      const responses = await Promise.all(
        requests.map((request,) => GET(request,)),
      )

      // Assert
      responses.forEach((response,) => {
        expect([200, 429,],).toContain(response.status,)
      },)
    })

    it('should compress large exports', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { role: 'admin', },
      }

      const moderateDataset = new Array(5000,).fill().map((_, i,) => ({
        id: `sub_${i}`,
        user_id: `user_${i}`,
        status: 'active',
      }))

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser, },
        error: undefined,
      },)

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: moderateDataset,
          error: undefined,
        },),
      }

      mockSupabase.from.mockReturnValue(mockFrom,)

      const request = new NextRequest(
        'http://localhost:3000/api/export?type=subscriptions&format=csv',
        {
          method: 'GET',
        },
      )

      // Act
      const response = await GET(request,)

      // Assert
      expect(response.status,).toBe(200,)
      expect(response.headers.get('content-encoding',),).toBe('gzip',)
    })
  })
})
