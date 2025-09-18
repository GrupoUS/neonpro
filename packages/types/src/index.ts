export * from './aesthetic-data';
export * from './ai-chat';
export * from './ai-provider';
export * from './webrtc';
export * from './healthcare-governance.types';
export * from './governance.types';
// Healthcare types
export interface Patient {
  id: string;
  clinicId: string;
  medicalRecordNumber: string;
  externalIds?: Record<string, any>;
  givenNames: string[];
  familyName: string;
  fullName: string;
  preferredName?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  isActive?: boolean;
  deceasedIndicator?: boolean;
  deceasedDate?: string;
  dataConsentStatus?: string;
  dataConsentDate?: string;
  dataRetentionUntil?: string;
  dataSource?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  photoUrl?: string;
  cpf?: string;
  rg?: string;
  passportNumber?: string;
  preferredContactMethod?: string;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  insuranceProvider?: string;
  insuranceNumber?: string;
  insurancePlan?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  lgpdConsentGiven: boolean;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  serviceTypeId?: string;
  status?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  internalNotes?: string;
  reminderSentAt?: string;
  confirmationSentAt?: string;
  whatsappReminderSent?: boolean;
  smsReminderSent?: boolean;
  roomId?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  // Calendar-specific properties
  title?: string;
  start?: Date | string;
  end?: Date | string;
  color?: string;
  description?: string;
}

// Database types - placeholder for Supabase generated types
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
}
