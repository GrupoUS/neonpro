import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface LGPDMetrics {
  compliance_percentage: number;
  active_consents: number;
  pending_requests: number;
  active_breaches: number;
  total_users: number;
  consent_rate: number;
  avg_response_time: number;
  last_assessment: string | null;
}

export interface ConsentData {
  user_id: string;
  purpose_id: string;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
  expires_at?: string;
}

export interface DataSubjectRequestData {
  user_id: string;
  request_type:
    | 'access'
    | 'rectification'
    | 'erasure'
    | 'portability'
    | 'restriction'
    | 'objection';
  description?: string;
}

export interface BreachIncidentData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_users: number;
  data_types: string[];
  discovered_at: string;
  reported_by: string;
}

export interface AuditEventData {
  event_type: string;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export class LGPDComplianceManager {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<LGPDMetrics> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_lgpd_dashboard_metrics'
      );

      if (error) {
        throw error;
      }

      return (
        data || {
          compliance_percentage: 0,
          active_consents: 0,
          pending_requests: 0,
          active_breaches: 0,
          total_users: 0,
          consent_rate: 0,
          avg_response_time: 0,
          last_assessment: null,
        }
      );
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to fetch dashboard metrics');
    }
  }

  // Consent Management
  async getConsents(
    filters: {
      user_id?: string;
      purpose_id?: string;
      granted?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      let query = this.supabase.from('lgpd_user_consents').select(`
          *,
          lgpd_consent_purposes!inner(
            id,
            name,
            description,
            category,
            required
          )
        `);

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.purpose_id) {
        query = query.eq('purpose_id', filters.purpose_id);
      }

      if (filters.granted !== undefined) {
        query = query.eq('granted', filters.granted);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        consents: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching consents:', error);
      throw new Error('Failed to fetch consents');
    }
  }

  async createOrUpdateConsent(consentData: ConsentData) {
    try {
      // Check if consent already exists
      const { data: existingConsent } = await this.supabase
        .from('lgpd_user_consents')
        .select('id')
        .eq('user_id', consentData.user_id)
        .eq('purpose_id', consentData.purpose_id)
        .single();

      let result;

      if (existingConsent) {
        // Update existing consent
        const { data, error } = await this.supabase
          .from('lgpd_user_consents')
          .update({
            granted: consentData.granted,
            granted_at: consentData.granted ? new Date().toISOString() : null,
            withdrawn_at: consentData.granted ? null : new Date().toISOString(),
            expires_at: consentData.expires_at,
            ip_address: consentData.ip_address,
            user_agent: consentData.user_agent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConsent.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      } else {
        // Create new consent
        const { data, error } = await this.supabase
          .from('lgpd_user_consents')
          .insert({
            user_id: consentData.user_id,
            purpose_id: consentData.purpose_id,
            granted: consentData.granted,
            granted_at: consentData.granted ? new Date().toISOString() : null,
            withdrawn_at: consentData.granted ? null : new Date().toISOString(),
            expires_at: consentData.expires_at,
            ip_address: consentData.ip_address,
            user_agent: consentData.user_agent,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'consent_management',
        user_id: consentData.user_id,
        resource_type: 'consent',
        resource_id: result.id,
        action: consentData.granted ? 'consent_granted' : 'consent_withdrawn',
        details: {
          purpose_id: consentData.purpose_id,
          granted: consentData.granted,
        },
        ip_address: consentData.ip_address,
        user_agent: consentData.user_agent,
      });

      return result;
    } catch (error) {
      console.error('Error creating/updating consent:', error);
      throw new Error('Failed to create or update consent');
    }
  }

  async withdrawConsent(consentId: string, userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_user_consents')
        .update({
          granted: false,
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', consentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'consent_management',
        user_id: userId,
        resource_type: 'consent',
        resource_id: consentId,
        action: 'consent_withdrawn',
        details: {
          purpose_id: data.purpose_id,
        },
      });

      return data;
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw new Error('Failed to withdraw consent');
    }
  }

  // Data Subject Rights
  async getDataSubjectRequests(
    filters: {
      user_id?: string;
      request_type?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      let query = this.supabase.from('lgpd_data_subject_requests').select('*');

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.request_type) {
        query = query.eq('request_type', filters.request_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('requested_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        requests: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching data subject requests:', error);
      throw new Error('Failed to fetch data subject requests');
    }
  }

  async createDataSubjectRequest(requestData: DataSubjectRequestData) {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .insert({
          user_id: requestData.user_id,
          request_type: requestData.request_type,
          description: requestData.description,
          status: 'pending',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'data_subject_rights',
        user_id: requestData.user_id,
        resource_type: 'data_subject_request',
        resource_id: data.id,
        action: 'request_created',
        details: {
          request_type: requestData.request_type,
          description: requestData.description,
        },
      });

      return data;
    } catch (error) {
      console.error('Error creating data subject request:', error);
      throw new Error('Failed to create data subject request');
    }
  }

  async updateDataSubjectRequest(
    requestId: string,
    updateData: {
      status?: string;
      response_data?: any;
      notes?: string;
      processed_by?: string;
    }
  ) {
    try {
      const updateFields: any = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      if (
        updateData.status === 'completed' ||
        updateData.status === 'rejected'
      ) {
        updateFields.processed_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .update(updateFields)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'data_subject_rights',
        user_id: data.user_id,
        resource_type: 'data_subject_request',
        resource_id: requestId,
        action: 'request_updated',
        details: {
          status: updateData.status,
          processed_by: updateData.processed_by,
        },
      });

      return data;
    } catch (error) {
      console.error('Error updating data subject request:', error);
      throw new Error('Failed to update data subject request');
    }
  }

  // Breach Management
  async getBreachIncidents(
    filters: {
      severity?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      let query = this.supabase.from('lgpd_breach_incidents').select('*');

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('discovered_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        breaches: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching breach incidents:', error);
      throw new Error('Failed to fetch breach incidents');
    }
  }

  async reportBreachIncident(breachData: BreachIncidentData) {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_breach_incidents')
        .insert({
          title: breachData.title,
          description: breachData.description,
          severity: breachData.severity,
          status: 'reported',
          affected_users: breachData.affected_users,
          data_types: breachData.data_types,
          discovered_at: breachData.discovered_at,
          reported_at: new Date().toISOString(),
          reported_by: breachData.reported_by,
          authority_notified: false,
          users_notified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'breach_management',
        user_id: breachData.reported_by,
        resource_type: 'breach_incident',
        resource_id: data.id,
        action: 'breach_reported',
        details: {
          title: breachData.title,
          severity: breachData.severity,
          affected_users: breachData.affected_users,
        },
      });

      return data;
    } catch (error) {
      console.error('Error reporting breach incident:', error);
      throw new Error('Failed to report breach incident');
    }
  }

  async updateBreachIncident(
    breachId: string,
    updateData: {
      status?: string;
      severity?: string;
      assigned_to?: string;
      authority_notified?: boolean;
      users_notified?: boolean;
      mitigation_steps?: string;
    }
  ) {
    try {
      const updateFields: any = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      if (updateData.status === 'resolved') {
        updateFields.resolved_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('lgpd_breach_incidents')
        .update(updateFields)
        .eq('id', breachId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'breach_management',
        resource_type: 'breach_incident',
        resource_id: breachId,
        action: 'breach_updated',
        details: {
          status: updateData.status,
          assigned_to: updateData.assigned_to,
          authority_notified: updateData.authority_notified,
          users_notified: updateData.users_notified,
        },
      });

      return data;
    } catch (error) {
      console.error('Error updating breach incident:', error);
      throw new Error('Failed to update breach incident');
    }
  }

  // Audit Trail
  async getAuditEvents(
    filters: {
      event_type?: string;
      user_id?: string;
      resource_type?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      let query = this.supabase.from('lgpd_audit_trail').select('*');

      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 100;
      const offset = (page - 1) * limit;

      query = query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        events: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching audit events:', error);
      throw new Error('Failed to fetch audit events');
    }
  }

  async logAuditEvent(eventData: AuditEventData) {
    try {
      const { error } = await this.supabase.from('lgpd_audit_trail').insert({
        event_type: eventData.event_type,
        user_id: eventData.user_id,
        resource_type: eventData.resource_type,
        resource_id: eventData.resource_id,
        action: eventData.action,
        details: eventData.details,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Compliance Assessment
  async getComplianceAssessments(
    filters: {
      assessment_type?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      let query = this.supabase.from('lgpd_compliance_assessments').select('*');

      if (filters.assessment_type) {
        query = query.eq('assessment_type', filters.assessment_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        assessments: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching compliance assessments:', error);
      throw new Error('Failed to fetch compliance assessments');
    }
  }

  async createComplianceAssessment(assessmentData: {
    assessment_type: 'manual' | 'automated';
    conducted_by?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_compliance_assessments')
        .insert({
          assessment_type: assessmentData.assessment_type,
          status: 'pending',
          max_score: 100,
          conducted_by: assessmentData.conducted_by,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'compliance_assessment',
        user_id: assessmentData.conducted_by,
        resource_type: 'compliance_assessment',
        resource_id: data.id,
        action: 'assessment_created',
        details: {
          assessment_type: assessmentData.assessment_type,
        },
      });

      return data;
    } catch (error) {
      console.error('Error creating compliance assessment:', error);
      throw new Error('Failed to create compliance assessment');
    }
  }

  async runAutomatedAssessment() {
    try {
      // Call the stored procedure for automated assessment
      const { data, error } = await this.supabase.rpc(
        'run_compliance_assessment'
      );

      if (error) {
        throw error;
      }

      // Log audit event
      await this.logAuditEvent({
        event_type: 'compliance_assessment',
        resource_type: 'compliance_assessment',
        action: 'automated_assessment_executed',
        details: {
          assessment_type: 'automated',
        },
      });

      return data;
    } catch (error) {
      console.error('Error running automated assessment:', error);
      throw new Error('Failed to run automated assessment');
    }
  }

  // Utility Methods
  async getAuditStatistics(
    filters: { start_date?: string; end_date?: string } = {}
  ) {
    try {
      let query = this.supabase
        .from('lgpd_audit_trail')
        .select('event_type, action');

      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process statistics
      const stats = {
        total_events: data?.length || 0,
        by_event_type: {} as Record<string, number>,
        by_action: {} as Record<string, number>,
      };

      data?.forEach((event) => {
        stats.by_event_type[event.event_type] =
          (stats.by_event_type[event.event_type] || 0) + 1;
        stats.by_action[event.action] =
          (stats.by_action[event.action] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw new Error('Failed to fetch audit statistics');
    }
  }

  async getBreachStatistics() {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_breach_incidents')
        .select('severity, status');

      if (error) {
        throw error;
      }

      const stats = {
        total_breaches: data?.length || 0,
        by_severity: {} as Record<string, number>,
        by_status: {} as Record<string, number>,
      };

      data?.forEach((breach) => {
        stats.by_severity[breach.severity] =
          (stats.by_severity[breach.severity] || 0) + 1;
        stats.by_status[breach.status] =
          (stats.by_status[breach.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching breach statistics:', error);
      throw new Error('Failed to fetch breach statistics');
    }
  }
}
