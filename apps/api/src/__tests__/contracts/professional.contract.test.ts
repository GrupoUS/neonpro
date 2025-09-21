import { appRouter } from '@/trpc/router';
import type { AppRouter } from '@/trpc/router';
import type { ProfessionalInput, ProfessionalOutput } from '@/types/api/contracts';
import { createTRPCMsw } from 'msw-trpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Professional Contract Tests
 * Tests the tRPC Professional API endpoints contract compliance
 * Ensures type safety, input validation, and output conformity
 */

describe(_'Professional Contract Testing',_() => {
  const mockContext = {
    user: { id: 'user-123', _role: 'admin' },
    auth: { _userId: 'user-123', isAuthenticated: true },
    prisma: {
      professional: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      clinic: {
        findUnique: vi.fn(),
      },
      professionalQualification: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    crm: {
      validateLicense: vi.fn(),
      checkStatus: vi.fn(),
      getSpecializations: vi.fn(),
    },
    audit: {
      logProfessionalAction: vi.fn(),
      createAuditRecord: vi.fn(),
    },
    compliance: {
      validateCFMCompliance: vi.fn(),
      checkProfessionalCredentials: vi.fn(),
    },
  };

  const _trpcMsw = createTRPCMsw<AppRouter>();
  const caller = appRouter.createCaller(mockContext);

  beforeEach(_() => {
    vi.clearAllMocks();
  });

  describe(_'Professional Creation Contract',_() => {
    it(_'should validate professional creation input and output',_async () => {
      const createInput: ProfessionalInput['create'] = {
        personalInfo: {
          fullName: 'Dr. Maria Silva',
          cpf: '123.456.789-00',
          email: 'maria@clinic.com',
          phone: '+5511999888777',
          dateOfBirth: '1985-03-15',
        },
        professionalInfo: {
          crmNumber: 'CRM/SP 123456',
          crmState: 'SP',
          specializations: ['dermatology', 'aesthetic_medicine'],
          licenseNumber: 'LICENSE-123456',
          licenseExpiryDate: '2025-12-31',
        },
        clinicId: 'clinic-456',
        _role: 'doctor',
        permissions: [
          'view_patients',
          'create_appointments',
          'prescribe_treatments',
        ],
      };

      const mockProfessional = {
        id: 'prof-789',
        fullName: 'Dr. Maria Silva',
        cpf: '123.456.789-00',
        email: 'maria@clinic.com',
        crmNumber: 'CRM/SP 123456',
        crmState: 'SP',
        specializations: ['dermatology', 'aesthetic_medicine'],
        clinicId: 'clinic-456',
        _role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.crm.validateLicense.mockResolvedValue({
        valid: true,
        status: 'active',
      });
      mockContext.prisma.clinic.findUnique.mockResolvedValue({
        id: 'clinic-456',
        name: 'Test Clinic',
      });
      mockContext.prisma.professional.create.mockResolvedValue(
        mockProfessional,
      );

      const result = await caller.api.professional.create(createInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'prof-789',
          fullName: 'Dr. Maria Silva',
          crmNumber: 'CRM/SP 123456',
          specializations: ['dermatology', 'aesthetic_medicine'],
        }),
      });

      // Verify CRM validation was called
      expect(mockContext.crm.validateLicense).toHaveBeenCalledWith({
        crmNumber: 'CRM/SP 123456',
        crmState: 'SP',
      });

      // Verify audit logging
      expect(mockContext.audit.logProfessionalAction).toHaveBeenCalledWith({
        action: 'create',
        professionalId: 'prof-789',
        _userId: mockContext.user.id,
        timestamp: expect.any(Date),
      });
    });

    it(_'should reject invalid CRM number',_async () => {
      const invalidInput: ProfessionalInput['create'] = {
        personalInfo: {
          fullName: 'Dr. Invalid',
          cpf: '123.456.789-00',
          email: 'invalid@clinic.com',
          phone: '+5511999888777',
          dateOfBirth: '1985-03-15',
        },
        professionalInfo: {
          crmNumber: 'INVALID-CRM',
          crmState: 'SP',
          specializations: ['dermatology'],
          licenseNumber: 'LICENSE-123',
          licenseExpiryDate: '2025-12-31',
        },
        clinicId: 'clinic-456',
        _role: 'doctor',
      };

      mockContext.crm.validateLicense.mockResolvedValue({
        valid: false,
        error: 'Invalid CRM format',
      });

      await expect(
        caller.api.professional.create(invalidInput),
      ).rejects.toThrow('Invalid CRM number: Invalid CRM format');
    });

    it(_'should enforce CFM compliance requirements',_async () => {
      const nonCompliantInput: ProfessionalInput['create'] = {
        personalInfo: {
          fullName: 'Dr. Non Compliant',
          cpf: '123.456.789-00',
          email: 'noncompliant@clinic.com',
          phone: '+5511999888777',
          dateOfBirth: '1985-03-15',
        },
        professionalInfo: {
          crmNumber: 'CRM/SP 123456',
          crmState: 'SP',
          specializations: ['surgery'], // Requires additional qualifications
          licenseNumber: 'LICENSE-123',
          licenseExpiryDate: '2025-12-31',
        },
        clinicId: 'clinic-456',
        _role: 'doctor',
      };

      mockContext.crm.validateLicense.mockResolvedValue({
        valid: true,
        status: 'active',
      });
      mockContext.compliance.validateCFMCompliance.mockResolvedValue({
        compliant: false,
        missingRequirements: ['surgical_qualification'],
      });

      await expect(
        caller.api.professional.create(nonCompliantInput),
      ).rejects.toThrow('CFM compliance requirements not met');
    });
  });

  describe(_'Professional Retrieval Contract',_() => {
    it(_'should validate professional retrieval by ID',_async () => {
      const professionalId = 'prof-789';
      const mockProfessional = {
        id: professionalId,
        fullName: 'Dr. Maria Silva',
        email: 'maria@clinic.com',
        crmNumber: 'CRM/SP 123456',
        crmState: 'SP',
        specializations: ['dermatology', 'aesthetic_medicine'],
        clinicId: 'clinic-456',
        _role: 'doctor',
        isActive: true,
        schedule: {
          workingHours: {
            monday: { start: '08:00', end: '18:00' },
            tuesday: { start: '08:00', end: '18:00' },
          },
          lunchBreak: { start: '12:00', end: '13:00' },
        },
        qualifications: [
          {
            id: 'qual-1',
            name: 'Dermatology Certification',
            issuedBy: 'SBD',
            expiryDate: '2025-12-31',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.prisma.professional.findUnique.mockResolvedValue(
        mockProfessional,
      );

      const result = await caller.api.professional.getById({
        id: professionalId,
      });

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: professionalId,
          fullName: 'Dr. Maria Silva',
          crmNumber: 'CRM/SP 123456',
          specializations: expect.arrayContaining(['dermatology']),
          schedule: expect.objectContaining({
            workingHours: expect.any(Object),
          }),
          qualifications: expect.arrayContaining([
            expect.objectContaining({
              name: 'Dermatology Certification',
            }),
          ]),
        }),
      });
    });

    it(_'should handle professional not found',_async () => {
      const professionalId = 'nonexistent-prof';

      mockContext.prisma.professional.findUnique.mockResolvedValue(null);

      await expect(
        caller.api.professional.getById({ id: professionalId }),
      ).rejects.toThrow('Professional not found');
    });
  });

  describe(_'Professional Update Contract',_() => {
    it(_'should validate professional information updates',_async () => {
      const professionalId = 'prof-789';
      const updateInput: ProfessionalInput['update'] = {
        id: professionalId,
        personalInfo: {
          phone: '+5511888777666',
          email: 'maria.new@clinic.com',
        },
        professionalInfo: {
          specializations: [
            'dermatology',
            'aesthetic_medicine',
            'laser_therapy',
          ],
        },
        schedule: {
          workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
          },
          lunchBreak: { start: '12:30', end: '13:30' },
        },
      };

      const existingProfessional = {
        id: professionalId,
        fullName: 'Dr. Maria Silva',
        crmNumber: 'CRM/SP 123456',
        isActive: true,
      };

      const updatedProfessional = {
        ...existingProfessional,
        phone: '+5511888777666',
        email: 'maria.new@clinic.com',
        specializations: ['dermatology', 'aesthetic_medicine', 'laser_therapy'],
        updatedAt: new Date(),
      };

      mockContext.prisma.professional.findUnique.mockResolvedValue(
        existingProfessional,
      );
      mockContext.prisma.professional.update.mockResolvedValue(
        updatedProfessional,
      );

      const result = await caller.api.professional.update(updateInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: professionalId,
          phone: '+5511888777666',
          email: 'maria.new@clinic.com',
          specializations: expect.arrayContaining(['laser_therapy']),
        }),
      });

      // Verify audit logging for update
      expect(mockContext.audit.logProfessionalAction).toHaveBeenCalledWith({
        action: 'update',
        professionalId,
        _userId: mockContext.user.id,
        changes: expect.objectContaining({
          phone: '+5511888777666',
          email: 'maria.new@clinic.com',
        }),
        timestamp: expect.any(Date),
      });
    });

    it(_'should prevent unauthorized updates to critical fields',_async () => {
      const professionalId = 'prof-789';
      const unauthorizedUpdate: ProfessionalInput['update'] = {
        id: professionalId,
        professionalInfo: {
          crmNumber: 'CRM/SP 999999', // Changing CRM should require special authorization
          crmState: 'RJ',
        },
      };

      const existingProfessional = {
        id: professionalId,
        crmNumber: 'CRM/SP 123456',
        crmState: 'SP',
      };

      mockContext.prisma.professional.findUnique.mockResolvedValue(
        existingProfessional,
      );

      await expect(
        caller.api.professional.update(unauthorizedUpdate),
      ).rejects.toThrow('Unauthorized to modify CRM information');
    });
  });

  describe(_'Professional Schedule Management Contract',_() => {
    it(_'should validate schedule updates',_async () => {
      const scheduleInput: ProfessionalInput['updateSchedule'] = {
        professionalId: 'prof-789',
        schedule: {
          workingHours: {
            monday: { start: '08:00', end: '17:00' },
            tuesday: { start: '08:00', end: '17:00' },
            wednesday: { start: '08:00', end: '17:00' },
            thursday: { start: '08:00', end: '17:00' },
            friday: { start: '08:00', end: '16:00' },
          },
          lunchBreak: { start: '12:00', end: '13:00' },
          breaks: [
            { start: '10:00', end: '10:15', name: 'Morning break' },
            { start: '15:00', end: '15:15', name: 'Afternoon break' },
          ],
        },
        effectiveFrom: '2024-03-01',
      };

      const updatedProfessional = {
        id: 'prof-789',
        schedule: scheduleInput.schedule,
        scheduleUpdatedAt: new Date(),
        scheduleEffectiveFrom: new Date('2024-03-01'),
      };

      mockContext.prisma.professional.update.mockResolvedValue(
        updatedProfessional,
      );

      const result = await caller.api.professional.updateSchedule(scheduleInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          schedule: expect.objectContaining({
            workingHours: expect.objectContaining({
              monday: { start: '08:00', end: '17:00' },
            }),
            lunchBreak: { start: '12:00', end: '13:00' },
          }),
        }),
      });
    });

    it(_'should validate schedule conflicts',_async () => {
      const conflictingSchedule: ProfessionalInput['updateSchedule'] = {
        professionalId: 'prof-789',
        schedule: {
          workingHours: {
            monday: { start: '14:00', end: '12:00' }, // Invalid: end before start
          },
        },
      };

      await expect(
        caller.api.professional.updateSchedule(conflictingSchedule),
      ).rejects.toThrow('Invalid schedule: end time must be after start time');
    });
  });

  describe(_'Professional List Contract',_() => {
    it(_'should validate professional listing with filters',_async () => {
      const listInput: ProfessionalInput['list'] = {
        page: 1,
        limit: 10,
        filters: {
          clinicId: 'clinic-456',
          specializations: ['dermatology'],
          isActive: true,
          _role: 'doctor',
        },
        orderBy: 'fullName',
        orderDirection: 'asc',
      };

      const mockProfessionals = [
        {
          id: 'prof-1',
          fullName: 'Dr. Ana Costa',
          crmNumber: 'CRM/SP 111111',
          specializations: ['dermatology'],
          isActive: true,
          _role: 'doctor',
        },
        {
          id: 'prof-2',
          fullName: 'Dr. Bruno Silva',
          crmNumber: 'CRM/SP 222222',
          specializations: ['dermatology', 'aesthetic_medicine'],
          isActive: true,
          _role: 'doctor',
        },
      ];

      mockContext.prisma.professional.findMany.mockResolvedValue(
        mockProfessionals,
      );
      mockContext.prisma.professional.count.mockResolvedValue(25);

      const result = await caller.api.professional.list(listInput);

      expect(result).toMatchObject({
        success: true,
        data: {
          professionals: expect.arrayContaining([
            expect.objectContaining({
              id: 'prof-1',
              fullName: 'Dr. Ana Costa',
              specializations: expect.arrayContaining(['dermatology']),
            }),
          ]),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
          filters: expect.objectContaining({
            clinicId: 'clinic-456',
            specializations: ['dermatology'],
          }),
        },
      });
    });
  });

  describe(_'Professional Qualification Management Contract',_() => {
    it(_'should validate qualification addition',_async () => {
      const qualificationInput: ProfessionalInput['addQualification'] = {
        professionalId: 'prof-789',
        qualification: {
          name: 'Advanced Laser Therapy Certification',
          issuedBy: 'International Laser Institute',
          issueDate: '2024-01-15',
          expiryDate: '2027-01-15',
          certificateNumber: 'CERT-2024-ALT-001',
          credentialUrl: 'https://certificates.laser-institute.com/ALT-001',
        },
      };

      const newQualification = {
        id: 'qual-new',
        professionalId: 'prof-789',
        ...qualificationInput.qualification,
        createdAt: new Date(),
      };

      mockContext.prisma.professionalQualification.create.mockResolvedValue(
        newQualification,
      );

      const result = await caller.api.professional.addQualification(qualificationInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'qual-new',
          name: 'Advanced Laser Therapy Certification',
          certificateNumber: 'CERT-2024-ALT-001',
        }),
      });
    });

    it(_'should validate qualification expiry monitoring',_async () => {
      const professionalId = 'prof-789';
      const mockExpiringQualifications = [
        {
          id: 'qual-expiring',
          name: 'Basic Certification',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          daysUntilExpiry: 30,
        },
      ];

      mockContext.prisma.professionalQualification.findMany.mockResolvedValue(
        mockExpiringQualifications,
      );

      const result = await caller.api.professional.getExpiringQualifications({
        professionalId,
      });

      expect(result).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'qual-expiring',
            daysUntilExpiry: 30,
          }),
        ]),
      });
    });
  });

  describe(_'Contract Type Safety',_() => {
    it(_'should enforce input type constraints at compile time',_() => {
      const validInput: ProfessionalInput['create'] = {
        personalInfo: {
          fullName: 'Dr. Test',
          cpf: '123.456.789-00',
          email: 'test@clinic.com',
          phone: '+5511999888777',
          dateOfBirth: '1985-03-15',
        },
        professionalInfo: {
          crmNumber: 'CRM/SP 123456',
          crmState: 'SP',
          specializations: ['dermatology'],
          licenseNumber: 'LICENSE-123',
          licenseExpiryDate: '2025-12-31',
        },
        clinicId: 'clinic-456',
        _role: 'doctor',
      };

      expect(validInput).toBeDefined();
    });

    it(_'should enforce output type constraints',_() => {
      const mockOutput: ProfessionalOutput['getById'] = {
        success: true,
        data: {
          id: 'prof-789',
          fullName: 'Dr. Maria Silva',
          email: 'maria@clinic.com',
          crmNumber: 'CRM/SP 123456',
          crmState: 'SP',
          specializations: ['dermatology'],
          clinicId: 'clinic-456',
          _role: 'doctor',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(mockOutput).toBeDefined();
      expect(mockOutput.success).toBe(true);
      expect(mockOutput.data.crmNumber).toBe('CRM/SP 123456');
    });
  });
});
