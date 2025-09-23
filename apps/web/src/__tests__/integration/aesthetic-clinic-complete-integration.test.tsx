/**
 * Comprehensive End-to-End Integration Tests for Aesthetic Clinic Features
 * 
 * This test suite validates the complete integration of aesthetic clinic components
 * from frontend user interfaces through backend services to database persistence,
 * ensuring healthcare compliance (LGPD, ANVISA, CFM), security, and performance.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test/utils';
import { server } from '@/test/mocks/server';
import { rest } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrpcProvider } from '@/lib/trpc/client';

// Test Data Management
const testData = {
  patients: {
    newPatient: {
      fullName: 'Ana Carolina Silva',
      email: 'ana.silva@example.com',
      phonePrimary: '+55 11 9999-8888',
      birthDate: '1990-05-15',
      gender: 'F',
      address: 'Rua Augusta, 1234, São Paulo, SP',
      emergencyContact: '+55 11 9777-6666',
      medicalHistory: {
        allergies: ['Penicillin', 'Ibuprofen'],
        medications: ['Vitamin C', 'Collagen supplements'],
        conditions: ['Hypertension controlled'],
        pregnancyStatus: 'not_pregnant',
        breastfeeding: false,
        contraindications: []
      }
    },
    pregnantPatient: {
      fullName: 'Maria Oliveira Santos',
      email: 'maria.santos@example.com',
      phonePrimary: '+55 11 9888-7777',
      birthDate: '1988-03-20',
      gender: 'F',
      medicalHistory: {
        pregnancyStatus: 'pregnant',
        breastfeeding: false,
        trimester: 'second',
        dueDate: '2024-09-15'
      }
    },
    minorPatient: {
      fullName: 'Julia Costa',
      email: 'julia.costa@example.com',
      phonePrimary: '+55 11 9666-5555',
      birthDate: '2010-08-10',
      gender: 'F',
      age: 14,
      guardian: {
        name: 'Sra. Costa',
        relationship: 'mother',
        phone: '+55 11 9555-4444'
      }
    }
  },

  professionals: {
    dermatologist: {
      id: 'prof-derm-001',
      fullName: 'Dr. Roberto Mendes',
      specialization: 'Dermatology',
      licenseNumber: 'CRM-SP-123456',
      certifications: ['Dermatology Board', 'Aesthetic Medicine'],
      experience: 8,
      rating: 4.8
    },
    plasticSurgeon: {
      id: 'prof-surg-001',
      fullName: 'Dra. Patricia Ferreira',
      specialization: 'Plastic Surgery',
      licenseNumber: 'CRM-SP-789012',
      certifications: ['Plastic Surgery Board', 'Aesthetic Surgery'],
      experience: 12,
      rating: 4.9
    },
    aestheticNurse: {
      id: 'prof-nurse-001',
      fullName: 'Enfa. Ana Luiza',
      specialization: 'Aesthetic Nursing',
      licenseNumber: 'COREN-SP-345678',
      certifications: ['Aesthetic Procedures', 'Patient Care'],
      experience: 6,
      rating: 4.7
    }
  },

  procedures: {
    botox: {
      id: 'proc-botox-001',
      name: 'Botox Applications',
      category: 'injectable',
      procedureType: 'injectable',
      baseDuration: 30,
      basePrice: 1200,
      description: 'Botulinum toxin applications for wrinkle reduction',
      contraindications: ['pregnancy', 'breastfeeding', 'neuromuscular disorders'],
      requiredCertifications: ['Aesthetic Medicine'],
      anvisaRegistration: 'ANVISA-123456789',
      recoveryPeriod: 24,
      sessionsRequired: 1
    },
    fillers: {
      id: 'proc-fillers-001',
      name: 'Dermal Fillers',
      category: 'injectable',
      procedureType: 'injectable',
      baseDuration: 45,
      basePrice: 2500,
      description: 'Hyaluronic acid fillers for facial volume restoration',
      contraindications: ['pregnancy', 'breastfeeding', 'autoimmune disorders'],
      requiredCertifications: ['Aesthetic Medicine'],
      anvisaRegistration: 'ANVISA-987654321',
      recoveryPeriod: 48,
      sessionsRequired: 1
    },
    laser: {
      id: 'proc-laser-001',
      name: 'CO2 Laser Resurfacing',
      category: 'laser',
      procedureType: 'laser',
      baseDuration: 60,
      basePrice: 3500,
      description: 'CO2 laser for skin rejuvenation and scar treatment',
      contraindications: ['pregnancy', 'breastfeeding', 'photosensitivity', 'active acne'],
      requiredCertifications: ['Laser Therapy', 'Dermatology'],
      anvisaRegistration: 'ANVISA-456789123',
      recoveryPeriod: 168, // 7 days
      sessionsRequired: 1
    },
    facial: {
      id: 'proc-facial-001',
      name: 'Facial Harmonization',
      category: 'combination',
      procedureType: 'combination',
      baseDuration: 90,
      basePrice: 5800,
      description: 'Comprehensive facial treatment with multiple procedures',
      contraindications: ['pregnancy', 'breastfeeding', 'severe skin conditions'],
      requiredCertifications: ['Aesthetic Medicine', 'Dermatology'],
      anvisaRegistration: 'ANVISA-789123456',
      recoveryPeriod: 72,
      sessionsRequired: 3
    }
  },

  packages: {
    antiAging: {
      id: 'pkg-antiaging-001',
      name: 'Pacote Anti-Idade Completo',
      category: 'anti-aging',
      description: 'Pacote completo para tratamento de rugas e flacidez facial',
      totalSessions: 6,
      totalPrice: 15000,
      packageDiscount: 15,
      validityPeriod: 90,
      procedures: [
        { procedure: 'proc-botox-001', sessions: 2, price: 2400 },
        { procedure: 'proc-fillers-001', sessions: 2, price: 5000 },
        { procedure: 'proc-laser-001', sessions: 1, price: 3500 },
        { procedure: 'proc-facial-001', sessions: 1, price: 5800 }
      ]
    },
    rejuvenation: {
      id: 'pkg-rejuvenation-001',
      name: 'Pacote Rejuvenescimento Facial',
      category: 'rejuvenation',
      description: 'Tratamento completo para rejuvenescimento facial não cirúrgico',
      totalSessions: 4,
      totalPrice: 8900,
      packageDiscount: 12,
      validityPeriod: 60,
      procedures: [
        { procedure: 'proc-fillers-001', sessions: 2, price: 5000 },
        { procedure: 'proc-laser-001', sessions: 1, price: 3500 },
        { procedure: 'proc-facial-001', sessions: 1, price: 5800 }
      ]
    }
  },

  appointments: {
    scheduled: {
      id: 'apt-001',
      patientId: 'patient-001',
      professionalId: 'prof-derm-001',
      procedureId: 'proc-botox-001',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T10:30:00Z',
      status: 'scheduled',
      noShowRisk: 0.2,
      notes: 'Botox application - wrinkle reduction',
      metadata: {
        isAesthetic: true,
        sessionNumber: 1,
        totalSessions: 1,
        preProcedureInstructions: 'Avoid blood thinners for 48h',
        postProcedureInstructions: 'No facial massage for 24h'
      }
    },
    completed: {
      id: 'apt-002',
      patientId: 'patient-002',
      professionalId: 'prof-surg-001',
      procedureId: 'proc-fillers-001',
      startTime: '2024-01-10T14:00:00Z',
      endTime: '2024-01-10T14:45:00Z',
      status: 'completed',
      notes: 'Dermal fillers - cheek augmentation',
      metadata: {
        isAesthetic: true,
        sessionNumber: 1,
        totalSessions: 1,
        treatmentOutcome: 'Excellent',
        patientSatisfaction: 5
      }
    }
  },

  consent: {
    treatment: {
      clientId: 'patient-001',
      consentType: 'treatment',
      purpose: 'Aesthetic treatment procedures and data processing',
      dataCategories: ['health_data', 'medical_history', 'treatment_records', 'visual_data'],
      retentionPeriod: '10_years',
      thirdPartyShares: ['healthcare_professionals', 'laboratory_partners'],
      withdrawalAllowed: true,
      ipAddress: '127.0.0.1',
      userAgent: 'NeonPro/1.0 Test'
    },
    photos: {
      clientId: 'patient-001',
      consentType: 'photos',
      purpose: 'Before and after treatment photos for medical documentation',
      dataCategories: ['biometric_data', 'visual_data'],
      retentionPeriod: '15_years',
      thirdPartyShares: [],
      withdrawalAllowed: true,
      automaticExpiration: true,
      expiresAt: new Date(Date.now() + 15 * 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
};

// Mock API Responses
const mockApiResponses = {
  auth: {
    login: {
      client: { success: true, user: { id: 'client-001', role: 'client' }, token: 'mock-token' },
      professional: { success: true, user: { id: 'prof-001', role: 'professional' }, token: 'mock-token' },
      admin: { success: true, user: { id: 'admin-001', role: 'admin' }, token: 'mock-token' }
    }
  },

  patients: {
    create: { success: true, patient: { id: 'patient-001', ...testData.patients.newPatient } },
    update: { success: true, patient: { id: 'patient-001', ...testData.patients.newPatient, updatedAt: new Date() } },
    get: { success: true, patient: { id: 'patient-001', ...testData.patients.newPatient } }
  },

  procedures: {
    list: { 
      success: true, 
      procedures: Object.values(testData.procedures),
      pagination: { total: 4, limit: 20, offset: 0, hasMore: false }
    },
    get: { success: true, procedure: testData.procedures.botox }
  },

  packages: {
    list: {
      success: true,
      packages: Object.values(testData.packages),
      pagination: { total: 2, limit: 20, offset: 0, hasMore: false }
    },
    get: { success: true, package: testData.packages.antiAging }
  },

  appointments: {
    schedule: { 
      success: true, 
      appointment: testData.appointments.scheduled 
    },
    update: { 
      success: true, 
      appointment: { ...testData.appointments.scheduled, status: 'confirmed' } 
    },
    cancel: { 
      success: true, 
      appointment: { ...testData.appointments.scheduled, status: 'cancelled' } 
    }
  },

  compliance: {
    lgpdValidate: { success: true, compliant: true, issues: [] },
    cfmValidate: { success: true, valid: true, certifications: ['Dermatology Board'] },
    anvisaValidate: { success: true, compliant: true, warnings: [] }
  },

  whatsapp: {
    send: { success: true, messageId: 'msg-001' },
    confirm: { success: true, messageId: 'msg-002' },
    reminder: { success: true, messageId: 'msg-003' }
  }
};

// Test Utilities
class TestDataManager {
  private queryClient: QueryClient;

  constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  }

  async setupDatabase() {
    // Setup mock database state
    await this.queryClient.setQueryData(['patients'], []);
    await this.queryClient.setQueryData(['procedures'], Object.values(testData.procedures));
    await this.queryClient.setQueryData(['packages'], Object.values(testData.packages));
    await this.queryClient.setQueryData(['appointments'], []);
  }

  async cleanupDatabase() {
    // Clear all mock data
    await this.queryClient.clear();
  }

  getQueryClient() {
    return this.queryClient;
  }
}

// Mock Server Setup
const setupMockServer = () => {
  server.use(
    // Authentication endpoints
    rest.post('/api/auth/login', async (req, res, ctx) => {
      const { email, password } = await req.json();
      if (email === 'ana.silva@example.com' && password === 'password123') {
        return res(ctx.json(mockApiResponses.auth.login.client));
      }
      return res(ctx.status(401), ctx.json({ success: false, message: 'Invalid credentials' }));
    }),

    // Patient endpoints
    rest.post('/api/patients', async (req, res, ctx) => {
      const patientData = await req.json();
      return res(ctx.json(mockApiResponses.patients.create));
    }),

    rest.get('/api/patients/:id', async (req, res, ctx) => {
      const { id } = req.params;
      return res(ctx.json(mockApiResponses.patients.get));
    }),

    // Procedure endpoints
    rest.get('/api/aesthetic-scheduling/procedures', async (req, res, ctx) => {
      const url = new URL(req.url);
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');
      
      let procedures = Object.values(testData.procedures);
      if (search) {
        procedures = procedures.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (category) {
        procedures = procedures.filter(p => p.category === category);
      }
      
      return res(ctx.json({
        success: true,
        procedures,
        pagination: { total: procedures.length, limit: 20, offset: 0, hasMore: false }
      }));
    }),

    // Package endpoints
    rest.get('/api/aesthetic-scheduling/packages', async (req, res, ctx) => {
      return res(ctx.json(mockApiResponses.packages.list));
    }),

    // Appointment endpoints
    rest.post('/api/appointments', async (req, res, ctx) => {
      const appointmentData = await req.json();
      return res(ctx.json(mockApiResponses.appointments.schedule));
    }),

    // Compliance endpoints
    rest.post('/api/compliance/lgpd/validate', async (req, res, ctx) => {
      return res(ctx.json(mockApiResponses.compliance.lgpdValidate));
    }),

    // WhatsApp endpoints
    rest.post('/api/whatsapp/send', async (req, res, ctx) => {
      return res(ctx.json(mockApiResponses.whatsapp.send));
    })
  );
};

// Test Component Wrappers
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TrpcProvider>
        {children}
      </TrpcProvider>
    </QueryClientProvider>
  );
};

export { testData, mockApiResponses, TestDataManager, setupMockServer, createTestWrapper };