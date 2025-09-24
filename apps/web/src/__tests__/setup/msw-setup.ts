/**
 * Mock Service Worker Setup
 *
 * Global setup for API mocking during integration tests
 */

import { http, HttpResponse } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Mock data factory
import {
  createMockAppointment,
  createMockPhotoAssessment,
  createMockProcedure,
  createMockProfessional,
  createMockTreatmentPackage,
  createMockUser,
} from './test-data'

// Setup MSW server
const server = setupServer(
  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: createMockUser('patient'),
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    }

    return HttpResponse.json({
      success: false,
      error: 'Invalid credentials',
    }, { status: 401 })
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json()
    const userData = createMockUser('patient')
    Object.assign(userData, body)

    return HttpResponse.json({
      success: true,
      data: {
        user: userData,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      },
    })
  }),
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
      },
    })
  }),
  // Patient endpoints
  http.get('/api/patients/:id', ({ params }) => {
    const patient = createMockUser('patient')
    patient.id = params.id as string

    return HttpResponse.json({
      success: true,
      data: patient,
    })
  }),
  http.put('/api/patients/:id', async ({ request, params }) => {
    const updates = await request.json()
    const patient = createMockUser('patient')
    patient.id = params.id as string
    Object.assign(patient, updates)

    return HttpResponse.json({
      success: true,
      data: patient,
    })
  }),
  // Professional endpoints
  http.get('/api/professionals', () => {
    const professionals = [
      createMockProfessional('dermatologist'),
      createMockProfessional('plastic_surgeon'),
      createMockProfessional('aesthetic_nurse'),
    ]

    return HttpResponse.json({
      success: true,
      data: professionals,
    })
  }),
  http.get('/api/professionals/:id', ({ params }) => {
    const professional = createMockProfessional('dermatologist')
    professional.id = params.id as string

    return HttpResponse.json({
      success: true,
      data: professional,
    })
  }),
  // Procedure endpoints
  http.get('/api/procedures', () => {
    const procedures = [
      createMockProcedure('botox'),
      createMockProcedure('hyaluronic_acid'),
      createMockProcedure('chemical_peeling'),
      createMockProcedure('laser_hair_removal'),
    ]

    return HttpResponse.json({
      success: true,
      data: procedures,
    })
  }),
  http.get('/api/procedures/:id', ({ params }) => {
    const procedure = createMockProcedure('botox')
    procedure.id = params.id as string

    return HttpResponse.json({
      success: true,
      data: procedure,
    })
  }),
  // Treatment package endpoints
  http.get('/api/treatment-packages', () => {
    const packages = [
      createMockTreatmentPackage('botox_package'),
      createMockTreatmentPackage('facial_package'),
      createMockTreatmentPackage('anti_aging_package'),
    ]

    return HttpResponse.json({
      success: true,
      data: packages,
    })
  }),
  http.post('/api/treatment-packages', async ({ request }) => {
    const packageData = await request.json()
    const newPackage = createMockTreatmentPackage('custom_package')
    Object.assign(newPackage, packageData)

    return HttpResponse.json({
      success: true,
      data: newPackage,
    })
  }),
  // Appointment endpoints
  http.get('/api/appointments', () => {
    const appointments = [
      createMockAppointment('consultation'),
      createMockAppointment('treatment'),
      createMockAppointment('follow_up'),
    ]

    return HttpResponse.json({
      success: true,
      data: appointments,
    })
  }),
  http.post('/api/appointments', async ({ request }) => {
    const appointmentData = await request.json()
    const newAppointment = createMockAppointment('treatment')
    Object.assign(newAppointment, appointmentData)

    return HttpResponse.json({
      success: true,
      data: newAppointment,
    })
  }),
  http.put('/api/appointments/:id', async ({ request, params }) => {
    const updates = await request.json()
    const appointment = createMockAppointment('treatment')
    appointment.id = params.id as string
    Object.assign(appointment, updates)

    return HttpResponse.json({
      success: true,
      data: appointment,
    })
  }),
  // Photo assessment endpoints
  http.get('/api/photo-assessments/:id', ({ params }) => {
    const assessment = createMockPhotoAssessment('facial_analysis')
    assessment.id = params.id as string

    return HttpResponse.json({
      success: true,
      data: assessment,
    })
  }),
  http.post('/api/photo-assessments', async ({ request }) => {
    const assessmentData = await request.json()
    const newAssessment = createMockPhotoAssessment('facial_analysis')
    Object.assign(newAssessment, assessmentData)

    return HttpResponse.json({
      success: true,
      data: newAssessment,
    })
  }),
  // LGPD compliance endpoints
  http.get('/api/compliance/lgpd/consent/:patientId', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'consent-123',
        patientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Aesthetic treatment procedures',
        dataCategories: ['health_data', 'visual_data'],
        retentionPeriod: '5_years',
        thirdPartyShares: [],
        withdrawalAllowed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  }),
  http.post('/api/compliance/lgpd/consent', async ({ request }) => {
    const consentData = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        id: 'consent-' + Date.now(),
        ...consentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  }),
  // WhatsApp integration endpoints
  http.post('/api/whatsapp/send', async ({ request }) => {
    const messageData = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        messageId: 'whatsapp-' + Date.now(),
        status: 'sent',
        to: messageData.to,
        timestamp: new Date().toISOString(),
      },
    })
  }),
  // Financial transaction endpoints
  http.post('/api/transactions', async ({ request }) => {
    const transactionData = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        id: 'transaction-' + Date.now(),
        ...transactionData,
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
    })
  }),
  // Error handlers
  http.all('*', () => {
    return HttpResponse.json({
      success: false,
      error: 'Endpoint not found',
    }, { status: 404 })
  }),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  console.log('🌐 MSW server started for integration tests')
})

afterAll(() => {
  server.close()
  console.log('🔌 MSW server stopped')
})

afterEach(() => {
  server.resetHandlers()
})

// Export server for test modifications
export { server }

// Helper functions for test customization
export const mockApi = {
  // Override handlers for specific test scenarios
  setResponse(endpoint: string, response: any) {
    server.use(
      http.all(endpoint, () => {
        return HttpResponse.json(response)
      }),
    )
  },

  // Simulate network errors
  simulateError(endpoint: string, status: number = 500) {
    server.use(
      http.all(endpoint, () => {
        return new HttpResponse(null, { status })
      }),
    )
  },

  // Simulate network delays
  simulateDelay(endpoint: string, delay: number) {
    server.use(
      http.all(endpoint, async () => {
        await new Promise((resolve) => setTimeout(resolve, delay))
        return HttpResponse.json({ success: true })
      }),
    )
  },

  // Reset to default handlers
  reset() {
    server.resetHandlers()
  },
}

console.log('🔧 MSW setup complete with default handlers')
