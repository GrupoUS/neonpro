/**
 * Professional Services Types
 * Types for managing professional-service relationships and assignments
 */

// Proficiency levels for professional-service relationships
export type ProficiencyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

// Base professional-service relationship
export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_id: string;
  is_primary: boolean;
  proficiency_level: ProficiencyLevel;
  hourly_rate: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Professional-service relationship with detailed information
export interface ProfessionalServiceDetailed extends ProfessionalService {
  professional_name: string;
  professional_email: string;
  service_name: string;
  service_price: number;
  service_duration: number;
}

// Service with professional assignment information
export interface ServiceWithProfessional {
  service_id: string;
  service_name: string;
  service_description: string | null;
  service_price: number;
  service_duration: number;
  is_primary: boolean;
  proficiency_level: ProficiencyLevel;
  hourly_rate: number | null;
  custom_rate: number; // Calculated rate (hourly_rate or service_price)
  notes: string | null;
}

// Professional with service assignment information
export interface ProfessionalWithService {
  professional_id: string;
  professional_name: string;
  professional_email: string;
  is_primary: boolean;
  proficiency_level: ProficiencyLevel;
  hourly_rate: number | null;
  custom_rate: number;
  notes: string | null;
  availability_score: number;
}

// Request types for CRUD operations
export interface CreateProfessionalServiceRequest {
  professional_id: string;
  service_id: string;
  is_primary?: boolean;
  proficiency_level?: ProficiencyLevel;
  hourly_rate?: number;
  notes?: string;
}

export interface UpdateProfessionalServiceRequest {
  id: string;
  is_primary?: boolean;
  proficiency_level?: ProficiencyLevel;
  hourly_rate?: number;
  is_active?: boolean;
  notes?: string;
}

export interface BulkAssignServicesRequest {
  professional_id: string;
  service_ids: string[];
  proficiency_level?: ProficiencyLevel;
  is_primary?: boolean;
}

export interface SetPrimaryProfessionalRequest {
  service_id: string;
  professional_id: string;
}

// Filter and query types
export interface ProfessionalServiceFilters {
  professional_id?: string;
  service_id?: string;
  is_primary?: boolean;
  proficiency_level?: ProficiencyLevel;
  is_active?: boolean;
  clinic_id?: string;
}

export interface ProfessionalServiceStats {
  total_assignments: number;
  active_assignments: number;
  primary_assignments: number;
  proficiency_distribution: Record<ProficiencyLevel, number>;
  average_hourly_rate: number;
  services_per_professional: number;
  professionals_per_service: number;
}

// Professional availability and scheduling types
export interface ProfessionalAvailability {
  professional_id: string;
  professional_name: string;
  service_id: string;
  service_name: string;
  is_available: boolean;
  next_available_slot: string | null;
  proficiency_level: ProficiencyLevel;
  estimated_duration: number;
  custom_rate: number;
}

// Service assignment summary
export interface ServiceAssignmentSummary {
  service_id: string;
  service_name: string;
  total_professionals: number;
  primary_professional: {
    id: string;
    name: string;
    proficiency_level: ProficiencyLevel;
  } | null;
  proficiency_levels: Record<ProficiencyLevel, number>;
  average_rate: number;
  is_fully_staffed: boolean;
}

// Professional assignment summary
export interface ProfessionalAssignmentSummary {
  professional_id: string;
  professional_name: string;
  total_services: number;
  primary_services: number;
  proficiency_levels: Record<ProficiencyLevel, number>;
  specializations: string[]; // Service categories they're assigned to
  average_rate: number;
  workload_score: number; // Based on number of services and complexity
}

// Proficiency level configuration
export const PROFICIENCY_LEVELS: Record<
  ProficiencyLevel,
  {
    label: string;
    description: string;
    color: string;
    score: number;
  }
> = {
  beginner: {
    label: 'Iniciante',
    description: 'Conhecimento básico, requer supervisão',
    color: '#f59e0b',
    score: 25,
  },
  intermediate: {
    label: 'Intermediário',
    description: 'Conhecimento sólido, trabalha independentemente',
    color: '#3b82f6',
    score: 50,
  },
  advanced: {
    label: 'Avançado',
    description: 'Conhecimento especializado, pode treinar outros',
    color: '#10b981',
    score: 75,
  },
  expert: {
    label: 'Especialista',
    description: 'Conhecimento excepcional, referência na área',
    color: '#8b5cf6',
    score: 100,
  },
};

// Default proficiency level
export const DEFAULT_PROFICIENCY_LEVEL: ProficiencyLevel = 'intermediate';

// Utility functions for proficiency levels
export const getProficiencyConfig = (_level: any) => {
  return PROFICIENCY_LEVELS[level];
};

export const getProficiencyScore = (level: ProficiencyLevel): number => {
  return PROFICIENCY_LEVELS[level].score;
};

export const getProficiencyColor = (level: ProficiencyLevel): string => {
  return PROFICIENCY_LEVELS[level].color;
};

export const getProficiencyLabel = (level: ProficiencyLevel): string => {
  return PROFICIENCY_LEVELS[level].label;
};

// Validation helpers
export const isValidProficiencyLevel = (
  level: string,
): level is ProficiencyLevel => {
  return Object.keys(PROFICIENCY_LEVELS).includes(level as ProficiencyLevel);
};

// Sorting and comparison utilities
export const compareProficiencyLevels = (
  a: ProficiencyLevel,
  b: ProficiencyLevel,
): number => {
  return getProficiencyScore(b) - getProficiencyScore(a); // Descending order (expert first)
};

export const sortProfessionalsByProficiency = (
  professionals: ProfessionalWithService[],
): ProfessionalWithService[] => {
  return [...professionals].sort((a, b) => {
    // Primary professionals first
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;

    // Then by proficiency level
    const proficiencyComparison = compareProficiencyLevels(
      a.proficiency_level,
      b.proficiency_level,
    );
    if (proficiencyComparison !== 0) return proficiencyComparison;

    // Finally by name
    return a.professional_name.localeCompare(b.professional_name);
  });
};

export const sortServicesByProficiency = (
  services: ServiceWithProfessional[],
): ServiceWithProfessional[] => {
  return [...services].sort((a, b) => {
    // Primary services first
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;

    // Then by proficiency level
    const proficiencyComparison = compareProficiencyLevels(
      a.proficiency_level,
      b.proficiency_level,
    );
    if (proficiencyComparison !== 0) return proficiencyComparison;

    // Finally by service name
    return a.service_name.localeCompare(b.service_name);
  });
};

// Rate calculation utilities
export const calculateEffectiveRate = (
  hourlyRate: number | null,
  servicePrice: number,
  serviceDuration: number,
): number => {
  if (hourlyRate !== null) {
    return hourlyRate;
  }

  // Calculate hourly rate from service price and duration
  const hours = serviceDuration / 60;
  return hours > 0 ? servicePrice / hours : servicePrice;
};

export const formatProficiencyLevel = (level: ProficiencyLevel): string => {
  return getProficiencyLabel(level);
};
