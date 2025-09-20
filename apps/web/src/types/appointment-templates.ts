/**
 * Appointment Templates Types
 * Pre-configured appointment types for common procedures
 */

export interface AppointmentTemplate {
  id: string;
  name: string;
  description?: string;
  category: AppointmentTemplateCategory;
  serviceTypeId: string;
  serviceName: string;
  duration: number; // in minutes
  price: number;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
  clinicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentTemplateCategory =
  | 'consultation'
  | 'facial'
  | 'body'
  | 'laser'
  | 'injectable'
  | 'surgery'
  | 'followup'
  | 'emergency';

export interface CreateAppointmentTemplateData {
  name: string;
  description?: string;
  category: AppointmentTemplateCategory;
  serviceTypeId: string;
  duration?: number;
  price?: number;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateAppointmentTemplateData {
  name?: string;
  description?: string;
  category?: AppointmentTemplateCategory;
  serviceTypeId?: string;
  duration?: number;
  price?: number;
  color?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface AppointmentTemplateFilters {
  category?: AppointmentTemplateCategory;
  isActive?: boolean;
  isDefault?: boolean;
  clinicId?: string;
  search?: string;
}

// Default templates for common procedures
export const DEFAULT_APPOINTMENT_TEMPLATES: Omit<
  AppointmentTemplate,
  'id' | 'createdAt' | 'updatedAt' | 'clinicId'
>[] = [
  {
    name: 'Consulta Inicial',
    description: 'Primeira consulta para avaliação e planejamento',
    category: 'consultation',
    serviceTypeId: '', // Will be set when creating
    serviceName: 'Consulta Inicial',
    duration: 60,
    price: 150,
    color: '#3b82f6',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Limpeza de Pele',
    description: 'Limpeza facial profunda com extração',
    category: 'facial',
    serviceTypeId: '',
    serviceName: 'Limpeza de Pele',
    duration: 90,
    price: 120,
    color: '#10b981',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Botox',
    description: 'Aplicação de toxina botulínica',
    category: 'injectable',
    serviceTypeId: '',
    serviceName: 'Botox',
    duration: 30,
    price: 800,
    color: '#8b5cf6',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Preenchimento',
    description: 'Preenchimento com ácido hialurônico',
    category: 'injectable',
    serviceTypeId: '',
    serviceName: 'Preenchimento',
    duration: 45,
    price: 1200,
    color: '#f59e0b',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Laser Hair Removal',
    description: 'Depilação a laser',
    category: 'laser',
    serviceTypeId: '',
    serviceName: 'Depilação a Laser',
    duration: 60,
    price: 200,
    color: '#ef4444',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Massagem Modeladora',
    description: 'Massagem corporal modeladora',
    category: 'body',
    serviceTypeId: '',
    serviceName: 'Massagem Modeladora',
    duration: 90,
    price: 180,
    color: '#06b6d4',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Retorno',
    description: 'Consulta de retorno e acompanhamento',
    category: 'followup',
    serviceTypeId: '',
    serviceName: 'Retorno',
    duration: 30,
    price: 80,
    color: '#84cc16',
    isActive: true,
    isDefault: true,
  },
];

// Category labels for UI
export const APPOINTMENT_TEMPLATE_CATEGORY_LABELS: Record<
  AppointmentTemplateCategory,
  string
> = {
  consultation: 'Consulta',
  facial: 'Facial',
  body: 'Corporal',
  laser: 'Laser',
  injectable: 'Injetáveis',
  surgery: 'Cirurgia',
  followup: 'Retorno',
  emergency: 'Emergência',
};

// Category colors for UI
export const APPOINTMENT_TEMPLATE_CATEGORY_COLORS: Record<
  AppointmentTemplateCategory,
  string
> = {
  consultation: '#3b82f6',
  facial: '#10b981',
  body: '#06b6d4',
  laser: '#ef4444',
  injectable: '#8b5cf6',
  surgery: '#f59e0b',
  followup: '#84cc16',
  emergency: '#dc2626',
};
