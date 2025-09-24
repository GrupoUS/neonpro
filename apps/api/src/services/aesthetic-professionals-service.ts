/**
 * Aesthetic Professionals Service for Brazilian Aesthetic Clinics
 * 
 * Comprehensive service for managing all aesthetic health professionals including:
 * - Doctors (CFM - Conselho Federal de Medicina)
 * - Nurses (COREN - Conselho Regional de Enfermagem)  
 * - Pharmacists (CFF - Conselho Federal de Farmácia)
 * - Physiotherapists (CREFITO - Conselho Regional de Fisioterapia e Terapia Ocupacional)
 * - Biomedical professionals (CRBM - Conselho Regional de Biomedicina)
 * - Beauty professionals (CNEP - Conselho Nacional de Estética Profissional)
 * 
 * Features:
 * - Multi-council license validation
 * - Aesthetic procedure certification tracking
 * - Professional availability management
 * - Compliance monitoring
 * - Service type associations
 */

import { z } from 'zod';
import { createAdminClient } from '../clients/supabase';
import { logger } from '../lib/logger';

// Brazilian Professional Council Types
export const PROFESSIONAL_COUNCILS = {
  CFM: 'cfm',        // Conselho Federal de Medicina (Doctors)
  COREN: 'coren',    // Conselho Regional de Enfermagem (Nurses)
  CFF: 'cff',        // Conselho Federal de Farmácia (Pharmacists)
  CREFITO: 'crefito', // Conselho Regional de Fisioterapia e Terapia Ocupacional (Physiotherapists)
  CRBM: 'crbm',      // Conselho Regional de Biomedicina (Biomedical)
  CNEP: 'cnep',      // Conselho Nacional de Estética Profissional (Beauty Professionals)
} as const;

export type ProfessionalCouncil = keyof typeof PROFESSIONAL_COUNCILS;

// Aesthetic Specialization Categories
export const AESTHETIC_SPECIALIZATIONS = {
  // Injectable Procedures
  BOTOX: 'botox',
  DERMAL_FILLERS: 'dermal_fillers',
  BIOSTIMULATORS: 'biostimulators',
  THREAD_LIFTING: 'thread_lifting',
  
  // Laser & Light Therapies
  LASER_TREATMENTS: 'laser_treatments',
  IPL_THERAPIES: 'ipl_therapies',
  PHOTOREJUVENATION: 'photorejuvenation',
  
  // Facial Treatments
  CHEMICAL_PEELS: 'chemical_peels',
  MICRONEEDLING: 'microneedling',
  FACIAL_TREATMENTS: 'facial_treatments',
  SKIN_ANALYSIS: 'skin_analysis',
  
  // Body Treatments
  BODY_CONTOURING: 'body_contouring',
  CRYOLIPOLYSIS: 'cryolipolysis',
  RADIOFREQUENCY: 'radiofrequency',
  ULTRASOUND_THERAPY: 'ultrasound_therapy',
  
  // Advanced Procedures
  MESOTHERAPY: 'mesotherapy',
  PRP_THERAPY: 'prp_therapy',
  SCAR_TREATMENT: 'scar_treatment',
} as const;

export type AestheticSpecialization = keyof typeof AESTHETIC_SPECIALIZATIONS;

// License Validation Status
export const LICENSE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  INVALID: 'invalid',
} as const;

export type LicenseStatus = keyof typeof LICENSE_STATUS;

// Service Interfaces
export interface AestheticProfessional {
  id: string;
  clinicId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  councilType: ProfessionalCouncil;
  councilLicense: string;
  councilState: string;
  councilValidation: LicenseStatus;
  licenseExpiryDate?: Date;
  specializations: AestheticSpecialization[];
  certificationLevels: Record<string, {
    level: number;
    obtainedAt: Date;
    expiresAt?: Date;
    certificateUrl?: string;
  }>;
  preferredProcedures: string[];
  maxDailyAppointments: number;
  appointmentBuffer: number;
  workingHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }>;
  availability: {
    canWorkWeekends: boolean;
    defaultStartTime: string;
    defaultEndTime: string;
    defaultBreakStart?: string;
    defaultBreakEnd?: string;
  };
  isActive: boolean;
  canPrescribe: boolean;
  emergencyContact: boolean;
  serviceTypeIds: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfessionalInput {
  clinicId: string;
  fullName: string;
  email: string;
  phone: string;
  councilType: ProfessionalCouncil;
  councilLicense: string;
  councilState: string;
  specializations: AestheticSpecialization[];
  preferredProcedures?: string[];
  maxDailyAppointments?: number;
  appointmentBuffer?: number;
  canPrescribe?: boolean;
  emergencyContact?: boolean;
  color?: string;
}

