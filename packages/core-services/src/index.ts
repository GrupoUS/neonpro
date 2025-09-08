// Core services package index
export * from './base'
export * from './scheduling'

// Re-export common types and interfaces
export interface ServiceResponse<T = unknown,> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T = unknown,> extends ServiceResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
