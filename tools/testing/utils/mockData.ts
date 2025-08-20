/**
 * Mock Data for Tests
 * Comprehensive mock data for NeonPro healthcare testing
 */

// Analytics Mock Data
export const mockAnalyticsData = {
  overview: {
    totalPatients: 1234,
    activeSubscriptions: 567,
    monthlyRevenue: 45_000,
    satisfaction: 4.8,
  },
  trends: {
    patients: {
      current: 1234,
      previous: 1180,
      growth: 4.6,
    },
    revenue: {
      current: 45_000,
      previous: 42_000,
      growth: 7.1,
    },
  },
  charts: {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      patients: Math.floor(Math.random() * 50) + 100,
      revenue: Math.floor(Math.random() * 5000) + 5000,
    })),
    monthly: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toISOString(),
      patients: Math.floor(Math.random() * 200) + 800,
      revenue: Math.floor(Math.random() * 10_000) + 30_000,
    })),
  },
};

// Export Mock Data
export const mockExportData = {
  patients: [
    {
      id: 'patient-1',
      name: 'João Silva',
      email: 'joao@email.com',
      createdAt: '2024-01-15T10:00:00Z',
      lastVisit: '2024-12-01T14:30:00Z',
    },
    {
      id: 'patient-2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      createdAt: '2024-02-20T09:15:00Z',
      lastVisit: '2024-11-28T16:00:00Z',
    },
  ],
  analytics: {
    period: '2024-01-01/2024-12-31',
    totalPatients: 2,
    exportedAt: new Date().toISOString(),
  },
};

// Session Mock Data
export const mockSession = {
  user: {
    id: 'user-123',
    email: 'doctor@neonpro.com',
    role: 'doctor',
    name: 'Dr. João Médico',
  },
  access_token: 'mock-jwt-token',
  expires_at: Date.now() + 3_600_000, // 1 hour from now
};

// Supabase Mock Data
export const mockSupabaseResponse = {
  data: [],
  error: null,
  count: 0,
  status: 200,
  statusText: 'OK',
};

// Medical Records Mock Data
export const mockMedicalRecord = {
  id: 'record-123',
  patient_id: 'patient-123',
  doctor_id: 'doctor-123',
  diagnosis: 'Consulta de rotina',
  treatment: 'Acompanhamento mensal',
  notes: 'Paciente apresenta boa evolução',
  created_at: '2024-12-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z',
};

// Professional Mock Data
export const mockProfessional = {
  id: 'prof-123',
  name: 'Dr. João Médico',
  crm: '12345-SP',
  specialty: 'Cardiologia',
  email: 'doctor@neonpro.com',
  phone: '+55 11 99999-9999',
  active: true,
  created_at: '2024-01-01T00:00:00Z',
};

// Patient Mock Data
export const mockPatient = {
  id: 'patient-123',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '+55 11 88888-8888',
  birth_date: '1990-01-01',
  cpf: '123.456.789-00',
  address: {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567',
  },
  created_at: '2024-01-15T00:00:00Z',
};

// Subscription Mock Data
export const mockSubscription = {
  id: 'sub-123',
  patient_id: 'patient-123',
  plan: 'premium',
  status: 'active',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z',
  amount: 199.99,
  currency: 'BRL',
};

// Stock Alert Mock Data
export const mockStockAlert = {
  id: 'alert-123',
  medication_id: 'med-123',
  medication_name: 'Paracetamol 500mg',
  current_stock: 5,
  minimum_stock: 10,
  severity: 'warning' as const,
  created_at: '2024-12-01T10:00:00Z',
  acknowledged: false,
};

// Medication Mock Data
export const mockMedication = {
  id: 'med-123',
  name: 'Paracetamol 500mg',
  description: 'Analgésico e antitérmico',
  current_stock: 5,
  minimum_stock: 10,
  price: 15.99,
  supplier: 'Farmácia Central',
  expiry_date: '2025-12-31',
};

// Audit Log Mock Data
export const mockAuditLog = {
  id: 'audit-123',
  user_id: 'user-123',
  action: 'patient_data_access',
  resource: 'patient-123',
  timestamp: '2024-12-01T10:00:00Z',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...',
  success: true,
};

// Error Mock Data
export const mockError = {
  code: 'PATIENT_NOT_FOUND',
  message: 'Paciente não encontrado',
  status: 404,
  timestamp: new Date().toISOString(),
};

// API Response Mock Data
export const mockApiResponse = {
  success: true,
  data: null,
  message: 'Operação realizada com sucesso',
  timestamp: new Date().toISOString(),
};

// CME (Continuing Medical Education) Mock Data
export const mockCME = {
  professional_id: 'prof-123',
  hours_completed: 40,
  hours_required: 40,
  valid_until: '2025-12-31T23:59:59Z',
  courses: [
    {
      id: 'course-1',
      name: 'Atualização em Cardiologia',
      hours: 20,
      completed_at: '2024-06-15T00:00:00Z',
    },
    {
      id: 'course-2',
      name: 'Ética Médica',
      hours: 20,
      completed_at: '2024-09-10T00:00:00Z',
    },
  ],
};

// WebAuthn Mock Data
export const mockWebAuthn = {
  publicKeyCredentialCreationOptions: {
    challenge: new Uint8Array(32),
    rp: { name: 'NeonPro Healthcare' },
    user: {
      id: new Uint8Array(32),
      name: 'doctor@neonpro.com',
      displayName: 'Dr. João Médico',
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    timeout: 60_000,
  },
  credential: {
    id: 'mock-credential-id',
    rawId: new ArrayBuffer(32),
    type: 'public-key',
    response: {
      attestationObject: new ArrayBuffer(256),
      clientDataJSON: new ArrayBuffer(128),
    },
  },
};

export default {
  mockAnalyticsData,
  mockExportData,
  mockSession,
  mockSupabaseResponse,
  mockMedicalRecord,
  mockProfessional,
  mockPatient,
  mockSubscription,
  mockStockAlert,
  mockMedication,
  mockAuditLog,
  mockError,
  mockApiResponse,
  mockCME,
  mockWebAuthn,
};
