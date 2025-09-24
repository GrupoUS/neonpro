import { SupabaseClient } from '@neonpro/database';
import { SupabaseClient as SupabaseJSClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schemas for validation
const CommunicationPreferencesSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  preferredLanguage: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
  communicationChannels: z.record(z.boolean()).default({
    email: true,
    sms: true,
    whatsapp: true,
    push_notification: true,
    phone_call: false,
  }),
  communicationFrequency: z.record(z.boolean()).default({
    appointment_reminders: true,
    follow_up_care: true,
    promotional: false,
    educational: true,
    surveys: true,
  }),
  notificationTiming: z.object({
    appointment_reminder_hours: z.array(z.number()).default([48, 24, 2]),
    follow_up_days: z.array(z.number()).default([1, 7, 30]),
    marketing_preference: z.enum(['minimal', 'moderate', 'frequent']).default('minimal'),
  }).default({}),
  doNotContact: z.boolean().default(false),
  doNotContactReason: z.string().optional(),
});

const CommunicationHistorySchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  professionalId: z.string().uuid().optional(),
  communicationType: z.enum([
    'appointment_reminder', 'follow_up_care', 'educational_content', 
    'promotional', 'survey_request', 'birthday_greeting', 'reengagement',
    'treatment_reminder', 'result_follow_up', 'satisfaction_check'
  ]),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push_notification', 'phone_call']),
  messageContent: z.string(),
  messageTemplateId: z.string().uuid().optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced']).default('pending'),
  metadata: z.record(z.any()).default({}),
});

const CommunicationTemplateSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  category: z.enum([
    'appointment_reminder', 'follow_up_care', 'educational', 'promotional',
    'survey', 'birthday', 'reengagement', 'treatment_reminder'
  ]),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push_notification']),
  subject: z.string().optional(),
  content: z.string(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

const PatientJourneyStageSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  currentStage: z.enum([
    'new_lead', 'consultation_scheduled', 'first_visit', 'active_patient',
    'treatment_in_progress', 'post_treatment_care', 'maintenance',
    'loyal_patient', 'at_risk', 'inactive', 'reactivated'
  ]),
  engagementScore: z.number().min(0).max(100).default(0),
  satisfactionScore: z.number().min(1).max(5).optional(),
  loyaltyTier: z.enum(['standard', 'silver', 'gold', 'platinum']).default('standard'),
  lastTreatmentDate: z.date().optional(),
  nextRecommendedTreatmentDate: z.date().optional(),
  riskFactors: z.array(z.string()).default([]),
});

const EngagementActionSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  actionType: z.enum([
    'appointment_booked', 'appointment_completed', 'treatment_started',
    'treatment_completed', 'review_left', 'referral_made', 'survey_completed',
    'educational_content_viewed', 'promotion_redeemed', 'reengagement_response'
  ]),
  actionValue: z.string().optional(),
  pointsEarned: z.number().default(0),
  metadata: z.record(z.any()).default({}),
});

const LoyaltyProgramSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  pointEarningRules: z.record(z.number()).default({}),
  tierRequirements: z.record(z.object({
    minPoints: z.number(),
    minTreatments: z.number(),
  })).default({}),
  benefits: z.record(z.array(z.string())).default({}),
  isActive: z.boolean().default(true),
});

const PatientSurveySchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['satisfaction', 'treatment_feedback', 'clinic_experience', 'service_quality']),
  questions: z.array(z.any()),
  triggerConditions: z.array(z.any()).default([]),
  isActive: z.boolean().default(true),
});

const SurveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid().optional(),
  responses: z.record(z.any()),
  satisfactionScore: z.number().min(1).max(5).optional(),
  netPromoterScore: z.number().min(-100).max(100).optional(),
  feedbackText: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(),
});

const EngagementCampaignSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  campaignType: z.enum([
    'reengagement', 'birthday_campaign', 'seasonal_promotion',
    'treatment_reminder', 'educational_series', 'loyalty_program'
  ]),
  targetAudience: z.record(z.any()),
  triggerConditions: z.record(z.any()),
  messageSequence: z.array(z.any()),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const ReengagementTriggerSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  triggerType: z.enum([
    'no_recent_appointment', 'missed_follow_up', 'declining_engagement',
    'treatment_due', 'birthday_approaching', 'loyalty_status_change'
  ]),
  actionTaken: z.string().optional(),
  outcome: z.record(z.any()).default({}),
});

