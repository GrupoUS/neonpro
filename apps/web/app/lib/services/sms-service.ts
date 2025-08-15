// SMS Service for NeonPro
// Comprehensive SMS service supporting multiple Brazilian providers

import type {
  BulkSMSRequest,
  BulkSMSResponse,
  MovileConfig,
  SendSMSResponse,
  SMSAnalytics,
  SMSDevConfig,
  SMSDevWebhook,
  SMSError,
  SMSErrorCode,
  SMSListParams,
  SMSListResponse,
  SMSMessage,
  SMSOptIn,
  SMSProvider,
  SMSProviderConfig,
  SMSStatus,
  SMSTemplate,
  TwilioConfig,
  TwilioWebhook,
  ZenviaConfig,
} from '@/app/types/sms';
import { createClient } from '@/app/utils/supabase/client';

export class SMSService {
  private supabase = createClient();

  // ==================== PROVIDER MANAGEMENT ====================

  /**
   * Get all SMS provider configurations
   */
  async getProviders(): Promise<SMSProviderConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('sms_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching SMS providers:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch providers',
        error
      );
    }
  }

  /**
   * Get active SMS provider
   */
  async getActiveProvider(): Promise<SMSProviderConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('sms_providers')
        .select('*')
        .eq('enabled', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching active SMS provider:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch active provider',
        error
      );
    }
  }

  /**
   * Create or update SMS provider configuration
   */
  async upsertProvider(
    config: Omit<SMSProviderConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SMSProviderConfig> {
    try {
      // Validate provider configuration
      await this.validateProviderConfig(config.provider, config.config);

      // Disable other providers if this one is being enabled
      if (config.enabled) {
        await this.supabase
          .from('sms_providers')
          .update({ enabled: false })
          .neq('id', config.id || '');
      }

      const { data, error } = await this.supabase
        .from('sms_providers')
        .upsert({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting SMS provider:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to save provider configuration',
        error
      );
    }
  }

  /**
   * Test SMS provider connection
   */
  async testProvider(providerId: string, testPhone: string): Promise<boolean> {
    try {
      const response = await this.sendMessage({
        provider_id: providerId,
        to: testPhone,
        body: 'Teste de configuração NeonPro SMS - Esta é uma mensagem de teste para validar a integração.',
      });

      return response.status === 'queued' || response.status === 'sent';
    } catch (error) {
      console.error('Error testing SMS provider:', error);
      return false;
    }
  }

  // ==================== MESSAGE SENDING ====================

  /**
   * Send individual SMS message
   */
  async sendMessage(params: {
    provider_id: string;
    to: string;
    body: string;
    template_id?: string;
    variables?: Record<string, string>;
  }): Promise<SendSMSResponse> {
    try {
      // Check opt-in status
      const optInStatus = await this.checkOptInStatus(params.to);
      if (optInStatus !== 'opted_in') {
        throw this.createSMSError(
          'OPT_OUT',
          'Recipient has not opted in for SMS communication'
        );
      }

      // Get provider configuration
      const provider = await this.getProviderById(params.provider_id);
      if (!(provider && provider.enabled)) {
        throw this.createSMSError(
          'PROVIDER_ERROR',
          'SMS provider not found or disabled'
        );
      }

      // Process template if provided
      let messageBody = params.body;
      if (params.template_id) {
        const template = await this.getTemplate(params.template_id);
        if (template) {
          messageBody = this.processTemplate(
            template.body,
            params.variables || {}
          );
        }
      }

      // Send via provider
      const providerResponse = await this.sendViaProvider(
        provider,
        params.to,
        messageBody
      );

      // Save message to database
      const message = await this.saveMessage({
        provider_id: params.provider_id,
        provider: provider.provider,
        to: params.to,
        from: this.getFromNumber(provider),
        body: messageBody,
        status: 'queued',
        provider_message_id: providerResponse.id,
        direction: 'outbound',
        cost: providerResponse.cost,
        parts: providerResponse.parts,
      });

      return {
        message_id: message.id,
        provider_message_id: providerResponse.id,
        to: params.to,
        status: 'queued',
        cost: providerResponse.cost,
        parts: providerResponse.parts,
        queued_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error instanceof Error && 'code' in error
        ? error
        : this.createSMSError(
            'PROVIDER_ERROR',
            'Failed to send SMS message',
            error
          );
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkMessages(request: BulkSMSRequest): Promise<BulkSMSResponse> {
    try {
      const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const batchSize = request.batch_size || 10;

      const results = {
        batch_id: batchId,
        total_messages: request.messages.length,
        queued_messages: 0,
        failed_messages: 0,
        estimated_cost: 0,
        status: 'processing' as const,
        errors: [] as Array<{ phone: string; error: string }>,
      };

      // Process messages in batches to respect rate limits
      for (let i = 0; i < request.messages.length; i += batchSize) {
        const batch = request.messages.slice(i, i + batchSize);

        const batchPromises = batch.map(async (message) => {
          try {
            const response = await this.sendMessage({
              provider_id: request.provider_id,
              to: message.to,
              body: message.body,
              template_id: request.template_id,
              variables: message.variables,
            });

            results.queued_messages++;
            results.estimated_cost += response.cost || 0;
          } catch (error) {
            results.failed_messages++;
            results.errors.push({
              phone: message.to,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        });

        await Promise.allSettled(batchPromises);

        // Rate limiting delay between batches
        if (i + batchSize < request.messages.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      results.status =
        results.failed_messages === 0 ? 'completed' : 'completed';
      return results;
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to send bulk SMS messages',
        error
      );
    }
  }

  // ==================== PROVIDER IMPLEMENTATIONS ====================

  /**
   * Send SMS via specific provider
   */
  private async sendViaProvider(
    provider: SMSProviderConfig,
    to: string,
    body: string
  ): Promise<{
    id: string;
    cost?: number;
    parts?: number;
  }> {
    switch (provider.provider) {
      case 'twilio':
        return this.sendViaTwilio(provider.config as TwilioConfig, to, body);
      case 'sms_dev':
        return this.sendViaSMSDev(provider.config as SMSDevConfig, to, body);
      case 'zenvia':
        return this.sendViaZenvia(provider.config as ZenviaConfig, to, body);
      case 'movile':
        return this.sendViaMovile(provider.config as MovileConfig, to, body);
      default:
        throw this.createSMSError(
          'PROVIDER_ERROR',
          `Unsupported provider: ${provider.provider}`
        );
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(
    config: TwilioConfig,
    to: string,
    body: string
  ): Promise<{
    id: string;
    cost?: number;
    parts?: number;
  }> {
    try {
      const auth = Buffer.from(
        `${config.account_sid}:${config.auth_token}`
      ).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: config.from_number,
            Body: body,
            ...(config.status_callback && {
              StatusCallback: config.status_callback,
            }),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Twilio error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        id: data.sid,
        cost: Number.parseFloat(data.price || '0'),
        parts: Number.parseInt(data.num_segments || '1', 10),
      };
    } catch (error) {
      throw this.createSMSError('PROVIDER_ERROR', 'Twilio API error', error);
    }
  }

  /**
   * Send SMS via SMS Dev (ZENVIA)
   */
  private async sendViaSMSDev(
    config: SMSDevConfig,
    to: string,
    body: string
  ): Promise<{
    id: string;
    cost?: number;
    parts?: number;
  }> {
    try {
      const response = await fetch('https://api.smsdev.com.br/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.api_key}`,
        },
        body: JSON.stringify({
          number: to.replace('+', ''),
          message: body,
          sender: config.sender_id,
          ...(config.callback_option && { callback: config.webhook_url }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`SMS Dev error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        id: data.id.toString(),
        cost: data.cost || 0,
        parts: Math.ceil(body.length / 160),
      };
    } catch (error) {
      throw this.createSMSError('PROVIDER_ERROR', 'SMS Dev API error', error);
    }
  }

  /**
   * Send SMS via ZENVIA
   */
  private async sendViaZenvia(
    config: ZenviaConfig,
    to: string,
    body: string
  ): Promise<{
    id: string;
    cost?: number;
    parts?: number;
  }> {
    try {
      const response = await fetch(
        'https://api.zenvia.com/v2/channels/sms/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-TOKEN': config.api_token,
          },
          body: JSON.stringify({
            from: config.from,
            to,
            contents: [
              {
                type: 'text',
                text: body,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ZENVIA error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        parts: Math.ceil(body.length / 160),
      };
    } catch (error) {
      throw this.createSMSError('PROVIDER_ERROR', 'ZENVIA API error', error);
    }
  }

  /**
   * Send SMS via Movile
   */
  private async sendViaMovile(
    config: MovileConfig,
    to: string,
    body: string
  ): Promise<{
    id: string;
    cost?: number;
    parts?: number;
  }> {
    try {
      const response = await fetch(
        'https://api-messaging.movile.com/v1/send-sms',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${config.username}:${config.auth_token}`).toString('base64')}`,
          },
          body: JSON.stringify({
            destination: to.replace('+', ''),
            messageText: body,
            sender: config.sender_id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Movile error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        id: data.id.toString(),
        parts: Math.ceil(body.length / 160),
      };
    } catch (error) {
      throw this.createSMSError('PROVIDER_ERROR', 'Movile API error', error);
    }
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Get SMS messages with filtering and pagination
   */
  async getMessages(params: SMSListParams = {}): Promise<SMSListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        filters = {},
      } = params;

      let query = this.supabase
        .from('sms_messages')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.provider) {
        query = query.eq('provider', filters.provider);
      }
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }
      if (filters.direction) {
        query = query.eq('direction', filters.direction);
      }
      if (filters.phone_number) {
        query = query.or(
          `to.ilike.%${filters.phone_number}%,from.ilike.%${filters.phone_number}%`
        );
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.ilike('body', `%${filters.search}%`);
      }

      // Apply sorting and pagination
      query = query
        .order(sort, { ascending: order === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
          has_next: page * limit < (count || 0),
          has_prev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching SMS messages:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch messages',
        error
      );
    }
  }

  /**
   * Get SMS message by ID
   */
  async getMessage(id: string): Promise<SMSMessage | null> {
    try {
      const { data, error } = await this.supabase
        .from('sms_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching SMS message:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch message',
        error
      );
    }
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Get SMS templates
   */
  async getTemplates(): Promise<SMSTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('sms_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch templates',
        error
      );
    }
  }

  /**
   * Create or update SMS template
   */
  async upsertTemplate(
    template: Omit<SMSTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SMSTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('sms_templates')
        .upsert({
          ...template,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting SMS template:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to save template',
        error
      );
    }
  }

  // ==================== OPT-IN MANAGEMENT ====================

  /**
   * Check opt-in status for phone number
   */
  async checkOptInStatus(
    phoneNumber: string
  ): Promise<'opted_in' | 'opted_out' | 'pending'> {
    try {
      const { data, error } = await this.supabase
        .from('sms_opt_ins')
        .select('status')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.status || 'pending';
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      return 'pending';
    }
  }

  /**
   * Update opt-in status
   */
  async updateOptInStatus(
    phoneNumber: string,
    status: 'opted_in' | 'opted_out',
    source = 'manual',
    patientId?: string
  ): Promise<SMSOptIn> {
    try {
      const { data, error } = await this.supabase
        .from('sms_opt_ins')
        .upsert({
          phone_number: phoneNumber,
          patient_id: patientId,
          status,
          source,
          [`${status === 'opted_in' ? 'opt_in' : 'opt_out'}_date`]:
            new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opt-in status:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to update opt-in status',
        error
      );
    }
  }

  // ==================== WEBHOOK PROCESSING ====================

  /**
   * Process webhook event
   */
  async processWebhook(provider: SMSProvider, payload: any): Promise<void> {
    try {
      switch (provider) {
        case 'twilio':
          await this.processTwilioWebhook(payload as TwilioWebhook);
          break;
        case 'sms_dev':
          await this.processSMSDevWebhook(payload as SMSDevWebhook);
          break;
        default:
          console.warn(
            `Webhook processing not implemented for provider: ${provider}`
          );
      }
    } catch (error) {
      console.error('Error processing SMS webhook:', error);
      throw this.createSMSError(
        'WEBHOOK_ERROR',
        'Failed to process webhook',
        error
      );
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get SMS analytics
   */
  async getAnalytics(
    startDate: string,
    endDate: string,
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<SMSAnalytics> {
    try {
      const { data, error } = await this.supabase.rpc('get_sms_analytics', {
        start_date: startDate,
        end_date: endDate,
        period_type: period,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching SMS analytics:', error);
      throw this.createSMSError(
        'PROVIDER_ERROR',
        'Failed to fetch analytics',
        error
      );
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate provider configuration
   */
  private async validateProviderConfig(
    provider: SMSProvider,
    config: any
  ): Promise<void> {
    switch (provider) {
      case 'twilio':
        if (!(config.account_sid && config.auth_token && config.from_number)) {
          throw this.createSMSError(
            'INVALID_CONFIG',
            'Twilio configuration incomplete'
          );
        }
        break;
      case 'sms_dev':
        if (!(config.api_key && config.sender_id)) {
          throw this.createSMSError(
            'INVALID_CONFIG',
            'SMS Dev configuration incomplete'
          );
        }
        break;
      case 'zenvia':
        if (!(config.api_token && config.from)) {
          throw this.createSMSError(
            'INVALID_CONFIG',
            'ZENVIA configuration incomplete'
          );
        }
        break;
      case 'movile':
        if (!(config.username && config.auth_token && config.sender_id)) {
          throw this.createSMSError(
            'INVALID_CONFIG',
            'Movile configuration incomplete'
          );
        }
        break;
    }
  }

  /**
   * Process template with variables
   */
  private processTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      processed = processed.replace(
        new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
        value
      );
    }
    return processed;
  }

  /**
   * Get from number for provider
   */
  private getFromNumber(provider: SMSProviderConfig): string {
    switch (provider.provider) {
      case 'twilio':
        return (provider.config as TwilioConfig).from_number;
      case 'sms_dev':
        return (provider.config as SMSDevConfig).sender_id;
      case 'zenvia':
        return (provider.config as ZenviaConfig).from;
      case 'movile':
        return (provider.config as MovileConfig).sender_id;
      default:
        return 'NeonPro';
    }
  }

  /**
   * Save message to database
   */
  private async saveMessage(
    message: Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SMSMessage> {
    const { data, error } = await this.supabase
      .from('sms_messages')
      .insert({
        ...message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get provider by ID
   */
  private async getProviderById(id: string): Promise<SMSProviderConfig | null> {
    const { data, error } = await this.supabase
      .from('sms_providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Get template by ID
   */
  private async getTemplate(id: string): Promise<SMSTemplate | null> {
    const { data, error } = await this.supabase
      .from('sms_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Process Twilio webhook
   */
  private async processTwilioWebhook(webhook: TwilioWebhook): Promise<void> {
    const statusMap: Record<string, SMSStatus> = {
      queued: 'queued',
      sending: 'sending',
      sent: 'sent',
      delivered: 'delivered',
      undelivered: 'undelivered',
      failed: 'failed',
    };

    await this.updateMessageStatus(
      webhook.MessageSid,
      statusMap[webhook.MessageStatus] || 'failed',
      webhook.ErrorCode,
      webhook.ErrorMessage
    );
  }

  /**
   * Process SMS Dev webhook
   */
  private async processSMSDevWebhook(webhook: SMSDevWebhook): Promise<void> {
    const statusMap: Record<string, SMSStatus> = {
      DELIVRD: 'delivered',
      EXPIRED: 'failed',
      DELETED: 'failed',
      UNDELIV: 'undelivered',
      ACCEPTD: 'sent',
      UNKNOWN: 'failed',
    };

    await this.updateMessageStatus(
      webhook.id,
      statusMap[webhook.status] || 'failed'
    );
  }

  /**
   * Update message status
   */
  private async updateMessageStatus(
    providerMessageId: string,
    status: SMSStatus,
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.failed_at = new Date().toISOString();
      if (errorCode) updateData.error_code = errorCode;
      if (errorMessage) updateData.error_message = errorMessage;
    } else if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }

    await this.supabase
      .from('sms_messages')
      .update(updateData)
      .eq('provider_message_id', providerMessageId);
  }

  /**
   * Create standardized SMS error
   */
  private createSMSError(
    code: SMSErrorCode,
    message: string,
    details?: any
  ): SMSError & Error {
    const error = new Error(message) as SMSError & Error;
    error.code = code;
    error.message = message;
    error.provider = 'unknown' as SMSProvider;
    error.retryable = ['RATE_LIMIT', 'NETWORK_ERROR'].includes(code);
    error.details = details;
    return error;
  }
}

// Export singleton instance
export const smsService = new SMSService();
