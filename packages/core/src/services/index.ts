// Service base class
export abstract class BaseService {
  protected supabaseUrl: string;
  protected supabaseKey: string;
  protected useServiceRole: boolean;

  constructor(supabaseUrl: string, supabaseKey: string, useServiceRole = false) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.useServiceRole = useServiceRole;
  }
}

// Error handling
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Response wrapper
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}