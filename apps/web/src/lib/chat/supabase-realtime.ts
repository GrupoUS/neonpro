"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { ChatMessage, ChatSession } from '@/components/chat/ChatInterface';

// Supabase real-time client instance
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null;

// Get or create Supabase client
const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient();
  }
  return supabaseClient;
};

// Database types for chat tables
export interface ChatConversationRecord {
  id: string;
  patient_id: string | null;
  staff_id: string | null;
  conversation_type: 'support' | 'consultation' | 'emergency' | 'internal';
  healthcare_context: {
    specialty?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    procedureType?: string;
    patientId?: string;
    clinicId?: string;
  } | null;
  lgpd_consent_level: 'full' | 'minimal' | 'emergency-only';
  status: 'active' | 'archived' | 'escalated';
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'patient' | 'staff' | 'ai';
  message_text: string;
  message_metadata: {
    confidence?: number;
    emergencyDetected?: boolean;
    escalationTriggered?: boolean;
    complianceFlags?: string[];
    healthcareContext?: {
      specialty?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      procedureType?: string;
    };
    ai_processed?: boolean;
    file_urls?: string[];
    voice_message_url?: string;
  } | null;
  ai_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TypingIndicatorRecord {
  conversation_id: string;
  user_id: string;
  user_type: 'patient' | 'staff' | 'ai';
  user_name: string;
  is_typing: boolean;
  specialty?: string;
  updated_at: string;
}

export interface PresenceRecord {
  conversation_id: string;
  user_id: string;
  user_type: 'patient' | 'staff' | 'ai';
  user_name: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  healthcare_context?: {
    specialty?: string;
    role?: string;
  };
}

// Real-time subscription manager class
export class ChatRealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabase = getSupabaseClient();

