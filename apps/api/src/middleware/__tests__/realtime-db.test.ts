/**
 * Database Real-time Subscriptions Middleware Tests (T074)
 * Comprehensive test suite for Supabase real-time subscriptions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type LGPDFilter,
  patientDataSubscription,
  type RealtimeEvent,
  realtimeManager,
  realtimeSubscription,
  type SubscriptionConfig,
} from '../realtime-db';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
  },
});

// Mock Supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

describe('Database Real-time Subscriptions Middleware (T074)', () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockContext = {
      req: {
        param: vi.fn(),
      },
      set: vi.fn(),
      get: vi.fn(),
    };
    mockNext = vi.fn();

    // Set environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';

    // Reset mocks
    vi.clearAllMocks();
    mockChannel.on.mockReturnThis();
    mockChannel.subscribe.mockReturnThis();

    // Inject mock Supabase client into the realtime manager
    (realtimeManager as any).supabase = mockSupabase;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Realtime Subscription Manager', () => {
    it('should create subscription successfully', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
        lgpdCompliant: true,
        auditEnabled: true,
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'test-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(true);
      expect(mockSupabase.channel).toHaveBeenCalledWith(
        expect.stringContaining('public:patients:test-subscription'),
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'patients',
        }),
        expect.any(Function),
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle subscription with filter', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: 'UPDATE',
        filter: 'id=eq.123',
        lgpdCompliant: true,
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'filtered-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(true);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          filter: 'id=eq.123',
        }),
        expect.any(Function),
      );
    });

    it('should track user subscriptions', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'user-subscription';

      await realtimeManager.createSubscription(subscriptionId, config, callback);

      const userSubscriptions = realtimeManager.getUserSubscriptions('user-123');
      expect(userSubscriptions).toContain(subscriptionId);
    });

    it('should remove subscription successfully', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'removable-subscription';

      // Create subscription first
      await realtimeManager.createSubscription(subscriptionId, config, callback);

      // Remove subscription
      const result = await realtimeManager.removeSubscription(subscriptionId);

      expect(result).toBe(true);
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it('should return false when removing non-existent subscription', async () => {
      const result = await realtimeManager.removeSubscription('non-existent');
      expect(result).toBe(false);
    });

    it('should get subscriptions count', async () => {
      const initialCount = realtimeManager.getSubscriptionsCount();

      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
      };

      await realtimeManager.createSubscription('count-test', config, vi.fn());

      const newCount = realtimeManager.getSubscriptionsCount();
      expect(newCount).toBe(initialCount + 1);
    });

    it('should set and remove LGPD filter', () => {
      const userId = 'user-123';
      const lgpdFilter: LGPDFilter = {
        userId,
        consentedDataCategories: ['personal_data', 'health_data'],
        canViewPersonalData: true,
        canViewHealthData: true,
        canViewContactData: false,
        dataRetentionDays: 365,
      };

      realtimeManager.setLGPDFilter(userId, lgpdFilter);

      // Test that filter is set (we can't directly access private methods,
      // but we can test the public interface)
      expect(() => realtimeManager.setLGPDFilter(userId, lgpdFilter)).not.toThrow();

      realtimeManager.removeLGPDFilter(userId);
      expect(() => realtimeManager.removeLGPDFilter(userId)).not.toThrow();
    });

    it('should cleanup all subscriptions', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
      };

      // Create multiple subscriptions
      await realtimeManager.createSubscription('cleanup-1', config, vi.fn());
      await realtimeManager.createSubscription('cleanup-2', config, vi.fn());

      const initialCount = realtimeManager.getSubscriptionsCount();
      expect(initialCount).toBeGreaterThan(0);

      await realtimeManager.cleanup();

      const finalCount = realtimeManager.getSubscriptionsCount();
      expect(finalCount).toBe(0);
    });
  });

  describe('Realtime Subscription Middleware', () => {
    it('should add realtime utilities to context', async () => {
      const middleware = realtimeSubscription();
      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('realtimeManager', realtimeManager);
      expect(mockContext.set).toHaveBeenCalledWith('createSubscription', expect.any(Function));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should provide createSubscription helper', async () => {
      const middleware = realtimeSubscription();
      await middleware(mockContext, mockNext);

      // Get the createSubscription function from the context
      const createSubscriptionCall = mockContext.set.mock.calls.find(
        (call: any) => call[0] === 'createSubscription',
      );
      expect(createSubscriptionCall).toBeDefined();

      const createSubscription = createSubscriptionCall[1];
      expect(typeof createSubscription).toBe('function');

      // Test the helper function
      const config: SubscriptionConfig = {
        table: 'test_table',
        event: '*',
      };
      const callback = vi.fn();

      const result = await createSubscription(config, callback);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Patient Data Subscription Middleware', () => {
    it('should skip when no userId', async () => {
      mockContext.get.mockReturnValue(undefined);

      const middleware = patientDataSubscription();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalledWith(
        expect.stringContaining('subscribeToPatientData'),
        expect.any(Function),
      );
    });

    it('should set LGPD filter when consent available', async () => {
      const userId = 'user-123';
      const lgpdConsent = {
        dataCategories: ['personal_data', 'health_data'],
        retentionPeriod: 365,
      };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'lgpdConsent') return lgpdConsent;
        return undefined;
      });

      const middleware = patientDataSubscription();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith(
        'subscribeToPatientData',
        expect.any(Function),
      );
    });

    it('should provide subscribeToPatientData helper', async () => {
      const userId = 'user-123';
      const healthcareProfessional = { id: 'prof-123' };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'healthcareProfessional') return healthcareProfessional;
        return undefined;
      });

      const middleware = patientDataSubscription();
      await middleware(mockContext, mockNext);

      // Get the subscribeToPatientData function from the context
      const subscribeCall = mockContext.set.mock.calls.find(
        (call: any) => call[0] === 'subscribeToPatientData',
      );
      expect(subscribeCall).toBeDefined();

      const subscribeToPatientData = subscribeCall[1];
      expect(typeof subscribeToPatientData).toBe('function');

      // Test the helper function
      const patientId = 'patient-456';
      const callback = vi.fn();

      const result = await subscribeToPatientData(patientId, callback);
      expect(typeof result).toBe('boolean');
    });

    it('should handle healthcare professional context', async () => {
      const userId = 'user-123';
      const healthcareProfessional = {
        id: 'prof-123',
        crmNumber: '12345-SP',
        specialty: 'Dermatologia',
      };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'healthcareProfessional') return healthcareProfessional;
        return undefined;
      });

      const middleware = patientDataSubscription();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith(
        'subscribeToPatientData',
        expect.any(Function),
      );
    });

    it('should handle missing LGPD consent gracefully', async () => {
      const userId = 'user-123';

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        return undefined;
      });

      const middleware = patientDataSubscription();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith(
        'subscribeToPatientData',
        expect.any(Function),
      );
    });
  });

  describe('LGPD Compliance', () => {
    it('should handle LGPD compliant subscriptions', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
        lgpdCompliant: true,
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'lgpd-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(true);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          table: 'patients',
        }),
        expect.any(Function),
      );
    });

    it('should handle audit enabled subscriptions', async () => {
      const config: SubscriptionConfig = {
        table: 'patients',
        event: 'INSERT',
        auditEnabled: true,
        userId: 'user-123',
      };

      const callback = vi.fn();
      const subscriptionId = 'audit-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(true);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'patients',
        }),
        expect.any(Function),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase client initialization failure', async () => {
      // Temporarily remove the mock Supabase client
      const originalSupabase = (realtimeManager as any).supabase;
      (realtimeManager as any).supabase = null;

      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
      };

      const callback = vi.fn();
      const subscriptionId = 'error-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(false);

      // Restore the mock Supabase client
      (realtimeManager as any).supabase = originalSupabase;
    });

    it('should handle invalid subscription configuration', async () => {
      const invalidConfig = {
        table: '', // Invalid empty table name
        event: '*',
      } as SubscriptionConfig;

      const callback = vi.fn();
      const subscriptionId = 'invalid-subscription';

      const result = await realtimeManager.createSubscription(
        subscriptionId,
        invalidConfig,
        callback,
      );

      expect(result).toBe(false);
    });

    it('should handle subscription creation errors gracefully', async () => {
      // Mock channel creation to throw error
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Channel creation failed');
      });

      const config: SubscriptionConfig = {
        table: 'patients',
        event: '*',
      };

      const callback = vi.fn();
      const subscriptionId = 'error-subscription';

      const result = await realtimeManager.createSubscription(subscriptionId, config, callback);

      expect(result).toBe(false);

      // Restore mock
      mockSupabase.channel.mockImplementation(() => mockChannel);
    });
  });
});
