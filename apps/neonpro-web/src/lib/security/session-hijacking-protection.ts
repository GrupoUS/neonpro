/**
 * Session Hijacking Protection for NeonPro
 * Detects and prevents session hijacking attempts
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createHash } from 'crypto';

export interface SessionFingerprint {
  userAgent: string;
  ipAddress: string;
  acceptLanguage: string;
  acceptEncoding: string;
  screenResolution?: string;
  timezone?: string;
  platform?: string;
}

export interface SessionSecurityEvent {
  sessionId: string;
  userId: string;
  eventType: 'login' | 'suspicious_activity' | 'hijack_attempt' | 'concurrent_session';
  riskScore: number;
  fingerprint: SessionFingerprint;
  timestamp: number;
  details: Record<string, any>;
}

export interface SessionValidationResult {
  valid: boolean;
  riskScore: number;
  action: 'allow' | 'challenge' | 'block' | 'terminate';
  reason?: string;
  requiresReauth?: boolean;
}

/**
 * Session Hijacking Protection Manager
 */
export class SessionHijackingProtection {
  private static readonly MAX_RISK_SCORE = 10;
  private static readonly CHALLENGE_THRESHOLD = 6;
  private static readonly BLOCK_THRESHOLD = 8;
  
  /**
   * Generate session fingerprint from request
   */
  static generateFingerprint(request: NextRequest): SessionFingerprint {
    return {
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: this.getClientIP(request),
      acceptLanguage: request.headers.get('accept-language') || '',
      acceptEncoding: request.headers.get('accept-encoding') || '',
      // Additional fingerprint data can be added via client-side JS
    };
  }
  
  /**
   * Create fingerprint hash for comparison
   */
  static createFingerprintHash(fingerprint: SessionFingerprint): string {
    const data = `${fingerprint.userAgent}:${fingerprint.acceptLanguage}:${fingerprint.acceptEncoding}`;
    return createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Store session fingerprint
   */
  static async storeSessionFingerprint(
    sessionId: string,
    userId: string,
    fingerprint: SessionFingerprint
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      const fingerprintHash = this.createFingerprintHash(fingerprint);
      
      const { error } = await supabase
        .from('session_fingerprints')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          fingerprint_hash: fingerprintHash,
          fingerprint_data: fingerprint,
          ip_address: fingerprint.ipAddress,
          user_agent: fingerprint.userAgent,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        });
      
