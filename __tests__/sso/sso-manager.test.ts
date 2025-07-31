// SSO Manager Tests
// Story 1.3: SSO Integration - Core Manager Testing

import { SSOManager } from '@/lib/auth/sso/sso-manager';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SSOManager', () => {
  let ssoManager: SSOManager;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      data: null,
      error: null,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    // Create SSO manager instance
    ssoManager = new SSOManager(
      'https://test.supabase.co',
      'test-key'
    );
  });

  describe('initialization', () => {
    it('should initialize with default providers', () => {
      const providers = ssoManager.getAvailableProviders();
      expect(providers.length).toBeGreaterThan(0);
      
      // Check if Google provider exists
      const googleProvider = providers.find(p => p.id === 'google');
      expect(googleProvider).toBeDefined();
      expect(googleProvider?.enabled).toBe(true);
    });

    it('should get configuration', () => {
      const config = ssoManager.getConfiguration();
      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(config.globalSettings).toBeDefined();
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate auth URL for valid provider', async () => {
      // Mock fetch for storing auth request
      global.fetch = jest.fn();

      const result = await ssoManager.generateAuthUrl('google', {
        redirectUri: 'http://localhost:3000/auth/callback',
        scopes: ['openid', 'email', 'profile'],
      });

      expect(result).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result).toContain('client_id=');
      expect(result).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback');
      expect(result).toContain('scope=openid+email+profile');
    });

    it('should throw error for invalid provider', async () => {
      await expect(
        ssoManager.generateAuthUrl('invalid-provider', {})
      ).rejects.toMatchObject({
        code: 'PROVIDER_NOT_FOUND',
        message: 'Provider invalid-provider not found'
      });
    });
  });

  describe('getDomainProvider', () => {
    it('should return null for unknown domain', () => {
      const provider = ssoManager.getDomainProvider('user@unknown.com');
      expect(provider).toBeNull();
    });

    it('should handle invalid email', () => {
      const provider = ssoManager.getDomainProvider('invalid-email');
      expect(provider).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('should return null for non-existent session', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });

      const session = await ssoManager.validateSession('non-existent-session');
      expect(session).toBeNull();
    });

    it('should update last used timestamp for valid session', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 'user_123',
        providerId: 'google',
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      };

      // Configure mocks for the complete chain
      mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });

      const session = await ssoManager.validateSession('session_123');
      
      expect(session).toEqual(mockSession);
      expect(mockSupabase.update).toHaveBeenCalledWith({ lastUsedAt: expect.any(Date) });
    });
  });

  describe('logout', () => {
    it('should delete session successfully', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 'user_123',
        providerId: 'google',
      };

      // Configure mocks for the complete chain
      mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });
      mockSupabase.insert.mockResolvedValue({ data: null, error: null }); // For audit log

      await ssoManager.logout('session_123');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.insert).toHaveBeenCalled(); // Audit log
    });

    it('should handle non-existent session gracefully', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });

      await expect(ssoManager.logout('non-existent-session')).resolves.toBeUndefined();
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration successfully', async () => {
      mockSupabase.insert.mockResolvedValue({ data: null, error: null }); // For audit log

      const newConfig = {
        globalSettings: {
          enabled: false,
          allowLocalFallback: false,
        },
      };

      await ssoManager.updateConfiguration(newConfig);

      const config = ssoManager.getConfiguration();
      expect(config.globalSettings?.enabled).toBe(false);
      expect(config.globalSettings?.allowLocalFallback).toBe(false);
      expect(mockSupabase.insert).toHaveBeenCalled(); // Audit log
    });
  });
});