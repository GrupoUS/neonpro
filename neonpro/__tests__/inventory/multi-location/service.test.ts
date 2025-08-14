import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { multiLocationInventoryService } from '@/lib/services/multi-location-inventory-service';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

jest.mock('@/app/utils/supabase/client', () => ({
  createClient: () => mockSupabase
}));

describe('Multi-Location Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInventoryStock', () => {
    it('should fetch inventory stock without filters', async () => {
      const mockData = [
        {
          item_id: '1',
          item_name: 'Test Item',
          current_quantity: 50,
          clinic_name: 'Test Clinic'
        }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await multiLocationInventoryService.getInventoryStock();

      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('inventory_stock');
    });

    it('should apply clinic_id filter when provided', async () => {
      const filters = { clinic_id: 'clinic-1' };
      
      await multiLocationInventoryService.getInventoryStock(filters);

      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
    });

    it('should handle service errors gracefully', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(
        multiLocationInventoryService.getInventoryStock()
      ).rejects.toThrow('Database error');
    });
  });

  describe('createStockTransfer', () => {
    it('should create a new stock transfer', async () => {
      const transferData = {
        from_clinic_id: 'clinic-1',
        to_clinic_id: 'clinic-2',
        item_id: 'item-1',
        quantity: 10,
        reason: 'Restock',
        notes: 'Emergency transfer'
      };

      const mockResponse = {
        data: [{ id: 'transfer-1', ...transferData }],
        error: null
      };

      mockSupabase.from().insert.mockResolvedValue(mockResponse);

      const result = await multiLocationInventoryService.createStockTransfer(transferData);

      expect(result).toEqual(mockResponse.data[0]);
      expect(mockSupabase.from).toHaveBeenCalledWith('stock_transfers');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([transferData]);
    });
  });

  describe('getLocationStockSummary', () => {
    it('should fetch location stock summary', async () => {
      const mockSummary = [
        {
          clinic_id: 'clinic-1',
          clinic_name: 'Test Clinic',
          total_items: 100,
          total_value: 50000,
          low_stock_count: 5,
          expiring_count: 2
        }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockSummary,
        error: null
      });

      const result = await multiLocationInventoryService.getLocationStockSummary();

      expect(result).toEqual(mockSummary);
    });
  });

  describe('getLowStockAlerts', () => {
    it('should fetch low stock alerts', async () => {
      const mockAlerts = [
        {
          item_id: 'item-1',
          item_name: 'Low Stock Item',
          current_quantity: 2,
          minimum_quantity: 10
        }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockAlerts,
        error: null
      });

      const result = await multiLocationInventoryService.getLowStockAlerts();

      expect(result).toEqual(mockAlerts);
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const updateData = {
        item_id: 'item-1',
        clinic_id: 'clinic-1',
        quantity_change: 10,
        transaction_type: 'adjustment' as const,
        reason: 'Manual adjustment'
      };

      mockSupabase.from().update().eq.mockResolvedValue({
        data: [{ current_quantity: 60 }],
        error: null
      });

      const result = await multiLocationInventoryService.updateStock(updateData);

      expect(result).toEqual({ current_quantity: 60 });
      expect(mockSupabase.from).toHaveBeenCalledWith('inventory_stock');
    });
  });
});