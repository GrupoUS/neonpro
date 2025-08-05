Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSession =
  exports.mockUser =
  exports.mockErrorResponse =
  exports.mockSupabaseResponse =
  exports.mockExportData =
  exports.mockCohortData =
  exports.mockAnalyticsData =
    void 0;
// Mock Analytics Data
exports.mockAnalyticsData = {
  totalPatients: 1250,
  totalRevenue: 125000,
  averageTicket: 100,
  conversionRate: 0.25,
  monthlyGrowth: 0.15,
  trends: {
    patients: [
      { date: "2024-01-01", value: 100 },
      { date: "2024-02-01", value: 120 },
      { date: "2024-03-01", value: 150 },
    ],
    revenue: [
      { date: "2024-01-01", value: 10000 },
      { date: "2024-02-01", value: 12000 },
      { date: "2024-03-01", value: 15000 },
    ],
  },
};
// Mock Cohort Data
exports.mockCohortData = [
  {
    cohort: "2024-01",
    totalPatients: 100,
    retentionRates: [1.0, 0.8, 0.6, 0.5, 0.4],
    monthlyRevenue: [5000, 4000, 3000, 2500, 2000],
  },
  {
    cohort: "2024-02",
    totalPatients: 120,
    retentionRates: [1.0, 0.85, 0.65, 0.55, 0.45],
    monthlyRevenue: [6000, 5100, 3900, 3300, 2700],
  },
];
// Mock Export Data
exports.mockExportData = {
  reportId: "test-report-123",
  title: "Test Analytics Report",
  generatedAt: new Date("2024-01-15T10:00:00Z"),
  period: {
    start: new Date("2024-01-01T00:00:00Z"),
    end: new Date("2024-01-31T23:59:59Z"),
  },
  data: exports.mockAnalyticsData,
  cohorts: exports.mockCohortData,
  filters: {
    dateRange: { start: "2024-01-01", end: "2024-01-31" },
    treatments: ["facial", "botox"],
    status: "active",
  },
};
// Mock Supabase Response
exports.mockSupabaseResponse = {
  data: exports.mockAnalyticsData,
  error: null,
  count: null,
  status: 200,
  statusText: "OK",
};
// Mock Error Response
exports.mockErrorResponse = {
  data: null,
  error: {
    message: "Database connection failed",
    details: "Connection timeout",
    hint: "Check your network connection",
    code: "DB_CONNECTION_ERROR",
  },
  count: null,
  status: 500,
  statusText: "Internal Server Error",
};
// Mock User for Testing
exports.mockUser = {
  id: "user-123",
  email: "test@neonpro.com",
  role: "admin",
  clinic_id: "clinic-456",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
// Mock Session
exports.mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: "bearer",
  user: exports.mockUser,
};
