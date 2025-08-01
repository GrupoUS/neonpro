// Session Manager Extended Methods
// Story 1.4: Session Management & Security Implementation
// This file contains the remaining methods for SessionManagerService

import { 
  UserSession, 
  SessionSecurityEvent, 
  DeviceRegistration, 
  SessionAuditLog,
  DeviceInfo,
  SecurityEventType,
  SessionAction
} from './types';
import { v4 as uuidv4 } from 'uuid';

// Extended methods for SessionManagerService class
export class SessionManagerExtended {
  private supabase: any;
  private config: any;
  private securityMonitor: any;
  private deviceFingerprint: any;
  private locationService: any;
  private hooks: any;

  constructor(dependencies: any) {
    Object.assign(this, dependencies);
  }

  // Cleanup Methods
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      
      // Get expired sessions
      const { data: expiredSessions, error: selectError } = await this.supabase
        .from('user_sessions')
        .select('id, user_id')
        .eq('is_active', true)
        .lt('expires_at', now.toISOString());
      
      if (selectError) {
        console.error('Error selecting expired sessions:', selectError);
        return 0;
      }
      
      if (!expiredSessions || expiredSessions.length === 0) {
        return 0;
      }
      
      // Mark sessions as inactive
      const { error: updateError } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          updated_at: now.toISOString() 
        })
        .eq('is_active', true)
        .lt('expires_at', now.toISOString());
      
      if (updateError) {
        console.error('Error updating expired sessions:', updateError);
        return 0;
      }
      
      // Log cleanup activity
      for (const session of expiredSessions) {
        await this.logSessionActivity(
          session.id,
          session.user_id,
          'session_expired',
          { 
            cleanup_time: now,
            reason: 'automatic_cleanup'
          }
        );
        
        // Call hook if session was found
        const sessionData = await this.getSessionById(session.id);
        if (sessionData) {
          this.hooks.onSessionExpired?.(sessionData);
        }
      }
      
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
      return expiredSessions.length;
    } catch (error) {
      console.error('Error in cleanupExpiredSessions:', error);
      return 0;
    }
  }

  async cleanupOldAuditLogs(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retainAuditLogs);
      
      // Delete old audit logs
      const { data: deletedLogs, error } = await this.supabase
        .from('session_audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');
      
      if (error) {
        console.error('Error cleaning up audit logs:', error);
        return 0;
      }
      
      const deletedCount = deletedLogs?.length || 0;
      console.log(`Cleaned up ${deletedCount} old audit logs`);
      return deletedCount;
    } catch (error) {
      console.error('Error in cleanupOldAuditLogs:', error);
      return 0;
    }
  }

  // Security Methods
  async detectSuspiciousActivity(
    session: UserSession, 
    activity: any
  ): Promise<SecurityEventType[]> {
    const suspiciousEvents: SecurityEventType[] = [];
    
    try {
      // Check for unusual hours
      if (this.isUnusualHour(activity.timestamp)) {
        suspiciousEvents.push('unusual_activity');
      }
      
      // Check for rapid requests
      if (await this.hasRapidRequests(session.user_id, activity.timestamp)) {
        suspiciousEvents.push('brute_force_attempt');
      }
      
      // Check for location changes
      if (await this.hasImpossibleTravel(session, activity)) {
        suspiciousEvents.push('suspicious_location');
      }
      
      // Check for device changes
      if (await this.hasDeviceAnomaly(session, activity)) {
        suspiciousEvents.push('suspicious_device');
      }
      
      // Check for privilege escalation attempts
      if (this.isPrivilegeEscalationAttempt(activity)) {
        suspiciousEvents.push('privilege_escalation_attempt');
      }
      
      return suspiciousEvents;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return [];
    }
  }

  async calculateRiskScore(session: UserSession, activity: any): Promise<number> {
    let riskScore = 0;
    
    try {
      // Base risk from session
      if (!session.is_trusted) riskScore += 20;
      if (session.security_level === 'high') riskScore += 15;
      if (session.security_level === 'critical') riskScore += 30;
      
      // Location risk
      if (session.location) {
        const locationRisk = await this.calculateLocationRisk(session.location);
        riskScore += locationRisk;
      }
      
      // Device risk
      const deviceRisk = await this.calculateDeviceRisk(session.device_fingerprint);
      riskScore += deviceRisk;
      
      // Activity pattern risk
      const activityRisk = await this.calculateActivityRisk(session.user_id, activity);
      riskScore += activityRisk;
      
      // Time-based risk
      const timeRisk = this.calculateTimeRisk(activity.timestamp);
      riskScore += timeRisk;
      
      // Cap at 100
      return Math.min(riskScore, 100);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 50; // Default medium risk
    }
  }

  async handleSecurityEvent(event: Partial<SessionSecurityEvent>): Promise<void> {
    try {
      const securityEvent: Partial<SessionSecurityEvent> = {
        id: uuidv4(),
        created_at: new Date(),
        ...event,
      };
      
      // Insert security event
      const { error } = await this.supabase
        .from('session_security_events')
        .insert(securityEvent);
      
      if (error) {
        console.error('Error inserting security event:', error);
        return;
      }
      
      // Handle high-risk events
      if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
        await this.handleHighRiskEvent(securityEvent as SessionSecurityEvent);
      }
      
      // Call security hook
      if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
        this.hooks.onSecurityThreat?.(securityEvent as SessionSecurityEvent);
      } else {
        this.hooks.onSuspiciousActivity?.(securityEvent as SessionSecurityEvent);
      }
    } catch (error) {
      console.error('Error handling security event:', error);
    }
  }

  // Device Management Methods
  async registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<DeviceRegistration> {
    try {
      // Check if device already exists
      const { data: existingDevice } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceInfo.fingerprint)
        .single();
      
      if (existingDevice) {
        // Update existing device
        const { data: updatedDevice, error } = await this.supabase
          .from('device_registrations')
          .update({
            last_seen: new Date(),
            total_sessions: existingDevice.total_sessions + 1,
            updated_at: new Date(),
          })
          .eq('id', existingDevice.id)
          .select()
          .single();
        
        if (error) {
          throw new Error('Failed to update device registration');
        }
        
        return updatedDevice as DeviceRegistration;
      }
      
      // Create new device registration
      const trustScore = await this.calculateDeviceTrustScore(deviceInfo);
      const riskIndicators = await this.identifyDeviceRisks(deviceInfo);
      
      const deviceRegistration: Partial<DeviceRegistration> = {
        id: uuidv4(),
        user_id: userId,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceInfo.name,
        device_type: deviceInfo.type,
        browser_info: deviceInfo.browser,
        os_info: deviceInfo.os,
        screen_info: deviceInfo.screen,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        is_trusted: trustScore > 70,
        trust_score: trustScore,
        first_seen: new Date(),
        last_seen: new Date(),
        total_sessions: 1,
        risk_indicators: riskIndicators,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      const { data: newDevice, error } = await this.supabase
        .from('device_registrations')
        .insert(deviceRegistration)
        .select()
        .single();
      
      if (error) {
        throw new Error('Failed to register device');
      }
      
      // Call hook
      this.hooks.onDeviceRegistered?.(newDevice as DeviceRegistration);
      
      return newDevice as DeviceRegistration;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async verifyDevice(deviceFingerprint: string, userId: string): Promise<boolean> {
    try {
      const { data: device } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .single();
      
      if (!device) {
        return false;
      }
      
      // Check if device is trusted
      return device.is_trusted && device.trust_score > 50;
    } catch (error) {
      console.error('Error verifying device:', error);
      return false;
    }
  }

  async trustDevice(deviceId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('device_registrations')
        .update({
          is_trusted: true,
          trust_score: Math.max(80, 0), // Set minimum trust score
          updated_at: new Date(),
        })
        .eq('id', deviceId)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error('Failed to trust device');
      }
    } catch (error) {
      console.error('Error trusting device:', error);
      throw error;
    }
  }

  // Audit Logging
  private async logSessionActivity(
    sessionId: string,
    userId: string,
    action: SessionAction,
    details: any
  ): Promise<void> {
    try {
      const auditLog: Partial<SessionAuditLog> = {
        id: uuidv4(),
        session_id: sessionId,
        user_id: userId,
        action,
        details,
        ip_address: details.ip_address || 'unknown',
        user_agent: details.user_agent || 'unknown',
        timestamp: new Date(),
        success: true,
      };
      
      const { error } = await this.supabase
        .from('session_audit_logs')
        .insert(auditLog);
      
      if (error) {
        console.error('Error logging session activity:', error);
      }
    } catch (error) {
      console.error('Error in logSessionActivity:', error);
    }
  }

  // Helper Methods
  private async getSessionById(sessionId: string): Promise<UserSession | null> {
    const { data: session } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    return session as UserSession | null;
  }

  private isUnusualHour(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    const businessHours = { start: 6, end: 22 };
    return hour < businessHours.start || hour > businessHours.end;
  }

  private async hasRapidRequests(userId: string, timestamp: Date): Promise<boolean> {
    const oneMinuteAgo = new Date(timestamp.getTime() - 60 * 1000);
    
    const { data: recentLogs } = await this.supabase
      .from('session_audit_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('timestamp', oneMinuteAgo.toISOString())
      .lte('timestamp', timestamp.toISOString());
    
    return (recentLogs?.length || 0) > 60; // More than 60 requests per minute
  }

  private async hasImpossibleTravel(session: UserSession, activity: any): Promise<boolean> {
    // Check if user has traveled impossibly fast between locations
    // This would require comparing current location with previous session location
    // For now, return false (implementation would need geolocation calculation)
    return false;
  }

  private async hasDeviceAnomaly(session: UserSession, activity: any): Promise<boolean> {
    // Check for device fingerprint changes or suspicious device characteristics
    // For now, return false (implementation would need device analysis)
    return false;
  }

  private isPrivilegeEscalationAttempt(activity: any): boolean {
    // Check if user is trying to access resources above their permission level
    return activity.attempted_permissions && 
           activity.attempted_permissions.some((perm: string) => 
             perm.includes('admin') || perm.includes('owner')
           );
  }

  private async calculateLocationRisk(location: any): Promise<number> {
    let risk = 0;
    
    // High-risk countries
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    if (highRiskCountries.includes(location.country)) {
      risk += 30;
    }
    
    return risk;
  }

  private async calculateDeviceRisk(deviceFingerprint: string): Promise<number> {
    const { data: device } = await this.supabase
      .from('device_registrations')
      .select('trust_score, risk_indicators')
      .eq('device_fingerprint', deviceFingerprint)
      .single();
    
    if (!device) {
      return 40; // Unknown device = medium risk
    }
    
    return Math.max(0, 100 - device.trust_score);
  }

  private async calculateActivityRisk(userId: string, activity: any): Promise<number> {
    // Calculate risk based on user's activity patterns
    // For now, return low risk
    return 5;
  }

  private calculateTimeRisk(timestamp: Date): number {
    const hour = timestamp.getHours();
    
    // Higher risk during unusual hours
    if (hour >= 0 && hour <= 5) return 15; // Late night
    if (hour >= 22 && hour <= 23) return 10; // Late evening
    
    return 0; // Normal hours
  }

  private async calculateDeviceTrustScore(deviceInfo: DeviceInfo): Promise<number> {
    let score = 50; // Base score
    
    // Known browsers get higher trust
    const trustedBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    if (trustedBrowsers.includes(deviceInfo.browser.name)) {
      score += 20;
    }
    
    // Known OS get higher trust
    const trustedOS = ['Windows', 'macOS', 'iOS', 'Android'];
    if (trustedOS.includes(deviceInfo.os.name)) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  private async identifyDeviceRisks(deviceInfo: DeviceInfo): Promise<string[]> {
    const risks: string[] = [];
    
    // Check for suspicious characteristics
    if (deviceInfo.browser.name === 'Unknown') {
      risks.push('unknown_browser');
    }
    
    if (deviceInfo.os.name === 'Unknown') {
      risks.push('unknown_os');
    }
    
    if (deviceInfo.screen.width < 800 || deviceInfo.screen.height < 600) {
      risks.push('unusual_screen_size');
    }
    
    return risks;
  }

  private async handleHighRiskEvent(event: SessionSecurityEvent): Promise<void> {
    // Handle high-risk security events
    if (event.severity === 'critical') {
      // Terminate session immediately
      if (event.session_id) {
        await this.terminateSession(event.session_id, 'security_violation');
      }
      
      // Block user temporarily
      await this.temporarilyBlockUser(event.user_id, 30); // 30 minutes
    }
  }

  private async temporarilyBlockUser(userId: string, minutes: number): Promise<void> {
    // Implementation would add user to temporary block list
    console.log(`User ${userId} temporarily blocked for ${minutes} minutes`);
  }

  private async terminateSession(sessionId: string, reason: string): Promise<void> {
    // This method should be available from the main class
    // Implementation would terminate the session
    console.log(`Session ${sessionId} terminated: ${reason}`);
  }
}
