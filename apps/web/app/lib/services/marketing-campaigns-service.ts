// =====================================================================================
// MARKETING CAMPAIGNS SERVICE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import type {
  AutomationStep,
  CampaignAnalytics,
  CampaignAutomation,
  CampaignExecution,
  CampaignMetrics,
  CampaignTemplate,
  CreateCampaignData,
  CreateTemplateData,
  ExecuteCampaignData,
  MarketingCampaign,
} from '@/app/types/marketing-campaigns';
import { createClient } from '@/app/utils/supabase/server';

export class MarketingCampaignsService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // =====================================================================================
  // CAMPAIGN MANAGEMENT
  // =====================================================================================

  /**
   * Get all marketing campaigns with optional filtering
   */
  async getCampaigns(filters?: {
    status?: string[];
    type?: string[];
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketingCampaign[]> {
    let query = this.supabase
      .from('marketing_campaigns')
      .select(`
        *,
        template:campaign_templates(name, category),
        executions:campaign_executions(
          id,
          execution_date,
          total_recipients,
          delivery_status,
          open_count,
          click_count,
          conversion_count
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.in('status', filters.status);
    }

    if (filters?.type) {
      query = query.in('campaign_type', filters.type);
    }

    if (filters?.clinicId) {
      query = query.eq('clinic_id', filters.clinicId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }

    return data || [];
  }

  /**
   * Get campaign by ID with full details
   */
  async getCampaignById(id: string): Promise<MarketingCampaign | null> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .select(`
        *,
        template:campaign_templates(*),
        triggers:campaign_triggers(*),
        executions:campaign_executions(
          *,
          recipients:campaign_recipients(
            id,
            patient_id,
            delivery_status,
            sent_at,
            opened_at,
            clicked_at,
            converted_at,
            consent_status
          )
        ),
        metrics:campaign_metrics(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }

    return data;
  }

  /**
   * Create new marketing campaign
   */
  async createCampaign(
    campaignData: CreateCampaignData
  ): Promise<MarketingCampaign> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .insert([
        {
          name: campaignData.name,
          description: campaignData.description,
          campaign_type: campaignData.campaignType,
          status: campaignData.status || 'draft',
          priority: campaignData.priority || 'normal',
          target_segments: campaignData.targetSegments || [],
          include_criteria: campaignData.includeCriteria,
          exclude_criteria: campaignData.excludeCriteria,
          scheduled_start: campaignData.scheduledStart,
          scheduled_end: campaignData.scheduledEnd,
          timezone: campaignData.timezone || 'America/Sao_Paulo',
          template_id: campaignData.templateId,
          subject: campaignData.subject,
          content: campaignData.content,
          personalization_level: campaignData.personalizationLevel || 'basic',
          personalization_data: campaignData.personalizationData || {},
          trigger_type: campaignData.triggerType,
          trigger_config: campaignData.triggerConfig,
          auto_optimization: campaignData.autoOptimization,
          requires_consent: true,
          consent_types: campaignData.consentTypes || [],
          respect_unsubscribe: true,
          created_by: campaignData.createdBy,
          clinic_id: campaignData.clinicId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }

    return data;
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    id: string,
    updates: Partial<CreateCampaignData>
  ): Promise<MarketingCampaign> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      throw new Error('Failed to update campaign');
    }

    return data;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      throw new Error('Failed to delete campaign');
    }
  }

  // =====================================================================================
  // TEMPLATE MANAGEMENT
  // =====================================================================================

  /**
   * Get campaign templates
   */
  async getTemplates(filters?: {
    category?: string;
    campaignType?: string;
    isActive?: boolean;
    clinicId?: string;
  }): Promise<CampaignTemplate[]> {
    let query = this.supabase
      .from('campaign_templates')
      .select('*')
      .order('usage_count', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.campaignType) {
      query = query.eq('campaign_type', filters.campaignType);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.clinicId) {
      query = query.eq('clinic_id', filters.clinicId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }

    return data || [];
  }

  /**
   * Create campaign template
   */
  async createTemplate(
    templateData: CreateTemplateData
  ): Promise<CampaignTemplate> {
    const { data, error } = await this.supabase
      .from('campaign_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }

    return data;
  }

  // =====================================================================================
  // CAMPAIGN EXECUTION
  // =====================================================================================

  /**
   * Execute campaign manually
   */
  async executeCampaign(
    campaignId: string,
    _executionData: ExecuteCampaignData
  ): Promise<CampaignExecution> {
    // First, validate campaign exists and is executable
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!['scheduled', 'active'].includes(campaign.status)) {
      throw new Error('Campaign is not in executable status');
    }

    // Get target recipients based on segments and criteria
    const recipients = await this.getTargetRecipients(
      campaign.targetSegments,
      campaign.includeCriteria,
      campaign.excludeCriteria
    );

    // Apply personalization
    const personalizedContent = await this.applyPersonalization(
      campaign.content,
      campaign.subject,
      campaign.personalizationLevel,
      campaign.personalizationData
    );

    // Create execution record
    const { data: execution, error } = await this.supabase
      .from('campaign_executions')
      .insert([
        {
          campaign_id: campaignId,
          execution_date: new Date().toISOString(),
          total_recipients: recipients.length,
          target_segments: campaign.targetSegments,
          final_content: personalizedContent.content,
          final_subject: personalizedContent.subject,
          delivery_status: 'pending',
          personalization_applied: campaign.personalizationLevel !== 'none',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating execution:', error);
      throw new Error('Failed to create execution');
    }

    // Create recipient records
    const recipientRecords = recipients.map((recipient) => ({
      execution_id: execution.id,
      patient_id: recipient.id,
      email: recipient.email,
      phone: recipient.phone,
      whatsapp: recipient.whatsapp,
      personalization_data: recipient.personalizationData || {},
      final_content: this.personalizeContent(
        personalizedContent.content,
        recipient
      ),
      final_subject: this.personalizeContent(
        personalizedContent.subject || '',
        recipient
      ),
      delivery_status: 'pending',
      consent_status: recipient.consentStatus || 'pending',
    }));

    const { error: recipientsError } = await this.supabase
      .from('campaign_recipients')
      .insert(recipientRecords);

    if (recipientsError) {
      console.error('Error creating recipients:', recipientsError);
      throw new Error('Failed to create recipients');
    }

    // Start delivery process (this would integrate with actual delivery services)
    await this.startDelivery(execution.id, campaign.campaignType);

    return execution;
  }

  /**
   * Get target recipients based on segments and criteria
   */
  private async getTargetRecipients(
    _targetSegments: string[],
    _includeCriteria?: any,
    _excludeCriteria?: any
  ): Promise<any[]> {
    // This would integrate with patient segmentation service
    // For now, return mock data
    return [
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'patient1@example.com',
        phone: '+5511999999001',
        whatsapp: '+5511999999001',
        name: 'Maria Silva',
        personalizationData: { name: 'Maria', lastTreatment: 'Facial' },
        consentStatus: 'granted',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'patient2@example.com',
        phone: '+5511999999002',
        whatsapp: '+5511999999002',
        name: 'João Santos',
        personalizationData: { name: 'João', lastTreatment: 'Peeling' },
        consentStatus: 'granted',
      },
    ];
  }

  /**
   * Apply personalization to campaign content
   */
  private async applyPersonalization(
    content: string,
    subject: string | null,
    _level: string,
    data: any
  ): Promise<{ content: string; subject: string | null }> {
    // Basic personalization - replace template variables
    let personalizedContent = content;
    let personalizedSubject = subject;

    const defaultData = {
      clinic_name: 'Clínica Estética Beauty',
      clinic_phone: '(11) 99999-9999',
      clinic_email: 'contato@clinicabeauty.com',
      ...data,
    };

    // Replace variables in content
    Object.entries(defaultData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, String(value));
    });

    // Replace variables in subject
    if (personalizedSubject) {
      Object.entries(defaultData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        personalizedSubject = personalizedSubject?.replace(
          regex,
          String(value)
        );
      });
    }

    return {
      content: personalizedContent,
      subject: personalizedSubject,
    };
  }

  /**
   * Personalize content for individual recipient
   */
  private personalizeContent(template: string, recipient: any): string {
    let content = template;

    // Replace recipient-specific variables
    Object.entries(recipient.personalizationData || {}).forEach(
      ([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, String(value));
      }
    );

    return content;
  }

  /**
   * Start delivery process
   */
  private async startDelivery(
    executionId: string,
    campaignType: string
  ): Promise<void> {
    // Update execution status
    await this.supabase
      .from('campaign_executions')
      .update({
        delivery_status: 'sent',
        delivery_started_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    // Here would integrate with actual delivery services:
    // - Email: SendGrid, AWS SES, etc.
    // - SMS: Twilio, AWS SNS, etc.
    // - WhatsApp: Twilio WhatsApp, Facebook API, etc.
    // - Push: Firebase, OneSignal, etc.

    console.log(
      `Starting delivery for execution ${executionId} of type ${campaignType}`
    );
  }

  // =====================================================================================
  // ANALYTICS & METRICS
  // =====================================================================================

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const [campaign, executions, metrics] = await Promise.all([
      this.getCampaignById(campaignId),
      this.getCampaignExecutions(campaignId),
      this.getCampaignMetrics(campaignId),
    ]);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const totalSent = executions.reduce(
      (sum, exec) => sum + (exec.successfulSends || 0),
      0
    );
    const totalOpened = executions.reduce(
      (sum, exec) => sum + (exec.openCount || 0),
      0
    );
    const totalClicked = executions.reduce(
      (sum, exec) => sum + (exec.clickCount || 0),
      0
    );
    const totalConverted = executions.reduce(
      (sum, exec) => sum + (exec.conversionCount || 0),
      0
    );

    return {
      campaignId,
      campaignName: campaign.name,
      campaignType: campaign.campaignType,
      status: campaign.status,
      totalSent,
      totalOpened,
      totalClicked,
      totalConverted,
      deliveryRate:
        totalSent > 0 ? (totalSent / campaign.totalRecipients) * 100 : 0,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      conversionRate: totalSent > 0 ? (totalConverted / totalSent) * 100 : 0,
      executions: executions.map((exec) => ({
        id: exec.id,
        executionDate: exec.executionDate,
        recipients: exec.totalRecipients,
        sent: exec.successfulSends || 0,
        opened: exec.openCount || 0,
        clicked: exec.clickCount || 0,
        converted: exec.conversionCount || 0,
      })),
      timeline: this.generateTimelineData(executions),
      segmentPerformance: await this.getSegmentPerformance(campaignId),
      deviceBreakdown: metrics?.deviceBreakdown || {},
      locationBreakdown: metrics?.locationBreakdown || {},
    };
  }

  /**
   * Get campaign executions
   */
  private async getCampaignExecutions(
    campaignId: string
  ): Promise<CampaignExecution[]> {
    const { data, error } = await this.supabase
      .from('campaign_executions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('execution_date', { ascending: false });

    if (error) {
      console.error('Error fetching executions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get campaign metrics
   */
  private async getCampaignMetrics(
    campaignId: string
  ): Promise<CampaignMetrics | null> {
    const { data, error } = await this.supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }

    return data;
  }

  /**
   * Generate timeline data for analytics
   */
  private generateTimelineData(executions: CampaignExecution[]): any[] {
    return executions.map((exec) => ({
      date: exec.executionDate,
      sent: exec.successfulSends || 0,
      opened: exec.openCount || 0,
      clicked: exec.clickCount || 0,
      converted: exec.conversionCount || 0,
    }));
  }

  /**
   * Get segment performance data
   */
  private async getSegmentPerformance(_campaignId: string): Promise<any[]> {
    // This would analyze performance by segment
    // For now, return mock data
    return [
      {
        segment: 'novos_pacientes',
        sent: 150,
        opened: 89,
        clicked: 34,
        converted: 12,
      },
      {
        segment: 'pacientes_ativos',
        sent: 200,
        opened: 145,
        clicked: 67,
        converted: 23,
      },
      {
        segment: 'pacientes_vip',
        sent: 50,
        opened: 42,
        clicked: 28,
        converted: 15,
      },
    ];
  }

  // =====================================================================================
  // AUTOMATION & TRIGGERS
  // =====================================================================================

  /**
   * Get campaign automations
   */
  async getAutomations(clinicId?: string): Promise<CampaignAutomation[]> {
    let query = this.supabase
      .from('campaign_automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching automations:', error);
      throw new Error('Failed to fetch automations');
    }

    return data || [];
  }

  /**
   * Create campaign automation
   */
  async createAutomation(
    automationData: Omit<CampaignAutomation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CampaignAutomation> {
    const { data, error } = await this.supabase
      .from('campaign_automations')
      .insert([automationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating automation:', error);
      throw new Error('Failed to create automation');
    }

    return data;
  }

  /**
   * Process automation triggers
   */
  async processAutomationTriggers(
    eventType: string,
    eventData: any
  ): Promise<void> {
    // Get active automations that match the event
    const { data: automations, error } = await this.supabase
      .from('campaign_automations')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error(
        'Error fetching automations for trigger processing:',
        error
      );
      return;
    }

    for (const automation of automations || []) {
      // Check if automation entry conditions match the event
      const shouldTrigger = this.evaluateAutomationConditions(
        automation.entryConditions,
        eventType,
        eventData
      );

      if (shouldTrigger) {
        await this.executeAutomationSteps(
          automation.id,
          automation.steps,
          eventData
        );
      }
    }
  }

  /**
   * Evaluate automation conditions
   */
  private evaluateAutomationConditions(
    conditions: any[],
    eventType: string,
    _eventData: any
  ): boolean {
    // Implement condition evaluation logic
    return conditions.some((condition) => {
      if (condition.trigger === eventType) {
        // Additional condition checks would go here
        return true;
      }
      return false;
    });
  }

  /**
   * Execute automation steps
   */
  private async executeAutomationSteps(
    _automationId: string,
    steps: AutomationStep[],
    eventData: any
  ): Promise<void> {
    for (const step of steps) {
      // Schedule or execute step based on delay
      if (step.delayHours && step.delayHours > 0) {
        // Schedule for later execution
        console.log(
          `Scheduling step ${step.step} for ${step.delayHours} hours from now`
        );
      } else {
        // Execute immediately
        await this.executeAutomationStep(step, eventData);
      }
    }
  }

  /**
   * Execute individual automation step
   */
  private async executeAutomationStep(
    step: AutomationStep,
    _eventData: any
  ): Promise<void> {
    switch (step.type) {
      case 'send_email':
      case 'send_sms':
      case 'send_whatsapp':
        // Execute send action
        console.log(
          `Executing ${step.type} step with template ${step.template}`
        );
        break;
      case 'add_to_segment':
        // Add patient to segment
        console.log(`Adding patient to segment: ${step.segment}`);
        break;
      case 'remove_from_segment':
        // Remove patient from segment
        console.log(`Removing patient from segment: ${step.segment}`);
        break;
      default:
        console.log(`Unknown step type: ${step.type}`);
    }
  }
}

// Export singleton instance
export const marketingCampaignsService = new MarketingCampaignsService();
