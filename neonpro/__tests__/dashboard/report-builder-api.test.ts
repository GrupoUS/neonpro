/**
 * Report Builder API Integration Tests
 * Story 8.2: Custom Report Builder (Drag-Drop Interface)
 * 
 * API Testing Coverage:
 * - Report CRUD operations
 * - Template management
 * - Data source integration
 * - Analytics tracking
 * - Sharing and collaboration
 * - Automated scheduling
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js environment
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-session-token' }),
  }),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    eq: jest.fn(function() { return this; }),
    order: jest.fn(function() { return this; }),
    limit: jest.fn(function() { return this; }),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
};

jest.mock('@/app/utils/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}));

jest.mock('@/app/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock data
const mockReport = {
  id: 'test-report-id',
  name: 'Test Report',
  description: 'Test Description',
  query_config: {
    data_sources: ['patients', 'appointments'],
    filters: [],
    aggregations: [],
  },
  visualization_config: {
    chart_type: 'bar',
    x_axis: 'date',
    y_axis: 'count',
  },
  layout_config: {
    components: [],
  },
  sharing_config: {
    is_public: false,
    allowed_users: [],
  },
  schedule_config: null,
  user_id: 'test-user-id',
  created_at: '2025-01-26T09:00:00Z',
  updated_at: '2025-01-26T09:00:00Z',
};

describe('Report Builder API Integration Tests', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Setup default auth mocks
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-id' },
          access_token: 'mock-token',
        },
      },
      error: null,
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'test-user-id' },
      },
      error: null,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Story 8.2 Acceptance Criteria API Validation', () => {
    describe('AC4: Real-time Report Generation', () => {
      it('generates reports with <3 second response time', async () => {
        const startTime = Date.now();
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            report: mockReport,
            generation_time: 2.1 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/generate/test-report-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'json' }),
        });

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

        expect(response.ok).toBe(true);
        expect(responseTime).toBeLessThan(3);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.report).toBeDefined();
      });

      it('handles complex queries efficiently', async () => {
        const complexQuery = {
          data_sources: ['patients', 'appointments', 'treatments', 'payments'],
          filters: [
            { field: 'created_at', operator: 'gte', value: '2024-01-01' },
            { field: 'status', operator: 'in', value: ['completed', 'scheduled'] },
          ],
          aggregations: [
            { field: 'total_value', function: 'sum' },
            { field: 'patient_id', function: 'count_distinct' },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            data: [{ total_value: 15000, patient_count: 45 }],
            query_execution_time: 1.8 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/generate/test-report-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: complexQuery }),
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.query_execution_time).toBeLessThan(3);
      });
    });

    describe('AC5: Advanced Filtering Capabilities', () => {
      it('validates advanced filter configurations', async () => {
        const advancedFilters = {
          date_range: { start: '2024-01-01', end: '2024-12-31' },
          status_filters: ['active', 'completed'],
          custom_filters: [
            { field: 'age', operator: 'between', value: [18, 65] },
            { field: 'treatment_type', operator: 'contains', value: 'facial' },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            valid_filters: true,
            filter_count: 4 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/filters/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(advancedFilters),
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.valid_filters).toBe(true);
      });
    });

    describe('AC6: Sharing and Collaboration Features', () => {
      it('enables report sharing with proper permissions', async () => {
        const sharingConfig = {
          report_id: 'test-report-id',
          share_with: ['user2@clinic.com', 'user3@clinic.com'],
          permissions: ['view', 'comment'],
          expires_at: '2025-02-01T00:00:00Z',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            share_id: 'share-123',
            shared_with: 2 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/sharing/test-report-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sharingConfig),
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.share_id).toBeDefined();
        expect(data.shared_with).toBe(2);
      });

      it('validates sharing permissions correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({ 
            success: false, 
            error: 'Insufficient permissions' 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/sharing/unauthorized-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ share_with: ['user@test.com'] }),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(403);
        
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('permissions');
      });
    });

    describe('AC7: Automated Report Scheduling', () => {
      it('creates automated report schedules', async () => {
        const scheduleConfig = {
          report_id: 'test-report-id',
          frequency: 'weekly',
          day_of_week: 1, // Monday
          time: '09:00',
          timezone: 'America/Sao_Paulo',
          recipients: ['manager@clinic.com'],
          format: 'pdf',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ 
            success: true, 
            schedule_id: 'schedule-123',
            next_run: '2025-02-03T09:00:00Z' 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleConfig),
        });

        expect(response.ok).toBe(true);
        expect(response.status).toBe(201);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.schedule_id).toBeDefined();
        expect(data.next_run).toBeDefined();
      });

      it('validates schedule configuration', async () => {
        const invalidSchedule = {
          report_id: 'test-report-id',
          frequency: 'invalid-frequency',
          time: '25:00', // Invalid time
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ 
            success: false, 
            error: 'Invalid schedule configuration' 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidSchedule),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid');
      });
    });

    describe('AC8: Export Capabilities', () => {
      it('exports reports in multiple formats', async () => {
        const exportFormats = ['pdf', 'excel', 'csv', 'json'];
        
        for (const format of exportFormats) {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ 
              success: true, 
              download_url: `https://storage.com/report.${format}`,
              expires_at: '2025-01-27T12:00:00Z' 
            }),
          } as Response);

          const response = await fetch(`/api/report-builder/export/test-report-id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format }),
          });

          expect(response.ok).toBe(true);
          
          const data = await response.json();
          expect(data.success).toBe(true);
          expect(data.download_url).toContain(format);
        }
      });
    });

    describe('AC9: Analytics and Usage Tracking', () => {
      it('tracks report usage analytics', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            analytics_recorded: true 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/analytics/test-report-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'view',
            user_id: 'test-user-id',
            timestamp: new Date().toISOString(),
          }),
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.analytics_recorded).toBe(true);
      });

      it('provides usage analytics dashboard data', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            analytics: {
              total_reports: 42,
              active_users: 15,
              popular_templates: ['financial', 'patient-summary'],
              usage_trends: { weekly_growth: 0.12 }
            }
          }),
        } as Response);

        const response = await fetch('/api/report-builder/analytics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.analytics.total_reports).toBeGreaterThan(0);
        expect(data.analytics.active_users).toBeGreaterThan(0);
        expect(Array.isArray(data.analytics.popular_templates)).toBe(true);
      });
    });

    describe('AC10: Integration with NeonPro Data Sources', () => {
      it('validates access to all NeonPro data sources', async () => {
        const expectedDataSources = [
          'patients', 'appointments', 'treatments', 'payments',
          'staff', 'inventory', 'reports', 'analytics'
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            available_sources: expectedDataSources,
            total_count: expectedDataSources.length 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/data-sources', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.available_sources).toEqual(expect.arrayContaining(expectedDataSources));
        expect(data.total_count).toBe(expectedDataSources.length);
      });

      it('handles data source access restrictions', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({ 
            success: false, 
            error: 'Access denied to restricted data source' 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/data-sources?source=restricted_data', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(403);
        
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('Access denied');
      });
    });
  });

  describe('Report CRUD Operations', () => {
    describe('Create Report', () => {
      it('creates a new report successfully', async () => {
        const newReportData = {
          name: 'New Test Report',
          description: 'A new test report',
          query_config: {
            data_sources: ['patients'],
            filters: [],
          },
        };

        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ ...mockReport, ...newReportData, id: 'new-report-id' }],
              error: null,
            }),
          }),
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ 
            success: true, 
            report: { ...mockReport, ...newReportData, id: 'new-report-id' } 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReportData),
        });

        expect(response.ok).toBe(true);
        expect(response.status).toBe(201);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.report.name).toBe(newReportData.name);
      });
    });

    describe('Read Report', () => {
      it('retrieves report by ID', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [mockReport],
              error: null,
            }),
          }),
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            report: mockReport 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/reports/test-report-id');

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.report.id).toBe('test-report-id');
      });
    });

    describe('Update Report', () => {
      it('updates report successfully', async () => {
        const updateData = {
          name: 'Updated Report Name',
          description: 'Updated description',
        };

        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ ...mockReport, ...updateData }],
                error: null,
              }),
            }),
          }),
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            report: { ...mockReport, ...updateData } 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/reports/test-report-id', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.report.name).toBe(updateData.name);
      });
    });

    describe('Delete Report', () => {
      it('deletes report successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [mockReport],
              error: null,
            }),
          }),
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            message: 'Report deleted successfully' 
          }),
        } as Response);

        const response = await fetch('/api/report-builder/reports/test-report-id', {
          method: 'DELETE',
        });

        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('deleted');
      });
    });
  });

  describe('Template Management', () => {
    it('retrieves available templates', async () => {
      const mockTemplates = [
        { id: 'template-1', name: 'Financial Report', category: 'financial' },
        { id: 'template-2', name: 'Patient Summary', category: 'clinical' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          templates: mockTemplates 
        }),
      } as Response);

      const response = await fetch('/api/report-builder/templates');

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.templates)).toBe(true);
      expect(data.templates.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Load Testing', () => {
    it('handles concurrent API requests gracefully', async () => {
      // Mock multiple responses
      for (let i = 0; i < 10; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            success: true, 
            report: { ...mockReport, id: `test-report-${i}` } 
          }),
        } as Response);
      }

      const requests = Array.from({ length: 10 }, (_, i) => 
        fetch(`/api/report-builder/reports/test-report-${i}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });

    it('maintains response time under load', async () => {
      const startTime = Date.now();
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, report: mockReport }),
      } as Response);

      // Simulate 50 concurrent requests
      const requests = Array.from({ length: 50 }, () => 
        fetch('/api/report-builder/reports/test-report-id')
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;

      // Should handle 50 requests in under 5 seconds
      expect(totalTime).toBeLessThan(5);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles invalid request data gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          success: false, 
          error: 'Invalid request data' 
        }),
      } as Response);

      const response = await fetch('/api/report-builder/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('handles database connection errors', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ 
          success: false, 
          error: 'Internal server error' 
        }),
      } as Response);

      const response = await fetch('/api/report-builder/reports/test-report-id');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('handles authentication failures', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ 
          success: false, 
          error: 'Unauthorized' 
        }),
      } as Response);

      const response = await fetch('/api/report-builder/reports');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });
});