/**
 * Test Client Helper for Contract Tests
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { createClient } from '@supabase/supabase-js'

interface TestClientOptions {
  authenticated?: boolean
  userId?: string
  clinicId?: string
}

interface TestResponse {
  status: number
  data: any
  headers: Record<string, string>
}

interface MockedEndpoints {
  [endpoint: string]: {
    [method: string]: {
      status: number
      data: any
    }
  }
}

export function createTestClient(options: TestClientOptions = {}) {
  const {
    authenticated = true,
    userId = 'test-user-id',
    clinicId = 'test-clinic-id'
  } = options

  // Mock Supabase client for testing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'test-service-key'

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authenticated ? `Bearer test-jwt-token` : '',
      },
    },
  })

  // Mocked endpoints for testing
  const mockedEndpoints: MockedEndpoints = {}

  // API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

  // Setup function
  const setup = async () => {
    // Create test user if authenticated
    if (authenticated) {
      await supabase.auth.setSession({
        access_token: 'test-jwt-token',
        refresh_token: 'test-refresh-token',
      })
    }
  }

  // Cleanup function
  const cleanup = async () => {
    // Clean up any test data
    await supabase.auth.signOut()
  }

  // Generic request function
  const request = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    requestOptions: TestClientOptions = {}
  ): Promise<TestResponse> => {
    const url = `${apiBaseUrl}/v1${endpoint}`
    const isRequestAuthenticated = requestOptions.authenticated !== false && authenticated

    // Check if endpoint is mocked
    if (mockedEndpoints[endpoint] && mockedEndpoints[endpoint][method]) {
      const mockResponse = mockedEndpoints[endpoint][method]
      return {
        status: mockResponse.status,
        data: mockResponse.data,
        headers: {},
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (isRequestAuthenticated) {
      headers.Authorization = `Bearer test-jwt-token`
    }

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    if (data && method !== 'GET') {
      fetchOptions.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, fetchOptions)
      const responseData = await response.json()

      return {
        status: response.status,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Internal Server Error', message: error.message },
        headers: {},
      }
    }
  }

  // HTTP method helpers
  const get = (endpoint: string, requestOptions: TestClientOptions = {}) => {
    return request('GET', endpoint, undefined, requestOptions)
  }

  const post = (endpoint: string, data: any, requestOptions: TestClientOptions = {}) => {
    return request('POST', endpoint, data, requestOptions)
  }

  const put = (endpoint: string, data: any, requestOptions: TestClientOptions = {}) => {
    return request('PUT', endpoint, data, requestOptions)
  }

  const patch = (endpoint: string, data: any, requestOptions: TestClientOptions = {}) => {
    return request('PATCH', endpoint, data, requestOptions)
  }

  const del = (endpoint: string, requestOptions: TestClientOptions = {}) => {
    return request('DELETE', endpoint, undefined, requestOptions)
  }

  // Mock server error
  const mockServerError = async (endpoint: string, method: string) => {
    if (!mockedEndpoints[endpoint]) {
      mockedEndpoints[endpoint] = {}
    }

    mockedEndpoints[endpoint][method] = {
      status: 500,
      data: { error: 'Internal Server Error', message: 'Mocked server error for testing' },
    }
  }

  // Mock response
  const mockResponse = async (
    endpoint: string,
    method: string,
    status: number,
    data: any
  ) => {
    if (!mockedEndpoints[endpoint]) {
      mockedEndpoints[endpoint] = {}
    }

    mockedEndpoints[endpoint][method] = {
      status,
      data,
    }
  }

  // Clear mocks
  const clearMocks = () => {
    Object.keys(mockedEndpoints).forEach(endpoint => {
      delete mockedEndpoints[endpoint]
    })
  }

  return {
    supabase,
    setup,
    cleanup,
    get,
    post,
    put,
    patch,
    delete: del,
    mockServerError,
    mockResponse,
    clearMocks,
    userId,
    clinicId,
  }
}
