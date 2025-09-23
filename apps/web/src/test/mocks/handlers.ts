import { http, HttpResponse } from 'msw';

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
];

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
];

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
];

// API handlers
export const handlers = [
  // Patients API
  http.get('/api/patients', () => {
    return HttpResponse.json({
      success: true,
      data: mockPatients,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
      },
    });
  }),

  http.post('/api/patients', async ({ request }) => {
    const patientData = await request.json();
    const newPatient = {
      id: '3',
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json({
      success: true,
      data: newPatient,
    });
  }),

  // Appointments API
  http.get('/api/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: mockAppointments,
    });
  }),

  http.post('/api/appointments', async ({ request }) => {
    const appointmentData = await request.json();
    const newAppointment = {
      id: '2',
      ...appointmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json({
      success: true,
      data: newAppointment,
    });
  }),

  // Professionals API
  http.get('/api/professionals', () => {
    return HttpResponse.json({
      success: true,
      data: mockProfessionals,
    });
  }),

  // Auth API
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token',
        },
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }),
];