import { hc } from 'hono/client';
import type { AppType } from '../../apps/api/src/index';

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create the RPC client with proper typing
export const apiClient = hc<AppType>(API_BASE_URL);

// Types for common API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || errorData.message || 'An error occurred',
      errorData
    );
  }

  const data = await response.json();

  if (!data.success && data.error) {
    throw new ApiError(200, data.error, data);
  }

  return data.data || data;
}

// Environment-specific configuration
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 10_000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiClient;
