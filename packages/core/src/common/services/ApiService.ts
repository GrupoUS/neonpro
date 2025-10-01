// Common API service for aesthetic clinic
export class ApiService {
  private static baseUrl = process.env['NEXT_PUBLIC_API_URL'] ?? '/api'
  
  // Generic request method
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const mergedHeaders = new Headers(defaultHeaders)

    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        mergedHeaders.set(key, value)
      })
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // GET request
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  // POST request with proper typing
  static async post<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    const body = data !== undefined ? JSON.stringify(data) : undefined
    const init: RequestInit = body !== undefined ? { method: 'POST', body } : { method: 'POST' }

    return this.request<T>(endpoint, init)
  }
  
  // PUT request with proper typing
  static async put<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    const body = data !== undefined ? JSON.stringify(data) : undefined
    const init: RequestInit = body !== undefined ? { method: 'PUT', body } : { method: 'PUT' }

    return this.request<T>(endpoint, init)
  }
  
  // PATCH request with proper typing
  static async patch<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    const body = data !== undefined ? JSON.stringify(data) : undefined
    const init: RequestInit = body !== undefined ? { method: 'PATCH', body } : { method: 'PATCH' }

    return this.request<T>(endpoint, init)
  }
  
  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}