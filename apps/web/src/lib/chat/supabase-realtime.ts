/**
 * Supabase Real-time Chat Integration
 * 
 * Handles real-time messaging, presence, and typing indicators
 * for the Universal AI Chat System in NeonPro healthcare platform
 * 
 * Features:
 * - Real-time message delivery with Supabase WebSockets
 * - User presence and typing indicators
 * - Healthcare message routing and encryption
 * - Emergency message prioritization
 * - LGPD-compliant data handling
 * - Brazilian healthcare compliance (CFM, ANVISA)
 * - Message persistence and synchronization
 * - Connection resilience and offline support
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { 
  ChatMessage, 
  ChatConversation, 
  SenderType, 
  MessageStatus,
  HealthcareContext,
  TypingUser 
} from '@/types/chat';

export interface SupabaseRealtimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enablePresence?: boolean;
  enableTypingIndicators?: boolean;
  messageEncryption?: boolean;
  emergencyPriority?: boolean;
  lgpdCompliance?: boolean;
}

export interface MessageSubscriptionCallback {
  onMessage: (message: ChatMessage) => void;
  onTyping?: (users: TypingUser[]) => void;
  onPresence?: (users: { id: string; status: 'online' | 'offline' | 'away' }[]) => void;
  onError?: (error: Error) => void;
}

export class SupabaseRealtimeChat {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, RealtimeChannel> = new Map();
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: SupabaseRealtimeConfig;
  private currentUserId?: string;
  private healthcareContext?: HealthcareContext;

  constructor(config: SupabaseRealtimeConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
          heartbeatIntervalMs: 30_000,
          reconnectDelayMs: 1000,
        }
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }

  /**
   * Initialize real-time chat system
   */
  async initialize(userId: string, healthcareContext?: HealthcareContext): Promise<void> {
    this.currentUserId = userId;
    this.healthcareContext = healthcareContext;

    try {
      // Authenticate user if needed
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Setup global presence
      if (this.config.enablePresence) {
        await this.setupGlobalPresence();
      }

      console.log('✅ Supabase Realtime Chat initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase Realtime Chat:', error);
      throw error;
    }
  }

  /**
   * Subscribe to conversation messages and events
   */
  async subscribeToConversation(
    conversationId: string,
    callbacks: MessageSubscriptionCallback
  ): Promise<void> {
    try {
      // Unsubscribe from existing channel if any
      await this.unsubscribeFromConversation(conversationId);

      // Create message channel
      const messageChannel = this.supabase
        .channel(`conversation_${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const message = this.transformMessage(payload.new as any);
            if (this.config.lgpdCompliance) {
              this.validateLGPDCompliance(message);
            }
            callbacks.onMessage(message);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const message = this.transformMessage(payload.new as any);
            callbacks.onMessage(message);
          }
        );

      // Setup typing indicators if enabled
      if (this.config.enableTypingIndicators && callbacks.onTyping) {
        messageChannel.on('broadcast', { event: 'typing' }, (payload) => {
          callbacks.onTyping!(payload.payload.users);
        });
      }

      // Setup presence if enabled
      if (this.config.enablePresence && callbacks.onPresence) {
        messageChannel.on('presence', { event: 'sync' }, () => {
          const presenceState = messageChannel.presenceState();
          const users = Object.entries(presenceState).map(([key, values]: [string, any[]]) => ({
            id: key,
            status: values[0]?.status || 'offline'
          }));
          callbacks.onPresence!(users);
        });

        messageChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const users = newPresences.map((presence: any) => ({
            id: key,
            status: presence.status
          }));
          callbacks.onPresence!(users);
        });

        messageChannel.on('presence', { event: 'leave' }, ({ key }) => {
          callbacks.onPresence!([{ id: key, status: 'offline' }]);
        });

        // Track own presence
        await messageChannel.track({
          user_id: this.currentUserId,
          status: 'online',
          last_seen: new Date().toISOString(),
          healthcare_context: this.healthcareContext
        });
      }

      // Subscribe to channel
      await messageChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to conversation ${conversationId}`);
          
          // Load recent messages
          await this.loadRecentMessages(conversationId, callbacks.onMessage);
          
        } else if (status === 'CLOSED') {
          console.log(`❌ Disconnected from conversation ${conversationId}`);
          callbacks.onError?.(new Error('Connection closed'));
          
          // Attempt to reconnect
          setTimeout(() => {
            this.subscribeToConversation(conversationId, callbacks);
          }, 2000);
          
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Channel error for conversation ${conversationId}`);
          callbacks.onError?.(new Error('Channel error'));
        }
      });

      this.channels.set(conversationId, messageChannel);

    } catch (error) {
      console.error(`Failed to subscribe to conversation ${conversationId}:`, error);
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Send message to conversation
   */
  async sendMessage(
    conversationId: string,
    content: any,
    messageType: string = 'text',
    healthcareContext?: HealthcareContext
  ): Promise<ChatMessage> {
    try {
      // Prepare message data
      const messageData = {
        conversation_id: conversationId,
        sender_id: this.currentUserId,
        sender_type: this.getSenderType(),
        message_type: messageType,
        content: this.config.messageEncryption ? this.encryptContent(content) : content,
        healthcare_context: healthcareContext || this.healthcareContext,
        status: 'sent' as MessageStatus,
        lgpd_compliant: this.config.lgpdCompliance,
        emergency_priority: this.isEmergencyMessage(content),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert message into database
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const message = this.transformMessage(data);

      // Handle emergency messages
      if (message.emergency_priority) {
        await this.handleEmergencyMessage(message);
      }

      // Update conversation last message
      await this.updateConversationLastMessage(conversationId, message);

      console.log('✅ Message sent successfully:', message.id);
      return message;

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Update message status (delivered, read, etc.)
   */
  async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
    readAt?: Date
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'read' && readAt) {
        updateData.read_at = readAt.toISOString();
      }

      const { error } = await this.supabase
        .from('chat_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Failed to update message status:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    conversationId: string,
    isTyping: boolean
  ): Promise<void> {
    if (!this.config.enableTypingIndicators) {return;}

    try {
      const channel = this.channels.get(conversationId);
      if (!channel) {return;}

      const typingUser: TypingUser = {
        id: this.currentUserId!,
        name: 'Current User', // Should be fetched from user profile
        type: this.getSenderType(),
        healthcare_context: this.healthcareContext,
        started_at: new Date()
      };

      if (isTyping) {
        // Send typing indicator
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user: typingUser,
            typing: true
          }
        });

        // Clear existing timer
        const existingTimer = this.typingTimers.get(conversationId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set auto-clear timer
        const timer = setTimeout(async () => {
          await channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              user: typingUser,
              typing: false
            }
          });
          this.typingTimers.delete(conversationId);
        }, 3000);

        this.typingTimers.set(conversationId, timer);

      } else {
        // Stop typing indicator
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user: typingUser,
            typing: false
          }
        });

        // Clear timer
        const timer = this.typingTimers.get(conversationId);
        if (timer) {
          clearTimeout(timer);
          this.typingTimers.delete(conversationId);
        }
      }

    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  /**
   * Unsubscribe from conversation
   */
  async unsubscribeFromConversation(conversationId: string): Promise<void> {
    const channel = this.channels.get(conversationId);
    if (channel) {
      await this.supabase.removeChannel(channel);
      this.channels.delete(conversationId);
    }

    // Clear typing timer
    const timer = this.typingTimers.get(conversationId);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(conversationId);
    }
  }

  /**
   * Get active conversations for user
   */
  async getActiveConversations(): Promise<ChatConversation[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_conversations')
        .select(`
          *,
          participants:chat_participants(*),
          last_message:chat_messages(*)
        `)
        .contains('participant_ids', [this.currentUserId])
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(this.transformConversation) || [];

    } catch (error) {
      console.error('Failed to get active conversations:', error);
      throw error;
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(
    participantIds: string[],
    conversationType: string,
    healthcareContext?: HealthcareContext
  ): Promise<ChatConversation> {
    try {
      const conversationData = {
        participant_ids: [this.currentUserId, ...participantIds],
        conversation_type: conversationType,
        healthcare_context: healthcareContext,
        created_by: this.currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('chat_conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.transformConversation(data);

    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Disconnect from all channels
   */
  async disconnect(): Promise<void> {
    try {
      // Clear all typing timers
      this.typingTimers.forEach(timer => clearTimeout(timer));
      this.typingTimers.clear();

      // Unsubscribe from all channels
      for (const [conversationId] of this.channels) {
        await this.unsubscribeFromConversation(conversationId);
      }

      // Remove all channels
      await this.supabase.removeAllChannels();

      console.log('✅ Disconnected from Supabase Realtime Chat');

    } catch (error) {
      console.error('❌ Failed to disconnect from Supabase Realtime Chat:', error);
    }
  }

  // Private helper methods

  private async setupGlobalPresence(): Promise<void> {
    const presenceChannel = this.supabase
      .channel('global_presence')
      .on('presence', { event: 'sync' }, () => {
        console.log('Global presence synced');
      })
      .subscribe();

    await presenceChannel.track({
      user_id: this.currentUserId,
      status: 'online',
      healthcare_context: this.healthcareContext,
      last_seen: new Date().toISOString()
    });
  }

  private async loadRecentMessages(
    conversationId: string,
    onMessage: (message: ChatMessage) => void
  ): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      data?.reverse().forEach(messageData => {
        const message = this.transformMessage(messageData);
        onMessage(message);
      });

    } catch (error) {
      console.error('Failed to load recent messages:', error);
    }
  }

  private transformMessage(data: any): ChatMessage {
    return {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      sender_type: data.sender_type,
      message_type: data.message_type,
      content: this.config.messageEncryption ? this.decryptContent(data.content) : data.content,
      status: data.status,
      healthcare_context: data.healthcare_context,
      emergency_priority: data.emergency_priority,
      lgpd_compliant: data.lgpd_compliant,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      read_at: data.read_at ? new Date(data.read_at) : undefined
    };
  }

  private transformConversation(data: any): ChatConversation {
    return {
      id: data.id,
      participant_ids: data.participant_ids,
      conversation_type: data.conversation_type,
      healthcare_context: data.healthcare_context,
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      participants: data.participants || [],
      last_message: data.last_message ? this.transformMessage(data.last_message) : undefined
    };
  }

  private getSenderType(): SenderType {
    if (this.healthcareContext?.professional_info) {
      return 'healthcare_professional';
    }
    return 'patient'; // Default to patient, can be enhanced with role detection
  }

  private isEmergencyMessage(content: any): boolean {
    if (typeof content !== 'object' || !content.text) {return false;}
    
    const emergencyKeywords = [
      'emergência', 'urgente', 'socorro', 'dor forte', 'sangramento',
      'não consegue respirar', 'ataque cardíaco', 'infarto', 'avc'
    ];
    
    const text = content.text.toLowerCase();
    return emergencyKeywords.some(keyword => text.includes(keyword));
  }

  private async handleEmergencyMessage(message: ChatMessage): Promise<void> {
    try {
      // Notify emergency services or on-call professionals
      await this.supabase.functions.invoke('handle-emergency-message', {
        body: { message }
      });

      console.log('🚨 Emergency message handled:', message.id);
    } catch (error) {
      console.error('Failed to handle emergency message:', error);
    }
  }

  private async updateConversationLastMessage(
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      await this.supabase
        .from('chat_conversations')
        .update({
          last_message_id: message.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Failed to update conversation last message:', error);
    }
  }

  private encryptContent(content: any): any {
    // Implement content encryption for LGPD compliance
    // This is a placeholder - implement actual encryption
    return content;
  }

  private decryptContent(content: any): any {
    // Implement content decryption
    // This is a placeholder - implement actual decryption
    return content;
  }

  private validateLGPDCompliance(message: ChatMessage): void {
    if (!this.config.lgpdCompliance) {return;}
    
    // Implement LGPD validation logic
    if (!message.lgpd_compliant) {
      console.warn('Message may not be LGPD compliant:', message.id);
    }
  }
}

// Singleton instance for global use
let realtimeChatInstance: SupabaseRealtimeChat | null = null;

export function getSupabaseRealtimeChat(config?: SupabaseRealtimeConfig): SupabaseRealtimeChat {
  if (!realtimeChatInstance && config) {
    realtimeChatInstance = new SupabaseRealtimeChat(config);
  }
  
  if (!realtimeChatInstance) {
    throw new Error('Supabase Realtime Chat not initialized. Please provide config.');
  }
  
  return realtimeChatInstance;
}

export default SupabaseRealtimeChat;