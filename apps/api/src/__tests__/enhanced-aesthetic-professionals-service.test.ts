/**
 * Enhanced Aesthetic Professionals Service Tests
 *
 * Comprehensive test suite for the enhanced aesthetic professionals service
 * Following RED-GREEN methodology and TDD principles
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { EnhancedAestheticProfessionalsService } from '../services/enhanced-aesthetic-professionals-service'

// Mock dependencies
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
      })),
      in: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
      })),
      ilike: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
}

const mockAuditLogger = {
  logSecurityEvent: vi.fn(),
  logError: vi.fn(),
  log: vi.fn(),
}

vi.mock('../clients/supabase', () => ({
  createAdminClient: () => mockSupabase,
}))

vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('EnhancedAestheticProfessionalsService', () => {
  let service: EnhancedAestheticProfessionalsService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new EnhancedAestheticProfessionalsService()
  })

  describe('Professional Management', () => {
    it('should create a new aesthetic professional with validation', async () => {
      const professionalData = {
        name: 'Dr. João Silva',
        email: 'joao.silva@exemplo.com',
        phone: '(11) 99999-9999',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        subspecialties: ['Botox', 'Preenchimento Facial'],
        clinicId: 'clinic-123',
        anvisaCertifications: ['CERT-001'],
        telemedicineAuthorized: true,
      }

      const mockCreated = {
        id: 'prof-123',
        ...professionalData,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockCreated,
        error: null,
      })

      const result = await service.createProfessional(professionalData)

      expect(result).toEqual(mockCreated)
      expect(mockSupabase.from).toHaveBeenCalledWith('professionals')
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'professional_created',
        professionalId: 'prof-123',
        council: 'CFM',
        councilNumber: '123456',
        timestamp: expect.any(String),
      })
    })

    it('should validate required fields for professional creation', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        council: 'INVALID',
        councilNumber: '',
      }

      await expect(service.createProfessional(invalidData as any)).rejects.toThrow()
    })

    it('should get professional by ID with proper validation', async () => {
      const mockProfessional = {
        id: 'prof-123',
        name: 'Dr. João Silva',
        email: 'joao.silva@exemplo.com',
        council: 'CFM',
        councilNumber: '123456',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProfessional,
        error: null,
      })

      const result = await service.getProfessionalById('prof-123')

      expect(result).toEqual(mockProfessional)
      expect(mockSupabase.from).toHaveBeenCalledWith('professionals')
    })

    it('should return null for non-existent professional', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const result = await service.getProfessionalById('non-existent')

      expect(result).toBeNull()
    })

    it('should list professionals with pagination and filtering', async () => {
      const mockProfessionals = [
        {
          id: 'prof-1',
          name: 'Dr. João Silva',
          specialty: 'Dermatologia Estética',
          active: true,
        },
        {
          id: 'prof-2',
          name: 'Dra. Maria Santos',
          specialty: 'Cosmiatria',
          active: true,
        },
      ]

      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: mockProfessionals,
        error: null,
      })

      const result = await service.listProfessionals({
        clinicId: 'clinic-123',
        limit: 10,
        offset: 0,
        specialty: 'Dermatologia Estética',
      })

      expect(result.data).toEqual(mockProfessionals)
      expect(result.total).toBe(2)
    })

    it('should update professional information with validation', async () => {
      const updateData = {
        specialty: 'Dermatologia Clínica',
        subspecialties: ['Botox', 'Laser'],
        telemedicineAuthorized: true,
      }

      const mockUpdated = {
        id: 'prof-123',
        name: 'Dr. João Silva',
        email: 'joao.silva@exemplo.com',
        specialty: 'Dermatologia Clínica',
        subspecialties: ['Botox', 'Laser'],
        telemedicineAuthorized: true,
        updatedAt: new Date().toISOString(),
      }

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await service.updateProfessional('prof-123', updateData)

      expect(result).toEqual(mockUpdated)
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'professional_updated',
        professionalId: 'prof-123',
        updateFields: Object.keys(updateData),
        timestamp: expect.any(String),
      })
    })

    it('should deactivate professional instead of deleting', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          id: 'prof-123',
          active: false,
          updatedAt: new Date().toISOString(),
        },
        error: null,
      })

      const result = await service.deactivateProfessional('prof-123')

      expect(result).toBe(true)
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'professional_deactivated',
        professionalId: 'prof-123',
        timestamp: expect.any(String),
      })
    })
  })

  describe('Council Validation', () => {
    it('should validate CFM council registration', async () => {
      const validationResult = await service.validateCouncilRegistration({
        council: 'CFM',
        councilNumber: '123456',
        state: 'SP',
        professionalName: 'Dr. João Silva',
      })

      expect(validationResult).toMatchObject({
        council: 'CFM',
        councilNumber: '123456',
        state: 'SP',
        valid: expect.any(Boolean),
        lastChecked: expect.any(String),
      })
    })

    it('should validate COREN council registration', async () => {
      const validationResult = await service.validateCouncilRegistration({
        council: 'COREN',
        councilNumber: '789012',
        state: 'RJ',
        professionalName: 'Enfermeira Maria Santos',
      })

      expect(validationResult).toMatchObject({
        council: 'COREN',
        councilNumber: '789012',
        state: 'RJ',
        valid: expect.any(Boolean),
        lastChecked: expect.any(String),
      })
    })

    it('should validate all supported council types', async () => {
      const councils = ['CFM', 'COREN', 'CFF', 'CNEP']

      for (const council of councils) {
        const validationResult = await service.validateCouncilRegistration({
          council,
          councilNumber: '123456',
          state: 'SP',
          professionalName: 'Professional Test',
        })

        expect(validationResult.council).toBe(council)
        expect(typeof validationResult.valid).toBe('boolean')
      }
    })

    it('should reject invalid council types', async () => {
      await expect(service.validateCouncilRegistration({
        council: 'INVALID' as any,
        councilNumber: '123456',
        state: 'SP',
        professionalName: 'Professional Test',
      })).rejects.toThrow('Invalid council type')
    })
  })

  describe('ANVISA Compliance', () => {
    it('should verify ANVISA certification', async () => {
      const certificationData = {
        certificationNumber: 'CERT-001',
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2025-12-31'),
        anvisaRegistration: 'REG-123456',
        professionalId: 'prof-123',
      }

      const result = await service.verifyAnvisaCertification(certificationData)

      expect(result).toMatchObject({
        certificationNumber: 'CERT-001',
        anvisaRegistration: 'REG-123456',
        valid: expect.any(Boolean),
        checkedAt: expect.any(String),
      })
    })

    it('should detect expired certifications', async () => {
      const expiredCertification = {
        certificationNumber: 'CERT-EXPIRED',
        issueDate: new Date('2020-01-01'),
        expiryDate: new Date('2022-12-31'),
        anvisaRegistration: 'REG-123456',
        professionalId: 'prof-123',
      }

      const result = await service.verifyAnvisaCertification(expiredCertification)

      expect(result.valid).toBe(false)
      expect(result.expiryStatus).toBe('expired')
    })

    it('should validate required ANVISA fields', async () => {
      const invalidCertification = {
        certificationNumber: '',
        issueDate: new Date(),
        expiryDate: new Date(),
        anvisaRegistration: '',
        professionalId: 'prof-123',
      }

      await expect(service.verifyAnvisaCertification(invalidCertification)).rejects.toThrow()
    })
  })

  describe('Specialty Validation', () => {
    it('should validate aesthetic medicine specialties', async () => {
      const specialties = [
        'Dermatologia Estética',
        'Cosmiatria',
        'Medicina Estética',
        'Cirurgia Plástica',
      ]

      for (const specialty of specialties) {
        const result = await service.validateSpecialty(specialty)
        expect(result.valid).toBe(true)
        expect(result.category).toBeDefined()
      }
    })

    it('should reject invalid specialties', async () => {
      const invalidSpecialties = [
        'Cardiologia',
        'Ortopedia',
        'Pediatria',
        '',
      ]

      for (const specialty of invalidSpecialties) {
        const result = await service.validateSpecialty(specialty)
        expect(result.valid).toBe(false)
      }
    })

    it('should validate subspecialties', async () => {
      const subspecialties = [
        'Botox',
        'Preenchimento Facial',
        'Laser',
        'Peeling Químico',
        'Fios de Sustentação',
      ]

      for (const subspecialty of subspecialties) {
        const result = await service.validateSubspecialty(subspecialty)
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('Search and Filtering', () => {
    it('should search professionals by name', async () => {
      const mockResults = [
        {
          id: 'prof-1',
          name: 'Dr. João Silva',
          specialty: 'Dermatologia Estética',
        },
      ]

      mockSupabase.from().select().ilike().order().range.mockResolvedValue({
        data: mockResults,
        error: null,
      })

      const results = await service.searchProfessionals('João')

      expect(results).toEqual(mockResults)
      expect(mockSupabase.from).toHaveBeenCalledWith('professionals')
    })

    it('should filter professionals by specialty', async () => {
      const mockResults = [
        {
          id: 'prof-1',
          name: 'Dr. João Silva',
          specialty: 'Dermatologia Estética',
        },
      ]

      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: mockResults,
        error: null,
      })

      const results = await service.getProfessionalsBySpecialty('Dermatologia Estética')

      expect(results).toEqual(mockResults)
    })

    it('should filter professionals by council', async () => {
      const mockResults = [
        {
          id: 'prof-1',
          name: 'Dr. João Silva',
          council: 'CFM',
        },
      ]

      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: mockResults,
        error: null,
      })

      const results = await service.getProfessionalsByCouncil('CFM')

      expect(results).toEqual(mockResults)
    })
  })

  describe('Clinic Association', () => {
    it('should associate professional with clinic', async () => {
      const associationData = {
        professionalId: 'prof-123',
        clinicId: 'clinic-456',
        role: 'primary',
        permissions: ['consultation', 'procedures'],
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'assoc-123',
          ...associationData,
          active: true,
          createdAt: new Date().toISOString(),
        },
        error: null,
      })

      const result = await service.associateWithClinic(associationData)

      expect(result).toMatchObject({
        professionalId: 'prof-123',
        clinicId: 'clinic-456',
        role: 'primary',
      })

      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'professional_clinic_association_created',
        professionalId: 'prof-123',
        clinicId: 'clinic-456',
        timestamp: expect.any(String),
      })
    })

    it('should get clinics for professional', async () => {
      const mockClinics = [
        {
          id: 'clinic-1',
          name: 'Clínica Estética A',
          address: 'Rua A, 123',
        },
        {
          id: 'clinic-2',
          name: 'Clínica Estética B',
          address: 'Rua B, 456',
        },
      ]

      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockClinics,
        error: null,
      })

      const result = await service.getProfessionalClinics('prof-123')

      expect(result).toEqual(mockClinics)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      await expect(service.createProfessional({
        name: 'Dr. Test',
        email: 'test@example.com',
        phone: '(11) 99999-9999',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        clinicId: 'clinic-123',
      })).rejects.toThrow('Database connection failed')
    })

    it('should validate email format', async () => {
      const invalidEmailData = {
        name: 'Dr. Test',
        email: 'invalid-email',
        phone: '(11) 99999-9999',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        clinicId: 'clinic-123',
      }

      await expect(service.createProfessional(invalidEmailData)).rejects.toThrow()
    })

    it('should validate phone format', async () => {
      const invalidPhoneData = {
        name: 'Dr. Test',
        email: 'test@example.com',
        phone: 'invalid-phone',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        clinicId: 'clinic-123',
      }

      await expect(service.createProfessional(invalidPhoneData)).rejects.toThrow()
    })
  })

  describe('Performance and Security', () => {
    it('should log security events for sensitive operations', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'prof-123',
          name: 'Dr. Test',
          email: 'test@example.com',
          council: 'CFM',
          councilNumber: '123456',
        },
        error: null,
      })

      await service.createProfessional({
        name: 'Dr. Test',
        email: 'test@example.com',
        phone: '(11) 99999-9999',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        clinicId: 'clinic-123',
      })

      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'professional_created',
        professionalId: 'prof-123',
        council: 'CFM',
        councilNumber: '123456',
        timestamp: expect.any(String),
      })
    })

    it('should validate input data for security', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        phone: '(11) 99999-9999',
        council: 'CFM',
        councilNumber: '123456',
        specialty: 'Dermatologia Estética',
        clinicId: 'clinic-123',
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'prof-123',
          name: 'alert("xss")', // Should be sanitized
          email: 'test@example.com',
          council: 'CFM',
          councilNumber: '123456',
        },
        error: null,
      })

      const result = await service.createProfessional(maliciousData)

      expect(result.name).not.toContain('<script>')
    })
  })
})
