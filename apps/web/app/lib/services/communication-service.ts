// Patient Communication Service
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// Comprehensive service for healthcare communication management

import { 
  Message, 
  MessageThread, 
  MessageTemplate, 
  CommunicationCampaign,
  CommunicationConsent,
  QuickResponse,
  CommunicationPreferences,
  AutomationRule,
  CommunicationStats,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesRequest,
  GetMessagesResponse,
  CampaignExecutionRequest,
  CampaignExecutionResponse,
  MessageThreadWithLastMessage,
  PatientCommunicationSummary,
  CommunicationDashboardData,
  CommunicationChannel,
  MessageType,
  MessageStatus,
  CampaignStatus,
  TemplateCategory
} from '@/lib/types/communication';

import { createClient } from '@/utils/supabase/client';

export class CommunicationService {
  private supabase = createClient();

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Send a new message to a patient
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      // Validate consent if required
      if (this.requiresConsent(request.channel, request.type)) {
        const hasConsent = await this.checkPatientConsent(request.patient_id, request.channel);
        if (!hasConsent) {
          return {
            success: false,
            status: 'failed',
            error: 'Patient consent required for this communication channel'
          };
        }
      }

      // Create or get conversation thread
      let threadId = request.thread_id;
      if (!threadId) {
        threadId = await this.createMessageThread(request.patient_id, request.subject);
      }

      // Process template variables if template provided
      let processedContent = request.content;
      let processedSubject = request.subject;

      if (request.template_id && request.template_variables) {
        const template = await this.getMessageTemplate(request.template_id);
        if (template) {
          processedContent = this.processTemplate(template.content_template, request.template_variables);
          processedSubject = this.processTemplate(template.subject_template, request.template_variables);
        }
      }

      // Create message record
      const messageData = {
        thread_id: threadId,
        sender_id: request.patient_id, // This would be current user in real implementation
        sender_type: 'staff',
        recipient_ids: [request.patient_id],
        type: request.type,
        channel: request.channel,
        subject: processedSubject,
        content: processedContent,
        priority: request.priority || 'normal',
        status: request.scheduled_at ? 'draft' : 'sent',
        template_id: request.template_id,
        metadata: {
          template_variables: request.template_variables,
          scheduled_at: request.scheduled_at,
        },
        attachments: [], // File attachments would be processed separately
      };

