import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@neonpro/database'

export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export interface LogAuditEventOptions {
  supabase: SupabaseClient<Database>
  clinicId: string
  userId?: string | null
  action: AuditLogInsert['action']
  resourceType: AuditLogInsert['resource_type']
  resourceId?: AuditLogInsert['resource_id']
  details?: AuditLogInsert['details']
  createdAt?: AuditLogInsert['created_at']
}

export const logAuditEvent = async ({
  supabase,
  clinicId,
  userId,
  action,
  resourceType,
  resourceId = null,
  details = null,
  createdAt = new Date(),
}: LogAuditEventOptions): Promise<void> => {
  const payload: AuditLogInsert = {
    clinic_id: clinicId,
    user_id: userId ?? null,
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    details,
    created_at: createdAt,
  }

  const { error } = await supabase.from('audit_logs').insert(payload)

  if (error) {
    console.error('Failed to write audit log:', error)
  }
}
