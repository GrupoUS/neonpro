/**
 * Service Categories Types
 * Defines TypeScript interfaces for service category management
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  services_count?: number;
  clinic?: {
    id: string;
    clinic_name: string;
  };
}

export interface CreateServiceCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  clinic_id: string;
}

export interface UpdateServiceCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ServiceCategoryFilters {
  is_active?: boolean;
  clinic_id?: string;
  search?: string;
}

// Predefined service category types for aesthetic clinics
export enum ServiceCategoryType {
  CONSULTATION = 'consultation',
  FACIAL = 'facial',
  BODY = 'body',
  LASER = 'laser',
  INJECTABLE = 'injectable',
  SURGERY = 'surgery',
  EXAM = 'exam',
  FOLLOWUP = 'followup',
  EMERGENCY = 'emergency',
  PACKAGE = 'package',
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryType, string> = {
  [ServiceCategoryType.CONSULTATION]: 'Consulta',
  [ServiceCategoryType.FACIAL]: 'Facial',
  [ServiceCategoryType.BODY]: 'Corporal',
  [ServiceCategoryType.LASER]: 'Laser',
  [ServiceCategoryType.INJECTABLE]: 'Injetáveis',
  [ServiceCategoryType.SURGERY]: 'Cirurgia',
  [ServiceCategoryType.EXAM]: 'Exame',
  [ServiceCategoryType.FOLLOWUP]: 'Retorno',
  [ServiceCategoryType.EMERGENCY]: 'Emergência',
  [ServiceCategoryType.PACKAGE]: 'Pacote',
};

export const SERVICE_CATEGORY_COLORS: Record<ServiceCategoryType, string> = {
  [ServiceCategoryType.CONSULTATION]: '#3b82f6', // Blue
  [ServiceCategoryType.FACIAL]: '#10b981', // Emerald
  [ServiceCategoryType.BODY]: '#f59e0b', // Amber
  [ServiceCategoryType.LASER]: '#ef4444', // Red
  [ServiceCategoryType.INJECTABLE]: '#8b5cf6', // Violet
  [ServiceCategoryType.SURGERY]: '#dc2626', // Red-600
  [ServiceCategoryType.EXAM]: '#06b6d4', // Cyan
  [ServiceCategoryType.FOLLOWUP]: '#84cc16', // Lime
  [ServiceCategoryType.EMERGENCY]: '#f97316', // Orange
  [ServiceCategoryType.PACKAGE]: '#6366f1', // Indigo
};

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategoryType, string> = {
  [ServiceCategoryType.CONSULTATION]: 'stethoscope',
  [ServiceCategoryType.FACIAL]: 'sparkles',
  [ServiceCategoryType.BODY]: 'user',
  [ServiceCategoryType.LASER]: 'zap',
  [ServiceCategoryType.INJECTABLE]: 'syringe',
  [ServiceCategoryType.SURGERY]: 'scissors',
  [ServiceCategoryType.EXAM]: 'search',
  [ServiceCategoryType.FOLLOWUP]: 'repeat',
  [ServiceCategoryType.EMERGENCY]: 'alert-triangle',
  [ServiceCategoryType.PACKAGE]: 'package',
};

// Default service categories for new clinics
export const DEFAULT_SERVICE_CATEGORIES: Omit<
  ServiceCategory,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>[] = [
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.CONSULTATION],
    description: 'Consultas médicas e avaliações iniciais',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.CONSULTATION],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.CONSULTATION],
    sort_order: 1,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.FACIAL],
    description: 'Tratamentos faciais estéticos',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.FACIAL],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.FACIAL],
    sort_order: 2,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.BODY],
    description: 'Tratamentos corporais estéticos',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.BODY],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.BODY],
    sort_order: 3,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.LASER],
    description: 'Tratamentos a laser',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.LASER],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.LASER],
    sort_order: 4,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.INJECTABLE],
    description: 'Procedimentos injetáveis (botox, preenchimento)',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.INJECTABLE],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.INJECTABLE],
    sort_order: 5,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.SURGERY],
    description: 'Procedimentos cirúrgicos',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.SURGERY],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.SURGERY],
    sort_order: 6,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.EXAM],
    description: 'Exames e diagnósticos',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.EXAM],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.EXAM],
    sort_order: 7,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.FOLLOWUP],
    description: 'Consultas de retorno e acompanhamento',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.FOLLOWUP],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.FOLLOWUP],
    sort_order: 8,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.EMERGENCY],
    description: 'Atendimentos de emergência',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.EMERGENCY],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.EMERGENCY],
    sort_order: 9,
    is_active: true,
  },
  {
    name: SERVICE_CATEGORY_LABELS[ServiceCategoryType.PACKAGE],
    description: 'Pacotes de tratamentos',
    color: SERVICE_CATEGORY_COLORS[ServiceCategoryType.PACKAGE],
    icon: SERVICE_CATEGORY_ICONS[ServiceCategoryType.PACKAGE],
    sort_order: 10,
    is_active: true,
  },
];

// Service category statistics
export interface ServiceCategoryStats {
  category_id: string;
  category_name: string;
  services_count: number;
  active_services_count: number;
  total_appointments: number;
  total_revenue: number;
  avg_service_price: number;
  most_popular_service: string | null;
}

// Service category with services
export interface ServiceCategoryWithServices extends ServiceCategory {
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
  }>;
}
