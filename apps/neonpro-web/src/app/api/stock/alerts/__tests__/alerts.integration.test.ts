// Stock Alerts API Integration Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Integration tests for stock alerts API endpoints

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../route';
import { POST as AcknowledgePost } from '../acknowledge/route';

// =====================================================
// TEST SETUP AND MOCKS
// =====================================================

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn()
    },
    from: jest.fn()
  }))
}));

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

// Mock console to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  jest.clearAllMocks();
});

// Test data
const mockSession = {
  user: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com'
  }
};

const mockClinicId = '123e4567-e89b-12d3-a456-426614174000';
const mockProductId = '123e4567-e89b-12d3-a456-426614174002';

const mockAlertConfig = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  clinic_id: mockClinicId,
  product_id: mockProductId,
  alert_type: 'low_stock',
  threshold_value: 10,
  threshold_unit: 'quantity',
  severity_level: 'medium',
  is_active: true,
  notification_channels: ['in_app', 'email'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockAlert = {
  id: '123e4567-e89b-12d3-a456-426614174004',
  clinic_id: mockClinicId,
  alert_config_id: mockAlertConfig.id,
  product_id: mockProductId,
  alert_type: 'low_stock',
  severity_level: 'medium',
  current_value: 5,
  threshold_value: 10,
  message: 'Low stock detected',
  status: 'active',
  metadata: {},
  triggered_at: '2024-01-01T12:00:00Z',
  acknowledged_at: null,
  created_at: '2024-01-01T12:00:00Z'
};

// Helper function to create mock request
function createMockRequest(url: string, options: RequestInit = {}): NextRequest {
  return new NextRequest(url, options);
}

// Helper function to create mock Supabase client
function createMockSupabaseClient(mockData: any = {}) {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    count: jest.fn()
  };

  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      })
    },
    from: jest.fn().mockReturnValue(mockQuery)
  };

  // Configure mock responses
  if (mockData.configs) {
    mockQuery.single.mockResolvedValue({ data: mockData.configs, error: null });
  }
  if (mockData.alert) {
    mockQuery.single.mockResolvedValue({ data: mockData.alert, error: null });
  }
  if (mockData.userClinic) {
    mockQuery.single.mockResolvedValue({ data: mockData.userClinic, error: null });
  }

  return { mockSupabase, mockQuery };
}

// =====================================================
// GET ENDPOINT TESTS
// =====================================================

describe('GET /api/stock/alerts', () => {
  it('should return paginated alert configurations', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock alert configs
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      count: jest.fn().mockResolvedValue({ 
        data: [mockAlertConfig], 
        error: null, 
        count: 1 
      })
    });

    const request = createMockRequest('http://localhost:3000/api/stock/alerts?page=1&limit=10');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.configs).toHaveLength(1);
    expect(data.data.configs[0]).toMatchObject({
      id: mockAlertConfig.id,
      alertType: mockAlertConfig.alert_type,
      severityLevel: mockAlertConfig.severity_level
    });
    expect(data.data.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 1
    });
  });

  it('should handle authentication errors', async () => {
    // Arrange
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ 
          data: { session: null }, 
          error: new Error('Auth error') 
        })
      },
      from: jest.fn()
    });

    const request = createMockRequest('http://localhost:3000/api/stock/alerts');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should handle query parameter validation', async () => {
    // Arrange
    const { mockSupabase } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    const request = createMockRequest('http://localhost:3000/api/stock/alerts?page=invalid&limit=999');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

// =====================================================
// POST ENDPOINT TESTS
// =====================================================

describe('POST /api/stock/alerts', () => {
  it('should create new alert configuration', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock config creation
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: mockAlertConfig, 
        error: null 
      })
    });

    const requestBody = {
      alertType: 'low_stock',
      thresholdValue: 10,
      thresholdUnit: 'quantity',
      severityLevel: 'medium',
      isActive: true,
      notificationChannels: ['in_app', 'email'],
      productId: mockProductId
    };

    const request = createMockRequest('http://localhost:3000/api/stock/alerts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.config).toMatchObject({
      id: mockAlertConfig.id,
      alertType: 'low_stock',
      severityLevel: 'medium'
    });
  });

  it('should validate request body', async () => {
    // Arrange
    const { mockSupabase } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    const invalidRequestBody = {
      alertType: 'invalid_type',
      thresholdValue: -5, // Invalid negative value
      severityLevel: 'invalid_severity'
    };

    const request = createMockRequest('http://localhost:3000/api/stock/alerts', {
      method: 'POST',
      body: JSON.stringify(invalidRequestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle database errors', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock database error
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error', code: '23505' } 
      })
    });

    const requestBody = {
      alertType: 'low_stock',
      thresholdValue: 10,
      thresholdUnit: 'quantity',
      severityLevel: 'medium',
      isActive: true,
      notificationChannels: ['in_app']
    };

    const request = createMockRequest('http://localhost:3000/api/stock/alerts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CREATE_FAILED');
  });
});