type CommunicationPreferencesInput = z.infer<typeof CommunicationPreferencesSchema>;
type CommunicationHistoryInput = z.infer<typeof CommunicationHistorySchema>;
type CommunicationTemplateInput = z.infer<typeof CommunicationTemplateSchema>;
type PatientJourneyStageInput = z.infer<typeof PatientJourneyStageSchema>;
type EngagementActionInput = z.infer<typeof EngagementActionSchema>;
type LoyaltyProgramInput = z.infer<typeof LoyaltyProgramSchema>;
type PatientSurveyInput = z.infer<typeof PatientSurveySchema>;
type SurveyResponseInput = z.infer<typeof SurveyResponseSchema>;
type EngagementCampaignInput = z.infer<typeof EngagementCampaignSchema>;
type ReengagementTriggerInput = z.infer<typeof ReengagementTriggerSchema>;

export interface PatientEngagementServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class PatientEngagementService {
  constructor(private supabase: SupabaseClient) {}

  // Communication Preferences Management
  async getCommunicationPreferences(patientId: string, clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_communication_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .single();

    if (error) {
      throw new Error(`Failed to get communication preferences: ${error.message}`);
    }

    return data;
  }

  async updateCommunicationPreferences(preferences: CommunicationPreferencesInput) {
    const validatedPreferences = CommunicationPreferencesSchema.parse(preferences);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_communication_preferences')
      .upsert({
        patient_id: validatedPreferences.patientId,
        clinic_id: validatedPreferences.clinicId,
        preferred_language: validatedPreferences.preferredLanguage,
        communication_channels: validatedPreferences.communicationChannels,
        communication_frequency: validatedPreferences.communicationFrequency,
        notification_timing: validatedPreferences.notificationTiming,
        do_not_contact: validatedPreferences.doNotContact,
        do_not_contact_reason: validatedPreferences.doNotContactReason,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update communication preferences: ${error.message}`);
    }

    return data;
  }

  // Communication History Management
  async sendCommunication(communication: CommunicationHistoryInput) {
    const validatedCommunication = CommunicationHistorySchema.parse(communication);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_communication_history')
      .insert({
        patient_id: validatedCommunication.patientId,
        clinic_id: validatedCommunication.clinicId,
        professional_id: validatedCommunication.professionalId,
        communication_type: validatedCommunication.communicationType,
        channel: validatedCommunication.channel,
        message_content: validatedCommunication.messageContent,
        message_template_id: validatedCommunication.messageTemplateId,
        status: validatedCommunication.status,
        metadata: validatedCommunication.metadata,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send communication: ${error.message}`);
    }

    return data;
  }

