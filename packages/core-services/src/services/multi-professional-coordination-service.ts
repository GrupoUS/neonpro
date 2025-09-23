import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@neonpro/types';

// Schema definitions for validation
const ProfessionalTeamInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  teamType: z.enum(['multidisciplinary', 'specialized', 'consultation', 'emergency']),
});

const TeamMemberInputSchema = z.object({
  teamId: z.string().uuid(),
  professionalId: z.string().uuid(),
  role: z.enum(['leader', 'coordinator', 'member', 'consultant', 'supervisor']),
  permissions: z.record(z.any()).optional(),
  scopeLimitations: z.array(z.string()).optional(),
});

const ProfessionalReferralInputSchema = z.object({
  patientId: z.string().uuid(),
  referringProfessionalId: z.string().uuid(),
  referredProfessionalId: z.string().uuid(),
  referralType: z.enum(['consultation', 'treatment', 'assessment', 'supervision', 'second_opinion']),
  reason: z.string().min(1),
  clinicalNotes: z.string().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
  responseDeadline: z.date().optional(),
});

const CollaborativeSessionInputSchema = z.object({
  patientId: z.string().uuid(),
  teamId: z.string().uuid(),
  sessionType: z.enum(['planning', 'treatment', 'assessment', 'follow_up', 'emergency']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduledStart: z.date(),
  scheduledEnd: z.date(),
  location: z.string().optional(),
  virtualMeetingUrl: z.string().url().optional(),
  facilitatorId: z.string().uuid(),
});

const SessionParticipantInputSchema = z.object({
  sessionId: z.string().uuid(),
  professionalId: z.string().uuid(),
  role: z.enum(['primary', 'secondary', 'observer', 'consultant', 'supervisor']),
  responsibilities: z.array(z.string()).optional(),
});

const CoordinationThreadInputSchema = z.object({
  patientId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  referralId: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  contextType: z.enum(['patient_care', 'treatment_planning', 'consultation', 'urgent', 'administrative']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

const CoordinationMessageInputSchema = z.object({
  threadId: z.string().uuid(),
  messageType: z.enum(['text', 'clinical_note', 'image', 'document', 'referral_request', 'treatment_update']),
  content: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  isSensitive: z.boolean().default(false),
  requiresAcknowledgment: z.boolean().default(false),
});

const ProfessionalSupervisionInputSchema = z.object({
  supervisorId: z.string().uuid(),
  superviseeId: z.string().uuid(),
  supervisionType: z.enum(['clinical', 'administrative', 'mentorship', 'training']),
  scope: z.string().min(1),
  requirements: z.array(z.string()).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'as_needed']),
  maxAutonomyLevel: z.number().int().min(1).max(5).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});

const ScopeValidationInputSchema = z.object({
  professionalId: z.string().uuid(),
  procedureId: z.string().uuid().optional(),
  medicationId: z.string().uuid().optional(),
  isAuthorized: z.boolean(),
  authorizationLevel: z.enum(['independent', 'supervised', 'prohibited']).optional(),
  conditions: z.array(z.string()).optional(),
  supervisionRequirements: z.string().optional(),
  validFrom: z.date(),
  validUntil: z.date().optional(),
  authorizedBy: z.string().uuid().optional(),
});

const CoordinationProtocolInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  protocolType: z.enum(['emergency', 'consultation', 'referral', 'treatment_coordination', 'supervision']),
  triggerConditions: z.array(z.string()).optional(),
  requiredProfessions: z.array(z.string()).optional(),
  workflowSteps: z.record(z.any()).optional(),
  timelineRequirements: z.record(z.any()).optional(),
  documentationRequirements: z.array(z.string()).optional(),
});

// Type definitions
export type ProfessionalTeamInput = z.infer<typeof ProfessionalTeamInputSchema>;
export type TeamMemberInput = z.infer<typeof TeamMemberInputSchema>;
export type ProfessionalReferralInput = z.infer<typeof ProfessionalReferralInputSchema>;
export type CollaborativeSessionInput = z.infer<typeof CollaborativeSessionInputSchema>;
export type SessionParticipantInput = z.infer<typeof SessionParticipantInputSchema>;
export type CoordinationThreadInput = z.infer<typeof CoordinationThreadInputSchema>;
export type CoordinationMessageInput = z.infer<typeof CoordinationMessageInputSchema>;
export type ProfessionalSupervisionInput = z.infer<typeof ProfessionalSupervisionInputSchema>;
export type ScopeValidationInput = z.infer<typeof ScopeValidationInputSchema>;
export type CoordinationProtocolInput = z.infer<typeof CoordinationProtocolInputSchema>;

export interface CoordinationServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class MultiProfessionalCoordinationService {
  private supabase: any;

