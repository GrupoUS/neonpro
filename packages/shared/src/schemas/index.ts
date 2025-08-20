/**
 * 🔍 Schemas Export Index - NeonPro Healthcare
 * ============================================
 * 
 * Centralização de exports para todos os schemas Zod
 * do sistema NeonPro Healthcare.
 */

// Patient schemas and types
export * from './patient.schema';

// Appointment schemas and types  
export * from './appointment.schema';

// Clinic schemas and types
export * from './clinic.schema';

// Authentication schemas and types
export * from './auth.schema';

// Re-export commonly used types for convenience
export type {
  // Patient types
  PatientBase,
  CreatePatient,
  UpdatePatient,
  PatientResponse,
  PatientSearch,
  
  // Appointment types
  AppointmentBase,
  CreateAppointment,
  UpdateAppointment,
  AppointmentResponse,
  AppointmentSearch,
  TimeSlot,
  
  // Clinic types
  ClinicBase,
  CreateClinic,
  UpdateClinic,
  ClinicResponse,
  ClinicSearch,
  BusinessHours,
  
  // Auth types
  Login,
  Register,
  AuthUser,
  AuthToken,
  LoginResponse,
  UserRole,
  MFAMethod,
} from './patient.schema';

export type {
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
} from './appointment.schema';

export type {
  ContactInfo,
  ClinicAddress,
  ClinicService,
} from './clinic.schema';

export type {
  ChangePassword,
  UpdateProfile,
  EnableMFA,
  VerifyMFA,
} from './auth.schema';

// Schema validation utilities
import { z } from 'zod';

// Generic schema validator function
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      }
      
      return { success: false, errors };
    }
    
    return { 
      success: false, 
      errors: { 
        _global: ['Erro de validação desconhecido'] 
      } 
    };
  }
};

// Safe parsing function that returns partial data on errors
export const safeParseSchema = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data: Partial<T>;
  errors?: Record<string, string[]>;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      const partialData: any = {};
      
      // Extract valid fields
      if (typeof data === 'object' && data !== null) {
        for (const [key, value] of Object.entries(data)) {
          try {
            // Try to validate individual fields
            if (key in schema.shape) {
              const fieldSchema = (schema as any).shape[key];
              fieldSchema.parse(value);
              partialData[key] = value;
            }
          } catch {
            // Field validation failed, skip it
          }
        }
      }
      
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      }
      
      return { success: false, data: partialData, errors };
    }
    
    return { 
      success: false, 
      data: {} as Partial<T>, 
      errors: { 
        _global: ['Erro de validação desconhecido'] 
      } 
    };
  }
};