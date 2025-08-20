import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!(supabaseUrl && supabaseServiceKey)) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for database operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database helper functions
export class DatabaseService {
  // Patient operations
  async getPatients() {
    const { data, error } = await supabase.from('patients').select('*');

    if (error) throw error;
    return data;
  }

  async getPatientById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createPatient(patient: any) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Clinic operations
  async getClinics() {
    const { data, error } = await supabase.from('clinics').select('*');

    if (error) throw error;
    return data;
  }

  // Appointment operations
  async getAppointments() {
    const { data, error } = await supabase.from('appointments').select('*');

    if (error) throw error;
    return data;
  }

  async createAppointment(appointment: any) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('count')
        .limit(1);
      return { status: 'healthy', connected: true, error: null };
    } catch (error) {
      return { status: 'unhealthy', connected: false, error: error.message };
    }
  }
}

export const db = new DatabaseService();
