import { createSupabaseClient, createSupabaseAdminClient, type DatabaseConfig } from '@neonpro/database';
import { z } from 'zod';

const AppointmentSchema = z.object({
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  service_type: z.string().min(1),
  notes: z.string().optional(),
  lgpd_processing_consent: z.boolean().default(false),
});

export type CreateAppointment = z.infer<typeof AppointmentSchema>;

export class AppointmentService {
  constructor(
    private config: DatabaseConfig,
    private useServiceRole = false
  ) {}

  private getClient() {
    return this.useServiceRole
      ? createSupabaseAdminClient(this.config)
      : createSupabaseClient(this.config);
  }

  async list(clinicId: string) {
    const supabase = this.getClient();
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users(name, email),
        professional:users(name, specialization)
      `)
      .eq('clinic_id', clinicId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }  async create(appointment: CreateAppointment) {
    // Validate input
    const validated = AppointmentSchema.parse(appointment);
    
    const supabase = this.getClient();
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<CreateAppointment>) {
    const supabase = this.getClient();
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancel(id: string, reason?: string) {
    return this.update(id, { 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
  }
}