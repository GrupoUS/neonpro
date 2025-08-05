// =====================================================================================
// TREATMENT FOLLOW-UP SERVICE
// Epic 7.3: Comprehensive service layer for follow-up automation
// =====================================================================================

import { createClient } from '@/lib/supabase/client';
import type {
  TreatmentFollowup,
  FollowupTemplate,
  TreatmentProtocol,
  CreateFollowupData,
  CreateFollowupTemplateData,
  CreateTreatmentProtocolData,
  FollowupFilters,
  TemplateFilters,
  ProtocolFilters,
  FollowupResponse,
  FollowupAnalytics,
  FollowupDashboardSummary,
  BulkFollowupOperation,
  TreatmentOutcome
} from '@/app/types/treatment-followups';

class TreatmentFollowupService {
  // Supabase client created per method for proper request context

  // =====================================================================================
  // FOLLOW-UP MANAGEMENT
  // =====================================================================================

  /**
   * Get follow-ups with filtering and pagination
   */
  async getFollowups(filters: FollowupFilters = {}): Promise<TreatmentFollowup[]> {
    try {
      let query = supabase
        .from('treatment_followups')
        .select(`
          *,
          template:followup_templates(*),
          patient:patients(id, name, phone, email, whatsapp),
          responses:followup_responses(*),
          attachments:followup_attachments(*)
        `);

      // Apply filters
      if (filters.status) {
        query = query.in('status', filters.status);
      }
      if (filters.followup_type) {
        query = query.in('followup_type', filters.followup_type);
      }
      if (filters.communication_method) {
        query = query.in('communication_method', filters.communication_method);
      }
      if (filters.priority) {
        query = query.in('priority', filters.priority);
      }
      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }
      if (filters.patient_id) {
        query = query.eq('patient_id', filters.patient_id);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.date_from) {
        query = query.gte('scheduled_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('scheduled_date', filters.date_to);
      }
      if (filters.automated !== undefined) {
        query = query.eq('automated', filters.automated);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      // Order by scheduled date
      query = query.order('scheduled_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching follow-ups:', error);
        throw new Error(`Failed to fetch follow-ups: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getFollowups:', error);
      throw error;
    }
  }

  /**
   * Get single follow-up by ID
   */
  async getFollowupById(id: string): Promise<TreatmentFollowup | null> {
    try {
    const supabase = await createClient();
      const { data, error } = await supabase
        .from('treatment_followups')
        .select(`
          *,
          template:followup_templates(*),
          patient:patients(id, name, phone, email, whatsapp),
          responses:followup_responses(*),
          attachments:followup_attachments(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching follow-up:', error);
        throw new Error(`Failed to fetch follow-up: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Service error in getFollowupById:', error);
      throw error;
    }
  }

  /**
   * Create new follow-up
   */
  async createFollowup(data: CreateFollowupData): Promise<TreatmentFollowup> {
    try {
      const followupData = {
        ...data,
        scheduled_date: data.scheduled_date.toISOString(),
        status: 'pending' as const,
        automated: data.automated ?? true,
        priority: data.priority ?? 'normal' as const
      };

      const { data: newFollowup, error } = await supabase
        .from('treatment_followups')
        .insert(followupData)
        .select(`
          *,
          template:followup_templates(*),
          patient:patients(id, name, phone, email, whatsapp)
        `)
        .single();

      if (error) {
        console.error('Error creating follow-up:', error);
        throw new Error(`Failed to create follow-up: ${error.message}`);
      }

      return newFollowup;
    } catch (error) {
      console.error('Service error in createFollowup:', error);
      throw error;
    }
  }

  /**
   * Update follow-up
   */
  async updateFollowup(id: string, updates: Partial<TreatmentFollowup>): Promise<TreatmentFollowup> {
    try {
    const supabase = await createClient();
      const { data, error } = await supabase
        .from('treatment_followups')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          template:followup_templates(*),
          patient:patients(id, name, phone, email, whatsapp)
        `)
        .single();

      if (error) {
        console.error('Error updating follow-up:', error);
        throw new Error(`Failed to update follow-up: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Service error in updateFollowup:', error);
      throw error;
    }
  }

  /**
   * Delete follow-up
   */
  async deleteFollowup(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('treatment_followups')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting follow-up:', error);
        throw new Error(`Failed to delete follow-up: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error in deleteFollowup:', error);
      throw error;
    }
  }

  /**
   * Mark follow-up as completed
   */
  async completeFollowup(id: string, notes?: string): Promise<TreatmentFollowup> {
    try {
      const updates = {
        status: 'completed' as const,
        completed_date: new Date().toISOString(),
        ...(notes && { notes })
      };

      return await this.updateFollowup(id, updates);
    } catch (error) {
      console.error('Service error in completeFollowup:', error);
      throw error;
    }
  }

  // =====================================================================================
  // TEMPLATE MANAGEMENT
  // =====================================================================================

  /**
   * Get follow-up templates
   */
  async getTemplates(filters: TemplateFilters = {}): Promise<FollowupTemplate[]> {
    try {
      let query = supabase
        .from('followup_templates')
        .select('*');

      // Apply filters
      if (filters.treatment_type) {
        query = query.in('treatment_type', filters.treatment_type);
      }
      if (filters.followup_type) {
        query = query.in('followup_type', filters.followup_type);
      }
      if (filters.communication_method) {
        query = query.in('communication_method', filters.communication_method);
      }
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getTemplates:', error);
      throw error;
    }
  }

  /**
   * Create follow-up template
   */
  async createTemplate(data: CreateFollowupTemplateData): Promise<FollowupTemplate> {
    try {
      const templateData = {
        ...data,
        timing_hours: data.timing_hours ?? 0,
        requires_response: data.requires_response ?? false,
        active: data.active ?? true
      };

      const { data: newTemplate, error } = await supabase
        .from('followup_templates')
        .insert(templateData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw new Error(`Failed to create template: ${error.message}`);
      }

      return newTemplate;
    } catch (error) {
      console.error('Service error in createTemplate:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updates: Partial<FollowupTemplate>): Promise<FollowupTemplate> {
    try {
    const supabase = await createClient();
      const { data, error } = await supabase
        .from('followup_templates')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw new Error(`Failed to update template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Service error in updateTemplate:', error);
      throw error;
    }
  }

  // =====================================================================================
  // PROTOCOL MANAGEMENT
  // =====================================================================================

  /**
   * Get treatment protocols
   */
  async getProtocols(filters: ProtocolFilters = {}): Promise<TreatmentProtocol[]> {
    try {
      let query = supabase
        .from('treatment_protocols')
        .select('*');

      // Apply filters
      if (filters.treatment_type) {
        query = query.in('treatment_type', filters.treatment_type);
      }
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching protocols:', error);
        throw new Error(`Failed to fetch protocols: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getProtocols:', error);
      throw error;
    }
  }

  /**
   * Create treatment protocol
   */
  async createProtocol(data: CreateTreatmentProtocolData): Promise<TreatmentProtocol> {
    try {
      const protocolData = {
        ...data,
        next_appointment_suggestion: data.next_appointment_suggestion ?? 30,
        active: data.active ?? true
      };

      const { data: newProtocol, error } = await supabase
        .from('treatment_protocols')
        .insert(protocolData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating protocol:', error);
        throw new Error(`Failed to create protocol: ${error.message}`);
      }

      return newProtocol;
    } catch (error) {
      console.error('Service error in createProtocol:', error);
      throw error;
    }
  }

  // =====================================================================================
  // ANALYTICS AND REPORTING
  // =====================================================================================

  /**
   * Get follow-up analytics
   */
  async getAnalytics(clinicId: string, dateFrom?: string, dateTo?: string): Promise<FollowupAnalytics> {
    try {
      // Get basic counts
    const supabase = await createClient();
      const { data: followups, error } = await supabase
        .from('treatment_followups')
        .select('*, responses:followup_responses(*)')
        .eq('clinic_id', clinicId)
        .gte('created_at', dateFrom || '2024-01-01')
        .lte('created_at', dateTo || new Date().toISOString());

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      const total_followups = followups.length;
      const completed_followups = followups.filter(f => f.status === 'completed').length;
      const pending_followups = followups.filter(f => f.status === 'pending').length;

      // Calculate response rate
      const followupsWithResponses = followups.filter(f => f.responses && f.responses.length > 0).length;
      const response_rate = total_followups > 0 ? (followupsWithResponses / total_followups) * 100 : 0;

      // Calculate satisfaction average
      const satisfactionResponses = followups
        .flatMap(f => f.responses || [])
        .filter(r => r.satisfaction_score !== null && r.satisfaction_score !== undefined);
      
      const satisfaction_average = satisfactionResponses.length > 0
        ? satisfactionResponses.reduce((sum, r) => sum + (r.satisfaction_score || 0), 0) / satisfactionResponses.length
        : 0;

      // Communication method stats
      const communication_method_stats = followups.reduce((stats, f) => {
        stats[f.communication_method] = (stats[f.communication_method] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      // Follow-up type stats
      const followup_type_stats = followups.reduce((stats, f) => {
        stats[f.followup_type] = (stats[f.followup_type] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      return {
        total_followups,
        completed_followups,
        pending_followups,
        response_rate,
        satisfaction_average,
        communication_method_stats,
        followup_type_stats,
        monthly_trends: [] // TODO: Implement monthly trends calculation
      };
    } catch (error) {
      console.error('Service error in getAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(clinicId: string): Promise<FollowupDashboardSummary> {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get today's follow-ups
    const supabase = await createClient();
      const { data: todayFollowups } = await supabase
        .from('treatment_followups')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('scheduled_date', todayStart)
        .lt('scheduled_date', todayEnd);

      // Get pending responses
      const { data: pendingResponses } = await supabase
        .from('treatment_followups')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'sent')
        .is('completed_date', null);

      // Get overdue follow-ups
      const { data: overdueFollowups } = await supabase
        .from('treatment_followups')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending')
        .lt('scheduled_date', todayStart);

      // Get upcoming this week
      const { data: upcomingWeek } = await supabase
        .from('treatment_followups')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('scheduled_date', todayEnd)
        .lt('scheduled_date', weekEnd);

      return {
        today_followups: todayFollowups?.length || 0,
        pending_responses: pendingResponses?.length || 0,
        overdue_followups: overdueFollowups?.length || 0,
        satisfaction_average: 0, // TODO: Calculate from recent responses
        upcoming_this_week: upcomingWeek?.length || 0,
        automation_success_rate: 0, // TODO: Calculate automation success rate
        recent_activities: [] // TODO: Implement recent activities
      };
    } catch (error) {
      console.error('Service error in getDashboardSummary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const treatmentFollowupService = new TreatmentFollowupService();