export interface UpdateProfessionalInput extends Partial<CreateProfessionalInput> {
  id: string;
}

export interface LicenseValidationResult {
  isValid: boolean;
  status: LicenseStatus;
  message: string;
  expiryDate?: Date;
  lastVerified: Date;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Validation Schemas
const CreateProfessionalSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Invalid phone format'),
  councilType: z.enum(Object.values(PROFESSIONAL_COUNCILS) as [string, ...string[]]),
  councilLicense: z.string().min(4, 'License number is required'),
  councilState: z.string().length(2, 'State must be 2 characters'),
  specializations: z.array(z.enum(Object.values(AESTHETIC_SPECIALIZATIONS) as [string, ...string[]]))
    .min(1, 'At least one specialization is required'),
  preferredProcedures: z.array(z.string()).optional(),
  maxDailyAppointments: z.number().min(1).max(50).optional(),
  appointmentBuffer: z.number().min(0).max(120).optional(),
  canPrescribe: z.boolean().optional(),
  emergencyContact: z.boolean().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

class AestheticProfessionalsService {
  private supabase = createAdminClient();

  /**
   * Create a new aesthetic professional
   */
  async createProfessional(input: CreateProfessionalInput): Promise<ServiceResponse<AestheticProfessional>> {
    try {
      // Validate input
      const validated = CreateProfessionalSchema.parse(input);
      
      // Check for duplicate license
      const { data: existingProfessional } = await this.supabase
        .from('professionals')
        .select('id')
        .eq('council_license', validated.councilLicense)
        .eq('council_type', validated.councilType)
        .single();

      if (existingProfessional) {
        return {
          success: false,
          error: 'Professional with this council license already exists',
        };
      }

      // Create professional record
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .insert({
          clinic_id: validated.clinicId,
          full_name: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          council_type: validated.councilType,
          council_license: validated.councilLicense,
          council_state: validated.councilState,
          council_validation: LICENSE_STATUS.PENDING,
          aesthetic_specializations: validated.specializations,
          preferred_procedures: validated.preferredProcedures || [],
          max_daily_appointments: validated.maxDailyAppointments || 20,
          appointment_buffer: validated.appointmentBuffer || 15,
          can_prescribe: validated.canPrescribe || false,
          emergency_contact: validated.emergencyContact || false,
          color: validated.color || '#10B981',
          working_hours: [],
          training_history: {},
          certification_levels: {},
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create professional', { error });
        return {
          success: false,
          error: error.message,
        };
      }

      // Initiate license validation (async)
      this.validateProfessionalLicense(professional.id, validated.councilType, validated.councilLicense)
        .catch(err => logger.error('License validation failed', { error: err }));

      return {
        success: true,
        data: this.mapProfessionalFromDb(professional),
        message: 'Professional created successfully',
      };
    } catch (error) {
      logger.error('Create professional error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get professional by ID
   */
  async getProfessionalById(id: string): Promise<ServiceResponse<AestheticProfessional>> {
    try {
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .select(`
          *,
          clinic:clinics(name, cnpj),
          service_types:service_types(id, name, category_id)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: this.mapProfessionalFromDb(professional),
      };
    } catch (error) {
      logger.error('Get professional error', { error, id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get professionals by clinic
   */
  async getProfessionalsByClinic(clinicId: string, activeOnly = true): Promise<ServiceResponse<AestheticProfessional[]>> {
    try {
      let query = this.supabase
        .from('professionals')
        .select(`
          *,
          clinic:clinics(name, cnpj),
          service_types:service_types(id, name, category_id)
        `)
        .eq('clinic_id', clinicId);

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data: professionals, error } = await query.order('full_name');

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: professionals.map(p => this.mapProfessionalFromDb(p)),
      };
    } catch (error) {
      logger.error('Get professionals by clinic error', { error, clinicId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update professional information
   */
  async updateProfessional(input: UpdateProfessionalInput): Promise<ServiceResponse<AestheticProfessional>> {
    try {
      const { id, ...updateData } = input;
      
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .update({
          full_name: updateData.fullName,
          email: updateData.email,
          phone: updateData.phone,
          council_license: updateData.councilLicense,
          council_state: updateData.councilState,
          aesthetic_specializations: updateData.specializations,
          preferred_procedures: updateData.preferredProcedures,
          max_daily_appointments: updateData.maxDailyAppointments,
          appointment_buffer: updateData.appointmentBuffer,
          can_prescribe: updateData.canPrescribe,
          emergency_contact: updateData.emergencyContact,
          color: updateData.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: this.mapProfessionalFromDb(professional),
        message: 'Professional updated successfully',
      };
    } catch (error) {
      logger.error('Update professional error', { error, id: input.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate professional license with respective council
   */
  async validateProfessionalLicense(
    professionalId: string,
    councilType: ProfessionalCouncil,
    licenseNumber: string
  ): Promise<LicenseValidationResult> {
    try {
      // Mock validation - in production, integrate with council APIs
      const isValid = await this.mockCouncilValidation(councilType, licenseNumber);
      
      const status: LicenseStatus = isValid ? LICENSE_STATUS.VERIFIED : LICENSE_STATUS.INVALID;
      const expiryDate = isValid ? this.calculateLicenseExpiry(councilType) : undefined;
      
      // Update professional record
      await this.supabase
        .from('professionals')
        .update({
          council_validation: status,
          license_expiry_date: expiryDate?.toISOString(),
        })
        .eq('id', professionalId);

      return {
        isValid,
        status,
        message: isValid ? 'License validated successfully' : 'License validation failed',
        expiryDate,
        lastVerified: new Date(),
      };
    } catch (error) {
      logger.error('License validation error', { error, professionalId, councilType });
      return {
        isValid: false,
        status: LICENSE_STATUS.PENDING,
        message: 'Validation service unavailable',
        lastVerified: new Date(),
      };
    }
  }

  /**
   * Get professionals by specialization
   */
  async getProfessionalsBySpecialization(
    clinicId: string,
    specialization: AestheticSpecialization
  ): Promise<ServiceResponse<AestheticProfessional[]>> {
    try {
      const { data: professionals, error } = await this.supabase
        .from('professionals')
        .select(`
          *,
          clinic:clinics(name, cnpj)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .contains('aesthetic_specializations', [specialization])
        .order('full_name');

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: professionals.map(p => this.mapProfessionalFromDb(p)),
      };
    } catch (error) {
      logger.error('Get professionals by specialization error', { error, clinicId, specialization });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check professional availability for a specific time
   */
  async checkProfessionalAvailability(
    professionalId: string,
    startTime: Date,
    duration: number
  ): Promise<ServiceResponse<{ available: boolean; conflicts?: any[] }>> {
    try {
      const endTime = new Date(startTime.getTime() + duration * 60000);

      // Check existing appointments
      const { data: appointments, error } = await this.supabase
        .from('appointments')
        .select('id, scheduled_date, duration')
        .eq('professional_id', professionalId)
        .eq('status', 'SCHEDULED')
        .gte('scheduled_date', startTime.toISOString())
        .lt('scheduled_date', endTime.toISOString());

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const available = appointments.length === 0;

      return {
        success: true,
        data: {
          available,
          conflicts: available ? undefined : appointments,
        },
      };
    } catch (error) {
      logger.error('Check availability error', { error, professionalId, startTime });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get professional statistics
   */
  async getProfessionalStats(professionalId: string): Promise<ServiceResponse<{
    totalAppointments: number;
    completedAppointments: number;
    noShowRate: number;
    averageRating?: number;
    revenueGenerated: number;
    topProcedures: Array<{ name: string; count: number }>;
  }>> {
    try {
      // Get appointment statistics
      const { data: appointments, error } = await this.supabase
        .from('appointments')
        .select('status, treatment_type, price')
        .eq('professional_id', professionalId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED').length;
      const noShows = appointments.filter(apt => apt.status === 'NO_SHOW').length;
      const noShowRate = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;
      
      const revenueGenerated = appointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      // Group procedures by type
      const procedureCounts = appointments.reduce((acc, apt) => {
        acc[apt.treatment_type] = (acc[apt.treatment_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProcedures = Object.entries(procedureCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        success: true,
        data: {
          totalAppointments,
          completedAppointments,
          noShowRate,
          revenueGenerated,
          topProcedures,
        },
      };
    } catch (error) {
      logger.error('Get professional stats error', { error, professionalId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Helper methods
  private mapProfessionalFromDb(dbProfessional: any): AestheticProfessional {
    return {
      id: dbProfessional.id,
      clinicId: dbProfessional.clinic_id,
      userId: dbProfessional.user_id,
      fullName: dbProfessional.full_name,
      email: dbProfessional.email,
      phone: dbProfessional.phone,
      councilType: dbProfessional.council_type,
      councilLicense: dbProfessional.council_license,
      councilState: dbProfessional.council_state,
      councilValidation: dbProfessional.council_validation,
      licenseExpiryDate: dbProfessional.license_expiry_date ? new Date(dbProfessional.license_expiry_date) : undefined,
      specializations: dbProfessional.aesthetic_specializations || [],
      certificationLevels: dbProfessional.certification_levels || {},
      preferredProcedures: dbProfessional.preferred_procedures || [],
      maxDailyAppointments: dbProfessional.max_daily_appointments || 20,
      appointmentBuffer: dbProfessional.appointment_buffer || 15,
      workingHours: dbProfessional.working_hours || [],
      availability: {
        canWorkWeekends: dbProfessional.can_work_weekends || false,
        defaultStartTime: dbProfessional.default_start_time || '09:00',
        defaultEndTime: dbProfessional.default_end_time || '18:00',
        defaultBreakStart: dbProfessional.default_break_start,
        defaultBreakEnd: dbProfessional.default_break_end,
      },
      isActive: dbProfessional.is_active,
      canPrescribe: dbProfessional.can_prescribe,
      emergencyContact: dbProfessional.emergency_contact,
      serviceTypeIds: dbProfessional.service_type_ids || [],
      color: dbProfessional.color || '#10B981',
      createdAt: new Date(dbProfessional.created_at),
      updatedAt: new Date(dbProfessional.updated_at),
    };
  }

  private async mockCouncilValidation(councilType: ProfessionalCouncil, licenseNumber: string): Promise<boolean> {
    // Mock validation - replace with actual council API integrations
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Basic format validation based on council type
    switch (councilType) {
      case 'CFM':
        return /^\d{6,8}$/.test(licenseNumber);
      case 'COREN':
        return /^\d{8,10}$/.test(licenseNumber);
      case 'CFF':
        return /^\d{6,8}$/.test(licenseNumber);
      case 'CREFITO':
        return /^\d{6,8}$/.test(licenseNumber);
      case 'CRBM':
        return /^\d{6,8}$/.test(licenseNumber);
      case 'CNEP':
        return /^\d{4,6}$/.test(licenseNumber);
      default:
        return false;
    }
  }

  private calculateLicenseExpiry(councilType: ProfessionalCouncil): Date {
    const expiry = new Date();
    
    // Different expiry periods based on council type
    switch (councilType) {
      case 'CFM':
        expiry.setFullYear(expiry.getFullYear() + 3); // 3 years
        break;
      case 'COREN':
        expiry.setFullYear(expiry.getFullYear() + 2); // 2 years
        break;
      case 'CFF':
        expiry.setFullYear(expiry.getFullYear() + 3); // 3 years
        break;
      case 'CREFITO':
        expiry.setFullYear(expiry.getFullYear() + 2); // 2 years
        break;
      case 'CRBM':
        expiry.setFullYear(expiry.getFullYear() + 3); // 3 years
        break;
      case 'CNEP':
        expiry.setFullYear(expiry.getFullYear() + 1); // 1 year
        break;
      default:
        expiry.setFullYear(expiry.getFullYear() + 2); // Default 2 years
    }
    
    return expiry;
  }
}

// Export singleton instance
export const aestheticProfessionalsService = new AestheticProfessionalsService();