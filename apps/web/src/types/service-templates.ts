/**
 * Service Templates Types
 * Types for managing service templates and packages
 */

// Template types for different use cases
export type ServiceTemplateType =
  | 'package'
  | 'procedure'
  | 'consultation'
  | 'followup';

// Pricing strategies for templates
export type ServiceTemplatePriceType = 'fixed' | 'calculated' | 'custom';

// Base service template
export interface ServiceTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: ServiceTemplateType;
  category_id: string | null;
  clinic_id: string;
  default_duration_minutes: number;
  default_price: number;
  price_type: ServiceTemplatePriceType;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  usage_count: number;
  template_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Service template with category information
export interface ServiceTemplateWithCategory extends ServiceTemplate {
  category_name: string | null;
  category_color: string | null;
  calculated_price: number;
}

// Service template item (services included in template)
export interface ServiceTemplateItem {
  id: string;
  template_id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  quantity: number;
  sequence_order: number;
  is_required: boolean;
  discount_percentage: number | null;
  notes: string | null;
  total_price: number;
  created_at: string;
}

// Service template with items
export interface ServiceTemplateWithItems extends ServiceTemplateWithCategory {
  items: ServiceTemplateItem[];
}

// Request types for CRUD operations
export interface CreateServiceTemplateRequest {
  name: string;
  description?: string;
  template_type: ServiceTemplateType;
  category_id?: string;
  clinic_id: string;
  default_duration_minutes?: number;
  default_price?: number;
  price_type?: ServiceTemplatePriceType;
  is_featured?: boolean;
  template_config?: Record<string, any>;
  items?: CreateServiceTemplateItemRequest[];
}

export interface UpdateServiceTemplateRequest {
  id: string;
  name?: string;
  description?: string;
  template_type?: ServiceTemplateType;
  category_id?: string;
  default_duration_minutes?: number;
  default_price?: number;
  price_type?: ServiceTemplatePriceType;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  template_config?: Record<string, any>;
}

export interface CreateServiceTemplateItemRequest {
  service_id: string;
  quantity?: number;
  sequence_order?: number;
  is_required?: boolean;
  discount_percentage?: number;
  notes?: string;
}

export interface UpdateServiceTemplateItemRequest {
  id: string;
  quantity?: number;
  sequence_order?: number;
  is_required?: boolean;
  discount_percentage?: number;
  notes?: string;
}

export interface DuplicateServiceTemplateRequest {
  template_id: string;
  new_name: string;
  clinic_id: string;
}

// Filter and query types
export interface ServiceTemplateFilters {
  clinic_id?: string;
  category_id?: string;
  template_type?: ServiceTemplateType;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
}

// Statistics and analytics
export interface ServiceTemplateStats {
  total_templates: number;
  active_templates: number;
  featured_templates: number;
  total_usage: number;
  template_types: Record<ServiceTemplateType, number>;
  price_types: Record<ServiceTemplatePriceType, number>;
  average_price: number;
  average_duration: number;
  most_used_template: {
    id: string;
    name: string;
    usage_count: number;
  } | null;
}

// Template configuration schemas
export interface PackageTemplateConfig {
  allow_item_customization: boolean;
  require_all_services: boolean;
  discount_type: 'percentage' | 'fixed';
  bulk_discount: number;
  scheduling_preferences: {
    same_day: boolean;
    consecutive_appointments: boolean;
    preferred_interval_days: number;
  };
}

export interface ProcedureTemplateConfig {
  preparation_instructions: string[];
  aftercare_instructions: string[];
  required_equipment: string[];
  contraindications: string[];
  estimated_recovery_time: number;
}

export interface ConsultationTemplateConfig {
  consultation_type: 'initial' | 'followup' | 'emergency';
  required_forms: string[];
  preparation_required: boolean;
  includes_examination: boolean;
  includes_treatment_plan: boolean;
}

// Template type configurations
export const SERVICE_TEMPLATE_TYPES: Record<
  ServiceTemplateType,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
    defaultConfig: Record<string, any>;
  }
