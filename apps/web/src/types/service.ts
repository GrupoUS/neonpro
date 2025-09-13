/**
 * Service Management Types
 * Defines TypeScript interfaces for service-related data structures
 */

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  clinic?: {
    id: string;
    clinic_name: string;
  };
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
  clinic_id: string;
}

export interface UpdateServiceRequest {
  id: string;
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  is_active?: boolean;
}

export interface ServiceFilters {
  search?: string;
  is_active?: boolean;
  clinic_id?: string;
}

export interface ServiceSchedule {
  id: string;
  service_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  reason?: string; // Why unavailable (e.g., "Booked", "Blocked", "Outside hours")
}

export interface AvailabilityCheck {
  service_id: string;
  professional_id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface AvailabilityResult {
  available: boolean;
  conflicts: Array<{
    type: 'appointment' | 'blocked' | 'outside_hours';
    start_time: string;
    end_time: string;
    description: string;
  }>;
  warnings: Array<{
    type: 'short_break' | 'late_hour' | 'early_hour';
    message: string;
  }>;
}

// Form validation schemas
export interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface ServiceFormErrors {
  name?: string;
  description?: string;
  duration_minutes?: string;
  price?: string;
  is_active?: string;
}

// Table column definitions
export interface ServiceTableColumn {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  actions?: string;
}

// API Response types
export interface ServicesResponse {
  data: Service[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ServiceResponse {
  data: Service;
  message?: string;
}

export interface ServiceMutationResponse {
  success: boolean;
  data?: Service;
  error?: string;
  message?: string;
}
