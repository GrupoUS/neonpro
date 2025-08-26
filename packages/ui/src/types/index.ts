// Core Patient Type
export interface PatientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  birthDate: Date | string;
  gender?: 'male' | 'female' | 'other';
  cpf?: string;
  rg?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastVisit?: Date | string;
  nextAppointment?: Date | string;
  totalAppointments?: number;
  notes?: string;
  tags?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Appointment Types
export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  type: 'consultation' | 'procedure' | 'follow-up' | 'emergency';
  location?: string;
  notes?: string;
  reminders?: {
    sent: boolean;
    sentAt?: Date;
    type: 'email' | 'sms' | 'whatsapp';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// User and Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'manager';
  clinic?: string;
  permissions?: string[];
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: 'pt-BR' | 'en-US';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Common UI Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'boolean';
  options?: SelectOption[];
  defaultValue?: any;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total?: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Layout Types
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string | number;
  active?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

// Healthcare-specific Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  date: Date;
  type: 'consultation' | 'procedure' | 'exam' | 'prescription';
  title: string;
  description: string;
  doctor: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  diagnosis?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  followUp?: {
    required: boolean;
    date?: Date;
    instructions?: string;
  };
}

export interface Treatment {
  id: string;
  patientId: string;
  name: string;
  category: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  sessions: {
    id: string;
    date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  }[];
  cost: {
    total: number;
    paid: number;
    pending: number;
  };
  notes?: string;
}

// Component Props Base Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ClickableComponentProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
}

export interface FormComponentProps extends BaseComponentProps {
  name?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

// Status and variant types
export type StatusVariant =
  | 'default'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'destructive';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'medical';

// Export aliases removed to avoid conflicts
// Basic Types
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Removed duplicate AppointmentData interface

// Practitioner Data Types
export interface PractitionerData extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  crm: string;
  avatar?: string;
  isActive: boolean;
  schedule?: WorkingHours[];
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Treatment Data Types
export interface TreatmentData extends BaseEntity {
  name: string;
  category: string;
  description?: string;
  patientId: string;
  practitionerId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  statusLabel?: string;
  priority?: 'low' | 'normal' | 'high';
  startDate?: Date;
  endDate?: Date;
  nextSession?: Date;
  estimatedDuration?: string;
  location?: string;
  notes?: string;
  sessions?: boolean;
  totalSessions?: number;
  completedSessions?: number;
  outcomes?: string[];
} // Procedure Data Types
export interface ProcedureData extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  patientId?: string;
  practitionerId: string;
  treatmentId?: string;
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number;
  location?: string;
  notes?: string;
  preRequirements: string[];
  postCareInstructions: string[];
  risks: string[];
  consentRequired: boolean;
  lgpdConsent: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Health Record Data Types
export interface HealthRecordData extends BaseEntity {
  patientId: string;
  patientName: string;
  birthDate: Date;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: MedicalHistory;
  medications?: string[];
  allergies?: string[];
  procedures?: ProcedureRecord[];
  previousProcedures?: PreviousProcedure[];
  documents?: HealthDocument[];
  lastUpdated?: Date;
}

export interface MedicalHistory {
  conditions?: string[];
  surgeries?: string[];
  familyHistory?: string[];
  chronicConditions?: string[];
}

export interface ProcedureRecord {
  id: string;
  name: string;
  date: Date;
  time: string;
  practitioner: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  outcome?: string;
}

export interface PreviousProcedure {
  name: string;
  date: Date;
  practitioner: string;
  status: string;
  notes?: string;
}

export interface HealthDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  url?: string;
  onDownload?: (id: string) => void;
}

// Layout Data Types
export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
  };
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string; }>;
  isActive?: boolean;
  children?: NavItem[];
}

// Form Types
export interface FormValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'date'
    | 'time'
    | 'select'
    | 'textarea'
    | 'checkbox';
  validation?: FormValidation;
  options?: { value: string; label: string; }[];
  placeholder?: string;
  description?: string;
}

// Component Variant Types
export type ComponentVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'medical';
export type ComponentSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning';
export type AvatarVariant = 'default' | 'patient' | 'practitioner' | 'system';
