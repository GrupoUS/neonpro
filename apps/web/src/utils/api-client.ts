/**
 * API Client utility for making authenticated requests to the backend API
 * Handles authentication headers, error responses, and LGPD compliance
 */

import { supabase } from '@/integrations/supabase/client';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    import.meta.env.NEXT_PUBLIC_API_URL || 
                    (import.meta.env.DEV ? 'http://localhost:3000' : '/api');

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [K in keyof T]: T[K];
  } & {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  metadata?: Record<string, any>;
}

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 'VALIDATION_ERROR', 400, errors);
    this.name = 'ValidationError';
  }
}

export class LGPDComplianceError extends ApiError {
  constructor(message: string = 'LGPD compliance violation') {
    super(message, 'LGPD_VIOLATION', 403);
    this.name = 'LGPDComplianceError';
  }
}

/**
 * Get authentication headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new AuthenticationError('No valid session found');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'web-app',
  };
}

/**
 * Make authenticated API request
 */
async function makeRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const authHeaders = await getAuthHeaders();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    // Handle non-JSON responses (e.g., 204 No Content)
    let responseData: ApiResponse<T>;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = {
        success: response.ok,
        data: undefined as T,
      };
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = responseData.error || `HTTP ${response.status}: ${response.statusText}`;
      
      switch (response.status) {
        case 400:
          throw new ValidationError(errorMessage, responseData.errors);
        case 401:
          throw new AuthenticationError(errorMessage);
        case 403:
          if (responseData.code === 'LGPD_ACCESS_DENIED' || responseData.code === 'LGPD_VIOLATION') {
            throw new LGPDComplianceError(errorMessage);
          }
          throw new ApiError(errorMessage, responseData.code, 403);
        case 404:
          throw new ApiError(errorMessage, 'NOT_FOUND', 404);
        case 500:
          throw new ApiError('Internal server error', 'INTERNAL_ERROR', 500);
        default:
          throw new ApiError(errorMessage, responseData.code, response.status);
      }
    }

    return responseData;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors, JSON parse errors, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to server', 'NETWORK_ERROR');
    }
    
    // Generic error fallback
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return makeRequest<T>(url, {
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * PATCH request
   */
  patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

export default apiClient;