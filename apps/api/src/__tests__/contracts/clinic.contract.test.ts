import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Clinic, ClinicInput, ClinicOutput } from '@/types/api/contracts';
import { createTRPCMsw } from 'msw-trpc';
import { httpLink } from '@trpc/client';
import { appRouter } from '@/trpc/router';
import type { AppRouter } from '@/trpc/router';

/**
 * Clinic Contract Tests
 * Tests the tRPC Clinic API endpoints contract compliance
 * Ensures type safety, input validation, and output conformity
 */

describe('Clinic Contract Testing', () => {
  const mockContext = {
    user: { id: 'user-123', role: 'admin' },
    auth: { userId: 'user-123', isAuthenticated: true },
    prisma: {
      clinic: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn()
      },
      professional: {
        findMany: vi.fn(),
        count: vi.fn()
      },
      patient: {
        count: vi.fn()
      },
      appointment: {
        count: vi.fn(),
        findMany: vi.fn()
      }
    },
    anvisa: {
      validateClinicRegistration: vi.fn(),
      checkComplianceStatus: vi.fn()
    },
    audit: {
      logClinicAction: vi.fn(),
      createAuditRecord: vi.fn()
    },
    compliance: {
      validateLGPDCompliance: vi.fn(),
      checkHealthRegulations: vi.fn()
    }
  };

  const trpcMsw = createTRPCMsw<AppRouter>();
  const caller = appRouter.createCaller(mockContext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Clinic Creation Contract', () => {
    it('should validate clinic creation input and output', async () => {
      const createInput: ClinicInput['create'] = {
        basicInfo: {
          name: 'Clínica Estética NeonPro',
          tradeName: 'NeonPro Estética',
          cnpj: '12.345.678/0001-90',
          email: 'contato@neonpro.com',
          phone: '+5511999888777',
          website: 'https://neonpro.com'
        },
        address: {
          street: 'Rua das Flores, 123',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          complement: 'Sala 101',
          coordinates: {
            lat: -23.5505,
            lng: -46.6333
          }
        },
        businessInfo: {
          anvisaRegistration: 'ANVISA-REG-2024-001',
          municipalLicense: 'LIC-SP-2024-001',
          specializations: ['aesthetic_medicine', 'dermatology', 'plastic_surgery'],
          businessHours: {
            monday: { start: '08:00', end: '18:00' },
            tuesday: { start: '08:00', end: '18:00' },
            wednesday: { start: '08:00', end: '18:00' },
            thursday: { start: '08:00', end: '18:00' },
            friday: { start: '08:00', end: '17:00' },
            saturday: { start: '08:00', end: '12:00' }
          }
        },
        configuration: {
          appointmentDuration: 60,
          maxAdvanceBookingDays: 90,
          cancellationPolicy: '24h',
          paymentMethods: ['cash', 'credit_card', 'debit_card', 'pix'],
          timezone: 'America/Sao_Paulo'
        }
      };

      const mockClinic = {
        id: 'clinic-789',
        name: 'Clínica Estética NeonPro',
        cnpj: '12.345.678/0001-90',
        email: 'contato@neonpro.com',
        anvisaRegistration: 'ANVISA-REG-2024-001',
        specializations: ['aesthetic_medicine', 'dermatology', 'plastic_surgery'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContext.anvisa.validateClinicRegistration.mockResolvedValue({ 
        valid: true, 
        status: 'active',
        registrationDate: '2024-01-15'
      });
      mockContext.compliance.validateLGPDCompliance.mockResolvedValue({ 
        compliant: true,
        requirements: ['data_protection_officer', 'privacy_policy', 'consent_management']
      });
      mockContext.prisma.clinic.create.mockResolvedValue(mockClinic);

      const result = await caller.api.clinic.create(createInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'clinic-789',
          name: 'Clínica Estética NeonPro',
          cnpj: '12.345.678/0001-90',
          specializations: expect.arrayContaining(['aesthetic_medicine'])
        })
      });

      // Verify ANVISA validation was called
      expect(mockContext.anvisa.validateClinicRegistration).toHaveBeenCalledWith({
        anvisaRegistration: 'ANVISA-REG-2024-001',
        cnpj: '12.345.678/0001-90'
      });

      // Verify audit logging
      expect(mockContext.audit.logClinicAction).toHaveBeenCalledWith({
        action: 'create',
        clinicId: 'clinic-789',
        userId: mockContext.user.id,
        timestamp: expect.any(Date)
      });
    });

    it('should reject invalid ANVISA registration', async () => {
      const invalidInput: ClinicInput['create'] = {
        basicInfo: {
          name: 'Invalid Clinic',
          cnpj: '12.345.678/0001-90',
          email: 'invalid@clinic.com',
          phone: '+5511999888777'
        },
        address: {
          street: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        businessInfo: {
          anvisaRegistration: 'INVALID-REG',
          specializations: ['aesthetic_medicine']
        }
      };

      mockContext.anvisa.validateClinicRegistration.mockResolvedValue({ 
        valid: false, 
        error: 'Invalid ANVISA registration format' 
      });

      await expect(caller.api.clinic.create(invalidInput))
        .rejects.toThrow('Invalid ANVISA registration: Invalid ANVISA registration format');
    });

    it('should enforce LGPD compliance requirements', async () => {
      const nonCompliantInput: ClinicInput['create'] = {
        basicInfo: {
          name: 'Non-Compliant Clinic',
          cnpj: '12.345.678/0001-90',
          email: 'noncompliant@clinic.com',
          phone: '+5511999888777'
        },
        address: {
          street: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        businessInfo: {
          anvisaRegistration: 'ANVISA-REG-2024-001',
          specializations: ['aesthetic_medicine']
        }
      };

      mockContext.anvisa.validateClinicRegistration.mockResolvedValue({ valid: true, status: 'active' });
      mockContext.compliance.validateLGPDCompliance.mockResolvedValue({ 
        compliant: false, 
        missingRequirements: ['data_protection_officer', 'privacy_policy'] 
      });

      await expect(caller.api.clinic.create(nonCompliantInput))
        .rejects.toThrow('LGPD compliance requirements not met');
    });
  });

  describe('Clinic Retrieval Contract', () => {
    it('should validate clinic retrieval by ID', async () => {
      const clinicId = 'clinic-789';
      const mockClinic = {
        id: clinicId,
        name: 'Clínica Estética NeonPro',
        tradeName: 'NeonPro Estética',
        cnpj: '12.345.678/0001-90',
        email: 'contato@neonpro.com',
        phone: '+5511999888777',
        website: 'https://neonpro.com',
        address: {
          street: 'Rua das Flores, 123',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        businessInfo: {
          anvisaRegistration: 'ANVISA-REG-2024-001',
          specializations: ['aesthetic_medicine', 'dermatology'],
          businessHours: {
            monday: { start: '08:00', end: '18:00' }
          }
        },
        statistics: {
          totalProfessionals: 15,
          totalPatients: 1250,
          totalAppointments: 5680,
          activeAppointments: 45
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContext.prisma.clinic.findUnique.mockResolvedValue(mockClinic);
      mockContext.prisma.professional.count.mockResolvedValue(15);
      mockContext.prisma.patient.count.mockResolvedValue(1250);
      mockContext.prisma.appointment.count.mockResolvedValue(5680);

      const result = await caller.api.clinic.getById({ id: clinicId });

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: clinicId,
          name: 'Clínica Estética NeonPro',
          cnpj: '12.345.678/0001-90',
          specializations: expect.arrayContaining(['aesthetic_medicine']),
          statistics: expect.objectContaining({
            totalProfessionals: 15,
            totalPatients: 1250
          })
        })
      });
    });

    it('should handle clinic not found', async () => {
      const clinicId = 'nonexistent-clinic';
      
      mockContext.prisma.clinic.findUnique.mockResolvedValue(null);

      await expect(caller.api.clinic.getById({ id: clinicId }))
        .rejects.toThrow('Clinic not found');
    });
  });

  describe('Clinic Update Contract', () => {
    it('should validate clinic information updates', async () => {
      const clinicId = 'clinic-789';
      const updateInput: ClinicInput['update'] = {
        id: clinicId,
        basicInfo: {
          phone: '+5511777666555',
          email: 'novo-contato@neonpro.com',
          website: 'https://neonpro.com.br'
        },
        businessInfo: {
          specializations: ['aesthetic_medicine', 'dermatology', 'laser_therapy'],
          businessHours: {
            monday: { start: '09:00', end: '19:00' },
            tuesday: { start: '09:00', end: '19:00' },
            wednesday: { start: '09:00', end: '19:00' },
            thursday: { start: '09:00', end: '19:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '08:00', end: '14:00' }
          }
        },
        configuration: {
          appointmentDuration: 90,
          maxAdvanceBookingDays: 120,
          paymentMethods: ['cash', 'credit_card', 'debit_card', 'pix', 'installments']
        }
      };

      const existingClinic = {
        id: clinicId,
        name: 'Clínica Estética NeonPro',
        cnpj: '12.345.678/0001-90',
        isActive: true
      };

      const updatedClinic = {
        ...existingClinic,
        phone: '+5511777666555',
        email: 'novo-contato@neonpro.com',
        website: 'https://neonpro.com.br',
        specializations: ['aesthetic_medicine', 'dermatology', 'laser_therapy'],
        updatedAt: new Date()
      };

      mockContext.prisma.clinic.findUnique.mockResolvedValue(existingClinic);
      mockContext.prisma.clinic.update.mockResolvedValue(updatedClinic);

      const result = await caller.api.clinic.update(updateInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: clinicId,
          phone: '+5511777666555',
          email: 'novo-contato@neonpro.com',
          specializations: expect.arrayContaining(['laser_therapy'])
        })
      });

      // Verify audit logging for update
      expect(mockContext.audit.logClinicAction).toHaveBeenCalledWith({
        action: 'update',
        clinicId,
        userId: mockContext.user.id,
        changes: expect.objectContaining({
          phone: '+5511777666555',
          email: 'novo-contato@neonpro.com'
        }),
        timestamp: expect.any(Date)
      });
    });

    it('should prevent unauthorized updates to critical fields', async () => {
      const clinicId = 'clinic-789';
      const unauthorizedUpdate: ClinicInput['update'] = {
        id: clinicId,
        basicInfo: {
          cnpj: '99.888.777/0001-66', // Changing CNPJ should require special authorization
          name: 'Completely New Name'
        }
      };

      const existingClinic = {
        id: clinicId,
        cnpj: '12.345.678/0001-90',
        name: 'Original Clinic Name'
      };

      mockContext.prisma.clinic.findUnique.mockResolvedValue(existingClinic);

      await expect(caller.api.clinic.update(unauthorizedUpdate))
        .rejects.toThrow('Unauthorized to modify CNPJ information');
    });
  });

  describe('Clinic Statistics Contract', () => {
    it('should validate clinic statistics retrieval', async () => {
      const clinicId = 'clinic-789';
      const period = 'monthly';
      
      const mockStatistics = {
        overview: {
          totalProfessionals: 15,
          activeProfessionals: 12,
          totalPatients: 1250,
          activePatients: 890,
          totalAppointments: 5680,
          completedAppointments: 5200,
          cancelledAppointments: 480
        },
        revenue: {
          totalRevenue: 850000.50,
          monthlyRevenue: 125000.75,
          averageTicket: 245.30,
          paymentMethods: {
            cash: 25.5,
            credit_card: 45.2,
            debit_card: 15.8,
            pix: 13.5
          }
        },
        appointments: {
          scheduledToday: 25,
          scheduledThisWeek: 156,
          scheduledThisMonth: 678,
          noShowRate: 12.5,
          cancellationRate: 8.5
        },
        professionals: [
          {
            id: 'prof-1',
            name: 'Dr. Ana Silva',
            appointmentsCompleted: 156,
            revenue: 38500.00,
            rating: 4.8
          }
        ],
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          type: 'monthly'
        }
      };

      mockContext.prisma.appointment.count.mockResolvedValue(5680);
      mockContext.prisma.appointment.findMany.mockResolvedValue([]);
      mockContext.prisma.professional.findMany.mockResolvedValue(mockStatistics.professionals);

      const result = await caller.api.clinic.getStatistics({ 
        clinicId, 
        period,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          overview: expect.objectContaining({
            totalProfessionals: expect.any(Number),
            totalPatients: expect.any(Number),
            totalAppointments: expect.any(Number)
          }),
          revenue: expect.objectContaining({
            totalRevenue: expect.any(Number),
            averageTicket: expect.any(Number)
          }),
          appointments: expect.objectContaining({
            noShowRate: expect.any(Number),
            cancellationRate: expect.any(Number)
          }),
          period: expect.objectContaining({
            type: 'monthly'
          })
        })
      });
    });
  });

  describe('Clinic Configuration Contract', () => {
    it('should validate clinic configuration updates', async () => {
      const configInput: ClinicInput['updateConfiguration'] = {
        clinicId: 'clinic-789',
        configuration: {
          appointmentDuration: 75,
          maxAdvanceBookingDays: 60,
          cancellationPolicy: '48h',
          paymentMethods: ['credit_card', 'debit_card', 'pix'],
          autoConfirmAppointments: true,
          reminderSettings: {
            email: {
              enabled: true,
              hoursBeforeAppointment: 24
            },
            sms: {
              enabled: true,
              hoursBeforeAppointment: 2
            },
            whatsapp: {
              enabled: false
            }
          },
          workflowAutomation: {
            patientFollowUp: true,
            appointmentConfirmation: true,
            noShowHandling: 'automatic_reschedule'
          }
        }
      };

      const updatedConfig = {
        clinicId: 'clinic-789',
        ...configInput.configuration,
        updatedAt: new Date(),
        updatedBy: mockContext.user.id
      };

      mockContext.prisma.clinic.update.mockResolvedValue({
        id: 'clinic-789',
        configuration: updatedConfig
      });

      const result = await caller.api.clinic.updateConfiguration(configInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          appointmentDuration: 75,
          maxAdvanceBookingDays: 60,
          reminderSettings: expect.objectContaining({
            email: expect.objectContaining({
              enabled: true,
              hoursBeforeAppointment: 24
            })
          })
        })
      });
    });

    it('should validate configuration constraints', async () => {
      const invalidConfig: ClinicInput['updateConfiguration'] = {
        clinicId: 'clinic-789',
        configuration: {
          appointmentDuration: 15, // Too short
          maxAdvanceBookingDays: 365 // Too long
        }
      };

      await expect(caller.api.clinic.updateConfiguration(invalidConfig))
        .rejects.toThrow('Invalid configuration: appointment duration must be at least 30 minutes');
    });
  });

  describe('Clinic List Contract', () => {
    it('should validate clinic listing with filters', async () => {
      const listInput: ClinicInput['list'] = {
        page: 1,
        limit: 10,
        filters: {
          state: 'SP',
          specializations: ['aesthetic_medicine'],
          isActive: true
        },
        orderBy: 'name',
        orderDirection: 'asc'
      };

      const mockClinics = [
        {
          id: 'clinic-1',
          name: 'Clínica A',
          city: 'São Paulo',
          state: 'SP',
          specializations: ['aesthetic_medicine'],
          isActive: true
        },
        {
          id: 'clinic-2',
          name: 'Clínica B',
          city: 'Santos',
          state: 'SP',
          specializations: ['aesthetic_medicine', 'dermatology'],
          isActive: true
        }
      ];

      mockContext.prisma.clinic.findMany.mockResolvedValue(mockClinics);
      mockContext.prisma.clinic.count.mockResolvedValue(25);

      const result = await caller.api.clinic.list(listInput);

      expect(result).toMatchObject({
        success: true,
        data: {
          clinics: expect.arrayContaining([
            expect.objectContaining({
              id: 'clinic-1',
              name: 'Clínica A',
              specializations: expect.arrayContaining(['aesthetic_medicine'])
            })
          ]),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          },
          filters: expect.objectContaining({
            state: 'SP',
            specializations: ['aesthetic_medicine']
          })
        }
      });
    });
  });

  describe('Contract Type Safety', () => {
    it('should enforce input type constraints at compile time', () => {
      const validInput: ClinicInput['create'] = {
        basicInfo: {
          name: 'Test Clinic',
          cnpj: '12.345.678/0001-90',
          email: 'test@clinic.com',
          phone: '+5511999888777'
        },
        address: {
          street: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        businessInfo: {
          anvisaRegistration: 'ANVISA-REG-2024-001',
          specializations: ['aesthetic_medicine']
        }
      };

      expect(validInput).toBeDefined();
    });

    it('should enforce output type constraints', () => {
      const mockOutput: ClinicOutput['getById'] = {
        success: true,
        data: {
          id: 'clinic-789',
          name: 'Clínica Estética NeonPro',
          cnpj: '12.345.678/0001-90',
          email: 'contato@neonpro.com',
          specializations: ['aesthetic_medicine'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      expect(mockOutput).toBeDefined();
      expect(mockOutput.success).toBe(true);
      expect(mockOutput.data.name).toBe('Clínica Estética NeonPro');
    });
  });
});