> = {
  package: {
    label: 'Pacote',
    description: 'Conjunto de serviços com desconto',
    color: '#3b82f6',
    icon: 'package',
    defaultConfig: {
      allow_item_customization: true,
      require_all_services: false,
      discount_type: 'percentage',
      bulk_discount: 10,
    },
  },
  procedure: {
    label: 'Procedimento',
    description: 'Procedimento médico específico',
    color: '#10b981',
    icon: 'activity',
    defaultConfig: {
      preparation_instructions: [],
      aftercare_instructions: [],
      required_equipment: [],
      contraindications: [],
    },
  },
  consultation: {
    label: 'Consulta',
    description: 'Consulta médica padrão',
    color: '#f59e0b',
    icon: 'user-check',
    defaultConfig: {
      consultation_type: 'initial',
      required_forms: [],
      preparation_required: false,
      includes_examination: true,
    },
  },
  followup: {
    label: 'Retorno',
    description: 'Consulta de acompanhamento',
    color: '#8b5cf6',
    icon: 'repeat',
    defaultConfig: {
      consultation_type: 'followup',
      required_forms: [],
      preparation_required: false,
      includes_examination: false,
    },
  },
};

// Price type configurations
export const SERVICE_TEMPLATE_PRICE_TYPES: Record<
  ServiceTemplatePriceType,
  {
    label: string;
    description: string;
  }
> = {
  fixed: {
    label: 'Preço Fixo',
    description: 'Preço definido manualmente',
  },
  calculated: {
    label: 'Preço Calculado',
    description: 'Soma dos preços dos serviços incluídos',
  },
  custom: {
    label: 'Preço Personalizado',
    description: 'Preço definido durante o agendamento',
  },
};

// Utility functions
export const getTemplateTypeConfig = (_type: any) => {
  return SERVICE_TEMPLATE_TYPES[type];
};

export const getPriceTypeConfig = (_type: any) => {
  return SERVICE_TEMPLATE_PRICE_TYPES[type];
};

export const calculateTemplatePrice = (
  template: ServiceTemplate,
  items: ServiceTemplateItem[],
): number => {
  switch (template.price_type) {
    case 'fixed':
      return template.default_price;
    case 'calculated':
      return items.reduce((total, item) => total + item.total_price, 0);
    case 'custom':
      return 0; // Will be set during booking
    default:
      return template.default_price;
  }
};

export const calculateTemplateDuration = (
  template: ServiceTemplate,
  items: ServiceTemplateItem[],
): number => {
  if (items.length === 0) {
    return template.default_duration_minutes;
  }

  // For packages, use the sum of all service durations
  // For procedures, use the default duration (usually longer than individual services)
  if (template.template_type === 'package') {
    return items.reduce((total, item) => {
      // Assuming service duration is available in the item or needs to be fetched
      return total + 60 * item.quantity; // Default 60 minutes per service
    }, 0);
  }

  return template.default_duration_minutes;
};

// Validation helpers
export const isValidTemplateType = (
  type: string,
): type is ServiceTemplateType => {
  return Object.keys(SERVICE_TEMPLATE_TYPES).includes(
    type as ServiceTemplateType,
  );
};

export const isValidPriceType = (
  type: string,
): type is ServiceTemplatePriceType => {
  return Object.keys(SERVICE_TEMPLATE_PRICE_TYPES).includes(
    type as ServiceTemplatePriceType,
  );
};

// Sorting utilities
export const sortTemplatesByPopularity = (
  templates: ServiceTemplate[],
): ServiceTemplate[] => {
  return [...templates].sort((a, b) => {
    // Featured templates first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    // Then by usage count
    if (a.usage_count !== b.usage_count) {
      return b.usage_count - a.usage_count;
    }

    // Finally by sort order and name
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.name.localeCompare(b.name);
  });
};

export const sortTemplatesByCategory = (
  templates: ServiceTemplateWithCategory[],
): ServiceTemplateWithCategory[] => {
  return [...templates].sort((a, b) => {
    // Group by category first
    const categoryA = a.category_name || 'Sem categoria';
    const categoryB = b.category_name || 'Sem categoria';

    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB);
    }

    // Then by featured status
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    // Finally by name
    return a.name.localeCompare(b.name);
  });
};

// Template search and filtering utilities
export const filterTemplatesBySearch = (
  templates: ServiceTemplate[],
  searchQuery: string,
): ServiceTemplate[] => {
  if (!searchQuery.trim()) return templates;

  const query = searchQuery.toLowerCase();
  return templates.filter(
    template =>
      template.name.toLowerCase().includes(query)
      || template.description?.toLowerCase().includes(query)
      || template.template_type.toLowerCase().includes(query),
  );
};

export const groupTemplatesByType = (
  templates: ServiceTemplate[],
): Record<ServiceTemplateType, ServiceTemplate[]> => {
  return templates.reduce(
    (groups, template) => {
      if (!groups[template.template_type]) {
        groups[template.template_type] = [];
      }
      groups[template.template_type].push(template);
      return groups;
    },
    {} as Record<ServiceTemplateType, ServiceTemplate[]>,
  );
};
