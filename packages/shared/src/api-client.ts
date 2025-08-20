/**
 * 🔗 API Client - NeonPro Healthcare
 * ===================================
 * 
 * Cliente RPC type-safe para comunicação com Hono.dev backend
 * com integração TanStack Query e gerenciamento de autenticação.
 */

import { hc } from 'hono/client';

// Import the backend app type for RPC client
import type { AppType } from '../../apps/api/src/index';
import type { ApiResponse, RequestContext } from './types/api.types';

// API Client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  onRequest?: (init: RequestInit) => Promise<RequestInit> | RequestInit;
  onResponse?: (response: Response) => Promise<Response> | Response;
  onError?: (error: Error) => void;
}

// Default configuration
const DEFAULT_CONFIG: Required<Omit<ApiClientConfig, 'onRequest' | 'onResponse' | 'onError'>> = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Auth token management
class AuthTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store in localStorage if available (browser)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('neonpro_access_token', accessToken);
      localStorage.setItem('neonpro_refresh_token', refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    
    // Try to get from localStorage (browser)
    if (typeof localStorage !== 'undefined') {
      this.accessToken = localStorage.getItem('neonpro_access_token');
    }
    
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken;
    
    // Try to get from localStorage (browser)
    if (typeof localStorage !== 'undefined') {
      this.refreshToken = localStorage.getItem('neonpro_refresh_token');
    }
    
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    // Clear from localStorage (browser)
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('neonpro_access_token');
      localStorage.removeItem('neonpro_refresh_token');
    }
  }

  async refreshAccessToken(apiClient: any): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = (async () => {
      try {
        const response = await apiClient.api.v1.auth.refresh.$post({
          json: { refreshToken }
        });
        
        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const result = await response.json();
        if (result.success && result.data?.tokens) {
          this.setTokens(
            result.data.tokens.accessToken,
            result.data.tokens.refreshToken
          );
          return result.data.tokens.accessToken;
        }
        
        throw new Error('Invalid refresh response');
        
      } catch (error) {
        this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// Create token manager instance
const tokenManager = new AuthTokenManager();

// Create API client factory
export function createApiClient(config: Partial<ApiClientConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create Hono RPC client
  const client = hc<AppType>(finalConfig.baseUrl, {
    init: async (args) => {
      const token = tokenManager.getAccessToken();
      
      // Add auth header if token exists
      const headers: Record<string, string> = {
        ...finalConfig.headers,
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracing
      headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let init: RequestInit = {
        ...args,
        headers: {
          ...args.headers,
          ...headers,
        },
        signal: AbortSignal.timeout(finalConfig.timeout),
      };

      // Apply custom request transformation
      if (config.onRequest) {
        init = await config.onRequest(init);
      }

      return init;
    },
    
    fetch: async (input, init) => {
      let response: Response;
      let lastError: Error | null = null;
      
      // Retry logic
      for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
        try {
          response = await fetch(input, init);
          
          // Handle 401 (token expired) - try to refresh
          if (response.status === 401 && attempt === 0) {
            try {
              const newToken = await tokenManager.refreshAccessToken(client);
              
              // Retry with new token
              const newInit = {
                ...init,
                headers: {
                  ...init?.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };
              
              response = await fetch(input, newInit);
            } catch (refreshError) {
              // Refresh failed, clear tokens and continue with original response
              tokenManager.clearTokens();
            }
          }
          
          // Apply custom response transformation
          if (config.onResponse) {
            response = await config.onResponse(response);
          }
          
          return response;
          
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on timeout or network errors on last attempt
          if (attempt === finalConfig.retries) break;
          
          // Exponential backoff delay
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // If we get here, all retries failed
      if (config.onError && lastError) {
        config.onError(lastError);
      }
      
      throw lastError || new Error('All retry attempts failed');
    },
  });

  // Add auth methods to client
  return {
    ...client,
    auth: {
      setTokens: (accessToken: string, refreshToken: string) => {
        tokenManager.setTokens(accessToken, refreshToken);
      },
      
      getAccessToken: () => tokenManager.getAccessToken(),
      
      clearTokens: () => tokenManager.clearTokens(),
      
      isAuthenticated: () => !!tokenManager.getAccessToken(),
    }
  };
}

// Default API client instance
export const apiClient = createApiClient();

// API client type (for TypeScript inference)
export type ApiClient = ReturnType<typeof createApiClient>;

// Helper functions for common patterns
export const apiHelpers = {
  // Handle API response with error checking
  handleResponse: async <T>(response: Response): Promise<ApiResponse<T>> => {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'API_ERROR',
          message: data.message || 'Unknown error occurred',
          errors: data.errors,
        };
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'PARSE_ERROR',
        message: 'Failed to parse response',
      };
    }
  },

  // Create query key for TanStack Query
  createQueryKey: (endpoint: string, params?: Record<string, unknown>) => {
    const key = [endpoint];
    if (params) {
      key.push(params);
    }
    return key;
  },

  // Format error message for display
  formatError: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error && 'message' in error) {
      return String((error as any).message);
    }
    return 'An unexpected error occurred';
  },

  // Check if error is network/connectivity issue
  isNetworkError: (error: unknown): boolean => {
    if (error instanceof Error) {
      return error.message.includes('fetch') || 
             error.message.includes('network') ||
             error.message.includes('timeout') ||
             error.name === 'AbortError';
    }
    return false;
  },

  // Check if error is authentication issue
  isAuthError: (error: unknown): boolean => {
    if (typeof error === 'object' && error && 'error' in error) {
      const errorCode = (error as any).error;
      return ['UNAUTHORIZED', 'FORBIDDEN', 'TOKEN_EXPIRED', 'INVALID_CREDENTIALS'].includes(errorCode);
    }
    return false;
  },
};

// Export types for convenience
export type { AppType };
export { tokenManager };