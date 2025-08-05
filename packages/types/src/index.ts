/**
 * NeonPro Types Package
 * Shared TypeScript types for healthcare platform
 */

// Patient types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: "M" | "F" | "O";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Doctor types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
  department: string;
  status: "active" | "inactive";
  working_hours: Record<string, { start: string; end: string }>;
}

// Appointment types
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration_minutes: number;
  appointment_type: "consultation" | "follow_up" | "emergency" | "surgery";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
