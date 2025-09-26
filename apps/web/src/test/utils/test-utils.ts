import '@testing-library/jest-dom'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from '@tanstack/react-router'
import { SupabaseProvider } from '@/contexts/supabase-context'
import { AuthProvider } from '@/contexts/auth-context'
import { LGPDProvider } from '@/contexts/lgpd-context'
import { HealthcareProvider } from '@/contexts/healthcare-context'
import { AuditTrailProvider } from '@/contexts/audit-trail-context'
import { Toaster } from '@/components/ui/toaster'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Healthcare compliance test utilities
export const HEALTHCARE_TEST_CONFIG = {
  LGPD_ENABLED: true,
  AUDIT_TRAIL_ENABLED: true,
  CONSENT_REQUIRED: true,
  DATA_RETENTION_DAYS: 365,
  ANONYMIZATION_ENABLED: true,
  ENCRYPTION_ENABLED: true,
  ACCESS_CONTROL_ENABLED: true,
} as const

// Mock healthcare data generators
export class HealthcareTestDataGenerator {
  static generatePatientData(overrides = {}) {
    return {
      id: 'test-patient-id',
      name: 'Test Patient',
      email: 'patient@test.com',
      phone: '+5511999999999',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      bloodType: 'O+',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+5511988888888',
        relationship: 'spouse',
      },
      ...overrides,
    }
  }

  static generateAppointmentData(overrides = {}) {
    return {
      id: 'test-appointment-id',
      patientId: 'test-patient-id',
      professionalId: 'test-professional-id',
      type: 'consultation',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      duration: 30,
      specialty: 'general',
      ...overrides,
    }
  }

  static generateMedicalRecordData(overrides = {}) {
    return {
      id: 'test-record-id',
      patientId: 'test-patient-id',
      professionalId: 'test-professional-id',
      type: 'consultation',
      date: new Date().toISOString(),
      diagnosis: ['Test diagnosis'],
      prescription: [],
      notes: 'Test medical record notes',
      ...overrides,
    }
  }

  static generateProfessionalData(overrides = {}) {
    return {
      id: 'test-professional-id',
      name: 'Dr. Test Professional',
      email: 'professional@test.com',
      specialty: 'general',
      license: 'TEST-12345',
      phone: '+5511977777777',
      ...overrides,
    }
  }
}

// MSW server setup with healthcare-specific handlers
export const createTestServer = () => {
  return setupServer(
    // Healthcare API handlers
    http.get('/api/healthcare/patients', () => {
      return HttpResponse.json({
        patients: [HealthcareTestDataGenerator.generatePatientData()],
        total: 1,
      })
    }),

    http.get('/api/healthcare/appointments', () => {
      return HttpResponse.json({
        appointments: [HealthcareTestDataGenerator.generateAppointmentData()],
        total: 1,
      })
    }),

    http.get('/api/healthcare/medical-records', () => {
      return HttpResponse.json({
        records: [HealthcareTestDataGenerator.generateMedicalRecordData()],
        total: 1,
      })
    }),

    http.get('/api/healthcare/professionals', () => {
      return HttpResponse.json({
        professionals: [HealthcareTestDataGenerator.generateProfessionalData()],
        total: 1,
      })
    }),

    // LGPD compliance handlers
    http.get('/api/lgpd/consent', () => {
      return HttpResponse.json({
        consent: {
          id: 'test-consent-id',
          patientId: 'test-patient-id',
          purposes: ['treatment', 'billing'],
          expiresAt: new Date(Date.now() + 31536000000).toISOString(),
          status: 'active',
        },
      })
    }),

    // Audit trail handlers
    http.get('/api/audit/records', () => {
      return HttpResponse.json({
        records: [
          {
            id: 'test-audit-id',
            action: 'test_action',
            resource: 'test_resource',
            userId: 'test-user-id',
            timestamp: new Date().toISOString(),
            details: {},
          },
        ],
        total: 1,
      })
    }),

    // Authentication handlers
    http.post('/api/auth/login', () => {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'professional',
        },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
        },
      })
    }),

    http.post('/api/auth/logout', () => {
      return HttpResponse.json({ success: true })
    }),

    http.get('/api/auth/me', () => {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'professional',
        },
      })
    }),
  )
}

