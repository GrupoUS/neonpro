/**
 * Agent Session Management Service
 *
 * Handles session lifecycle, expiration, and cleanup for AI agent sessions
 * with LGPD compliance and healthcare security requirements.
 */

import { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface SessionConfig {
  defaultExpirationMs: number;
  maxSessionLengthMs: number;
  cleanupIntervalMs: number;
  maxConcurrentSessions: number;
}

export interface SessionContext {
  _userId: string;
  patientId?: string;
  userPreferences?: Record<string, any>;
  previousTopics?: string[];
  clinicId?: string;
}

export interface SessionData {
  id: string;
  sessionId: string;
  _userId: string;
  title: string;
  _context: SessionContext;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isActive: boolean;
  messageCount: number;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export interface SessionCreateOptions {
  title?: string;
  _context?: Partial<SessionContext>;
  expirationMs?: number;
  metadata?: Record<string, any>;
}

export class AgentSessionService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private config: SessionConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private sessionCache: Map<string, SessionData> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    config: Partial<SessionConfig> = {},
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    this.config = {
      defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
      maxSessionLengthMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupIntervalMs: 15 * 60 * 1000, // 15 minutes
      maxConcurrentSessions: 10,
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Create a new session
   */
  async createSession(
    _userId: string,
    options: SessionCreateOptions = {},
  ): Promise<SessionData> {
    try {
      // Check concurrent session limit
      await this.validateConcurrentSessionLimit(_userId);

      const sessionId = uuidv4();
      const _now = new Date();
      const expirationMs = options.expirationMs || this.config.defaultExpirationMs;
      const expiresAt = new Date(now.getTime() + expirationMs);

      const sessionContext: SessionContext = {
        userId,
        patientId: options.context?.patientId,
        userPreferences: options.context?.userPreferences || {},
        previousTopics: options.context?.previousTopics || [],
        clinicId: options.context?.clinicId,
      };

      const session: SessionData = {
        id: sessionId,
        sessionId,
        userId,
        title: options.title || 'AI Assistant Session',
        _context: sessionContext,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        messageCount: 0,
        lastActivity: now.toISOString(),
        metadata: options.metadata,
      };

      // Store session in database
      await this.storeSession(session);

      // Cache session
      this.cacheSession(session);

      return session;
    } catch (_error) {
      console.error('Error creating session:', error);
      throw new Error(
        `Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      // Check cache first
      const cached = this.sessionCache.get(sessionId);
      if (cached && cached.expiresAt > new Date().toISOString()) {
        return cached;
      }

      // Retrieve from database
      const session = await this.retrieveSession(sessionId);
      if (!session) {
        return null;
      }

      // Validate session expiration
      if (new Date(session.expiresAt) <= new Date()) {
        await this.expireSession(sessionId);
        return null;
      }

      // Cache valid session
      this.cacheSession(session);

      return session;
    } catch (_error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(_userId: string): Promise<SessionData[]> {
    try {
      const { data, error } = await this.supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', _userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        throw error;
      }

      const sessions = (data || []).map(this.mapSessionRecord);

      // Update cache
      sessions.forEach(session => this.cacheSession(session));

      return sessions;
    } catch (_error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    updates: {
      title?: string;
      _context?: Partial<SessionContext>;
      expiresAt?: Date;
      metadata?: Record<string, any>;
    },
  ): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      // Validate session expiration
      const newExpiresAt = updates.expiresAt
        ? new Date(updates.expiresAt)
        : new Date(session.expiresAt);

      if (newExpiresAt.getTime() > Date.now() + this.config.maxSessionLengthMs) {
        throw new Error('Session length exceeds maximum allowed duration');
      }

      const updatedSession: SessionData = {
        ...session,
        title: updates.title || session.title,
        _context: { ...session.context, ...updates.context },
        expiresAt: newExpiresAt.toISOString(),
        metadata: { ...session.metadata, ...updates.metadata },
        updatedAt: new Date().toISOString(),
      };

      // Store updated session
      await this.storeSession(updatedSession);

      // Update cache
      this.cacheSession(updatedSession);

      return updatedSession;
    } catch (_error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  /**
   * Record user activity in session
   */
  async recordActivity(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return;
      }

      const updatedSession: SessionData = {
        ...session,
        messageCount: session.messageCount + 1,
        lastActivity: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.storeSession(updatedSession);
      this.cacheSession(updatedSession);
    } catch (_error) {
      console.error('Error recording session activity:', error);
    }
  }

  /**
   * Expire session manually
   */
  async expireSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return false;
      }

      // Mark session as expired
      await this.supabase
        .from('agent_sessions')
        .update({
          is_active: false,
          expires_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      // Remove from cache
      this.sessionCache.delete(sessionId);

      return true;
    } catch (_error) {
      console.error('Error expiring session:', error);
      return false;
    }
  }

  /**
   * Delete session and all related data
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Delete session messages
      await this.supabase
        .from('agent_messages')
        .delete()
        .eq('session_id', sessionId);

      // Delete session context
      await this.supabase
        .from('agent_context')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      await this.supabase
        .from('agent_sessions')
        .delete()
        .eq('session_id', sessionId);

      // Remove from cache
      this.sessionCache.delete(sessionId);

      return true;
    } catch (_error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      // Find expired sessions
      const { data: expiredSessions, error } = await this.supabase
        .from('agent_sessions')
        .select('session_id')
        .lte('expires_at', new Date().toISOString())
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!expiredSessions || expiredSessions.length === 0) {
        return 0;
      }

      // Mark sessions as expired
      await this.supabase
        .from('agent_sessions')
        .update({ is_active: false })
        .in('session_id', expiredSessions.map(s => s.session_id));

      // Remove from cache
      expiredSessions.forEach(session => {
        this.sessionCache.delete(session.session_id);
      });

      return expiredSessions.length;
    } catch (_error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(
    sessionId: string,
    additionalMs: number = this.config.defaultExpirationMs,
  ): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      const currentExpiresAt = new Date(session.expiresAt);
      const newExpiresAt = new Date(currentExpiresAt.getTime() + additionalMs);

      // Check maximum session length
      const sessionLength = newExpiresAt.getTime() - new Date(session.createdAt).getTime();
      if (sessionLength > this.config.maxSessionLengthMs) {
        throw new Error('Cannot extend session beyond maximum length');
      }

      return await this.updateSession(sessionId, {
        expiresAt: newExpiresAt,
      });
    } catch (_error) {
      console.error('Error extending session:', error);
      return null;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(_userId?: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionLength: number;
    totalMessages: number;
  }> {
    try {
      let query = this.supabase
        .from('agent_sessions')
        .select('*', { count: 'exact' });

      if (_userId) {
        query = query.eq('user_id', _userId);
      }

      const { data: sessions, error, count } = await query;

      if (error) {
        throw error;
      }

      const allSessions = sessions || [];
      const activeSessions = allSessions.filter(s =>
        s.is_active && new Date(s.expires_at) > new Date()
      );
      const expiredSessions = allSessions.filter(s =>
        !s.is_active || new Date(s.expires_at) <= new Date()
      );

      // Calculate average session length
      const sessionLengths = allSessions
        .map(s => new Date(s.expires_at).getTime() - new Date(s.created_at).getTime())
        .filter(length => length > 0);

      const averageSessionLength = sessionLengths.length > 0
        ? sessionLengths.reduce(_(sum,_length) => sum + length, 0) / sessionLengths.length
        : 0;

      // Get total messages
      const totalMessages = allSessions.reduce(_(sum,_session) => sum + (session.message_count || 0),
        0,
      );

      return {
        totalSessions: count || 0,
        activeSessions: activeSessions.length,
        expiredSessions: expiredSessions.length,
        averageSessionLength,
        totalMessages,
      };
    } catch (_error) {
      console.error('Error getting session statistics:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        averageSessionLength: 0,
        totalMessages: 0,
      };
    }
  }

  /**
   * Store session in database
   */
  private async storeSession(session: SessionData): Promise<void> {
    const { error } = await this.supabase
      .from('agent_sessions')
      .upsert({
        session_id: session.sessionId,
        user_id: session.userId,
        title: session.title,
        _context: session.context,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
        expires_at: session.expiresAt,
        is_active: session.isActive,
        message_count: session.messageCount,
        last_activity: session.lastActivity,
        metadata: session.metadata,
      });

    if (error) {
      throw error;
    }
  }

  /**
   * Retrieve session from database
   */
  private async retrieveSession(sessionId: string): Promise<SessionData | null> {
    const { data, error } = await this.supabase
      .from('agent_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapSessionRecord(data);
  }

  /**
   * Map database record to session data
   */
  private mapSessionRecord(record: any): SessionData {
    return {
      id: record.id,
      sessionId: record.session_id,
      _userId: record.user_id,
      title: record.title,
      _context: record.context,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      expiresAt: record.expires_at,
      isActive: record.is_active,
      messageCount: record.message_count,
      lastActivity: record.last_activity,
      metadata: record.metadata,
    };
  }

  /**
   * Cache session
   */
  private cacheSession(session: SessionData): void {
    this.sessionCache.set(session.sessionId, session);

    // Set expiration for cache entry
    setTimeout(_() => {
      this.sessionCache.delete(session.sessionId);
    }, this.cacheTimeout);
  }

  /**
   * Validate concurrent session limit
   */
  private async validateConcurrentSessionLimit(_userId: string): Promise<void> {
    const activeSessions = await this.getUserSessions(_userId);

    if (activeSessions.length >= this.config.maxConcurrentSessions) {
      throw new Error(
        `Maximum concurrent sessions (${this.config.maxConcurrentSessions}) exceeded`,
      );
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(_async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (_error) {
        console.error('Error in session cleanup:', error);
      }
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Shutdown session service
   */
  async shutdown(): Promise<void> {
    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Clear cache
    this.sessionCache.clear();

    // Final cleanup
    try {
      await this.cleanupExpiredSessions();
    } catch (_error) {
      console.error('Error in final cleanup:', error);
    }
  }
}
