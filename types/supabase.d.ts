// Supabase types and database schema
import { Database } from "@supabase/supabase-js";

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

// Auth types
export interface User {
  id: string;
  email: string;
  role: "doctor" | "nurse" | "admin" | "patient" | "receptionist";
  tenantId: string;
  permissions: string[];
  licenseNumber?: string;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

// Database table types
export interface Patient {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  birthDate: string;
  address?: string;
  emergencyContact?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  licenseNumber: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  attachments?: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  providerId?: string;
  amount: number;
  status: "pending" | "paid" | "cancelled" | "overdue";
  description: string;
  dueDate: string;
  paidAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Supabase client types
export interface SupabaseClientOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

// Export main database type
export type { Database };
