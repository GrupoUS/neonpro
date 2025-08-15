// Patient-related types

export interface PatientData {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastVisit?: string;
  nextAppointment?: string;
  urgentAlerts?: number;
  totalAppointments?: number;
  registrationDate?: string;
  // LGPD compliance fields
  consentGiven?: boolean;
  dataRetentionDate?: string;
  privacySettings?: {
    allowMarketing: boolean;
    allowDataSharing: boolean;
    allowAnalytics: boolean;
  };
}

export interface PatientCardProps {
  patient: PatientData;
  onViewDetails?: () => void;
  onScheduleAppointment?: () => void;
  onCall?: (phone: string) => void;
  onEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}