// =====================================================
// PUT ENDPOINT TESTS
// =====================================================

describe('PUT /api/stock/alerts/[id]', () => {
  it('should update alert configuration', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock config update
    const updatedConfig = { ...mockAlertConfig, is_active: false };
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: updatedConfig, 
        error: null 
      })
    });

    const requestBody = {
      isActive: false
    };

    const request = createMockRequest(`http://localhost:3000/api/stock/alerts/${mockAlertConfig.id}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await PUT(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.config.isActive).toBe(false);
  });
});

// =====================================================
// DELETE ENDPOINT TESTS
// =====================================================

describe('DELETE /api/stock/alerts/[id]', () => {
  it('should delete alert configuration', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock config deletion
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { id: mockAlertConfig.id }, 
        error: null 
      })
    });

    const request = createMockRequest(`http://localhost:3000/api/stock/alerts/${mockAlertConfig.id}`, {
      method: 'DELETE'
    });

    // Act
    const response = await DELETE(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('deleted successfully');
  });
});

// =====================================================
// ACKNOWLEDGE ENDPOINT TESTS
// =====================================================

describe('POST /api/stock/alerts/acknowledge', () => {
  it('should acknowledge alert successfully', async () => {
    // Arrange
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Mock user clinic
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    // Mock alert acknowledgment
    const acknowledgedAlert = { 
      ...mockAlert, 
      status: 'acknowledged',
      acknowledged_at: '2024-01-01T13:00:00Z'
    };
    
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: acknowledgedAlert, 
        error: null 
      })
    });

    const requestBody = {
      alertId: mockAlert.id,
      notes: 'Issue resolved'
    };

    const request = createMockRequest('http://localhost:3000/api/stock/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await AcknowledgePost(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.alert.status).toBe('acknowledged');
    expect(data.data.alert.acknowledgedAt).toBeTruthy();
  });

  it('should validate acknowledgment request', async () => {
    // Arrange
    const invalidRequestBody = {
      // Missing required alertId
      notes: 'Some notes'
    };

    const request = createMockRequest('http://localhost:3000/api/stock/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify(invalidRequestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await AcknowledgePost(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

// =====================================================
// END-TO-END WORKFLOW TESTS
// =====================================================

describe('End-to-End Alert Workflow', () => {
  it('should complete full alert lifecycle', async () => {
    // This test would simulate a complete workflow:
    // 1. Create alert configuration
    // 2. Trigger alert evaluation (would be done by background job)
    // 3. Generate alert
    // 4. Acknowledge alert
    // 5. Verify audit trail

    // For now, we'll test the API endpoints in sequence
    const { mockSupabase, mockQuery } = createMockSupabaseClient();
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    // Step 1: Create configuration
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: mockAlertConfig, 
        error: null 
      })
    });

    const createRequest = createMockRequest('http://localhost:3000/api/stock/alerts', {
      method: 'POST',
      body: JSON.stringify({
        alertType: 'low_stock',
        thresholdValue: 10,
        thresholdUnit: 'quantity',
        severityLevel: 'medium',
        isActive: true,
        notificationChannels: ['in_app']
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const createResponse = await POST(createRequest);
    const createData = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(createData.success).toBe(true);

    // Step 2: Acknowledge alert (simulating that an alert was generated)
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      })
    });

    const acknowledgedAlert = { 
      ...mockAlert, 
      status: 'acknowledged'
    };
    
    mockSupabase.from.mockReturnValueOnce({
      ...mockQuery,
      single: jest.fn().mockResolvedValue({ 
        data: acknowledgedAlert, 
        error: null 
      })
    });

    const ackRequest = createMockRequest('http://localhost:3000/api/stock/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify({
        alertId: mockAlert.id
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const ackResponse = await AcknowledgePost(ackRequest);
    const ackData = await ackResponse.json();

    expect(ackResponse.status).toBe(200);
    expect(ackData.success).toBe(true);
    expect(ackData.data.alert.status).toBe('acknowledged');
  });
});
