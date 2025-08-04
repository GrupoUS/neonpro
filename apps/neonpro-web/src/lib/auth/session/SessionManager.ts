/**
 * Session Manager - Core Session Operations
 * 
 * Handles direct session management operations including creation, validation,
 * updates, termination, and cleanup. Works with Supabase for persistence.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { generateSessionToken, validateUUID, removeUndefined } from './utils';
import type {
  SessionConfig,
  SessionData,
  SessionCreateRequest,
  SessionValidationResult,
  SessionActivityUpdate,
  SessionMetrics,
  AuthenticationResponse
} from './types';

/**
 * Session Manager Class
 * 
 * Core session management operations:
 * - Session creation with configurable timeouts
 * - Session validation and token verification
 * - Activity tracking and session extension
 * - Session termination and cleanup
 * - Concurrent session management
 * - Session metrics and analytics
 */
export class SessionManager {
  private supabase: SupabaseClient;
  private config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Create a new session
   */
  async createSession(request: SessionCreateRequest): Promise<AuthenticationResponse> {
    try {
      // Validate input
      if (!validateUUID(request.userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      if (!validateUUID(request.deviceId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_DEVICE_ID',
            message: 'Invalid device ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Check concurrent session limits
      const concurrentCheck = await this.checkConcurrentSessionLimit(request.userId);
      if (!concurrentCheck.success) {
        return concurrentCheck;
      }

      // Generate session token
      const token = generateSessionToken();
      const sessionId = crypto.randomUUID();
      
      // Prepare session data
      const sessionData = removeUndefined({
        id: sessionId,
        user_id: request.userId,
        device_id: request.deviceId,
        token,
        ip_address: request.ipAddress,
        user_agent: request.userAgent,
        location: request.location ? JSON.stringify(request.location) : null,
        expires_at: request.expiresAt,
        last_activity: new Date().toISOString(),
        metadata: request.metadata ? JSON.stringify(request.metadata) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Insert session into database
      const { data, error } = await this.supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'SESSION_CREATION_FAILED',
            message: 'Failed to create session',
            details: { error: error.message }
          },
          timestamp: new Date().toISOString()
        };
      }

      // Convert database format to SessionData
      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_CREATION_ERROR',
          message: 'Internal error creating session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate session by token
   */
  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      if (!token || typeof token !== 'string') {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or missing token'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Query session by token
      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .is('terminated_at', null)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or terminated'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Check if session is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        // Auto-terminate expired session
        await this.terminateSession(data.id, 'expired');
        
        return {
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session has expired'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Convert to SessionData format
      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_VALIDATION_ERROR',
          message: 'Error validating session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(sessionId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION_ID',
            message: 'Invalid session ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          },
          timestamp: new Date().toISOString()
        };
      }

      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_SESSION_ERROR',
          message: 'Error retrieving session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string, activity?: SessionActivityUpdate): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(sessionId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION_ID',
            message: 'Invalid session ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const updateData = removeUndefined({
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ip_address: activity?.ipAddress,
        location: activity?.location ? JSON.stringify(activity.location) : undefined,
        metadata: activity?.metadata ? JSON.stringify(activity.metadata) : undefined
      });

      const { data, error } = await this.supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .is('terminated_at', null)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'SESSION_UPDATE_FAILED',
            message: 'Failed to update session activity'
          },
          timestamp: new Date().toISOString()
        };
      }

      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_UPDATE_ERROR',
          message: 'Error updating session activity',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extend session expiration time
   */
  async extendSession(sessionId: string, newExpiresAt: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(sessionId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION_ID',
            message: 'Invalid session ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .update({
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .is('terminated_at', null)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'SESSION_EXTENSION_FAILED',
            message: 'Failed to extend session'
          },
          timestamp: new Date().toISOString()
        };
      }

      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_EXTENSION_ERROR',
          message: 'Error extending session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string, reason: string = 'user_logout'): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(sessionId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION_ID',
            message: 'Invalid session ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .update({
          terminated_at: new Date().toISOString(),
          termination_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'SESSION_TERMINATION_FAILED',
            message: 'Failed to terminate session'
          },
          timestamp: new Date().toISOString()
        };
      }

      const session: SessionData = {
        id: data.id,
        userId: data.user_id,
        deviceId: data.device_id,
        token: data.token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        location: data.location ? JSON.parse(data.location) : undefined,
        expiresAt: data.expires_at,
        lastActivity: data.last_activity,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        terminatedAt: data.terminated_at,
        terminationReason: data.termination_reason
      };

      return {
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_TERMINATION_ERROR',
          message: 'Error terminating session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .is('terminated_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: 'GET_SESSIONS_FAILED',
            message: 'Failed to retrieve user sessions'
          },
          timestamp: new Date().toISOString()
        };
      }

      const sessions: SessionData[] = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        deviceId: row.device_id,
        token: row.token,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        location: row.location ? JSON.parse(row.location) : undefined,
        expiresAt: row.expires_at,
        lastActivity: row.last_activity,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        terminatedAt: row.terminated_at,
        terminationReason: row.termination_reason
      }));

      return {
        success: true,
        data: sessions,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_SESSIONS_ERROR',
          message: 'Error retrieving user sessions',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId: string, reason: string = 'admin_action'): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID format'
          },
          timestamp: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .update({
          terminated_at: new Date().toISOString(),
          termination_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .is('terminated_at', null)
        .select();

      if (error) {
        return {
          success: false,
          error: {
            code: 'BULK_TERMINATION_FAILED',
            message: 'Failed to terminate user sessions'
          },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: {
          terminatedCount: data.length,
          reason
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BULK_TERMINATION_ERROR',
          message: 'Error terminating user sessions',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<AuthenticationResponse> {
    try {
      const now = new Date().toISOString();
      
      // First, mark expired sessions as terminated
      const { data: expiredSessions, error: updateError } = await this.supabase
        .from('sessions')
        .update({
          terminated_at: now,
          termination_reason: 'expired',
          updated_at: now
        })
        .lt('expires_at', now)
        .is('terminated_at', null)
        .select('id');

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'CLEANUP_UPDATE_FAILED',
            message: 'Failed to mark expired sessions as terminated'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Then delete old terminated sessions (older than retention period)
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - this.config.retentionDays);
      
      const { data: deletedSessions, error: deleteError } = await this.supabase
        .from('sessions')
        .delete()
        .lt('terminated_at', retentionDate.toISOString())
        .not('terminated_at', 'is', null)
        .select('id');

      if (deleteError) {
        return {
          success: false,
          error: {
            code: 'CLEANUP_DELETE_FAILED',
            message: 'Failed to delete old sessions'
          },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: {
          expiredCount: expiredSessions?.length || 0,
          deletedCount: deletedSessions?.length || 0,
          cleanupDate: now
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Error during session cleanup',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get session metrics
   */
  async getSessionMetrics(userId?: string): Promise<SessionMetrics> {
    try {
      let query = this.supabase.from('sessions').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: allSessions, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch sessions: ${error.message}`);
      }

      const now = new Date();
      const activeSessions = allSessions.filter(s => 
        !s.terminated_at && new Date(s.expires_at) > now
      );
      const expiredSessions = allSessions.filter(s => 
        !s.terminated_at && new Date(s.expires_at) <= now
      );
      const terminatedSessions = allSessions.filter(s => s.terminated_at);

      // Calculate average session duration
      const completedSessions = terminatedSessions.filter(s => s.terminated_at);
      const totalDuration = completedSessions.reduce((sum, session) => {
        const start = new Date(session.created_at).getTime();
        const end = new Date(session.terminated_at).getTime();
        return sum + (end - start);
      }, 0);
      const averageDuration = completedSessions.length > 0 
        ? totalDuration / completedSessions.length 
        : 0;

      // Group by termination reason
      const terminationReasons = terminatedSessions.reduce((acc, session) => {
        const reason = session.termination_reason || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: allSessions.length,
        active: activeSessions.length,
        expired: expiredSessions.length,
        terminated: terminatedSessions.length,
        averageDuration,
        terminationReasons,
        generatedAt: now.toISOString()
      };

    } catch (error) {
      throw new Error(`Error generating session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private helper methods
   */
  private async checkConcurrentSessionLimit(userId: string): Promise<AuthenticationResponse> {
    try {
      const { data: activeSessions, error } = await this.supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .is('terminated_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return {
          success: false,
          error: {
            code: 'CONCURRENT_CHECK_FAILED',
            message: 'Failed to check concurrent sessions'
          },
          timestamp: new Date().toISOString()
        };
      }

      const activeCount = activeSessions?.length || 0;
      
      if (activeCount >= this.config.maxConcurrentSessions) {
        return {
          success: false,
          error: {
            code: 'MAX_SESSIONS_EXCEEDED',
            message: `Maximum concurrent sessions (${this.config.maxConcurrentSessions}) exceeded`,
            details: { currentSessions: activeCount, maxAllowed: this.config.maxConcurrentSessions }
          },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: { currentSessions: activeCount, maxAllowed: this.config.maxConcurrentSessions },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONCURRENT_CHECK_ERROR',
          message: 'Error checking concurrent sessions',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create a default instance for direct import
export const sessionManager = new SessionManager({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  defaultTimeout: 24 * 60 * 60 * 1000, // 24 hours
  enableLogging: process.env.NODE_ENV === 'development'
});

export default SessionManager;