      return !error;
    } catch (error) {
      console.error('Failed to store session fingerprint:', error);
      return false;
    }
  }
  
  /**
   * Validate session against stored fingerprint
   */
  static async validateSessionFingerprint(
    sessionId: string,
    currentFingerprint: SessionFingerprint
  ): Promise<SessionValidationResult> {
    try {
      const supabase = await createClient();
      
      // Get stored fingerprint
      const { data: storedSession, error } = await supabase
        .from('session_fingerprints')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (error || !storedSession) {
        return {
          valid: false,
          riskScore: 10,
          action: 'block',
          reason: 'No stored session fingerprint found',
        };
      }
      
      const storedFingerprint = storedSession.fingerprint_data as SessionFingerprint;
      let riskScore = 0;
      const reasons: string[] = [];
      
      // Check IP address change
      if (storedFingerprint.ipAddress !== currentFingerprint.ipAddress) {
        riskScore += 3;
        reasons.push('IP address changed');
      }
      
      // Check User-Agent change
      if (storedFingerprint.userAgent !== currentFingerprint.userAgent) {
        riskScore += 4;
        reasons.push('User agent changed');
      }
      
      // Check Accept-Language change
      if (storedFingerprint.acceptLanguage !== currentFingerprint.acceptLanguage) {
        riskScore += 2;
        reasons.push('Accept language changed');
      }
      
      // Check Accept-Encoding change
      if (storedFingerprint.acceptEncoding !== currentFingerprint.acceptEncoding) {
        riskScore += 1;
        reasons.push('Accept encoding changed');
      }
      
      // Update last seen
      await supabase
        .from('session_fingerprints')
        .update({ last_seen: new Date().toISOString() })
        .eq('session_id', sessionId);
      
      // Determine action based on risk score
      let action: 'allow' | 'challenge' | 'block' | 'terminate' = 'allow';
      let requiresReauth = false;
      
      if (riskScore >= this.BLOCK_THRESHOLD) {
        action = 'terminate';
        requiresReauth = true;
      } else if (riskScore >= this.CHALLENGE_THRESHOLD) {
        action = 'challenge';
        requiresReauth = true;
      }
      
      // Log security event if suspicious
      if (riskScore > 0) {
        await this.logSecurityEvent({
          sessionId,
          userId: storedSession.user_id,
          eventType: riskScore >= this.CHALLENGE_THRESHOLD ? 'hijack_attempt' : 'suspicious_activity',
          riskScore,
          fingerprint: currentFingerprint,
          timestamp: Date.now(),
          details: {
            reasons,
            storedFingerprint,
            currentFingerprint,
          },
        });
      }
      
      return {
        valid: action !== 'terminate',
        riskScore,
        action,
        reason: reasons.join(', '),
        requiresReauth,
      };
    } catch (error) {
      console.error('Session fingerprint validation error:', error);
      return {
        valid: false,
        riskScore: 10,
        action: 'block',
        reason: 'Validation error',
      };
    }
  }
  
  /**
   * Detect concurrent sessions for a user
   */
  static async detectConcurrentSessions(
    userId: string,
    currentSessionId: string,
    maxConcurrentSessions: number = 3
  ): Promise<{
    hasExcess: boolean;
    activeSessions: number;
    sessionsToTerminate: string[];
  }> {
    try {
      const supabase = await createClient();
      
      // Get all active sessions for user
      const { data: sessions, error } = await supabase
        .from('session_fingerprints')
        .select('session_id, last_seen, created_at')
        .eq('user_id', userId)
        .gte('last_seen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('last_seen', { ascending: false });
      
      if (error || !sessions) {
        return { hasExcess: false, activeSessions: 0, sessionsToTerminate: [] };
      }
      
      const activeSessions = sessions.length;
      const hasExcess = activeSessions > maxConcurrentSessions;
      
      let sessionsToTerminate: string[] = [];
      
      if (hasExcess) {
        // Keep the current session and most recent ones, terminate oldest
        const sessionsToKeep = sessions
          .filter(s => s.session_id === currentSessionId)
          .concat(
            sessions
              .filter(s => s.session_id !== currentSessionId)
              .slice(0, maxConcurrentSessions - 1)
          );
        
        sessionsToTerminate = sessions
          .filter(s => !sessionsToKeep.some(keep => keep.session_id === s.session_id))
          .map(s => s.session_id);
        
        // Log concurrent session event
        await this.logSecurityEvent({
          sessionId: currentSessionId,
          userId,
          eventType: 'concurrent_session',
          riskScore: Math.min(activeSessions - maxConcurrentSessions, 5),
          fingerprint: {} as SessionFingerprint, // Will be filled by caller
          timestamp: Date.now(),
          details: {
            activeSessions,
            maxAllowed: maxConcurrentSessions,
            sessionsToTerminate,
          },
        });
      }
      
      return {
        hasExcess,
        activeSessions,
        sessionsToTerminate,
      };
    } catch (error) {
      console.error('Concurrent session detection error:', error);
      return { hasExcess: false, activeSessions: 0, sessionsToTerminate: [] };
    }
  }
  
  /**
   * Terminate suspicious sessions
   */
  static async terminateSessions(sessionIds: string[]): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      // Remove session fingerprints
      const { error: fingerprintError } = await supabase
        .from('session_fingerprints')
        .delete()
        .in('session_id', sessionIds);
      
      // Invalidate sessions in auth system
      for (const sessionId of sessionIds) {
        try {
          // This would integrate with your session management system
          // For Supabase, you might need to call their admin API
          await this.invalidateSession(sessionId);
        } catch (error) {
          console.error(`Failed to invalidate session ${sessionId}:`, error);
        }
      }
      
      return !fingerprintError;
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
      return false;
    }
  }
  
  /**
   * Log security event
   */
  static async logSecurityEvent(event: SessionSecurityEvent): Promise<void> {
    try {
      const supabase = await createClient();
      
      await supabase
        .from('security_events')
        .insert({
          session_id: event.sessionId,
          user_id: event.userId,
          event_type: event.eventType,
          risk_score: event.riskScore,
          fingerprint_data: event.fingerprint,
          event_details: event.details,
          timestamp: new Date(event.timestamp).toISOString(),
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return request.ip || 'unknown';
  }
  
  /**
   * Invalidate session (integrate with your auth system)
   */
  private static async invalidateSession(sessionId: string): Promise<void> {
    // This should integrate with your session management system
    // For Supabase, you might use the admin API or custom function
    console.log(`Invalidating session: ${sessionId}`);
  }
}

export default SessionHijackingProtection;

