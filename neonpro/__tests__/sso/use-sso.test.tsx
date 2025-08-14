// useSSO Hook Tests
// Story 1.3: SSO Integration - React Hook Testing

import { renderHook, act } from '@testing-library/react';
import { useSSO } from '@/hooks/use-sso';
import { SSOProvider } from '@/types/sso';

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: jest.fn(),
  },
  writable: true,
});

describe('useSSO', () => {
  const mockProviders: SSOProvider[] = [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth2',
      enabled: true,
      config: {
        clientId: 'google_client_id',
        clientSecret: 'google_client_secret',
        redirectUri: 'http://localhost:3000/auth/callback',
        scopes: ['openid', 'email', 'profile'],
        enabled: true,
        supportsRefreshToken: true,
        supportsIdToken: true,
        supportsPKCE: false,
      },
      metadata: {
        displayName: 'Google',
        description: 'Sign in with Google',
        iconUrl: '/icons/google.svg',
        buttonColor: '#4285f4',
        textColor: '#ffffff',
        supportedDomains: ['gmail.com', 'googlemail.com'],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });
  describe('getProviders', () => {
    it('should fetch and set providers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ providers: mockProviders }),
      });

      const { result } = renderHook(() => useSSO());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.providers).toEqual([]);

      await act(async () => {
        await result.current.getProviders();
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/sso/providers?enabled_only=true');
      expect(result.current.providers).toEqual(mockProviders);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSSO());

      await act(async () => {
        await result.current.getProviders();
      });

      expect(result.current.error).toBe('Failed to load SSO providers');
      expect(result.current.providers).toEqual([]);
    });
  });

  describe('login', () => {
    it('should redirect to authorization URL', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl: mockAuthUrl }),
      });

      const { result } = renderHook(() => useSSO());

      await act(async () => {
        await result.current.login('google');
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/sso/authorize?provider=google&prompt=select_account'
      );
      expect(window.location.assign).toHaveBeenCalledWith(mockAuthUrl);
    });
  });
  describe('logout', () => {
    it('should logout and redirect', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          redirectUrl: '/auth/login?logout=success' 
        }),
      });

      const { result } = renderHook(() => useSSO());

      await act(async () => {
        await result.current.logout();
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/sso/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revoke_tokens: true }),
      });
      expect(window.location.assign).toHaveBeenCalledWith('/auth/login?logout=success');
    });

    it('should handle logout error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Logout failed'));

      const { result } = renderHook(() => useSSO());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Failed to logout');
    });
  });

  describe('session management', () => {
    it('should update session state', async () => {
      const { result } = renderHook(() => useSSO());

      act(() => {
        result.current.updateSession({
          id: 'session_123',
          userId: 'user_123',
          provider: 'google',
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        });
      });

      expect(result.current.session).toMatchObject({
        id: 'session_123',
        provider: 'google',
        status: 'active',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