  // Subscribe to chat messages for a conversation
  subscribeToMessages(
    conversationId: string,
    callbacks: {
      onNewMessage?: (message: ChatMessageRecord) => void;
      onMessageUpdated?: (message: ChatMessageRecord) => void;
      onMessageDeleted?: (messageId: string) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `messages:${conversationId}`;
    
    // Remove existing channel if any
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<ChatMessageRecord>) => {
          if (payload.new && callbacks.onNewMessage) {
            callbacks.onNewMessage(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<ChatMessageRecord>) => {
          if (payload.new && callbacks.onMessageUpdated) {
            callbacks.onMessageUpdated(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<ChatMessageRecord>) => {
          if (payload.old && callbacks.onMessageDeleted) {
            callbacks.onMessageDeleted(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to messages for conversation: ${conversationId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to messages for conversation: ${conversationId}`);
          if (callbacks.onError) {
            callbacks.onError(new Error(`Failed to subscribe to messages for conversation ${conversationId}`));
          }
        }
      });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  // Subscribe to typing indicators
  subscribeToTyping(
    conversationId: string,
    callbacks: {
      onTypingUpdate?: (typingData: TypingIndicatorRecord) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `typing:${conversationId}`;
    
    // Remove existing channel if any
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<TypingIndicatorRecord>) => {
          if (payload.new && callbacks.onTypingUpdate) {
            callbacks.onTypingUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to typing indicators for conversation: ${conversationId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to typing indicators for conversation: ${conversationId}`);
          if (callbacks.onError) {
            callbacks.onError(new Error(`Failed to subscribe to typing indicators for conversation ${conversationId}`));
          }
        }
      });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  // Subscribe to user presence (online/offline status)
  subscribeToPresence(
    conversationId: string,
    userId: string,
    userInfo: {
      name: string;
      type: 'patient' | 'staff' | 'ai';
      specialty?: string;
      role?: string;
    },
    callbacks: {
      onPresenceSync?: (presences: PresenceRecord[]) => void;
      onPresenceJoin?: (presence: PresenceRecord) => void;
      onPresenceLeave?: (presence: PresenceRecord) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `presence:${conversationId}`;
    
    // Remove existing channel if any
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceRecord>();
        const presences: PresenceRecord[] = [];
        
        Object.keys(state).forEach((key) => {
          state[key].forEach((presence) => {
            presences.push(presence);
          });
        });

        if (callbacks.onPresenceSync) {
          callbacks.onPresenceSync(presences);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: PresenceRecord) => {
          if (callbacks.onPresenceJoin) {
            callbacks.onPresenceJoin(presence);
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: PresenceRecord) => {
          if (callbacks.onPresenceLeave) {
            callbacks.onPresenceLeave(presence);
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to presence for conversation: ${conversationId}`);
          
          // Track current user's presence
          const presenceData: PresenceRecord = {
            conversation_id: conversationId,
            user_id: userId,
            user_type: userInfo.type,
            user_name: userInfo.name,
            status: 'online',
            last_seen: new Date().toISOString(),
            healthcare_context: {
              specialty: userInfo.specialty,
              role: userInfo.role,
            },
          };

          await channel.track(presenceData);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to presence for conversation: ${conversationId}`);
          if (callbacks.onError) {
            callbacks.onError(new Error(`Failed to subscribe to presence for conversation ${conversationId}`));
          }
        }
      });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  // Update typing status
  async updateTypingStatus(
    conversationId: string,
    userId: string,
    userInfo: {
      name: string;
      type: 'patient' | 'staff' | 'ai';
      specialty?: string;
    },
    isTyping: boolean
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('chat_typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          user_type: userInfo.type,
          user_name: userInfo.name,
          is_typing: isTyping,
          specialty: userInfo.specialty,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
      throw error;
    }
  }

  // Send message to database
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'patient' | 'staff' | 'ai',
    content: string,
    metadata?: ChatMessageRecord['message_metadata']
  ): Promise<ChatMessageRecord> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          message_text: content,
          message_metadata: metadata || {},
          ai_processed: senderType === 'ai',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create or get conversation
  async createOrGetConversation(
    userId: string,
    userType: 'patient' | 'staff',
    conversationType: 'support' | 'consultation' | 'emergency' | 'internal',
    healthcareContext?: ChatConversationRecord['healthcare_context'],
    lgpdConsentLevel: 'full' | 'minimal' | 'emergency-only' = 'full'
  ): Promise<ChatConversationRecord> {
    try {
      // Try to find existing active conversation
      const { data: existingConversation } = await this.supabase
        .from('chat_conversations')
        .select('*')
        .eq(userType === 'patient' ? 'patient_id' : 'staff_id', userId)
        .eq('conversation_type', conversationType)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const { data, error } = await this.supabase
        .from('chat_conversations')
        .insert({
          [userType === 'patient' ? 'patient_id' : 'staff_id']: userId,
          conversation_type: conversationType,
          healthcare_context: healthcareContext || {},
          lgpd_consent_level: lgpdConsentLevel,
          status: 'active',
          title: `Chat ${conversationType} - ${new Date().toLocaleTimeString('pt-BR')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      throw error;
    }
  }

  // Get conversation messages with pagination
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessageRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from channel: ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      this.supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from channel: ${channelName}`);
    });
    this.channels.clear();
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    // This is a simplified status check - in real implementation,
    // you'd check the actual Supabase connection status
    return 'connected';
  }
}

// Singleton instance
let realtimeManager: ChatRealtimeManager | null = null;

export const getChatRealtimeManager = (): ChatRealtimeManager => {
  if (!realtimeManager) {
    realtimeManager = new ChatRealtimeManager();
  }
  return realtimeManager;
};

// Utility functions to convert between database records and chat types
export const convertMessageRecordToChatMessage = (record: ChatMessageRecord): ChatMessage => ({
  id: record.id,
  role: record.sender_type === 'ai' ? 'assistant' : 
        record.sender_type === 'staff' ? 'assistant' : 'user',
  content: record.message_text,
  timestamp: new Date(record.created_at),
  confidence: record.message_metadata?.confidence,
  emergencyDetected: record.message_metadata?.emergencyDetected,
  escalationTriggered: record.message_metadata?.escalationTriggered,
  complianceFlags: record.message_metadata?.complianceFlags,
  healthcareContext: record.message_metadata?.healthcareContext,
});

export const convertConversationRecordToChatSession = (record: ChatConversationRecord): ChatSession => ({
  id: record.id,
  title: record.title,
  status: record.status === 'active' ? 'active' : 'archived',
  interface: record.conversation_type === 'internal' ? 'internal' : 
            record.conversation_type === 'emergency' ? 'emergency' : 'external',
  messages: [], // Messages are loaded separately
  createdAt: new Date(record.created_at),
  healthcareContext: record.healthcare_context,
});

export default ChatRealtimeManager;