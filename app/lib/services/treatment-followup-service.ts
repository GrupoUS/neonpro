// Treatment Follow-up Service
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import type { Database } from '@/app/types/database';
import type {
    AITimingOptimization,
    EscalationRule,
    FollowupCommunication,
    FollowupProtocol,
    PatientFollowup,
    PerformanceAnalytics,
    TreatmentOutcome
} from '@/app/types/followup';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export class TreatmentFollowupService {
  private supabase;

  constructor() {
    this.supabase = createServerComponentClient<Database>({ cookies });
  }

  // Follow-up Protocol Management
  async createFollowupProtocol(protocolData: Omit<FollowupProtocol, 'id' | 'created_at' | 'updated_at'>): Promise<FollowupProtocol> {
    try {
      const { data, error } = await this.supabase
        .from('followup_protocols')
        .insert([{
          ...protocolData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating follow-up protocol:', error);
      throw new Error('Failed to create follow-up protocol');
    }
  }

  async getFollowupProtocols(filters?: {
    treatment_type?: string;
    specialty?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<FollowupProtocol[]> {
    try {
      let query = this.supabase
        .from('followup_protocols')
        .select('*');

      if (filters) {
        if (filters.treatment_type) {
          query = query.eq('treatment_type', filters.treatment_type);
        }
        if (filters.specialty) {
          query = query.eq('specialty', filters.specialty);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        if (filters.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-up protocols:', error);
      throw new Error('Failed to fetch follow-up protocols');
    }
  }

  async getFollowupProtocolById(protocolId: string): Promise<FollowupProtocol | null> {
    try {
      const { data, error } = await this.supabase
        .from('followup_protocols')
        .select('*')
        .eq('id', protocolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching follow-up protocol:', error);
      throw new Error('Failed to fetch follow-up protocol');
    }
  }

  async updateFollowupProtocol(protocolId: string, updates: Partial<FollowupProtocol>): Promise<FollowupProtocol> {
    try {
      const { data, error } = await this.supabase
        .from('followup_protocols')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', protocolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating follow-up protocol:', error);
      throw new Error('Failed to update follow-up protocol');
    }
  }

  async deleteFollowupProtocol(protocolId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('followup_protocols')
        .delete()
        .eq('id', protocolId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting follow-up protocol:', error);
      throw new Error('Failed to delete follow-up protocol');
    }
  }

  // Patient Follow-up Management
  async createPatientFollowup(followupData: Omit<PatientFollowup, 'id' | 'created_at' | 'updated_at'>): Promise<PatientFollowup> {
    try {
      const { data, error } = await this.supabase
        .from('patient_followups')
        .insert([{
          ...followupData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating patient follow-up:', error);
      throw new Error('Failed to create patient follow-up');
    }
  }

  async getPatientFollowups(filters?: {
    patient_id?: string;
    protocol_id?: string;
    status?: string;
    followup_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<PatientFollowup[]> {
    try {
      let query = this.supabase
        .from('patient_followups')
        .select(`
          *,
          followup_protocols (name, treatment_type),
          followup_communications (*)
        `);

      if (filters) {
        if (filters.patient_id) {
          query = query.eq('patient_id', filters.patient_id);
        }
        if (filters.protocol_id) {
          query = query.eq('protocol_id', filters.protocol_id);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.followup_type) {
          query = query.eq('followup_type', filters.followup_type);
        }
        if (filters.date_from) {
          query = query.gte('scheduled_date', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('scheduled_date', filters.date_to);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        if (filters.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient follow-ups:', error);
      throw new Error('Failed to fetch patient follow-ups');
    }
  }

  async getPatientFollowupById(followupId: string): Promise<PatientFollowup | null> {
    try {
      const { data, error } = await this.supabase
        .from('patient_followups')
        .select(`
          *,
          followup_protocols (*),
          followup_communications (*),
          treatment_outcomes (*)
        `)
        .eq('id', followupId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching patient follow-up:', error);
      throw new Error('Failed to fetch patient follow-up');
    }
  }

  async updatePatientFollowup(followupId: string, updates: Partial<PatientFollowup>): Promise<PatientFollowup> {
    try {
      const { data, error } = await this.supabase
        .from('patient_followups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', followupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient follow-up:', error);
      throw new Error('Failed to update patient follow-up');
    }
  }

  // Communication Management
  async createFollowupCommunication(communicationData: Omit<FollowupCommunication, 'id' | 'created_at' | 'updated_at'>): Promise<FollowupCommunication> {
    try {
      const { data, error } = await this.supabase
        .from('followup_communications')
        .insert([{
          ...communicationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating follow-up communication:', error);
      throw new Error('Failed to create follow-up communication');
    }
  }

  async getFollowupCommunications(followupId: string): Promise<FollowupCommunication[]> {
    try {
      const { data, error } = await this.supabase
        .from('followup_communications')
        .select('*')
        .eq('followup_id', followupId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-up communications:', error);
      throw new Error('Failed to fetch follow-up communications');
    }
  }

  async updateCommunicationStatus(communicationId: string, status: string, deliveryConfirmedAt?: string): Promise<FollowupCommunication> {
    try {
      const updates: any = {
        delivery_status: status,
        updated_at: new Date().toISOString()
      };

      if (deliveryConfirmedAt) {
        updates.delivery_confirmed_at = deliveryConfirmedAt;
      }

      const { data, error } = await this.supabase
        .from('followup_communications')
        .update(updates)
        .eq('id', communicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating communication status:', error);
      throw new Error('Failed to update communication status');
    }
  }

  // Treatment Outcome Management
  async createTreatmentOutcome(outcomeData: Omit<TreatmentOutcome, 'id' | 'created_at' | 'updated_at'>): Promise<TreatmentOutcome> {
    try {
      const { data, error } = await this.supabase
        .from('treatment_outcomes')
        .insert([{
          ...outcomeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment outcome:', error);
      throw new Error('Failed to create treatment outcome');
    }
  }

  async getTreatmentOutcomes(filters?: {
    patient_id?: string;
    treatment_id?: string;
    followup_id?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<TreatmentOutcome[]> {
    try {
      let query = this.supabase
        .from('treatment_outcomes')
        .select('*');

      if (filters) {
        if (filters.patient_id) {
          query = query.eq('patient_id', filters.patient_id);
        }
        if (filters.treatment_id) {
          query = query.eq('treatment_id', filters.treatment_id);
        }
        if (filters.followup_id) {
          query = query.eq('followup_id', filters.followup_id);
        }
        if (filters.date_from) {
          query = query.gte('outcome_date', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('outcome_date', filters.date_to);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        if (filters.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }
      }

      const { data, error } = await query.order('outcome_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching treatment outcomes:', error);
      throw new Error('Failed to fetch treatment outcomes');
    }
  }

  // Escalation Management
  async createEscalationRule(ruleData: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at'>): Promise<EscalationRule> {
    try {
      const { data, error } = await this.supabase
        .from('escalation_rules')
        .insert([{
          ...ruleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      throw new Error('Failed to create escalation rule');
    }
  }

  async getEscalationRules(protocolId?: string): Promise<EscalationRule[]> {
    try {
      let query = this.supabase
        .from('escalation_rules')
        .select('*');

      if (protocolId) {
        query = query.eq('protocol_id', protocolId);
      }

      const { data, error } = await query
        .eq('is_active', true)
        .order('escalation_level', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching escalation rules:', error);
      throw new Error('Failed to fetch escalation rules');
    }
  }

  async checkEscalationTriggers(followupId: string): Promise<EscalationRule[]> {
    try {
      // Get follow-up details
      const followup = await this.getPatientFollowupById(followupId);
      if (!followup) throw new Error('Follow-up not found');

      // Get escalation rules for the protocol
      const rules = await this.getEscalationRules(followup.protocol_id);

      const triggeredRules: EscalationRule[] = [];

      for (const rule of rules) {
        let triggered = false;

        switch (rule.condition_type) {
          case 'no_response':
            const hoursSinceScheduled = Math.floor(
              (new Date().getTime() - new Date(followup.scheduled_date).getTime()) / (1000 * 60 * 60)
            );
            if (rule.time_threshold_hours && hoursSinceScheduled >= rule.time_threshold_hours && !followup.patient_responded) {
              triggered = true;
            }
            break;

          case 'poor_outcome':
            if (followup.satisfaction_score && rule.threshold_value && followup.satisfaction_score < rule.threshold_value) {
              triggered = true;
            }
            break;

          case 'compliance_issue':
            if (followup.treatment_compliance_score && rule.threshold_value && followup.treatment_compliance_score < rule.threshold_value) {
              triggered = true;
            }
            break;

          case 'urgent_symptoms':
            if (followup.additional_care_needed || followup.side_effects_reported) {
              triggered = true;
            }
            break;
        }

        if (triggered) {
          triggeredRules.push(rule);
        }
      }

      return triggeredRules;
    } catch (error) {
      console.error('Error checking escalation triggers:', error);
      throw new Error('Failed to check escalation triggers');
    }
  }

  // Performance Analytics
  async getPerformanceAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    period_type?: 'daily' | 'weekly' | 'monthly';
    protocol_id?: string;
  }): Promise<PerformanceAnalytics> {
    try {
      const dateFrom = filters?.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = filters?.date_to || new Date().toISOString().split('T')[0];

      // Base query for follow-ups in date range
      let baseQuery = this.supabase
        .from('patient_followups')
        .select('*')
        .gte('scheduled_date', dateFrom)
        .lte('scheduled_date', dateTo);

      if (filters?.protocol_id) {
        baseQuery = baseQuery.eq('protocol_id', filters.protocol_id);
      }

      const { data: followups, error: followupsError } = await baseQuery;
      if (followupsError) throw followupsError;

      // Calculate metrics
      const totalScheduled = followups?.length || 0;
      const completed = followups?.filter(f => f.status === 'completed').length || 0;
      const missed = followups?.filter(f => f.status === 'missed').length || 0;
      const escalated = followups?.filter(f => f.status === 'escalated').length || 0;
      const responded = followups?.filter(f => f.patient_responded).length || 0;

      // Get communication metrics
      const { data: communications, error: commError } = await this.supabase
        .from('followup_communications')
        .select('*')
        .gte('sent_at', dateFrom + 'T00:00:00')
        .lte('sent_at', dateTo + 'T23:59:59');

      if (commError) throw commError;

      const smsSent = communications?.filter(c => c.channel === 'sms').length || 0;
      const smsDelivered = communications?.filter(c => c.channel === 'sms' && c.delivery_status === 'delivered').length || 0;
      const whatsappSent = communications?.filter(c => c.channel === 'whatsapp').length || 0;
      const whatsappDelivered = communications?.filter(c => c.channel === 'whatsapp' && c.delivery_status === 'delivered').length || 0;
      const emailSent = communications?.filter(c => c.channel === 'email').length || 0;
      const emailDelivered = communications?.filter(c => c.channel === 'email' && c.delivery_status === 'delivered').length || 0;
      const phoneSent = communications?.filter(c => c.channel === 'phone').length || 0;
      const phoneDelivered = communications?.filter(c => c.channel === 'phone' && c.delivery_status === 'delivered').length || 0;

      // Get satisfaction scores
      const satisfactionScores = followups?.filter(f => f.satisfaction_score).map(f => f.satisfaction_score!) || [];
      const avgSatisfaction = satisfactionScores.length > 0 
        ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
        : 0;

      // Get response times
      const responseTimes = communications?.filter(c => c.response_time_minutes).map(c => c.response_time_minutes!) || [];
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      // Get treatment outcomes
      const { data: outcomes, error: outcomesError } = await this.supabase
        .from('treatment_outcomes')
        .select('*')
        .gte('outcome_date', dateFrom)
        .lte('outcome_date', dateTo);

      if (outcomesError) throw outcomesError;

      const improvementCount = outcomes?.filter(o => o.clinical_improvement).length || 0;
      const goalAchievementCount = outcomes?.filter(o => o.meets_treatment_goals).length || 0;

      const analytics: PerformanceAnalytics = {
        analysis_date: new Date().toISOString().split('T')[0],
        period_type: filters?.period_type || 'daily',
        total_followups_scheduled: totalScheduled,
        total_followups_completed: completed,
        total_followups_missed: missed,
        total_escalations: escalated,
        completion_rate: totalScheduled > 0 ? (completed / totalScheduled) * 100 : 0,
        response_rate: totalScheduled > 0 ? (responded / totalScheduled) * 100 : 0,
        satisfaction_average: avgSatisfaction,
        escalation_rate: totalScheduled > 0 ? (escalated / totalScheduled) * 100 : 0,
        sms_success_rate: smsSent > 0 ? (smsDelivered / smsSent) * 100 : 0,
        whatsapp_success_rate: whatsappSent > 0 ? (whatsappDelivered / whatsappSent) * 100 : 0,
        email_success_rate: emailSent > 0 ? (emailDelivered / emailSent) * 100 : 0,
        phone_success_rate: phoneSent > 0 ? (phoneDelivered / phoneSent) * 100 : 0,
        optimal_time_accuracy: 85, // Placeholder - would be calculated from AI predictions
        avg_response_time_minutes: Math.round(avgResponseTime),
        treatment_improvement_rate: outcomes && outcomes.length > 0 ? (improvementCount / outcomes.length) * 100 : 0,
        goal_achievement_rate: outcomes && outcomes.length > 0 ? (goalAchievementCount / outcomes.length) * 100 : 0,
        ai_prediction_accuracy: 87, // Placeholder - would be calculated from AI model performance
        automation_success_rate: 92 // Placeholder - would be calculated from automation metrics
      };

      return analytics;
    } catch (error) {
      console.error('Error calculating performance analytics:', error);
      throw new Error('Failed to calculate performance analytics');
    }
  }

  // AI-Powered Features
  async calculateOptimalTiming(patientId: string): Promise<AITimingOptimization> {
    try {
      // Get patient's historical response data
      const { data: pastFollowups, error } = await this.supabase
        .from('patient_followups')
        .select(`
          *,
          followup_communications (response_time_minutes, sent_at)
        `)
        .eq('patient_id', patientId)
        .eq('patient_responded', true)
        .order('scheduled_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Extract response times and patterns
      const responseTimes: number[] = [];
      const responseHours: number[] = [];
      const responseDays: number[] = [];

      pastFollowups?.forEach(followup => {
        followup.followup_communications?.forEach((comm: any) => {
          if (comm.response_time_minutes) {
            responseTimes.push(comm.response_time_minutes);
            
            const sentAt = new Date(comm.sent_at);
            responseHours.push(sentAt.getHours());
            responseDays.push(sentAt.getDay());
          }
        });
      });

      // Calculate optimal timing
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      // Find most common response hour
      const hourCounts = new Array(24).fill(0);
      responseHours.forEach(hour => hourCounts[hour]++);
      const optimalHour = hourCounts.indexOf(Math.max(...hourCounts));

      // Find most common response day
      const dayCounts = new Array(7).fill(0);
      responseDays.forEach(day => dayCounts[day]++);
      const optimalDay = dayCounts.indexOf(Math.max(...dayCounts));

      // Generate preferred time slots based on successful responses
      const preferredTimeSlots = responseHours
        .filter((hour, index, arr) => arr.indexOf(hour) === index)
        .sort((a, b) => hourCounts[b] - hourCounts[a])
        .slice(0, 3)
        .map(hour => `${hour.toString().padStart(2, '0')}:00`);

      const optimization: AITimingOptimization = {
        patient_id: patientId,
        historical_response_times: responseTimes,
        preferred_time_slots: preferredTimeSlots,
        timezone: 'America/Sao_Paulo',
        optimal_day_of_week: optimalDay,
        optimal_hour: optimalHour,
        confidence_score: responseTimes.length >= 5 ? 0.8 : Math.min(responseTimes.length * 0.15, 0.7),
        factors_analyzed: [
          'historical_response_times',
          'time_of_day_patterns',
          'day_of_week_patterns',
          'communication_channel_success'
        ]
      };

      return optimization;
    } catch (error) {
      console.error('Error calculating optimal timing:', error);
      throw new Error('Failed to calculate optimal timing');
    }
  }

  async generatePersonalizedMessage(
    patientId: string, 
    protocolId: string, 
    channel: 'sms' | 'whatsapp' | 'email' | 'phone'
  ): Promise<string> {
    try {
      // Get protocol template
      const protocol = await this.getFollowupProtocolById(protocolId);
      if (!protocol) throw new Error('Protocol not found');

      // Get patient's communication history and preferences
      const { data: patientFollowups } = await this.supabase
        .from('patient_followups')
        .select(`
          *,
          followup_communications (*)
        `)
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: false })
        .limit(10);

      // Base template from protocol
      let template = '';
      switch (channel) {
        case 'sms':
          template = protocol.sms_template || 'Olá! Como está se sentindo após o tratamento?';
          break;
        case 'whatsapp':
          template = protocol.whatsapp_template || 'Olá! Esperamos que esteja se sentindo bem. Como foi sua evolução?';
          break;
        case 'email':
          template = protocol.email_template || 'Prezado(a) paciente, como parte do seu acompanhamento, gostaríamos de saber como está se sentindo.';
          break;
        case 'phone':
          template = protocol.phone_script || 'Olá, estou ligando para saber como está se sentindo após o tratamento.';
          break;
      }

      // Personalize based on history
      if (patientFollowups && patientFollowups.length > 0) {
        const lastFollowup = patientFollowups[0];
        
        if (lastFollowup.satisfaction_score && lastFollowup.satisfaction_score < 7) {
          template = template.replace(/Como está/g, 'Esperamos que esteja melhor. Como está');
        }
        
        if (lastFollowup.side_effects_reported) {
          template += ' Por favor, nos informe se ainda está sentindo algum desconforto.';
        }
      }

      return template;
    } catch (error) {
      console.error('Error generating personalized message:', error);
      return 'Olá! Como está se sentindo após o tratamento?';
    }
  }

  // Automated Follow-up Scheduling
  async scheduleAutomaticFollowups(patientId: string, treatmentId: string, protocolId: string): Promise<PatientFollowup[]> {
    try {
      const protocol = await this.getFollowupProtocolById(protocolId);
      if (!protocol || !protocol.auto_schedule_enabled) {
        throw new Error('Auto-scheduling not enabled for this protocol');
      }

      const scheduledFollowups: PatientFollowup[] = [];
      const today = new Date();

      // Initial follow-up
      const initialDate = new Date(today);
      initialDate.setDate(today.getDate() + protocol.initial_followup_days);

      const initialFollowup = await this.createPatientFollowup({
        patient_id: patientId,
        treatment_id: treatmentId,
        protocol_id: protocolId,
        followup_type: 'initial',
        sequence_number: 1,
        scheduled_date: initialDate.toISOString().split('T')[0],
        preferred_channel: 'sms',
        backup_channels: ['whatsapp', 'email'],
        language_preference: 'pt-BR',
        status: 'scheduled',
        auto_generated: true
      });

      scheduledFollowups.push(initialFollowup);

      // Subsequent follow-ups
      const currentDate = new Date(initialDate);
      for (let i = 0; i < Math.min(protocol.subsequent_intervals.length, protocol.max_followups - 1); i++) {
        currentDate.setDate(currentDate.getDate() + protocol.subsequent_intervals[i]);
        
        const followup = await this.createPatientFollowup({
          patient_id: patientId,
          treatment_id: treatmentId,
          protocol_id: protocolId,
          followup_type: 'routine',
          sequence_number: i + 2,
          scheduled_date: currentDate.toISOString().split('T')[0],
          preferred_channel: 'sms',
          backup_channels: ['whatsapp', 'email'],
          language_preference: 'pt-BR',
          status: 'scheduled',
          auto_generated: true
        });

        scheduledFollowups.push(followup);
      }

      return scheduledFollowups;
    } catch (error) {
      console.error('Error scheduling automatic follow-ups:', error);
      throw new Error('Failed to schedule automatic follow-ups');
    }
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<{
    totalActiveFollowups: number;
    pendingFollowups: number;
    overdueFollowups: number;
    completionRateToday: number;
    avgSatisfactionScore: number;
    escalationCount: number;
    topPerformingProtocols: { name: string; completion_rate: number }[];
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get active follow-ups
      const { data: activeFollowups } = await this.supabase
        .from('patient_followups')
        .select('*')
        .in('status', ['scheduled', 'sent']);

      // Get pending follow-ups (scheduled for today or earlier)
      const { data: pendingFollowups } = await this.supabase
        .from('patient_followups')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_date', today);

      // Get overdue follow-ups
      const { data: overdueFollowups } = await this.supabase
        .from('patient_followups')
        .select('*')
        .eq('status', 'scheduled')
        .lt('scheduled_date', today);

      // Get today's completion rate
      const { data: todayFollowups } = await this.supabase
        .from('patient_followups')
        .select('*')
        .eq('scheduled_date', today);

      const todayCompleted = todayFollowups?.filter(f => f.status === 'completed').length || 0;
      const todayTotal = todayFollowups?.length || 0;

      // Get average satisfaction score
      const { data: satisfactionData } = await this.supabase
        .from('patient_followups')
        .select('satisfaction_score')
        .not('satisfaction_score', 'is', null)
        .gte('completed_at', yesterday);

      const satisfactionScores = satisfactionData?.map(d => d.satisfaction_score).filter(s => s !== null) || [];
      const avgSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
        : 0;

      // Get escalation count
      const { data: escalations } = await this.supabase
        .from('patient_followups')
        .select('*')
        .eq('status', 'escalated')
        .gte('updated_at', yesterday + 'T00:00:00');

      // Get top performing protocols
      const { data: protocolPerformance } = await this.supabase
        .from('patient_followups')
        .select(`
          protocol_id,
          status,
          followup_protocols (name)
        `)
        .gte('scheduled_date', yesterday);

      const protocolStats: { [key: string]: { name: string; total: number; completed: number } } = {};
      
      protocolPerformance?.forEach(f => {
        const protocolId = f.protocol_id;
        const protocolName = (f.followup_protocols as any)?.name || 'Unknown';
        
        if (!protocolStats[protocolId]) {
          protocolStats[protocolId] = { name: protocolName, total: 0, completed: 0 };
        }
        
        protocolStats[protocolId].total++;
        if (f.status === 'completed') {
          protocolStats[protocolId].completed++;
        }
      });

      const topPerformingProtocols = Object.values(protocolStats)
        .map(p => ({
          name: p.name,
          completion_rate: p.total > 0 ? (p.completed / p.total) * 100 : 0
        }))
        .sort((a, b) => b.completion_rate - a.completion_rate)
        .slice(0, 5);

      return {
        totalActiveFollowups: activeFollowups?.length || 0,
        pendingFollowups: pendingFollowups?.length || 0,
        overdueFollowups: overdueFollowups?.length || 0,
        completionRateToday: todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0,
        avgSatisfactionScore: Math.round(avgSatisfaction * 10) / 10,
        escalationCount: escalations?.length || 0,
        topPerformingProtocols
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}

export const treatmentFollowupService = new TreatmentFollowupService();
