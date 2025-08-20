import type { AnalyticsData, CohortData, ExportData } from '@/types/analytics';

// Mock Analytics Data
export const mockAnalyticsData: AnalyticsData = {
  totalPatients: 1250,
  totalRevenue: 125_000,
  averageTicket: 100,
  conversionRate: 0.25,
  monthlyGrowth: 0.15,
  trends: {
    patients: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-02-01', value: 120 },
      { date: '2024-03-01', value: 150 },
    ],
    revenue: [
      { date: '2024-01-01', value: 10_000 },
      { date: '2024-02-01', value: 12_000 },
      { date: '2024-03-01', value: 15_000 },
    ],
  },
};

// Mock Cohort Data
export const mockCohortData: CohortData[] = [
  {
    cohort: '2024-01',
    totalPatients: 100,
    retentionRates: [1.0, 0.8, 0.6, 0.5, 0.4],
    monthlyRevenue: [5000, 4000, 3000, 2500, 2000],
  },
  {
    cohort: '2024-02',
    totalPatients: 120,
    retentionRates: [1.0, 0.85, 0.65, 0.55, 0.45],
    monthlyRevenue: [6000, 5100, 3900, 3300, 2700],
  },
];

// Mock Export Data
export const mockExportData: ExportData = {
  reportId: 'test-report-123',
  title: 'Test Analytics Report',
  generatedAt: new Date('2024-01-15T10:00:00Z'),
  period: {
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2024-01-31T23:59:59Z'),
  },
  data: mockAnalyticsData,
  cohorts: mockCohortData,
  filters: {
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    treatments: ['facial', 'botox'],
    status: 'active',
  },
};

// Mock Supabase Response
export const mockSupabaseResponse = {
  data: mockAnalyticsData,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
};

// Mock Error Response
export const mockErrorResponse = {
  data: null,
  error: {
    message: 'Database connection failed',
    details: 'Connection timeout',
    hint: 'Check your network connection',
    code: 'DB_CONNECTION_ERROR',
  },
  count: null,
  status: 500,
  statusText: 'Internal Server Error',
};

// Mock User for Testing
export const mockUser = {
  id: 'user-123',
  email: 'test@neonpro.com',
  role: 'admin',
  clinic_id: 'clinic-456',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock Session
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3_600_000,
  token_type: 'bearer',
  user: mockUser,
};