  async getCommunicationHistory(patientId: string, clinicId: string, limit = 50) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_communication_history')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get communication history: ${error.message}`);
    }

    return data;
  }

  // Template Management
  async createTemplate(template: CommunicationTemplateInput) {
    const validatedTemplate = CommunicationTemplateSchema.parse(template);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('communication_templates')
      .insert({
        clinic_id: validatedTemplate.clinicId,
        name: validatedTemplate.name,
        category: validatedTemplate.category,
        channel: validatedTemplate.channel,
        subject: validatedTemplate.subject,
        content: validatedTemplate.content,
        variables: validatedTemplate.variables,
        is_active: validatedTemplate.isActive,
        is_default: validatedTemplate.isDefault,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return data;
  }

  async getTemplatesByCategory(clinicId: string, category: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('communication_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('category', category)
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }

    return data;
  }

  // Patient Journey Management
  async updatePatientJourneyStage(journey: PatientJourneyStageInput) {
    const validatedJourney = PatientJourneyStageSchema.parse(journey);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_journey_stages')
      .upsert({
        patient_id: validatedJourney.patientId,
        clinic_id: validatedJourney.clinicId,
        current_stage: validatedJourney.currentStage,
        engagement_score: validatedJourney.engagementScore,
        satisfaction_score: validatedJourney.satisfactionScore,
        loyalty_tier: validatedJourney.loyaltyTier,
        last_treatment_date: validatedJourney.lastTreatmentDate?.toISOString(),
        next_recommended_treatment_date: validatedJourney.nextRecommendedTreatmentDate?.toISOString(),
        risk_factors: validatedJourney.riskFactors,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update patient journey stage: ${error.message}`);
    }

    return data;
  }

  async getPatientJourney(patientId: string, clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_journey_stages')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .single();

    if (error) {
      throw new Error(`Failed to get patient journey: ${error.message}`);
    }

    return data;
  }

  // Engagement Actions Management
  async recordEngagementAction(action: EngagementActionInput) {
    const validatedAction = EngagementActionSchema.parse(action);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_engagement_actions')
      .insert({
        patient_id: validatedAction.patientId,
        clinic_id: validatedAction.clinicId,
        action_type: validatedAction.actionType,
        action_value: validatedAction.actionValue,
        points_earned: validatedAction.pointsEarned,
        metadata: validatedAction.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record engagement action: ${error.message}`);
    }

    return data;
  }

  async getPatientEngagementActions(patientId: string, clinicId: string, limit = 50) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_engagement_actions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get engagement actions: ${error.message}`);
    }

    return data;
  }

  // Loyalty Program Management
  async createLoyaltyProgram(program: LoyaltyProgramInput) {
    const validatedProgram = LoyaltyProgramSchema.parse(program);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('loyalty_programs')
      .insert({
        clinic_id: validatedProgram.clinicId,
        name: validatedProgram.name,
        description: validatedProgram.description,
        point_earning_rules: validatedProgram.pointEarningRules,
        tier_requirements: validatedProgram.tierRequirements,
        benefits: validatedProgram.benefits,
        is_active: validatedProgram.isActive,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create loyalty program: ${error.message}`);
    }

    return data;
  }

  async getLoyaltyPrograms(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('loyalty_programs')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get loyalty programs: ${error.message}`);
    }

    return data;
  }

  async getPatientPointsBalance(patientId: string, clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_points_balance')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .single();

    if (error) {
      // Create balance if it doesn't exist
      if (error.code === 'PGRST116') {
        const { data: newBalance, error: createError } = await (this.supabase as SupabaseJSClient)
          .from('patient_points_balance')
          .insert({
            patient_id: patientId,
            clinic_id: clinicId,
            total_points_earned: 0,
            points_available: 0,
            points_redeemed: 0,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create points balance: ${createError.message}`);
        }

        return newBalance;
      }
      throw new Error(`Failed to get points balance: ${error.message}`);
    }

    return data;
  }

  async updatePatientPoints(patientId: string, clinicId: string, pointsToAdd: number) {
    const balance = await this.getPatientPointsBalance(patientId, clinicId);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_points_balance')
      .update({
        total_points_earned: balance.total_points_earned + pointsToAdd,
        points_available: balance.points_available + pointsToAdd,
        last_updated: new Date().toISOString(),
      })
      .eq('id', balance.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update patient points: ${error.message}`);
    }

    return data;
  }

  // Survey Management
  async createSurvey(survey: PatientSurveyInput) {
    const validatedSurvey = PatientSurveySchema.parse(survey);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_surveys')
      .insert({
        clinic_id: validatedSurvey.clinicId,
        name: validatedSurvey.name,
        type: validatedSurvey.type,
        questions: validatedSurvey.questions,
        trigger_conditions: validatedSurvey.triggerConditions,
        is_active: validatedSurvey.isActive,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create survey: ${error.message}`);
    }

    return data;
  }

  async getSurveys(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_surveys')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get surveys: ${error.message}`);
    }

    return data;
  }

  async submitSurveyResponse(response: SurveyResponseInput) {
    const validatedResponse = SurveyResponseSchema.parse(response);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('patient_survey_responses')
      .insert({
        survey_id: validatedResponse.surveyId,
        patient_id: validatedResponse.patientId,
        professional_id: validatedResponse.professionalId,
        responses: validatedResponse.responses,
        satisfaction_score: validatedResponse.satisfactionScore,
        net_promoter_score: validatedResponse.netPromoterScore,
        feedback_text: validatedResponse.feedbackText,
        follow_up_required: validatedResponse.followUpRequired,
        follow_up_notes: validatedResponse.followUpNotes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit survey response: ${error.message}`);
    }

    return data;
  }

  // Campaign Management
  async createCampaign(campaign: EngagementCampaignInput) {
    const validatedCampaign = EngagementCampaignSchema.parse(campaign);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('engagement_campaigns')
      .insert({
        clinic_id: validatedCampaign.clinicId,
        name: validatedCampaign.name,
        campaign_type: validatedCampaign.campaignType,
        target_audience: validatedCampaign.targetAudience,
        trigger_conditions: validatedCampaign.triggerConditions,
        message_sequence: validatedCampaign.messageSequence,
        status: validatedCampaign.status,
        start_date: validatedCampaign.startDate?.toISOString(),
        end_date: validatedCampaign.endDate?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    return data;
  }

  async getCampaigns(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('engagement_campaigns')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }

    return data;
  }

  // Reengagement Management
  async createReengagementTrigger(trigger: ReengagementTriggerInput) {
    const validatedTrigger = ReengagementTriggerSchema.parse(trigger);

    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('reengagement_triggers')
      .insert({
        patient_id: validatedTrigger.patientId,
        clinic_id: validatedTrigger.clinicId,
        trigger_type: validatedTrigger.triggerType,
        action_taken: validatedTrigger.actionTaken,
        outcome: validatedTrigger.outcome,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reengagement trigger: ${error.message}`);
    }

    return data;
  }

  async getReengagementTriggers(clinicId: string, status = 'pending') {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('reengagement_triggers')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', status)
      .order('trigger_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get reengagement triggers: ${error.message}`);
    }

    return data;
  }

  async updateReengagementTrigger(triggerId: string, status: string, actionTaken: string, outcome: any) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .from('reengagement_triggers')
      .update({
        status,
        action_taken: actionTaken,
        outcome,
        updated_at: new Date().toISOString(),
      })
      .eq('id', triggerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reengagement trigger: ${error.message}`);
    }

    return data;
  }

  // Analytics and Reporting
  async getEngagementAnalytics(clinicId: string, dateRange: { start: string; end: string }) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .rpc('get_engagement_analytics', {
        p_clinic_id: clinicId,
        p_start_date: dateRange.start,
        p_end_date: dateRange.end,
      });

    if (error) {
      throw new Error(`Failed to get engagement analytics: ${error.message}`);
    }

    return data;
  }

  async getPatientEngagementReport(patientId: string, clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .rpc('get_patient_engagement_report', {
        p_patient_id: patientId,
        p_clinic_id: clinicId,
      });

    if (error) {
      throw new Error(`Failed to get patient engagement report: ${error.message}`);
    }

    return data;
  }

  // Automated Communication Workflows
  async processAppointmentReminders(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .rpc('process_appointment_reminders', {
        p_clinic_id: clinicId,
      });

    if (error) {
      throw new Error(`Failed to process appointment reminders: ${error.message}`);
    }

    return data;
  }

  async processFollowUpCommunications(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .rpc('process_follow_up_communications', {
        p_clinic_id: clinicId,
      });

    if (error) {
      throw new Error(`Failed to process follow up communications: ${error.message}`);
    }

    return data;
  }

  async processBirthdayGreetings(clinicId: string) {
    const { data, error } = await (this.supabase as SupabaseJSClient)
      .rpc('process_birthday_greetings', {
        p_clinic_id: clinicId,
      });

    if (error) {
      throw new Error(`Failed to process birthday greetings: ${error.message}`);
    }

    return data;
  }

  // Template Processing
  async processTemplate(templateId: string, variables: Record<string, any>) {
    const { data: template, error } = await (this.supabase as SupabaseJSClient)
      .from('communication_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      throw new Error(`Failed to get template: ${error.message}`);
    }

    let processedContent = template.content;
    let processedSubject = template.subject;

    // Replace variables in content and subject
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
      if (processedSubject) {
        processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    return {
      content: processedContent,
      subject: processedSubject,
    };
  }
}

export class BasePatientEngagementService {
  constructor(private supabase: SupabaseClient) {}

  async createEngagement(input: any) {
    // Basic implementation stub
    return {
      id: 'engagement-id',
      patientId: input.patientId,
      type: input.type,
      createdAt: new Date().toISOString(),
    };
  }

  async getEngagementStats(input: any) {
    // Basic implementation stub
    return {
      totalEngagements: 0,
      activeEngagements: 0,
      engagementRate: 0,
    };
  }
}