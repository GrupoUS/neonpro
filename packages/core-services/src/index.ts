// Core services package index
export * from "./base";
export * from "./scheduling";

// Re-export common types and interfaces
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ServiceResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