  constructor(config: CoordinationServiceConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // Professional Teams Management
  async createProfessionalTeam(team: ProfessionalTeamInput) {
    const validatedTeam = ProfessionalTeamInputSchema.parse(team);
    
    const { data, error } = await this.supabase
      .from('professional_teams')
      .insert([{
        clinic_id: validatedTeam.clinicId,
        name: validatedTeam.name,
        description: validatedTeam.description,
        team_type: validatedTeam.teamType,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create professional team: ${error.message}`);
    }

    return data;
  }

  async getProfessionalTeams(clinicId: string) {
    const { data, error } = await this.supabase
      .from('professional_teams')
      .select(`
        *,
        team_members (
          *,
          professionals (*)
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get professional teams: ${error.message}`);
    }

    return data;
  }

  async addTeamMember(member: TeamMemberInput) {
    const validatedMember = TeamMemberInputSchema.parse(member);
    
    const { data, error } = await this.supabase
      .from('team_members')
      .insert([{
        team_id: validatedMember.teamId,
        professional_id: validatedMember.professionalId,
        role: validatedMember.role,
        permissions: validatedMember.permissions || {},
        scope_limitations: validatedMember.scopeLimitations || [],
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add team member: ${error.message}`);
    }

    return data;
  }

  async removeTeamMember(teamMemberId: string) {
    const { error } = await this.supabase
      .from('team_members')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', teamMemberId);

    if (error) {
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }

  // Professional Referrals
  async createReferral(referral: ProfessionalReferralInput) {
    const validatedReferral = ProfessionalReferralInputSchema.parse(referral);
    
    // Validate professional scope if applicable
    const scopeValidation = await this.validateProfessionalScope(
      validatedReferral.referredProfessionalId,
      undefined, // Will be determined from referral context
      undefined
    );

    if (!scopeValidation.isAuthorized && scopeValidation.authorizationLevel === 'prohibited') {
      throw new Error('Referred professional is not authorized for this type of referral');
    }

    const { data, error } = await this.supabase
      .from('professional_referrals')
      .insert([{
        patient_id: validatedReferral.patientId,
        referring_professional_id: validatedReferral.referringProfessionalId,
        referred_professional_id: validatedReferral.referredProfessionalId,
        referral_type: validatedReferral.referralType,
        reason: validatedReferral.reason,
        clinical_notes: validatedReferral.clinicalNotes,
        urgency_level: validatedReferral.urgencyLevel,
        response_deadline: validatedReferral.responseDeadline?.toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create referral: ${error.message}`);
    }

    // Create coordination thread for the referral
    await this.createCoordinationThread({
      patientId: validatedReferral.patientId,
      referralId: data.id,
      subject: `Referral: ${validatedReferral.referralType}`,
      contextType: 'consultation',
      priority: validatedReferral.urgencyLevel === 'emergency' ? 'urgent' : 'normal',
    });

    return data;
  }

  async getReferrals(professionalId: string, type: 'sent' | 'received' | 'all' = 'all') {
    let query = this.supabase
      .from('professional_referrals')
      .select(`
        *,
        patients (*),
        referring_professional:professionals!professional_referrals_referring_professional_id_fkey (*),
        referred_professional:professionals!professional_referrals_referred_professional_id_fkey (*)
      `);

    if (type === 'sent') {
      query = query.eq('referring_professional_id', professionalId);
    } else if (type === 'received') {
      query = query.eq('referred_professional_id', professionalId);
    } else {
      query = query.or(`referring_professional_id.eq.${professionalId},referred_professional_id.eq.${professionalId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get referrals: ${error.message}`);
    }

    return data;
  }

  async respondToReferral(referralId: string, response: 'accept' | 'decline', responseNotes?: string) {
    const { data, error } = await this.supabase
      .from('professional_referrals')
      .update({
        status: response === 'accept' ? 'accepted' : 'declined',
        response_notes: responseNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', referralId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to respond to referral: ${error.message}`);
    }

    return data;
  }

  // Collaborative Sessions
  async createCollaborativeSession(session: CollaborativeSessionInput) {
    const validatedSession = CollaborativeSessionInputSchema.parse(session);
    
    const { data, error } = await this.supabase
      .from('collaborative_sessions')
      .insert([{
        patient_id: validatedSession.patientId,
        team_id: validatedSession.teamId,
        session_type: validatedSession.sessionType,
        title: validatedSession.title,
        description: validatedSession.description,
        scheduled_start: validatedSession.scheduledStart.toISOString(),
        scheduled_end: validatedSession.scheduledEnd.toISOString(),
        location: validatedSession.location,
        virtual_meeting_url: validatedSession.virtualMeetingUrl,
        facilitator_id: validatedSession.facilitatorId,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create collaborative session: ${error.message}`);
    }

    return data;
  }

  async getCollaborativeSessions(clinicId: string, professionalId?: string) {
    let query = this.supabase
      .from('collaborative_sessions')
      .select(`
        *,
        patients (*),
        professional_teams (*),
        session_participants (
          *,
          professionals (*)
        )
      `)
      .eq('professional_teams.clinic_id', clinicId);

    if (professionalId) {
      query = query.or(`facilitator_id.eq.${professionalId},id.in.(select session_id from session_participants where professional_id = ${professionalId})`);
    }

    const { data, error } = await query.order('scheduled_start', { ascending: true });

    if (error) {
      throw new Error(`Failed to get collaborative sessions: ${error.message}`);
    }

    return data;
  }

  async addSessionParticipant(participant: SessionParticipantInput) {
    const validatedParticipant = SessionParticipantInputSchema.parse(participant);
    
    const { data, error } = await this.supabase
      .from('session_participants')
      .insert([{
        session_id: validatedParticipant.sessionId,
        professional_id: validatedParticipant.professionalId,
        role: validatedParticipant.role,
        responsibilities: validatedParticipant.responsibilities || [],
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add session participant: ${error.message}`);
    }

    return data;
  }

  // Coordination Threads and Messages
  async createCoordinationThread(thread: CoordinationThreadInput) {
    const validatedThread = CoordinationThreadInputSchema.parse(thread);
    
    const { data, error } = await this.supabase
      .from('coordination_threads')
      .insert([{
        patient_id: validatedThread.patientId,
        team_id: validatedThread.teamId,
        session_id: validatedThread.sessionId,
        referral_id: validatedThread.referralId,
        subject: validatedThread.subject,
        context_type: validatedThread.contextType,
        priority: validatedThread.priority || 'normal',
        created_by: 'current_user', // This should be replaced with actual auth context
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create coordination thread: ${error.message}`);
    }

    return data;
  }

  async getCoordinationThreads(clinicId: string, patientId?: string) {
    let query = this.supabase
      .from('coordination_threads')
      .select(`
        *,
        patients (*),
        professional_teams (*),
        coordination_messages (
          *,
          professionals (*)
        )
      `)
      .eq('status', 'active');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    } else {
      query = query.in('patient_id', this.supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', clinicId));
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get coordination threads: ${error.message}`);
    }

    return data;
  }

  async addCoordinationMessage(message: CoordinationMessageInput) {
    const validatedMessage = CoordinationMessageInputSchema.parse(message);
    
    const { data, error } = await this.supabase
      .from('coordination_messages')
      .insert([{
        thread_id: validatedMessage.threadId,
        professional_id: 'current_user', // Replace with actual auth context
        message_type: validatedMessage.messageType,
        content: validatedMessage.content,
        attachment_url: validatedMessage.attachmentUrl,
        is_sensitive: validatedMessage.isSensitive,
        requires_acknowledgment: validatedMessage.requiresAcknowledgment,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add coordination message: ${error.message}`);
    }

    // Update thread timestamp
    await this.supabase
      .from('coordination_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', validatedMessage.threadId);

    return data;
  }

  // Professional Supervision
  async createProfessionalSupervision(supervision: ProfessionalSupervisionInput) {
    const validatedSupervision = ProfessionalSupervisionInputSchema.parse(supervision);
    
    const { data, error } = await this.supabase
      .from('professional_supervision')
      .insert([{
        supervisor_id: validatedSupervision.supervisorId,
        supervisee_id: validatedSupervision.superviseeId,
        supervision_type: validatedSupervision.supervisionType,
        scope: validatedSupervision.scope,
        requirements: validatedSupervision.requirements || [],
        frequency: validatedSupervision.frequency,
        max_autonomy_level: validatedSupervision.maxAutonomyLevel || 1,
        start_date: validatedSupervision.startDate.toISOString(),
        end_date: validatedSupervision.endDate?.toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create professional supervision: ${error.message}`);
    }

    return data;
  }

  async getSupervisionRelationships(professionalId: string, type: 'supervisor' | 'supervisee' | 'all' = 'all') {
    let query = this.supabase
      .from('professional_supervision')
      .select(`
        *,
        supervisor:professionals!professional_supervision_supervisor_id_fkey (*),
        supervisee:professionals!professional_supervision_supervisee_id_fkey (*),
        supervision_sessions (*)
      `)
      .eq('is_active', true);

    if (type === 'supervisor') {
      query = query.eq('supervisor_id', professionalId);
    } else if (type === 'supervisee') {
      query = query.eq('supervisee_id', professionalId);
    } else {
      query = query.or(`supervisor_id.eq.${professionalId},supervisee_id.eq.${professionalId}`);
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get supervision relationships: ${error.message}`);
    }

    return data;
  }

  // Professional Scope Validation
  async validateProfessionalScope(
    professionalId: string, 
    procedureId?: string, 
    medicationId?: string
  ) {
    const { data, error } = await this.supabase
      .rpc('validate_professional_scope', {
        p_professional_id: professionalId,
        p_procedure_id: procedureId,
        p_medication_id: medicationId
      });

    if (error) {
      throw new Error(`Failed to validate professional scope: ${error.message}`);
    }

    return data[0] || { is_authorized: false, authorization_level: 'prohibited', conditions: [] };
  }

  async createScopeValidation(validation: ScopeValidationInput) {
    const validatedValidation = ScopeValidationInputSchema.parse(validation);
    
    const { data, error } = await this.supabase
      .from('professional_scope_validation')
      .insert([{
        professional_id: validatedValidation.professionalId,
        procedure_id: validatedValidation.procedureId,
        medication_id: validatedValidation.medicationId,
        is_authorized: validatedValidation.isAuthorized,
        authorization_level: validatedValidation.authorizationLevel,
        conditions: validatedValidation.conditions || [],
        supervision_requirements: validatedValidation.supervisionRequirements,
        valid_from: validatedValidation.validFrom.toISOString(),
        valid_until: validatedValidation.validUntil?.toISOString(),
        authorized_by: validatedValidation.authorizedBy,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create scope validation: ${error.message}`);
    }

    return data;
  }

  // Coordination Protocols
  async createCoordinationProtocol(protocol: CoordinationProtocolInput) {
    const validatedProtocol = CoordinationProtocolInputSchema.parse(protocol);
    
    const { data, error } = await this.supabase
      .from('coordination_protocols')
      .insert([{
        clinic_id: validatedProtocol.clinicId,
        name: validatedProtocol.name,
        description: validatedProtocol.description,
        protocol_type: validatedProtocol.protocolType,
        trigger_conditions: validatedProtocol.triggerConditions || [],
        required_professions: validatedProtocol.requiredProfessions || [],
        workflow_steps: validatedProtocol.workflowSteps || {},
        timeline_requirements: validatedProtocol.timelineRequirements || {},
        documentation_requirements: validatedProtocol.documentationRequirements || [],
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create coordination protocol: ${error.message}`);
    }

    return data;
  }

  async getCoordinationProtocols(clinicId: string) {
    const { data, error } = await this.supabase
      .from('coordination_protocols')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get coordination protocols: ${error.message}`);
    }

    return data;
  }

  async executeProtocol(protocolId: string, patientId: string, triggerEvent: string, triggeredBy: string) {
    const { data, error } = await this.supabase
      .from('protocol_executions')
      .insert([{
        protocol_id: protocolId,
        patient_id: patientId,
        triggered_by: triggeredBy,
        trigger_event: triggerEvent,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to execute protocol: ${error.message}`);
    }

    return data;
  }

  // Automated Workflows
  async checkOverdueReferrals() {
    const { data, error } = await this.supabase
      .from('professional_referrals')
      .select('*')
      .eq('status', 'pending')
      .lt('response_deadline', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to check overdue referrals: ${error.message}`);
    }

    return data;
  }

  async createCollaborativeSessionForTreatment(patientId: string, treatmentPlanId: string, sessionType: string = 'planning') {
    const { data, error } = await this.supabase
      .rpc('create_collaborative_session_for_treatment', {
        p_patient_id: patientId,
        p_treatment_plan_id: treatmentPlanId,
        p_session_type: sessionType
      });

    if (error) {
      throw new Error(`Failed to create collaborative session for treatment: ${error.message}`);
    }

    return data;
  }

  // Analytics and Reporting
  async getCoordinationAnalytics(clinicId: string, dateRange: { start: Date; end: Date }) {
    const { data, error } = await this.supabase
      .from('professional_teams')
      .select(`
        id,
        name,
        team_members (count),
        collaborative_sessions (count),
        professional_referrals (count)
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get coordination analytics: ${error.message}`);
    }

    return data;
  }

  async getProfessionalCollaborationMetrics(professionalId: string, dateRange: { start: Date; end: Date }) {
    const { data, error } = await this.supabase
      .from('professionals')
      .select(`
        id,
        name,
        team_members (count),
        session_participants (count),
        professional_referrals_as_referring:professional_referrals!professional_referrals_referring_professional_id_fkey (count),
        professional_referrals_as_referred:professional_referrals!professional_referrals_referred_professional_id_fkey (count),
        coordination_messages (count)
      `)
      .eq('id', professionalId);

    if (error) {
      throw new Error(`Failed to get professional collaboration metrics: ${error.message}`);
    }

    return data;
  }
}