// Test query client with healthcare-specific configuration
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// All Providers wrapper for component testing
export const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SupabaseProvider>
          <AuthProvider>
            <LGPDProvider>
              <HealthcareProvider>
                <AuditTrailProvider>
                  {children}
                  <Toaster />
                </AuditTrailProvider>
              </HealthcareProvider>
            </LGPDProvider>
          </AuthProvider>
        </SupabaseProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Custom render function with healthcare providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: AllProviders,
    ...options,
  })
}

// Healthcare-specific test matchers
expect.extend({
  toHaveValidLGPDCompliance(received: any) {
    const hasConsent = received.consent?.status === 'active'
    const hasAuditTrail = received.auditTrail?.enabled === true
    const hasEncryption = received.encryption?.enabled === true

    return {
      message: () =>
        `expected ${received} to have valid LGPD compliance. Consent: ${hasConsent}, Audit: ${hasAuditTrail}, Encryption: ${hasEncryption}`,
      pass: hasConsent && hasAuditTrail && hasEncryption,
    }
  },

  toHaveHealthcareAuditTrail(received: any) {
    const hasUserId = received.userId != null
    const hasAction = received.action != null
    const hasTimestamp = received.timestamp != null
    const hasResource = received.resource != null

    return {
      message: () =>
        `expected ${received} to have healthcare audit trail. User: ${hasUserId}, Action: ${hasAction}, Timestamp: ${hasTimestamp}, Resource: ${hasResource}`,
      pass: hasUserId && hasAction && hasTimestamp && hasResource,
    }
  },

  toBeEncryptedData(received: any) {
    const isString = typeof received === 'string'
    const hasEncryptionMarker = isString && received.includes('encrypted:')
    const isNotRawData = !received.includes('raw_data')

    return {
      message: () =>
        `expected ${received} to be encrypted data. IsString: ${isString}, HasMarker: ${hasEncryptionMarker}, NotRaw: ${isNotRawData}`,
      pass: isString && (hasEncryptionMarker || isNotRawData),
    }
  },
})

// Test utilities for async operations
export const waitForAsyncOperations = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Mock date utilities for consistent testing
export const mockDate = (date: string) => {
  const mockDate = new Date(date)
  vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
}

// Mock local storage for testing
export const createMockStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Healthcare-specific test helpers
export const createHealthcareTestContext = () => {
  return {
    patientData: HealthcareTestDataGenerator.generatePatientData(),
    appointmentData: HealthcareTestDataGenerator.generateAppointmentData(),
    medicalRecordData: HealthcareTestDataGenerator.generateMedicalRecordData(),
    professionalData: HealthcareTestDataGenerator.generateProfessionalData(),
  }
}

// Mock healthcare services
export const mockHealthcareServices = {
  patient: {
    getById: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generatePatientData()),
    create: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generatePatientData()),
    update: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generatePatientData()),
    delete: vi.fn().mockResolvedValue(true),
  },
  appointment: {
    getById: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateAppointmentData()),
    create: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateAppointmentData()),
    update: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateAppointmentData()),
    delete: vi.fn().mockResolvedValue(true),
    listByPatient: vi.fn().mockResolvedValue([HealthcareTestDataGenerator.generateAppointmentData()]),
  },
  medicalRecord: {
    getById: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateMedicalRecordData()),
    create: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateMedicalRecordData()),
    update: vi.fn().mockResolvedValue(HealthcareTestDataGenerator.generateMedicalRecordData()),
    delete: vi.fn().mockResolvedValue(true),
    listByPatient: vi.fn().mockResolvedValue([HealthcareTestDataGenerator.generateMedicalRecordData()]),
  },
}

// Test cleanup utilities
export const cleanupHealthcareTests = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
}

// Performance test utilities
export const measurePerformance = async (operation: () => Promise<void> | void) => {
  const start = performance.now()
  await operation()
  const end = performance.now()
  return {
    duration: end - start,
    passed: end - start < 1000, // Less than 1 second
  }
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { renderWithProviders as render }
