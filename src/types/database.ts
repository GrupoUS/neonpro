
export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  instagram_handle?: string;
  birthdate?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  specialty?: string;
  bio?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string;
  service_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price_at_booking: number;
  created_at: string;
  updated_at: string;
  // These are not from the database but may be joined in queries
  client?: Client;
  service?: Service;
  professional?: Professional;
}

export interface Transaction {
  id: string;
  user_id: string;
  appointment_id?: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  // These are not from the database but may be joined in queries
  appointment?: Appointment;
}

export interface ClinicSettings {
  id: string;
  user_id: string;
  clinic_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  business_hours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
  created_at: string;
  updated_at: string;
}
