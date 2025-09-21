// T040: Connect ChatService to Supabase
import { createClient } from "@supabase/supabase-js";
import type { ChatSession, ChatMessage, AuditEvent } from "@neonpro/types";

export class ChatRepository {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createSession(
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<ChatSession> {
    const { data, error } = await this.supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        status: "active",
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }

    return data as ChatSession;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await this.supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to get chat session: ${error.message}`);
    }

    return data as ChatSession;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession> {
    const { data, error } = await this.supabase
      .from("chat_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat session: ${error.message}`);
    }

    return data as ChatSession;
  }

  async addMessage(
    message: Omit<ChatMessage, "id" | "created_at">,
  ): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from("chat_messages")
      .insert({
        ...message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add chat message: ${error.message}`);
    }

    return data as ChatMessage;
  }

  async getMessages(
    sessionId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }

    return data as ChatMessage[];
  }

  async logAuditEvent(
    event: Omit<AuditEvent, "id" | "created_at">,
  ): Promise<AuditEvent> {
    const { data, error } = await this.supabase
      .from("audit_events")
      .insert({
        ...event,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log audit event: ${error.message}`);
    }

    return data as AuditEvent;
  }

  async getAuditEvents(
    sessionId: string,
    limit = 100,
    offset = 0,
  ): Promise<AuditEvent[]> {
    const { data, error } = await this.supabase
      .from("audit_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get audit events: ${error.message}`);
    }

    return data as AuditEvent[];
  }

  async closeSession(sessionId: string): Promise<ChatSession> {
    return this.updateSession(sessionId, {
      status: "closed",
      endedAt: new Date().toISOString(),
    });
  }

  async getActiveSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await this.supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get active sessions: ${error.message}`);
    }

    return data as ChatSession[];
  }
}

// Singleton instance for dependency injection
let chatRepositoryInstance: ChatRepository | null = null;

export function createChatRepository(
  supabaseUrl: string,
  supabaseKey: string,
): ChatRepository {
  if (!chatRepositoryInstance) {
    chatRepositoryInstance = new ChatRepository(supabaseUrl, supabaseKey);
  }
  return chatRepositoryInstance;
}

export function getChatRepository(): ChatRepository {
  if (!chatRepositoryInstance) {
    throw new Error(
      "ChatRepository not initialized. Call createChatRepository first.",
    );
  }
  return chatRepositoryInstance;
}
