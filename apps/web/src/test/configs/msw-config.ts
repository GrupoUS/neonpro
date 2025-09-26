import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Healthcare-specific test data
export const healthcareMockData = {
  patients: [
    {
      id: 'test-patient-1',
      fullName: 'Maria Silva',
      email: 'maria.silva@email.com',
      phonePrimary: '+55 11 9999-8888',
      birthDate: '1990-05-15',
      gender: 'F',
      bloodType: 'O+',
      isActive: true,
      lgpdConsentGiven: true,
      lgpdConsentDate: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'test-patient-2',
      fullName: 'João Santos',
      email: 'joao.santos@email.com',
      phonePrimary: '+55 11 9888-7777',
      birthDate: '1985-08-20',
      gender: 'M',
      bloodType: 'A+',
      isActive: true,
      lgpdConsentGiven: true,
      lgpdConsentDate: '2024-01-14T15:30:00Z',
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z',
    },
  ],
  professionals: [
    {
      id: 'test-prof-1',
      fullName: 'Dr. Carlos Mendes',
      email: 'carlos.mendes@email.com',
      specialty: 'Dermatologia',
      crm: 'CRM SP 123456',
      isActive: true,
      phone: '+55 11 9777-6666',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'test-prof-2',
      fullName: 'Dra. Ana Costa',
      email: 'ana.costa@email.com',
      specialty: 'Clínica Geral',
      crm: 'CRM SP 789012',
      isActive: true,
      phone: '+55 11 9666-5555',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ],
  appointments: [
    {
      id: 'test-appointment-1',
      patientId: 'test-patient-1',
      professionalId: 'test-prof-1',
      type: 'consultation',
      status: 'scheduled',
      scheduledAt: '2024-01-20T14:00:00Z',
      scheduledEnd: '2024-01-20T15:00:00Z',
      duration: 60,
      specialty: 'Dermatologia',
      notes: 'Consulta de avaliação inicial',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'test-appointment-2',
      patientId: 'test-patient-2',
      professionalId: 'test-prof-2',
      type: 'follow_up',
      status: 'completed',
      scheduledAt: '2024-01-18T10:00:00Z',
      scheduledEnd: '2024-01-18T10:30:00Z',
      duration: 30,
      specialty: 'Clínica Geral',
      notes: 'Retorno de acompanhamento',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-18T10:30:00Z',
    },
  ],
  medicalRecords: [
    {
      id: 'test-record-1',
      patientId: 'test-patient-1',
      professionalId: 'test-prof-1',
      type: 'consultation',
      date: '2024-01-20T14:00:00Z',
      diagnosis: ['Acne moderada'],
      treatment: ['Tópico com retinóide', 'Antibiótico oral'],
      notes: 'Paciente apresenta acne inflamatória moderada. Prescrito tratamento combinado.',
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.5,
        oxygenSaturation: 98,
      },
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
  ],
  lgpdConsents: [
    {
      id: 'test-consent-1',
      patientId: 'test-patient-1',
      purposes: ['tratamento', 'faturamento', 'comunicação'],
      expirationDate: '2025-01-15T10:00:00Z',
      status: 'active',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  auditEvents: [
    {
      id: 'test-audit-1',
      userId: 'test-user-1',
      action: 'view_patient_record',
      resource: 'patient/test-patient-1',
      resourceId: 'test-patient-1',
      details: {
        reason: 'consulta',
        patientId: 'test-patient-1',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      timestamp: '2024-01-20T14:00:00Z',
    },
  ],
}

// Healthcare API handlers following LGPD compliance
export const healthcareHandlers = [
  // Patients API with LGPD compliance
  http.get('/api/patients', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''

    let filteredPatients = healthcareMockData.patients
    if (search) {
      filteredPatients = filteredPatients.filter(patient =>
        patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
        patient.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

    return HttpResponse.json({
      success: true,
      data: paginatedPatients,
      pagination: {
        page,
        limit,
        total: filteredPatients.length,
        totalPages: Math.ceil(filteredPatients.length / limit),
      },
      meta: {
        lgpdCompliant: true,
        encryptionEnabled: true,
        auditTrailEnabled: true,
      },
    })
  }),

  http.get('/api/patients/:id', ({ params }) => {
    const patient = healthcareMockData.patients.find(p => p.id === params.id)
    
    if (!patient) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Patient not found',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: patient,
      meta: {
        lgpdCompliant: true,
        lastAccessed: new Date().toISOString(),
        accessLogId: 'test-access-log-1',
      },
    })
  }),

  http.post('/api/patients', async ({ request }) => {
    const patientData = await request.json()
    
    // Validate LGPD consent
    if (!patientData.lgpdConsentGiven) {
      return HttpResponse.json(
        {
          success: false,
          error: 'LGPD consent is required',
          code: 'LGPD_CONSENT_REQUIRED',
        },
        { status: 400 }
      )
    }

    const newPatient = {
      id: `test-patient-${Date.now()}`,
      ...patientData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    healthcareMockData.patients.push(newPatient)

    return HttpResponse.json({
      success: true,
      data: newPatient,
      meta: {
        lgpdCompliant: true,
        consentRecorded: true,
        auditTrailId: 'test-audit-' + Date.now(),
      },
    })
  }),

  // Professionals API
  http.get('/api/professionals', () => {
    return HttpResponse.json({
      success: true,
      data: healthcareMockData.professionals,
      meta: {
        encryptionEnabled: true,
        auditTrailEnabled: true,
      },
    })
  }),

  // Appointments API
  http.get('/api/appointments', ({ request }) => {
    const url = new URL(request.url)
    const patientId = url.searchParams.get('patientId')
    const professionalId = url.searchParams.get('professionalId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let filteredAppointments = healthcareMockData.appointments

    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId)
    }

    if (professionalId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.professionalId === professionalId)
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt)
        return aptDate >= start && aptDate <= end
      })
    }

    return HttpResponse.json({
      success: true,
      data: filteredAppointments,
      meta: {
        lgpdCompliant: true,
        encryptedData: true,
      },
    })
  }),

  http.post('/api/appointments', async ({ request }) => {
    const appointmentData = await request.json()
    
    // Validate required fields
    if (!appointmentData.patientId || !appointmentData.professionalId) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Patient ID and Professional ID are required',
        },
        { status: 400 }
      )
    }

    const newAppointment = {
      id: `test-appointment-${Date.now()}`,
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    healthcareMockData.appointments.push(newAppointment)

    return HttpResponse.json({
      success: true,
      data: newAppointment,
      meta: {
        lgpdCompliant: true,
        auditTrailId: 'test-audit-' + Date.now(),
      },
    })
  }),

  // Medical Records API (with extra security)
  http.get('/api/medical-records', ({ request }) => {
    const url = new URL(request.url)
    const patientId = url.searchParams.get('patientId')

    if (!patientId) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Patient ID is required',
        },
        { status: 400 }
      )
    }

    const patientRecords = healthcareMockData.medicalRecords.filter(
      record => record.patientId === patientId
    )

    return HttpResponse.json({
      success: true,
      data: patientRecords,
      meta: {
        lgpdCompliant: true,
        encryptionEnabled: true,
        accessLevel: 'restricted',
        auditTrailEnabled: true,
      },
    })
  }),

  // LGPD Consent API
  http.get('/api/lgpd/consents/:patientId', ({ params }) => {
    const consents = healthcareMockData.lgpdConsents.filter(
      consent => consent.patientId === params.patientId
    )

    return HttpResponse.json({
      success: true,
      data: consents,
      meta: {
        lgpdCompliant: true,
        encryptionEnabled: true,
      },
    })
  }),

  http.post('/api/lgpd/consents', async ({ request }) => {
    const consentData = await request.json()
    
    const newConsent = {
      id: `test-consent-${Date.now()}`,
      ...consentData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    healthcareMockData.lgpdConsents.push(newConsent)

    return HttpResponse.json({
      success: true,
      data: newConsent,
      meta: {
        lgpdCompliant: true,
        auditTrailId: 'test-audit-' + Date.now(),
      },
    })
  }),

  // Audit Trail API
  http.get('/api/audit/events', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const action = url.searchParams.get('action')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    let filteredEvents = healthcareMockData.auditEvents

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId)
    }

    if (action) {
      filteredEvents = filteredEvents.filter(event => event.action === action)
    }

    const paginatedEvents = filteredEvents.slice(0, limit)

    return HttpResponse.json({
      success: true,
      data: paginatedEvents,
      meta: {
        total: filteredEvents.length,
        limit,
        encryptionEnabled: true,
      },
    })
  }),

  // Authentication API
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()

    // Mock authentication logic
    if (email === 'test@professional.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 'test-user-1',
            email: 'test@professional.com',
            name: 'Dr. Test Professional',
            role: 'professional',
            professionalId: 'test-prof-1',
          },
          session: {
            access_token: 'test-access-token-' + Date.now(),
            refresh_token: 'test-refresh-token-' + Date.now(),
            expires_in: 3600,
            token_type: 'Bearer',
          },
        },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    )
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-user-1',
        email: 'test@professional.com',
        name: 'Dr. Test Professional',
        role: 'professional',
        professionalId: 'test-prof-1',
      },
    })
  }),

  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: 'healthy',
        cache: 'healthy',
        external_services: 'healthy',
        lgpd_compliance: 'compliant',
        audit_trail: 'active',
      },
    })
  }),
]

// Setup MSW server
export const server = setupServer(...healthcareHandlers)

// Server lifecycle functions
export const startMSWServer = () => {
  server.listen({
    onUnhandledRequest: 'error',
    quiet: true,
  })
}

export const stopMSWServer = () => {
  server.close()
}

export const resetMSWHandlers = () => {
  server.resetHandlers()
}