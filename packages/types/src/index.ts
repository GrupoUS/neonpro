export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  medicalHistory: string;
  consentGiven: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  date: Date;
  type: 'consultation' | 'treatment' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  availability: Date[];
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'aesthetic' | 'medical' | 'wellness';
}

export type HealthcareUser = Patient | Professional;

export * from './guards.ts';
export * from './validation.ts';
