import { createClient } from '@/app/utils/supabase/client';
import { performanceTracker } from './performance-tracker';

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  riskScore: number;
}

export interface SessionSettings {
  maxConcurrentSessions: number;
  sessionExtensionThreshold: number; // Minutes before expiry to auto-extend
  maxInactivityMinutes: number;
  requireReauthForSensitive: boolean;
  enableHijackingProtection: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private settings: SessionSettings;

  private constructor() {
    this.settings = {
      maxConcurrentSessions: 5,
      sessionExtensionThreshold: 15,
      maxInactivityMinutes: 120,
      requireReauthForSensitive: true,
      enableHijackingProtection: true,
    };
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Intelligent session extension based on user activity
   */
  async extendSessionIfNeeded(sessionId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const supabase = await createClient();
      
      // Get current session info
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;

      const timeUntilExpiry = new Date(session.session.expires_at!).getTime() - Date.now();
      const extensionThresholdMs = this.settings.sessionExtensionThreshold * 60 * 1000;

      // Auto-extend if within threshold and user is active
      if (timeUntilExpiry <= extensionThresholdMs) {
        const { error } = await supabase.auth.refreshSession();
        
        if (!error) {
          await this.logSessionActivity(sessionId, 'session_extended');
          performanceTracker.recordMetric('session_extension', Date.now() - startTime);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Session extension error:', error);
      return false;
    }
  }

  /**
   * Manage concurrent sessions with intelligent cleanup
   */
  async manageConcurrentSessions(userId: string, currentSessionId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const supabase = await createClient();
      
      // Get all active sessions for user
      const activeSessions = await this.getActiveSessions(userId);
      
      if (activeSessions.length > this.settings.maxConcurrentSessions) {
        // Sort by last activity and risk score
        const sessionsToTerminate = activeSessions
          .filter(s => s.id !== currentSessionId)
          .sort((a, b) => {
            // Prioritize terminating high-risk, inactive sessions
            const riskDiff = b.riskScore - a.riskScore;
            if (riskDiff !== 0) return riskDiff;
            
            return a.lastActivity.getTime() - b.lastActivity.getTime();
          })
          .slice(0, activeSessions.length - this.settings.maxConcurrentSessions);

        // Terminate excess sessions
        for (const session of sessionsToTerminate) {
          await this.terminateSession(session.id);
          await this.logSessionActivity(session.id, 'session_terminated_excess');
        }
      }

      performanceTracker.recordMetric('concurrent_session_management', Date.now() - startTime);
    } catch (error) {
      console.error('Concurrent session management error:', error);
    }
  }

  /**
   * Detect and prevent session hijacking
   */
  async validateSessionSecurity(sessionId: string, currentRequest: {
    userAgent: string;
    ip: string;
  }): Promise<{ isValid: boolean; riskLevel: 'low' | 'medium' | 'high' }> {
    const startTime = Date.now();
    
    try {
      const sessionInfo = await this.getSessionInfo(sessionId);
      if (!sessionInfo) {
        return { isValid: false, riskLevel: 'high' };
      }

      let riskScore = 0;
      
      // Check for sudden location/IP changes
      if (sessionInfo.deviceInfo.ip !== currentRequest.ip) {
        riskScore += 3;
      }

      // Check for user agent changes
      if (sessionInfo.deviceInfo.userAgent !== currentRequest.userAgent) {
        riskScore += 2;
      }

      // Check for unusual activity patterns
      const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity.getTime();
      if (timeSinceLastActivity > 30 * 60 * 1000) { // 30 minutes
        riskScore += 1;
      }

      const riskLevel = riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low';
      
      // Log security validation
      await this.logSessionActivity(sessionId, 'security_validation', {
        riskLevel,
        riskScore,
        ipChange: sessionInfo.deviceInfo.ip !== currentRequest.ip,
        userAgentChange: sessionInfo.deviceInfo.userAgent !== currentRequest.userAgent,
      });

      performanceTracker.recordMetric('session_security_validation', Date.now() - startTime);
      
      return {
        isValid: riskLevel !== 'high',
        riskLevel,
      };
    } catch (error) {
      console.error('Session security validation error:', error);
      return { isValid: false, riskLevel: 'high' };
    }
  }

  /**
   * Check if reauthentication is required for sensitive operations
   */
  async requiresReauth(sessionId: string, operation: string): Promise<boolean> {
    if (!this.settings.requireReauthForSensitive) return false;

    const sensitiveOperations = [
      'change_password',
      'delete_account',
      'export_data',
      'change_email',
      'financial_transaction',
    ];

    if (!sensitiveOperations.includes(operation)) return false;

    try {
      const sessionInfo = await this.getSessionInfo(sessionId);
      if (!sessionInfo) return true;

      // Require reauth if session is older than 30 minutes for sensitive ops
      const sessionAge = Date.now() - sessionInfo.createdAt.getTime();
      return sessionAge > 30 * 60 * 1000;
    } catch (error) {
      console.error('Reauth check error:', error);
      return true; // Fail secure
    }
  }

  /**
   * Update session activity with intelligent tracking
   */
  async updateSessionActivity(sessionId: string, activity: {
    action: string;
    resource?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const supabase = await createClient();
      
      // Update last activity timestamp
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          last_activity: new Date().toISOString(),
          activity_count: supabase.raw('activity_count + 1')
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Session activity update error:', error);
        return;
      }

      // Log detailed activity
      await this.logSessionActivity(sessionId, 'user_activity', activity);
    } catch (error) {
      console.error('Update session activity error:', error);
    }
  }

  /**
   * Get active sessions for a user
   */
  private async getActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;

      return (data || []).map(session => ({
        id: session.session_id,
        userId: session.user_id,
        deviceInfo: session.device_info,
        createdAt: new Date(session.created_at),
        lastActivity: new Date(session.last_activity),
        expiresAt: new Date(session.expires_at),
        isActive: session.is_active,
        riskScore: session.risk_score || 0,
      }));
    } catch (error) {
      console.error('Get active sessions error:', error);
      return [];
    }
  }

  /**
   * Get session information
   */
  private async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) return null;

      return {
        id: data.session_id,
        userId: data.user_id,
        deviceInfo: data.device_info,
        createdAt: new Date(data.created_at),
        lastActivity: new Date(data.last_activity),
        expiresAt: new Date(data.expires_at),
        isActive: data.is_active,
        riskScore: data.risk_score || 0,
      };
    } catch (error) {
      console.error('Get session info error:', error);
      return null;
    }
  }

  /**
   * Terminate a session
   */
  private async terminateSession(sessionId: string): Promise<void> {
    try {
      const supabase = await createClient();
      
      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          terminated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Terminate session error:', error);
    }
  }

  /**
   * Log session activity for audit and security monitoring
   */
  private async logSessionActivity(
    sessionId: string,
    activity: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await createClient();
      
      await supabase
        .from('security_audit_log')
        .insert({
          session_id: sessionId,
          activity_type: activity,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Log session activity error:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();