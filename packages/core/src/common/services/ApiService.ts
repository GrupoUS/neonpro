// Common API service for aesthetic clinic
export class ApiService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  
  // Generic request method
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json();
  };
  
  // GET request
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  // POST request with proper typing
  static async post<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  // PUT request with proper typing
  static async put<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  // PATCH request with proper typing
  static async patch<T, D = Record<string, unknown>>(
    endpoint: string, 
    data?: D
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}