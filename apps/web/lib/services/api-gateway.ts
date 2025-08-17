// Migrated from src/services/api-gateway.ts
import { supabase } from '@/lib/supabase';

export class ApiGateway {
  private static instance: ApiGateway;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`,
        }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Gateway error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async get<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(
    endpoint: string, 
    body?: unknown
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string, 
    body?: unknown
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiGateway = ApiGateway.getInstance();