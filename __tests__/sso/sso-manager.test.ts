// SSO Manager Tests
// Story 1.3: SSO Integration - Core Manager Testing

import { SSOManager } from '@/lib/auth/sso/sso-manager';
import { GoogleOAuthProvider } from '@/lib/auth/sso/providers/google-oauth';
import { MicrosoftOAuthProvider } from '@/lib/auth/sso/providers/microsoft-oauth';
import { createClient } from '@supabase/supabase-js';
import { SSOProvider, SSOAuthRequest, SSOSession } from '@/types/sso';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock providers
jest.mock('@/lib/auth/sso/providers/google-oauth');
jest.mock('@/lib/auth/sso/providers/microsoft-oauth');

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
  let mockGoogleProvider: jest.Mocked<GoogleOAuthProvider>;
  let mockMicrosoftProvider: jest.Mocked<MicrosoftOAuthProvider>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
// SSO Manager Tests
// Story 1.3: SSO Integration - Core Manager Testing

import { SSOManager } from '@/lib/auth/sso/sso-manager';
import { GoogleOAuthProvider } from '@/lib/auth/sso/providers/google-oauth';
import { MicrosoftOAuthProvider } from '@/lib/auth/sso/providers/microsoft-oauth';
import { createClient } from '@supabase/supabase-js';
import { SSOProvider, SSOAuthRequest, SSOSession } from '@/types/sso';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock providers
jest.mock('@/lib/auth/sso/providers/google-oauth');
jest.mock('@/lib/auth/sso/providers/microsoft-oauth');

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
  let mockGoogleProvider: jest.Mocked<GoogleOAuthProvider>;
  let mockMicrosoftProvider: jest.Mocked<MicrosoftOAuthProvider>;

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
      single: jest.fn(),
      data: null,
      error: null,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Mock Google provider
    mockGoogleProvider = {
      generateAuthUrl: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
      refreshTokens: jest.fn(),
      getUserInfo: jest.fn(),
      revokeTokens: jest.fn(),
      validateIdToken: jest.fn(),
      getConfig: jest.fn(),
    } as any;

    (GoogleOAuthProvider as jest.Mock).mockImplementation(() => mockGoogleProvider);

    // Mock Microsoft provider
    mockMicrosoftProvider = {
      generateAuthUrl: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
      refreshTokens: jest.fn(),
      getUserInfo: jest.fn(),
      revokeTokens: jest.fn(),
      validateIdToken: jest.fn(),
      getConfig: jest.fn(),
    } as any;

    (MicrosoftOAuthProvider as jest.Mock).mockImplementation(() => mockMicrosoftProvider);

    // Create SSO manager instance
    ssoManager = new SSOManager();
  });
  describe('initialization', () => {
    it('should initialize with default providers', () => {
      const providers = ssoManager.getAvailableProviders();
      expect(providers).toHaveLength(2);
      expect(providers.map(p => p.id)).toContain('google');
      expect(providers.map(p => p.id)).toContain('microsoft');
    });

    it('should initialize providers correctly', () => {
      expect(GoogleOAuthProvider).toHaveBeenCalled();
      expect(MicrosoftOAuthProvider).toHaveBeenCalled();
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate auth URL for valid provider', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      mockGoogleProvider.generateAuthUrl.mockResolvedValue(mockAuthUrl);

      const result = await ssoManager.generateAuthUrl('google', {
        redirectUri: 'http://localhost:3000/auth/callback',
        scopes: ['openid', 'email', 'profile'],
      });

      expect(result).toBe(mockAuthUrl);
      expect(mockGoogleProvider.generateAuthUrl).toHaveBeenCalledWith({
        redirectUri: 'http://localhost:3000/auth/callback',
        scopes: ['openid', 'email', 'profile'],
      });
    });

    it('should throw error for invalid provider', async () => {
      await expect(
        ssoManager.generateAuthUrl('invalid-provider', {})
      ).rejects.toThrow('SSO provider not found: invalid-provider');
    });
  });
  describe('handleCallback', () => {
    it('should handle successful callback', async () => {
      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        idToken: 'id_token_123',
        expiresIn: 3600,
      };

      const mockUserInfo = {
        id: 'google_123',
        email: 'user@example.com',
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg',
      };

      mockGoogleProvider.exchangeCodeForTokens.mockResolvedValue(mockTokens);
      mockGoogleProvider.getUserInfo.mockResolvedValue(mockUserInfo);

      // Mock database operations
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null }); // User not found
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'user_123', email: 'user@example.com' }, 
        error: null 
      }); // User created

      const result = await ssoManager.handleCallback('google', {
        code: 'auth_code_123',
        state: 'state_123',
      });

      expect(result.success).toBe(true);
      expect(result.user).toMatchObject({
        email: 'user@example.com',
        name: 'John Doe',
      });
      expect(mockGoogleProvider.exchangeCodeForTokens).toHaveBeenCalledWith('auth_code_123');
      expect(mockGoogleProvider.getUserInfo).toHaveBeenCalledWith(mockTokens.accessToken);
    });
  });
  describe('logout', () => {
    it('should logout and revoke tokens', async () => {
      const mockSession = {
        id: 'session_123',
        provider: 'google',
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      };

      mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });
      mockGoogleProvider.revokeTokens.mockResolvedValue(undefined);

      await ssoManager.logout('session_123', { revokeTokens: true });

      expect(mockGoogleProvider.revokeTokens).toHaveBeenCalledWith('access_token_123');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'terminated',
        terminatedAt: expect.any(String),
      });
    });

    it('should handle logout without token revocation', async () => {
      const mockSession = {
        id: 'session_123',
        provider: 'google',
      };

      mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });

      await ssoManager.logout('session_123', { revokeTokens: false });

      expect(mockGoogleProvider.revokeTokens).not.toHaveBeenCalled();
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'terminated',
        terminatedAt: expect.any(String),
      });
    });
  });

  describe('getProvidersByDomain', () => {
    it('should return providers for domain', () => {
      const providers = ssoManager.getProvidersByDomain('gmail.com');
      expect(providers).toHaveLength(1);
      expect(providers[0].id).toBe('google');
    });

    it('should return empty array for unknown domain', () => {
      const providers = ssoManager.getProvidersByDomain('unknown.com');
      expect(providers).toHaveLength(0);
    });
  });
});
