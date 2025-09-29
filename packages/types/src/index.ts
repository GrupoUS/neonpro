export interface LegacyPatient {
  id: string
  name: string
  email: string
  phone: string
  medicalHistory: string
  consentGiven: boolean
  createdAt: Date
}

export interface LegacyAppointment {
  id: string
  patientId: string
  professionalId: string
  date: Date
  type: 'consultation' | 'treatment' | 'follow-up'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string
}

export interface Professional {
  id: string
  name: string
  specialty: string
  licenseNumber: string
  availability: Date[]
}

export interface Treatment {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
  category: 'aesthetic' | 'medical' | 'wellness'
}

export type HealthcareUser = LegacyPatient | Professional

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: LegacyPatient;
        Insert: Omit<LegacyPatient, 'id' | 'createdAt'>;
        Update: Partial<LegacyPatient>;
      };
      appointments: {
        Row: LegacyAppointment;
        Insert: Omit<LegacyAppointment, 'id'>;
        Update: Partial<LegacyAppointment>;
      };
      // Add other tables as needed based on schema
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};

// Export Zod schemas with new type definitions
export * from './schemas/index.js';

export * from './common.js'
export * from './database.js'
export * from './healthcare.js'
export * from './api.js'
export * from './guards.js'
export * from './validation.js'
export * from './auth.js'