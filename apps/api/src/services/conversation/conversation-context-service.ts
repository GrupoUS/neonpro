/**
 * Conversation Context Persistence Service
 *
 * Manages conversation context storage and retrieval for AI agent sessions
 * in Supabase with LGPD compliance and healthcare data protection.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../../packages/database/src/types/database';

export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'structured' | 'error';
  metadata?: {
    sources?: Array<{
      id: string;
      type: 'patient_data' | 'medical_knowledge' | 'appointment' | 'financial' | 'document';
      title: string;
      snippet?: string;
      relevanceScore?: number;
    }>;
    confidence?: number;
    processingTimeMs?: number;
    actionTaken?: string;
    queryIntent?: string;
    entitiesExtracted?: string[];
  };
  timestamp: string;
  userId: string;
  patientId?: string;
  encryptionKey?: string; // For sensitive healthcare data
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  messages: ConversationMessage[];
  contextSummary?: {
    topics: string[];
    entities: string[];
    lastQueryIntent?: string;
    patientFocus?: string;
    conversationFlow: 'initial' | 'follow_up' | 'clarification' | 'resolution';
  };
  userPreferences?: {
    language: 'pt-BR' | 'en-US';
    detailLevel: 'basic' | 'detailed' | 'comprehensive';
    responseFormat: 'text' | 'structured' | 'mixed';
    accessibilityNeeds?: string[];
  };
  sessionMetadata: {
    startedAt: string;
    lastActivity: string;
    messageCount: number;
    averageResponseTime?: number;
    satisfactionRating?: number;
    complianceFlags: string[];
  };
  retentionPolicy: {
    retentionDays: number;
    autoDelete: boolean;
    archivalEnabled: boolean;
  };
}

export interface ContextSearchOptions {
  sessionId?: string;
  userId?: string;
  patientId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  messageTypes?: ConversationMessage['type'][];
  roles?: ConversationMessage['role'][];
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
  dataClassification?: ConversationMessage['dataClassification'][];
}

export interface ContextAnalytics {
  totalSessions: number;
  totalMessages: number;
  averageMessagesPerSession: number;
  topTopics: Array<{ topic: string; count: number }>;
  responseTimeAnalytics: {
    average: number;
    min: number;
    max: number;
    p95: number;
  };
  satisfactionTrends: Array<{
    period: string;
    averageRating: number;
    sessionCount: number;
  }>;
  complianceMetrics: {
    flaggedContent: number;
    dataBreaches: number;
    accessViolations: number;
  };
}

export class ConversationContextService {
  private supabase: SupabaseClient<Database>;
  private cache: Map<string, ConversationContext> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  /**
   * Store a conversation message in the database
   */
  async storeMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      const messageId = uuidv4();
      const timestamp = new Date().toISOString();

      // Prepare message for storage with LGPD compliance
      const sanitizedContent = this.sanitizeContent(message.content, message.dataClassification);

      const messageData = {
        id: messageId,
        session_id: message.sessionId,
        user_id: message.userId,
        patient_id: message.patientId || null,
        role: message.role,
        content: sanitizedContent,
        message_type: message.type,
        metadata: message.metadata || {},
        timestamp,
        data_classification: message.dataClassification,
        encryption_key: message.encryptionKey || null,
        created_at: timestamp,
        updated_at: timestamp,
      };

      const { data, error } = await this.supabase
        .from('agent_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store conversation message: ${error.message}`);
      }

      // Update session activity
      await this.updateSessionActivity(message.sessionId);

      // Invalidate cache for this session
      this.invalidateCache(message.sessionId);

      return messageId;
    } catch (error) {
      console.error('[ConversationContext] Error storing message:', error);
      throw error;
    }
  }

  /**
   * Retrieve conversation context for a session
   */
  async getConversationContext(
    sessionId: string,
    options: {
      includeMetadata?: boolean;
      messageLimit?: number;
      includeSystemMessages?: boolean;
    } = {},
  ): Promise<ConversationContext | null> {
    try {
      // Check cache first
      const cached = this.getFromCache(sessionId);
      if (cached) {
        return cached;
      }

      // Get session information
      const { data: session, error: sessionError } = await this.supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        return null;
      }

      // Get messages for the session
      let query = this.supabase
        .from('agent_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (!options.includeSystemMessages) {
        query = query.neq('role', 'system');
      }

      if (options.messageLimit) {
        query = query.limit(options.messageLimit);
      }

      const { data: messages, error: messagesError } = await query;

      if (messagesError) {
        throw new Error(`Failed to retrieve messages: ${messagesError.message}`);
      }

      // Convert database messages to ConversationMessage format
      const conversationMessages: ConversationMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        sessionId: msg.session_id,
        role: msg.role,
        content: msg.content,
        type: msg.message_type,
        metadata: msg.metadata as ConversationMessage['metadata'],
        timestamp: msg.timestamp,
        userId: msg.user_id,
        patientId: msg.patient_id || undefined,
        encryptionKey: msg.encryption_key || undefined,
        dataClassification: msg.data_classification,
      }));

      // Generate context summary
      const contextSummary = this.generateContextSummary(conversationMessages);

      // Build conversation context
      const context: ConversationContext = {
        sessionId,
        userId: session.user_id,
        messages: conversationMessages,
        contextSummary,
        userPreferences: session.context?.userPreferences || {},
        sessionMetadata: {
          startedAt: session.created_at,
          lastActivity: session.last_activity,
          messageCount: conversationMessages.length,
          averageResponseTime: this.calculateAverageResponseTime(conversationMessages),
          complianceFlags: session.context?.complianceFlags || [],
        },
        retentionPolicy: {
          retentionDays: 30, // LGPD compliance
          autoDelete: true,
          archivalEnabled: true,
        },
      };

      // Cache the result
      this.setCache(sessionId, context);

      return context;
    } catch (error) {
      console.error('[ConversationContext] Error retrieving context:', error);
      throw error;
    }
  }

  /**
   * Search conversation history
   */
  async searchConversations(options: ContextSearchOptions): Promise<{
    messages: ConversationMessage[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      let query = this.supabase
        .from('agent_messages')
        .select('*', { count: 'exact' });

      // Apply filters
      if (options.sessionId) {
        query = query.eq('session_id', options.sessionId);
      }
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options.dateRange) {
        query = query
          .gte('timestamp', options.dateRange.start)
          .lte('timestamp', options.dateRange.end);
      }
      if (options.messageTypes?.length) {
        query = query.in('message_type', options.messageTypes);
      }
      if (options.roles?.length) {
        query = query.in('role', options.roles);
      }
      if (options.dataClassification?.length) {
        query = query.in('data_classification', options.dataClassification);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset || 0) + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query.order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to search conversations: ${error.message}`);
      }

      const messages: ConversationMessage[] = (data || []).map(msg => ({
        id: msg.id,
        sessionId: msg.session_id,
        role: msg.role,
        content: msg.content,
        type: msg.message_type,
        metadata: msg.metadata as ConversationMessage['metadata'],
        timestamp: msg.timestamp,
        userId: msg.user_id,
        patientId: msg.patient_id || undefined,
        encryptionKey: msg.encryption_key || undefined,
        dataClassification: msg.data_classification,
      }));

      return {
        messages,
        totalCount: count || 0,
        hasMore: (options.limit || 10) === messages.length,
      };
    } catch (error) {
      console.error('[ConversationContext] Error searching conversations:', error);
      throw error;
    }
  }

  /**
   * Update conversation context summary
   */
  async updateContextSummary(
    sessionId: string,
    summary: Partial<ConversationContext['contextSummary']>,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_context')
        .upsert({
          session_id: sessionId,
          context_summary: summary,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(`Failed to update context summary: ${error.message}`);
      }

      // Invalidate cache
      this.invalidateCache(sessionId);
    } catch (error) {
      console.error('[ConversationContext] Error updating context summary:', error);
      throw error;
    }
  }

  /**
   * Generate conversation analytics
   */
  async generateAnalytics(
    options: {
      userId?: string;
      dateRange?: { start: string; end: string };
      patientId?: string;
    } = {},
  ): Promise<ContextAnalytics> {
    try {
      let query = this.supabase
        .from('agent_messages')
        .select('*');

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options.dateRange) {
        query = query
          .gte('timestamp', options.dateRange.start)
          .lte('timestamp', options.dateRange.end);
      }

      const { data: messages, error } = await query;

      if (error) {
        throw new Error(`Failed to generate analytics: ${error.message}`);
      }

      // Get sessions count
      let sessionsQuery = this.supabase.from('agent_sessions').select('*', { count: 'exact' });
      if (options.userId) {
        sessionsQuery = sessionsQuery.eq('user_id', options.userId);
      }
      if (options.dateRange) {
        sessionsQuery = sessionsQuery
          .gte('created_at', options.dateRange.start)
          .lte('created_at', options.dateRange.end);
      }
      const { count: sessionCount } = await sessionsQuery;

      return this.calculateAnalytics(messages || [], sessionCount || 0);
    } catch (error) {
      console.error('[ConversationContext] Error generating analytics:', error);
      throw error;
    }
  }

  /**
   * Apply retention policies and cleanup old conversations
   */
  async applyRetentionPolicies(): Promise<{
    deletedSessions: number;
    deletedMessages: number;
    archivedSessions: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30-day retention

      // Archive old sessions
      const { data: sessionsToArchive } = await this.supabase
        .from('agent_sessions')
        .select('id')
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_active', false);

      let archivedSessions = 0;
      for (const session of sessionsToArchive || []) {
        await this.archiveSession(session.id);
        archivedSessions++;
      }

      // Delete very old sessions (beyond archival period)
      const archivalCutoff = new Date();
      archivalCutoff.setDate(archivalCutoff.getDate() - 90); // 90-day archival

      const { data: sessionsToDelete } = await this.supabase
        .from('agent_sessions')
        .select('id')
        .lt('created_at', archivalCutoff.toISOString());

      let deletedSessions = 0;
      let deletedMessages = 0;
      for (const session of sessionsToDelete || []) {
        const { count } = await this.supabase
          .from('agent_messages')
          .delete({ count: 'exact' })
          .eq('session_id', session.id);

        await this.supabase
          .from('agent_sessions')
          .delete()
          .eq('id', session.id);

        deletedSessions++;
        deletedMessages += count || 0;
      }

      return {
        deletedSessions,
        deletedMessages,
        archivedSessions,
      };
    } catch (error) {
      console.error('[ConversationContext] Error applying retention policies:', error);
      throw error;
    }
  }

  /**
   * Archive a conversation session
   */
  private async archiveSession(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_sessions')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Failed to archive session: ${error.message}`);
      }
    } catch (error) {
      console.error('[ConversationContext] Error archiving session:', error);
      throw error;
    }
  }

  /**
   * Sanitize content for LGPD compliance
   */
  private sanitizeContent(
    content: string,
    classification: ConversationMessage['dataClassification'],
  ): string {
    if (classification === 'public' || classification === 'internal') {
      return content;
    }

    // For confidential and restricted data, apply sanitization
    let sanitized = content;

    // Remove potential PII patterns (basic implementation)
    const piiPatterns = [
      /\d{3}\.\d{3}\.\d{3}-\d{2}/g, // CPF
      /\d{11}/g, // Phone numbers
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
      /\d{2}\/\d{2}\/\d{4}/g, // Dates
    ];

    piiPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Generate context summary from messages
   */
  private generateContextSummary(
    messages: ConversationMessage[],
  ): ConversationContext['contextSummary'] {
    if (messages.length === 0) {
      return {
        topics: [],
        entities: [],
        conversationFlow: 'initial',
      };
    }

    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    // Simple topic extraction (in production, use NLP)
    const topics = this.extractTopics(messages);
    const entities = this.extractEntities(messages);

    return {
      topics,
      entities,
      lastQueryIntent: lastUserMessage?.metadata?.queryIntent,
      patientFocus: this.extractPatientFocus(messages),
      conversationFlow: this.determineConversationFlow(messages),
    };
  }

  /**
   * Extract topics from messages
   */
  private extractTopics(messages: ConversationMessage[]): string[] {
    const allContent = messages.map(m => m.content).join(' ').toLowerCase();
    const healthcareTopics = [
      'agendamento',
      'consulta',
      'exame',
      'tratamento',
      'medicamento',
      'paciente',
      'médico',
      'clinica',
      'hospital',
      'saúde',
      'appointment',
      'consultation',
      'exam',
      'treatment',
      'medicine',
      'patient',
      'doctor',
      'clinic',
      'hospital',
      'health',
    ];

    return healthcareTopics.filter(topic => allContent.includes(topic));
  }

  /**
   * Extract entities from messages
   */
  private extractEntities(messages: ConversationMessage[]): string[] {
    const entities = new Set<string>();

    messages.forEach(message => {
      if (message.metadata?.entitiesExtracted) {
        message.metadata.entitiesExtracted.forEach(entity => {
          entities.add(entity);
        });
      }
    });

    return Array.from(entities);
  }

  /**
   * Extract patient focus from messages
   */
  private extractPatientFocus(messages: ConversationMessage[]): string | undefined {
    const patientMessages = messages.filter(m => m.patientId);
    if (patientMessages.length > 0) {
      return patientMessages[0].patientId;
    }
    return undefined;
  }

  /**
   * Determine conversation flow
   */
  private determineConversationFlow(
    messages: ConversationMessage[],
  ): ConversationContext['contextSummary']['conversationFlow'] {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    if (userMessages.length === 1 && assistantMessages.length === 0) {
      return 'initial';
    } else if (
      userMessages.some(m =>
        m.content.toLowerCase().includes('esclarecer')
        || m.content.toLowerCase().includes('clarify')
      )
    ) {
      return 'clarification';
    } else if (userMessages.length > 1 && assistantMessages.length > 0) {
      return 'follow_up';
    } else {
      return 'resolution';
    }
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(messages: ConversationMessage[]): number | undefined {
    const responseTimes: number[] = [];

    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];

      if (current.role === 'assistant' && previous.role === 'user') {
        const responseTime = new Date(current.timestamp).getTime()
          - new Date(previous.timestamp).getTime();
        responseTimes.push(responseTime);
      }
    }

    if (responseTimes.length === 0) {
      return undefined;
    }

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  /**
   * Calculate analytics from messages
   */
  private calculateAnalytics(
    messages: ConversationMessage[],
    sessionCount: number,
  ): ContextAnalytics {
    // Calculate response time analytics
    const responseTimes = this.extractResponseTimes(messages);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate topics frequency
    const topicCounts = new Map<string, number>();
    messages.forEach(message => {
      const topics = this.extractTopics([message]);
      topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    return {
      totalSessions: sessionCount,
      totalMessages: messages.length,
      averageMessagesPerSession: sessionCount > 0 ? messages.length / sessionCount : 0,
      topTopics,
      responseTimeAnalytics: {
        average: avgResponseTime,
        min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        p95: this.calculatePercentile(responseTimes, 95),
      },
      satisfactionTrends: [], // Would need satisfaction ratings in metadata
      complianceMetrics: {
        flaggedContent: messages.filter(m => m.dataClassification === 'restricted').length,
        dataBreaches: 0, // Would need breach tracking
        accessViolations: 0, // Would need access violation tracking
      },
    };
  }

  /**
   * Extract response times from messages
   */
  private extractResponseTimes(messages: ConversationMessage[]): number[] {
    const times: number[] = [];

    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];

      if (current.role === 'assistant' && previous.role === 'user') {
        const responseTime = new Date(current.timestamp).getTime()
          - new Date(previous.timestamp).getTime();
        times.push(responseTime);
      }
    }

    return times;
  }

  /**
   * Calculate percentile from array of numbers
   */
  private calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0;

    const sorted = numbers.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Update session activity timestamp
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_sessions')
        .update({
          last_activity: new Date().toISOString(),
          message_count: this.supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('[ConversationContext] Error updating session activity:', error);
      }
    } catch (error) {
      console.error('[ConversationContext] Error updating session activity:', error);
    }
  }

  /**
   * Cache management methods
   */
  private setCache(sessionId: string, context: ConversationContext): void {
    this.cache.set(sessionId, context);
    this.cacheExpiry.set(sessionId, Date.now() + this.CACHE_TTL_MS);
  }

  private getFromCache(sessionId: string): ConversationContext | null {
    const expiry = this.cacheExpiry.get(sessionId);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(sessionId);
      this.cacheExpiry.delete(sessionId);
      return null;
    }
    return this.cache.get(sessionId) || null;
  }

  private invalidateCache(sessionId: string): void {
    this.cache.delete(sessionId);
    this.cacheExpiry.delete(sessionId);
  }

  /**
   * Clear all cached contexts
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}
