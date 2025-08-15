import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface AuditLogEntry {
  user_id: string;
  event_type: string;
  event_description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogger {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        ...entry,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      // Log errors to console but don't throw to prevent disrupting main flow
      console.error('Failed to write audit log:', error);
    }
  }
}
