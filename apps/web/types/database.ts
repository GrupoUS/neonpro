// Database types for type-safe Supabase operations

export interface AuditEvent {
  id?: string;
  event_type: string;
  table_name: string;
  record_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  user_id?: string | null;
  created_at: string;
  tenant_id?: string | null;
}

export type AuditEventInsert = Omit<AuditEvent, "id">;
