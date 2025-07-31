/**
 * Notification API Tests
 * 
 * Suíte de testes para API de notificações
 * incluindo envio, status, analytics e compliance.
 * 
 * @author APEX QA Team
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST, PUT, GET } from '@/app/api/notifications/send/route';
import { GET as StatusGET } from '@/app/api/notifications/status/route';
import { GET as AnalyticsGET } from '@/app/api/notifications/analytics/route';

// ================================================================================
// MOCKS
// ================================================================================

// Mock Supabase
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@test.com' } },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-user-id',
          clinic_id: 'test-clinic-id',
          role: 'admin',
          permissions: ['send_notifications', 'view_analytics']
        }
      }),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0
      })
    }))
  }))
}));

// Mock Notification Manager
jest.mock('@/lib/notifications/core/notification-manager', () => ({
  notificationManager: {
    sendNotification: jest.fn().mockResolvedValue({
      id: 'test-notification-id',
      status: 'sent'
    })
  }
}));

// Mock ML Engine
jest.mock('@/lib/notifications/ml/optimization-engine', () => ({
  notificationMLEngine: {
    optimizeForUser: jest.fn().mockResolvedValue({
      optimizations: {
        channel: { recommended: 'email', confidence: 0.9 },
        timing: { recommended: new Date(), confidence: 0.8 },
        content: { personalizedContent: 'Optimized content', confidence: 0.85 }
      },
      modelVersions: { channel: '1.0', timing: '1.1', content: '1.2' }
    })
  }
}));

// Mock Compliance Engine
jest.mock('@/lib/notifications/compliance/compliance-engine', () => ({
  notificationComplianceEngine: {
    validateLGPDCompliance: jest.fn().mockResolvedValue({
      violations: [],
      recommendations: []
    }),
    validateMedicalCompliance: jest.fn().mockResolvedValue({
      violations: [],
      recommendations: []
    })
  }
}));

// Mock Analytics
jest.mock('@/lib/notifications/analytics/notification-analytics', () => ({
  notificationAnalytics: {
    getOverviewMetrics: jest.fn().mockResolvedValue({
      total: 100,
      sent: 95,
      delivered: 90,
      failed: 5,
      pending: 5,
      deliveryRate: 94.7,
      engagementRate: 78.5
    }),
    getPerformanceMetrics: jest.fn().mockResolvedValue({
      averageDeliveryTime: 120,
      successRate: 94.7,
      channelPerformance: {}
    }),
    getEngagementMetrics: jest.fn().mockResolvedValue({
      openRate: 45.2,
      clickRate: 12.8,
      unsubscribeRate: 0.5
    }),
    getChannelAnalytics: jest.fn().mockResolvedValue({
      email: { sent: 50, delivered: 48, rate: 96 },
      sms: { sent: 30, delivered: 29, rate: 96.7 }
    }),
    getTrendAnalysis: jest.fn().mockResolvedValue({
      daily: [],
      weekly: [],
      trends: {}
    })
  }
}));

// ================================================================================
// TEST UTILITIES
// ================================================================================

function createMockRequest(method: string, body?: any, searchParams?: Record<string, string>) {
  const url = searchParams 
    ? `http://localhost:3000/api/notifications/send?${new URLSearchParams(searchParams)}`
    : 'http://localhost:3000/api/notifications/send';
    
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
}

// ================================================================================
// SEND ENDPOINT TESTS
// ================================================================================

describe('/api/notifications/send', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - Single Notification', () => {
    it('should send notification successfully', async () => {
      const validPayload = {
        userId: 'test-user-id',
        clinicId: 'test-clinic-id',
        type: 'appointment_reminder',
        title: 'Test Notification',
        content: 'This is a test notification',
        channels: ['email'],
        priority: 'normal',
        enableMLOptimization: true
      };

      const request = createMockRequest('POST', validPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notificationId).toBe('test-notification-id');
      expect(data.optimizations).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidPayload = {
        userId: 'test-user-id',
        // Missing required fields
      };

      const request = createMockRequest('POST', invalidPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
      expect(data.details).toBeDefined();
    });

    it('should enforce clinic authorization', async () => {
      const unauthorizedPayload = {
        userId: 'test-user-id',
        clinicId: 'unauthorized-clinic-id',
        type: 'appointment_reminder',
        title: 'Test',
        content: 'Test',
        channels: ['email']
      };

      const request = createMockRequest('POST', unauthorizedPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Usuário não autorizado para esta clínica');
    });

    it('should handle compliance violations', async () => {
      // Mock compliance violation
      const { notificationComplianceEngine } = require('@/lib/notifications/compliance/compliance-engine');
      notificationComplianceEngine.validateLGPDCompliance.mockResolvedValueOnce({
        violations: [{ severity: 'critical', message: 'No consent' }],
        recommendations: []
      });

      const payload = {
        userId: 'test-user-id',
        clinicId: 'test-clinic-id',
        type: 'promotional',
        title: 'Test',
        content: 'Test',
        channels: ['email']
      };

      const request = createMockRequest('POST', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toContain('compliance');
    });
  });

  describe('PUT - Bulk Notifications', () => {
    it('should process bulk notifications successfully', async () => {
      const bulkPayload = {
        clinicId: 'test-clinic-id',
        notifications: [
          {
            userId: 'user-1',
            clinicId: 'test-clinic-id',
            type: 'promotional',
            title: 'Bulk Test 1',
            content: 'Content 1',
            channels: ['email']
          },
          {
            userId: 'user-2',
            clinicId: 'test-clinic-id',
            type: 'promotional',
            title: 'Bulk Test 2',
            content: 'Content 2',
            channels: ['sms']
          }
        ],
        batchOptions: {
          delay: 100,
          stopOnError: false
        }
      };

      const request = createMockRequest('PUT', bulkPayload);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.total).toBe(2);
      expect(data.results).toHaveLength(2);
    });

    it('should handle bulk validation errors', async () => {
      const invalidBulkPayload = {
        clinicId: 'test-clinic-id',
        notifications: [] // Empty array
      };

      const request = createMockRequest('PUT', invalidBulkPayload);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos para envio em lote');
    });
  });

  describe('GET - Configuration Info', () => {
    it('should return configuration information', async () => {
      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limits).toBeDefined();
      expect(data.features).toBeDefined();
      expect(data.clinic).toBeDefined();
    });
  });
});

// ================================================================================
// STATUS ENDPOINT TESTS
// ================================================================================

describe('/api/notifications/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return notification status list', async () => {
    const request = createMockRequest('GET', null, { limit: '10', offset: '0' });
    const response = await StatusGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it('should validate query parameters', async () => {
    const request = createMockRequest('GET', null, { limit: '2000' }); // Invalid limit
    const response = await StatusGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Parâmetros inválidos');
  });

  it('should filter by notification ID', async () => {
    const testId = 'test-notification-id';
    const request = createMockRequest('GET', null, { id: testId });
    const response = await StatusGET(request);

    expect(response.status).toBe(200);
    // Verify that the Supabase query was called with the correct filter
    const mockSupabase = require('@/app/utils/supabase/server').createClient();
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', testId);
  });
});

// ================================================================================
// ANALYTICS ENDPOINT TESTS
// ================================================================================

describe('/api/notifications/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return overview analytics', async () => {
    const request = createMockRequest('GET', null, { 
      metric: 'overview', 
      period: 'week' 
    });
    const response = await AnalyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metric).toBe('overview');
    expect(data.data.total).toBe(100);
  });

  it('should return performance analytics', async () => {
    const request = createMockRequest('GET', null, { 
      metric: 'performance',
      period: 'month'
    });
    const response = await AnalyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.averageDeliveryTime).toBeDefined();
  });

  it('should return engagement analytics', async () => {
    const request = createMockRequest('GET', null, { 
      metric: 'engagement',
      period: 'week'
    });
    const response = await AnalyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.openRate).toBeDefined();
    expect(data.data.clickRate).toBeDefined();
  });

  it('should validate metric parameter', async () => {
    const request = createMockRequest('GET', null, { 
      metric: 'invalid_metric'
    });
    const response = await AnalyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Parâmetros inválidos');
  });

  it('should handle date range parameters', async () => {
    const dateFrom = '2024-01-01T00:00:00Z';
    const dateTo = '2024-01-07T23:59:59Z';
    
    const request = createMockRequest('GET', null, { 
      metric: 'trends',
      dateFrom,
      dateTo
    });
    const response = await AnalyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.period.from).toBe(dateFrom);
    expect(data.period.to).toBe(dateTo);
  });
});

// ================================================================================
// INTEGRATION TESTS
// ================================================================================

describe('Integration Tests', () => {
  it('should handle complete notification workflow', async () => {
    // 1. Send notification
    const sendPayload = {
      userId: 'test-user-id',
      clinicId: 'test-clinic-id',
      type: 'appointment_reminder',
      title: 'Integration Test',
      content: 'Testing complete workflow',
      channels: ['email'],
      priority: 'normal'
    };

    const sendRequest = createMockRequest('POST', sendPayload);
    const sendResponse = await POST(sendRequest);
    const sendData = await sendResponse.json();

    expect(sendResponse.status).toBe(200);
    expect(sendData.notificationId).toBeDefined();

    // 2. Check status
    const statusRequest = createMockRequest('GET', null, { 
      id: sendData.notificationId 
    });
    const statusResponse = await StatusGET(statusRequest);
    
    expect(statusResponse.status).toBe(200);

    // 3. Get analytics
    const analyticsRequest = createMockRequest('GET', null, { 
      metric: 'overview' 
    });
    const analyticsResponse = await AnalyticsGET(analyticsRequest);
    
    expect(analyticsResponse.status).toBe(200);
  });
});

// ================================================================================
// PERFORMANCE TESTS
// ================================================================================

describe('Performance Tests', () => {
  it('should handle bulk notifications within time limit', async () => {
    const startTime = Date.now();
    
    const bulkPayload = {
      clinicId: 'test-clinic-id',
      notifications: Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        clinicId: 'test-clinic-id',
        type: 'promotional',
        title: `Bulk Test ${i}`,
        content: `Content ${i}`,
        channels: ['email']
      }))
    };

    const request = createMockRequest('PUT', bulkPayload);
    const response = await PUT(request);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });

  it('should handle analytics queries efficiently', async () => {
    const startTime = Date.now();
    
    const request = createMockRequest('GET', null, { 
      metric: 'overview',
      period: 'year' // Large dataset
    });
    const response = await AnalyticsGET(request);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});

// ================================================================================
// ERROR HANDLING TESTS
// ================================================================================

describe('Error Handling', () => {
  it('should handle database connection errors gracefully', async () => {
    // Mock database error
    const mockSupabase = require('@/app/utils/supabase/server').createClient();
    mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = createMockRequest('POST', {
      userId: 'test-user-id',
      clinicId: 'test-clinic-id',
      type: 'system',
      title: 'Test',
      content: 'Test',
      channels: ['email']
    });

    const response = await POST(request);
    
    expect(response.status).toBe(500);
  });

  it('should handle ML engine failures gracefully', async () => {
    // Mock ML engine error
    const { notificationMLEngine } = require('@/lib/notifications/ml/optimization-engine');
    notificationMLEngine.optimizeForUser.mockRejectedValueOnce(new Error('ML service unavailable'));

    const request = createMockRequest('POST', {
      userId: 'test-user-id',
      clinicId: 'test-clinic-id',
      type: 'informational',
      title: 'Test',
      content: 'Test',
      channels: ['email'],
      enableMLOptimization: true
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed without ML optimization
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle compliance engine failures', async () => {
    // Mock compliance engine error
    const { notificationComplianceEngine } = require('@/lib/notifications/compliance/compliance-engine');
    notificationComplianceEngine.validateLGPDCompliance.mockRejectedValueOnce(new Error('Compliance service error'));

    const request = createMockRequest('POST', {
      userId: 'test-user-id',
      clinicId: 'test-clinic-id',
      type: 'promotional',
      title: 'Test',
      content: 'Test',
      channels: ['email'],
      skipComplianceCheck: false
    });

    const response = await POST(request);
    
    expect(response.status).toBe(500);
  });
});