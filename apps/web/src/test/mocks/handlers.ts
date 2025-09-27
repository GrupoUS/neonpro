// Simple API mock handlers for healthcare platform
// Using basic Node.js approach to avoid MSW compatibility issues

// Mock data for aesthetic clinic
export const mockPatients = [
  {
    id: '1',
    fullName: 'Maria Silva',
    phonePrimary: '+55 11 9999-8888',
    email: 'maria.silva@email.com',
    birthDate: '1990-05-15',
    gender: 'F',
    isActive: true,
    lgpdConsentGiven: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    fullName: 'João Santos',
    phonePrimary: '+55 11 9888-7777',
    email: 'joao.santos@email.com',
    birthDate: '1985-08-20',
    gender: 'M',
    isActive: true,
    lgpdConsentGiven: true,
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
  },
]

export const mockAppointments = [
  {
    id: '1',
    patientId: '1',
    professionalId: 'prof-1',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:00:00Z',
    status: 'SCHEDULED',
    title: 'Consulta de Avaliação',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
]

export const mockProfessionals = [
  {
    id: 'prof-1',
    fullName: 'Dr. Carlos Mendes',
    specialty: 'Dermatologia',
    crm: 'CRM SP 123456',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Mock API response generator
export const createMockResponse = (success: boolean, data?: any, error?: string) => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
})

// API handlers - simplified approach
export const mockApiHandlers = {
  // Patients API
  patients: {
    list: () => Promise.resolve(createMockResponse(true, mockPatients)),
    create: (data: any) => Promise.resolve(createMockResponse(true, { id: '3', ...data })),
    update: (id: string, data: any) => Promise.resolve(createMockResponse(true, { id, ...data })),
    delete: (id: string) => Promise.resolve(createMockResponse(true, { id })),
    getById: (id: string) => Promise.resolve(createMockResponse(true, mockPatients.find(p => p.id === id))),
  },
  
  // Appointments API
  appointments: {
    list: () => Promise.resolve(createMockResponse(true, mockAppointments)),
    create: (data: any) => Promise.resolve(createMockResponse(true, { id: '2', ...data })),
    update: (id: string, data: any) => Promise.resolve(createMockResponse(true, { id, ...data })),
    delete: (id: string) => Promise.resolve(createMockResponse(true, { id })),
  },
  
  // Professionals API
  professionals: {
    list: () => Promise.resolve(createMockResponse(true, mockProfessionals)),
    create: (data: any) => Promise.resolve(createMockResponse(true, { id: 'prof-2', ...data })),
    update: (id: string, data: any) => Promise.resolve(createMockResponse(true, { id, ...data })),
    delete: (id: string) => Promise.resolve(createMockResponse(true, { id })),
  },
  
  // Auth API
  auth: {
    login: (credentials: { email: string; password: string }) => {
      if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
        return Promise.resolve(createMockResponse(true, {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token',
        }))
      }
      return Promise.resolve(createMockResponse(false, null, 'Invalid credentials'))
    },
  },
  
  // Health check
  health: {
    check: () => Promise.resolve({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
  },
}

// Mock fetch implementation
export const createMockFetch = () => {
  return async (url: string, options?: RequestInit) => {
    const method = options?.method || 'GET'
    const pathname = new URL(url, 'http://localhost').pathname
    
    // Handle different endpoints
    if (pathname === '/api/patients') {
      if (method === 'GET') {
        return new Response(JSON.stringify(mockApiHandlers.patients.list()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } else if (method === 'POST') {
        const data = JSON.parse(options?.body as string)
        return new Response(JSON.stringify(await mockApiHandlers.patients.create(data)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    
    if (pathname.startsWith('/api/patients/')) {
      const id = pathname.split('/')[3]
      if (method === 'GET') {
        return new Response(JSON.stringify(await mockApiHandlers.patients.getById(id)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    
    if (pathname === '/api/appointments') {
      if (method === 'GET') {
        return new Response(JSON.stringify(mockApiHandlers.appointments.list()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } else if (method === 'POST') {
        const data = JSON.parse(options?.body as string)
        return new Response(JSON.stringify(await mockApiHandlers.appointments.create(data)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    
    if (pathname === '/api/professionals') {
      if (method === 'GET') {
        return new Response(JSON.stringify(mockApiHandlers.professionals.list()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    
    if (pathname === '/api/auth/login') {
      if (method === 'POST') {
        const credentials = JSON.parse(options?.body as string)
        return new Response(JSON.stringify(await mockApiHandlers.auth.login(credentials)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    
    if (pathname === '/api/health') {
      return new Response(JSON.stringify(mockApiHandlers.health.check()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Setup mock server lifecycle
export const startMockServer = () => {
  // Store original fetch
  const originalFetch = global.fetch
  
  // Replace with mock fetch
  global.fetch = createMockFetch() as any
  
  console.warn('🌐 Mock API server started (simplified approach)')
  
  // Return cleanup function
  return () => {
    global.fetch = originalFetch
    console.warn('🌐 Mock API server stopped')
  }
}

// Helper functions for test setup
export const setupMockApi = () => {
  const cleanup = startMockServer()
  return { cleanup }
}

export const resetMockHandlers = () => {
  // Reset any custom handlers if needed
  console.warn('🔄 Mock handlers reset')
}