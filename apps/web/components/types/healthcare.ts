// Healthcare Domain Types - Standardized TypeScript Interfaces

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: PatientStatus;
  lastVisit?: string | Date;
  treatments?: number;
  dateOfBirth?: string | Date;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
}

export type PatientStatus = "active" | "inactive" | "pending";

export interface Appointment {
  id: string;
  patientId: string;
  patient?: string | Patient;
  service: string;
  professional: string;
  date: string | Date;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  room?: string;
  notes?: string;
}

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no-show";

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  category?: string;
}

export interface Professional {
  id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

// Component Props Interfaces
export interface BaseComponentProps {
  className?: string;
  "data-testid"?: string;
}

export interface ListComponentProps<T> extends BaseComponentProps {
  items: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onItemClick?: (item: T) => void;
}

export interface CardComponentProps extends BaseComponentProps {
  variant?: "default" | "compact" | "animated";
}

export interface ModalComponentProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  preventClose?: boolean;
}

// Event Handler Types
export type PatientEventHandler = (patientId: string) => void;
export type AppointmentEventHandler = (appointmentId: string) => void;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  total?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  totalPages: number;
}
