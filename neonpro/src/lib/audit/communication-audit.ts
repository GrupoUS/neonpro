import { createClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  action: string;
  entity_type: 'conversation' | 'message' | 'template' | 'notification' | 'consent';
  entity_id: string;
  user_id: string;
  clinic_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log communication audit events
 * @param entry - Audit log entry data
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient();
    
    // Insert audit log entry
    const { error } = await supabase
      .from('communication_audit_log')
      .insert({
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        user_id: entry.user_id,
        clinic_id: entry.clinic_id,
        details: entry.details || {},
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to create audit log entry:', error);
      // Don't throw error to avoid breaking main functionality
    }
  } catch (error) {
    console.error('Error in auditLog function:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

/**
 * Get audit logs for a specific entity
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 * @param clinicId - Clinic ID for security
 * @param limit - Maximum number of entries to return
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  clinicId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('communication_audit_log')
      .select(`
        *,
        user:user_id (
          profiles (
            name,
            role
          )
        )
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAuditLogs function:', error);
    return [];
  }
}

/**
 * Get audit logs for a clinic within a date range
 * @param clinicId - Clinic ID
 * @param fromDate - Start date (ISO string)
 * @param toDate - End date (ISO string)
 * @param action - Optional specific action to filter
 * @param entityType - Optional entity type to filter
 * @param limit - Maximum number of entries to return
 */
export async function getClinicAuditLogs(
  clinicId: string,
  fromDate?: string,
  toDate?: string,
  action?: string,
  entityType?: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('communication_audit_log')
      .select(`
        *,
        user:user_id (
          profiles (
            name,
            role
          )
        )
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch clinic audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClinicAuditLogs function:', error);
    return [];
  }
}