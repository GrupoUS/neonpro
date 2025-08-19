// Stock Alert Integration Tests - Updated for new StockAlertsService
// Story 11.4: Alertas e Relatórios de Estoque

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { StockAlertsService } from '../stock-alerts.service';
import {
  type CreateStockAlertConfig,
  type AcknowledgeAlert,
  type ResolveAlert,
  type AlertsQuery,
} from '@/lib/types/stock-alerts';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getSession: jest.fn(),
  },
};

// Test data
const mockClinicId = '123e4567-e89b-12d3-a456-426614174000';
const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
const mockProductId = '123e4567-e89b-12d3-a456-426614174002';

const mockAlertConfig: CreateStockAlertConfig = {
  alertType: 'low_stock',
  thresholdValue: 10,
  thresholdUnit: 'quantity',
  severityLevel: 'medium',
  isActive: true,
  notificationChannels: ['in_app', 'email'],
  productId: mockProductId,
  createdBy: mockUserId,
  createdAt: new Date(),
};

describe('Stock Alert Integration Tests', () => {
  let service: StockAlertsService;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = {
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
    };

    (mockSupabaseClient.from as jest.Mock).mockReturnValue(mockQuery);
    
    // Mock getUserClinicId method
    mockQuery.single
      .mockResolvedValueOnce({ 
        data: { clinic_id: mockClinicId }, 
        error: null 
      });

    service = new StockAlertsService();
    // Replace the supabase client with our mock
    (service as any).supabase = mockSupabaseClient;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Alert Configuration Management', () => {
    it('should create alert configuration successfully', async () => {
      // Mock getUserClinicId
      mockQuery.single
        .mockResolvedValueOnce({ data: { clinic_id: mockClinicId }, error: null })
        // Mock duplicate check (no existing)
        .mockResolvedValueOnce({ data: [], error: null })
        // Mock insert result
        .mockResolvedValueOnce({ 
          data: { 
            id: 'new-config-id',
            ...mockAlertConfig,
            clinic_id: mockClinicId 
          }, 
          error: null 
        });

      const result = await service.createAlertConfig(mockAlertConfig, mockUserId);

      expect(result).toBeDefined();
      expect(result.clinic_id).toBe(mockClinicId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('stock_alert_configs');
    });

    it('should handle duplicate configuration error', async () => {
      // Mock getUserClinicId
      mockQuery.single
        .mockResolvedValueOnce({ data: { clinic_id: mockClinicId }, error: null })
        // Mock duplicate found
        .mockResolvedValueOnce({ data: [{ id: 'existing-id' }], error: null });

      await expect(
        service.createAlertConfig(mockAlertConfig, mockUserId)
      ).rejects.toThrow('Alert configuration already exists');
    });
  });

  describe('Alert Queries', () => {
    it('should get alerts with filtering', async () => {
      const query: AlertsQuery = {
        clinicId: mockClinicId,
        alertType: 'low_stock',
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      const mockAlerts = [
        {
          id: 'alert-1',
          clinic_id: mockClinicId,
          alert_type: 'low_stock',
          severity_level: 'medium',
          message: 'Test alert',
          status: 'active',
          created_at: new Date(),
        }
      ];

      // Mock getUserClinicId
      mockQuery.single
        .mockResolvedValueOnce({ data: { clinic_id: mockClinicId }, error: null });

      // Mock alerts query
      mockQuery.single = jest.fn();
      const mockAlertsQuery = {
        ...mockQuery,
        single: undefined,
      };
      (mockSupabaseClient.from as jest.Mock).mockReturnValue(mockAlertsQuery);
      
      // Mock the final query execution
      Object.defineProperty(mockAlertsQuery, 'then', {
        value: jest.fn().mockResolvedValue({ 
          data: mockAlerts, 
          error: null, 
          count: 1 
        }),
        writable: true
      });

      const result = await service.getAlerts(query, mockUserId);

      expect(result).toBeDefined();
      expect(result.alerts).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('Alert Acknowledgment', () => {
    it('should acknowledge alert successfully', async () => {
      const acknowledgeData: AcknowledgeAlert = {
        alertId: 'alert-id',
        acknowledgedBy: mockUserId,
        note: 'Issue resolved',
      };

      // Mock check existing alert (active)
      mockQuery.single
        .mockResolvedValueOnce({ 
          data: { id: 'alert-id', status: 'active' }, 
          error: null 
        })
        // Mock update result
        .mockResolvedValueOnce({ 
          data: { 
            id: 'alert-id', 
            status: 'acknowledged',
            acknowledged_by: mockUserId,
            acknowledged_at: new Date(),
          }, 
          error: null 
        });

      const result = await service.acknowledgeAlert(acknowledgeData);

      expect(result).toBeDefined();
      expect(result.status).toBe('acknowledged');
      expect(result.acknowledged_by).toBe(mockUserId);
    });

    it('should handle acknowledgment of non-existent alert', async () => {
      const acknowledgeData: AcknowledgeAlert = {
        alertId: 'non-existent',
        acknowledgedBy: mockUserId,
      };

      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      await expect(service.acknowledgeAlert(acknowledgeData))
        .rejects.toThrow('Alert not found');
    });

    it('should handle acknowledgment of non-active alert', async () => {
      const acknowledgeData: AcknowledgeAlert = {
        alertId: 'alert-id',
        acknowledgedBy: mockUserId,
      };

      mockQuery.single.mockResolvedValue({ 
        data: { id: 'alert-id', status: 'resolved' }, 
        error: null 
      });

      await expect(service.acknowledgeAlert(acknowledgeData))
        .rejects.toThrow('Alert is not in active status');
    });
  });

  describe('Alert Resolution', () => {
    it('should resolve alert successfully', async () => {
      const resolveData: ResolveAlert = {
        alertId: 'alert-id',
        resolvedBy: mockUserId,
        resolution: 'Stock replenished',
        actionsTaken: ['Ordered more inventory', 'Updated thresholds'],
      };

      // Mock check existing alert
      mockQuery.single
        .mockResolvedValueOnce({ 
          data: { id: 'alert-id', status: 'acknowledged' }, 
          error: null 
        })
        // Mock update result
        .mockResolvedValueOnce({ 
          data: { 
            id: 'alert-id', 
            status: 'resolved',
            resolved_by: mockUserId,
            resolved_at: new Date(),
            metadata: {
              resolution: 'Stock replenished',
              actions_taken: ['Ordered more inventory', 'Updated thresholds'],
            },
          }, 
          error: null 
        });

      const result = await service.resolveAlert(resolveData);

      expect(result).toBeDefined();
      expect(result.status).toBe('resolved');
      expect(result.resolved_by).toBe(mockUserId);
      expect(result.metadata.resolution).toBe('Stock replenished');
    });

    it('should handle resolution of already resolved alert', async () => {
      const resolveData: ResolveAlert = {
        alertId: 'alert-id',
        resolvedBy: mockUserId,
        resolution: 'Already resolved',
      };

      mockQuery.single.mockResolvedValue({ 
        data: { id: 'alert-id', status: 'resolved' }, 
        error: null 
      });

      await expect(service.resolveAlert(resolveData))
        .rejects.toThrow('Alert is already resolved');
    });
  });

  describe('Stock Level Evaluation', () => {
    it('should check stock levels and generate alerts', async () => {
      // Mock getUserClinicId
      mockQuery.single
        .mockResolvedValueOnce({ data: { clinic_id: mockClinicId }, error: null });

      // Mock getAlertConfigs
      const mockConfigs = [
        {
          id: 'config-id',
          clinicId: mockClinicId,
          productId: mockProductId,
          alertType: 'low_stock',
          thresholdValue: 10,
          severityLevel: 'medium',
        }
      ];
      
      // Replace getAlertConfigs method
      (service as any).getAlertConfigs = jest.fn().mockResolvedValue(mockConfigs);

      // Mock evaluateStockConfig 
      (service as any).evaluateStockConfig = jest.fn().mockResolvedValue([
        {
          id: 'new-alert',
          clinicId: mockClinicId,
          productId: mockProductId,
          alertType: 'low_stock',
          severityLevel: 'medium',
          currentValue: 5,
          thresholdValue: 10,
          message: 'Low stock detected',
          status: 'active',
        }
      ]);

      const result = await service.checkStockLevels(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].alertType).toBe('low_stock');
      expect(result[0].currentValue).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockQuery.single.mockRejectedValue(new Error('Connection failed'));

      await expect(service.createAlertConfig(mockAlertConfig, mockUserId))
        .rejects.toThrow('Connection failed');
    });

    it('should handle invalid user clinic context', async () => {
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      await expect(service.createAlertConfig(mockAlertConfig, mockUserId))
        .rejects.toThrow('User clinic context not found');
    });
  });
});