      const { data: message, error } = await this.supabase
        .from('communication_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // If not scheduled, attempt to send immediately
      if (!request.scheduled_at) {
        await this.deliverMessage(message.id, request.channel);
      }

      // Update thread last message timestamp
      await this.updateThreadLastMessage(threadId);

      return {
        success: true,
        message_id: message.id,
        thread_id: threadId,
        status: message.status,
        scheduled_at: request.scheduled_at,
        estimated_delivery: this.calculateDeliveryTime(request.channel),
        cost: this.calculateMessageCost(request.channel, processedContent.length)
      };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get messages with filtering and pagination
   */
  async getMessages(request: GetMessagesRequest): Promise<GetMessagesResponse> {
    try {
      let query = this.supabase
        .from('communication_messages')
        .select(`
          *,
          thread:communication_threads(*),
          attachments:communication_attachments(*)
        `);

      // Apply filters
      if (request.thread_id) {
        query = query.eq('thread_id', request.thread_id);
      }
      if (request.patient_id) {
        query = query.contains('recipient_ids', [request.patient_id]);
      }
      if (request.channel) {
        query = query.eq('channel', request.channel);
      }
      if (request.status) {
        query = query.eq('status', request.status);
      }
      if (request.type) {
        query = query.eq('type', request.type);
      }
      if (request.date_from) {
        query = query.gte('created_at', request.date_from);
      }
      if (request.date_to) {
        query = query.lte('created_at', request.date_to);
      }
      if (request.search) {
        query = query.or(`content.ilike.%${request.search}%,subject.ilike.%${request.search}%`);
      }

      // Apply sorting
      const sortBy = request.sort_by || 'created_at';
      const sortOrder = request.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = request.page || 1;
      const limit = Math.min(request.limit || 50, 100); // Max 100 items per page
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);

      const { data: messages, error, count } = await query;

      if (error) throw error;

      return {
        messages: messages || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit
      };

    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get message threads for a patient or all patients
   */
  async getMessageThreads(patientId?: string, includeArchived: boolean = false): Promise<MessageThreadWithLastMessage[]> {
    try {
      let query = this.supabase
        .from('communication_threads')
        .select(`
          *,
          last_message:communication_messages(
            id, content, created_at, sender_type, status, type, channel
          ),
          participants:communication_thread_participants(
            user_id, role, name, avatar, joined_at, last_read_at
          )
        `)
        .order('last_message_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (!includeArchived) {
        query = query.neq('status', 'archived');
      }

      const { data: threads, error } = await query;

      if (error) throw error;

      // Calculate unread count for each thread
      const threadsWithUnread = await Promise.all(
        (threads || []).map(async (thread) => {
          const unreadCount = await this.getUnreadMessageCount(thread.id);
          return {
            ...thread,
            unread_count: unreadCount
          };
        })
      );

      return threadsWithUnread;

    } catch (error) {
      console.error('Error getting message threads:', error);
      throw error;
    }
  }

  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Get all message templates
   */
  async getMessageTemplates(category?: TemplateCategory, channel?: CommunicationChannel): Promise<MessageTemplate[]> {
    try {
      let query = this.supabase
        .from('communication_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      if (channel) {
        query = query.contains('channel', [channel]);
      }

      const { data: templates, error } = await query;

      if (error) throw error;

      return templates || [];

    } catch (error) {
      console.error('Error getting message templates:', error);
      throw error;
    }
  }

  /**
   * Create a new message template
   */
  async createMessageTemplate(template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at'>): Promise<MessageTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('communication_templates')
        .insert({
          ...template,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error creating message template:', error);
      throw error;
    }
  }

  /**
   * Update message template
   */
  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('communication_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error updating message template:', error);
      throw error;
    }
  }

  // ============================================================================
  // CAMPAIGN OPERATIONS
  // ============================================================================

  /**
   * Get communication campaigns
   */
  async getCommunicationCampaigns(status?: CampaignStatus): Promise<CommunicationCampaign[]> {
    try {
      let query = this.supabase
        .from('communication_campaigns')
        .select(`
          *,
          template:communication_templates(name, subject_template, content_template)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: campaigns, error } = await query;

      if (error) throw error;

      return campaigns || [];

    } catch (error) {
      console.error('Error getting communication campaigns:', error);
      throw error;
    }
  }

  /**
   * Create a new communication campaign
   */
  async createCommunicationCampaign(campaign: Omit<CommunicationCampaign, 'id' | 'created_at' | 'updated_at' | 'metrics' | 'sent_count' | 'delivered_count' | 'read_count' | 'failed_count' | 'response_count' | 'unsubscribe_count'>): Promise<CommunicationCampaign> {
    try {
      // Estimate audience size
      const estimatedSize = await this.estimateAudienceSize(campaign.target_audience);

      const { data, error } = await this.supabase
        .from('communication_campaigns')
        .insert({
          ...campaign,
          total_recipients: estimatedSize,
          sent_count: 0,
          delivered_count: 0,
          read_count: 0,
          failed_count: 0,
          response_count: 0,
          unsubscribe_count: 0,
          metrics: {}
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error creating communication campaign:', error);
      throw error;
    }
  }

  /**
   * Execute a communication campaign
   */
  async executeCampaign(request: CampaignExecutionRequest): Promise<CampaignExecutionResponse> {
    try {
      const campaign = await this.getCampaign(request.campaign_id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get target audience
      const recipients = request.test_mode 
        ? await this.getTestRecipients(request.test_recipients || [])
        : await this.getCampaignRecipients(campaign.target_audience);

      // Update campaign status
      await this.updateCampaignStatus(request.campaign_id, 'running');

      // Create execution record
      const executionId = `exec_${Date.now()}`;

      // Queue messages for sending
      const queuedMessages = await this.queueCampaignMessages(
        campaign, 
        recipients, 
        executionId
      );

      const estimatedCost = this.calculateCampaignCost(campaign.channel, queuedMessages.length);

      return {
        success: true,
        execution_id: executionId,
        estimated_recipients: recipients.length,
        estimated_cost: estimatedCost,
        scheduled_at: campaign.scheduled_at
      };

    } catch (error) {
      console.error('Error executing campaign:', error);
      return {
        success: false,
        execution_id: '',
        estimated_recipients: 0,
        estimated_cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // CONSENT & PREFERENCES
  // ============================================================================

  /**
   * Check patient communication consent
   */
  async checkPatientConsent(patientId: string, channel: CommunicationChannel): Promise<boolean> {
    try {
      const { data: consent, error } = await this.supabase
        .from('communication_consent')
        .select('*')
        .eq('patient_id', patientId)
        .eq('channel', channel)
        .eq('consent_given', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (!consent) return false;

      // Check if consent has expired
      if (consent.expiry_date && new Date(consent.expiry_date) < new Date()) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error checking patient consent:', error);
      return false;
    }
  }

  /**
   * Update patient communication consent
   */
  async updatePatientConsent(consent: Omit<CommunicationConsent, 'id' | 'created_at' | 'updated_at'>): Promise<CommunicationConsent> {
    try {
      const { data, error } = await this.supabase
        .from('communication_consent')
        .upsert(consent, { 
          onConflict: 'patient_id,channel',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error updating patient consent:', error);
      throw error;
    }
  }

  /**
   * Get patient communication preferences
   */
  async getPatientPreferences(patientId: string): Promise<CommunicationPreferences | null> {
    try {
      const { data: preferences, error } = await this.supabase
        .from('communication_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return preferences;

    } catch (error) {
      console.error('Error getting patient preferences:', error);
      return null;
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Get communication statistics
   */
  async getCommunicationStats(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): Promise<CommunicationStats> {
    try {
      const dateRange = this.getDateRange(period);

      // Get basic message counts
      const { data: messageStats, error: statsError } = await this.supabase
        .from('communication_messages')
        .select('channel, type, status, created_at')
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);

      if (statsError) throw statsError;

      // Process statistics
      const stats: CommunicationStats = {
        period,
        total_messages: messageStats?.length || 0,
        messages_by_channel: this.groupByChannel(messageStats || []),
        messages_by_type: this.groupByType(messageStats || []),
        average_response_time: await this.calculateAverageResponseTime(dateRange),
        automation_success_rate: await this.calculateAutomationSuccessRate(dateRange),
        top_templates: await this.getTopTemplates(dateRange),
        peak_hours: await this.getPeakHours(dateRange),
        staff_performance: await this.getStaffPerformance(dateRange)
      };

      return stats;

    } catch (error) {
      console.error('Error getting communication stats:', error);
      throw error;
    }
  }

  /**
   * Get communication dashboard data
   */
  async getCommunicationDashboard(): Promise<CommunicationDashboardData> {
    try {
      const [
        stats,
        recentMessages,
        activeCampaigns,
        pendingApprovals,
        failedMessages,
        topPerformers
      ] = await Promise.all([
        this.getCommunicationStats('today'),
        this.getRecentMessages(10),
        this.getCommunicationCampaigns('running'),
        this.getPendingApprovals(),
        this.getFailedMessages(),
        this.getTopPerformers()
      ]);

      return {
        stats,
        recent_messages: recentMessages,
        active_campaigns: activeCampaigns,
        pending_approvals: pendingApprovals,
        failed_messages: failedMessages,
        top_performers: topPerformers
      };

    } catch (error) {
      console.error('Error getting communication dashboard:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private requiresConsent(channel: CommunicationChannel, type: MessageType): boolean {
    // Marketing messages always require consent
    if (type === 'alert' && channel !== 'portal') return true;
    
    // SMS and WhatsApp require consent for non-emergency communications
    if ((channel === 'sms' || channel === 'whatsapp') && type !== 'alert') return true;
    
    return false;
  }

  private async createMessageThread(patientId: string, subject?: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('communication_threads')
      .insert({
        patient_id: patientId,
        subject: subject || 'New Conversation',
        status: 'active',
        priority: 'normal',
        participants: []
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  private async getMessageTemplate(templateId: string): Promise<MessageTemplate | null> {
    const { data, error } = await this.supabase
      .from('communication_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  private async deliverMessage(messageId: string, channel: CommunicationChannel): Promise<void> {
    // In a real implementation, this would integrate with external providers
    // For now, we'll just update the message status
    await this.supabase
      .from('communication_messages')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', messageId);
  }

  private async updateThreadLastMessage(threadId: string): Promise<void> {
    await this.supabase
      .from('communication_threads')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', threadId);
  }

  private calculateDeliveryTime(channel: CommunicationChannel): string {
    const baseTime = new Date();
    
    switch (channel) {
      case 'sms':
      case 'whatsapp':
        baseTime.setMinutes(baseTime.getMinutes() + 1);
        break;
      case 'email':
        baseTime.setMinutes(baseTime.getMinutes() + 5);
        break;
      case 'portal':
        baseTime.setSeconds(baseTime.getSeconds() + 30);
        break;
      default:
        baseTime.setMinutes(baseTime.getMinutes() + 2);
    }

    return baseTime.toISOString();
  }

  private calculateMessageCost(channel: CommunicationChannel, contentLength: number): number {
    // Simplified cost calculation
    const baseCosts = {
      sms: 0.05,
      whatsapp: 0.03,
      email: 0.01,
      portal: 0,
      internal: 0
    };

    const segmentMultiplier = Math.ceil(contentLength / 160); // SMS segment size
    return baseCosts[channel] * segmentMultiplier;
  }

  private async getUnreadMessageCount(threadId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('communication_messages')
      .select('id', { count: 'exact' })
      .eq('thread_id', threadId)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  }

  private async estimateAudienceSize(audience: any): Promise<number> {
    // Simplified audience estimation
    return 100; // In real implementation, would query based on criteria
  }

  private async getCampaign(campaignId: string): Promise<CommunicationCampaign | null> {
    const { data, error } = await this.supabase
      .from('communication_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private async getTestRecipients(testIds: string[]): Promise<string[]> {
    return testIds;
  }

  private async getCampaignRecipients(audience: any): Promise<string[]> {
    // In real implementation, would query patients based on audience criteria
    return [];
  }

  private async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<void> {
    await this.supabase
      .from('communication_campaigns')
      .update({ status })
      .eq('id', campaignId);
  }

  private async queueCampaignMessages(campaign: CommunicationCampaign, recipients: string[], executionId: string): Promise<any[]> {
    // In real implementation, would queue messages for batch processing
    return [];
  }

  private calculateCampaignCost(channel: CommunicationChannel, messageCount: number): number {
    return this.calculateMessageCost(channel, 160) * messageCount;
  }

  private getDateRange(period: string) {
    const now = new Date();
    const from = new Date();

    switch (period) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      from: from.toISOString(),
      to: now.toISOString()
    };
  }

  private groupByChannel(messages: any[]) {
    const groups: Record<CommunicationChannel, number> = {
      sms: 0,
      email: 0,
      portal: 0,
      whatsapp: 0,
      internal: 0
    };

    messages.forEach(message => {
      groups[message.channel] = (groups[message.channel] || 0) + 1;
    });

    return groups;
  }

  private groupByType(messages: any[]) {
    const groups: Record<MessageType, number> = {
      text: 0,
      appointment: 0,
      reminder: 0,
      alert: 0,
      document: 0,
      image: 0,
      form: 0
    };

    messages.forEach(message => {
      groups[message.type] = (groups[message.type] || 0) + 1;
    });

    return groups;
  }

  private async calculateAverageResponseTime(dateRange: any): Promise<number> {
    // Simplified calculation - would be more complex in real implementation
    return 45; // 45 minutes average
  }

  private async calculateAutomationSuccessRate(dateRange: any): Promise<number> {
    // Simplified calculation
    return 0.95; // 95% success rate
  }

  private async getTopTemplates(dateRange: any) {
    // Simplified - would query actual template usage
    return [];
  }

  private async getPeakHours(dateRange: any) {
    // Simplified - would analyze message patterns by hour
    return [];
  }

  private async getStaffPerformance(dateRange: any) {
    // Simplified - would analyze staff communication metrics
    return [];
  }

  private async getRecentMessages(limit: number): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('communication_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  private async getPendingApprovals(): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('communication_messages')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async getFailedMessages(): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('communication_messages')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private async getTopPerformers() {
    // Simplified - would calculate actual staff performance metrics
    return [];
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();