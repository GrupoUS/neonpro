// React Hooks for Session Management
// Story 1.4: Session Management & Security Implementation

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserSession,
  SessionState,
  UseSessionReturn,
  UseSessionSecurityReturn,
  UseSessionMetricsReturn,
  SessionSecurityEvent,
  DeviceRegistration,
  SessionMetrics,
} from './types';
import { SessionManager } from './session-manager';
import { SecurityMonitor } from './security-monitor';
import { DeviceManager } from './device-manager';
import { createClient } from '@supabase/supabase-js';

// Global instances (would be provided via context in real app)
let sessionManager: SessionManager;
let securityMonitor: SecurityMonitor;
let deviceManager: DeviceManager;

// Initialize services
const initializeServices = () => {
  if (!sessionManager) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    sessionManager = new SessionManager(supabase);
    securityMonitor = new SecurityMonitor(supabase);
    deviceManager = new DeviceManager(supabase);
  }
};

// Main Session Hook
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const activityRef = useRef<Date>(new Date());

  // Initialize services
  useEffect(() => {
    initializeServices();
  }, []);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Activity tracking
  useEffect(() => {
    const trackActivity = () => {
      activityRef.current = new Date();
      if (session) {
        updateActivity();
      }
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
    };
  }, [session]);

  // Session heartbeat
  useEffect(() => {
    if (session && sessionState === 'active') {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return () => stopHeartbeat();
  }, [session, sessionState]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentSession = await sessionManager.getCurrentSession();
      
      if (currentSession) {
        setSession(currentSession);
        setSessionState('active');
        
        // Start security monitoring
        await securityMonitor.startMonitoring(currentSession);
      } else {
        setSessionState('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setSessionState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (
    userId: string,
    deviceInfo: any,
    location?: any
  ): Promise<UserSession> => {
    try {
      setIsLoading(true);
      setError(null);
      setSessionState('creating');

      // Register device first
      await deviceManager.registerDevice(userId, deviceInfo, location);

      // Create session
      const newSession = await sessionManager.createSession(userId, deviceInfo, location);
      
      setSession(newSession);
      setSessionState('active');
      
      // Start security monitoring
      await securityMonitor.startMonitoring(newSession);
      
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      setSessionState('error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const extendSession = async (): Promise<void> => {
    if (!session) return;

    try {
      setError(null);
      const extendedSession = await sessionManager.extendSession(session.id);
      setSession(extendedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend session');
    }
  };

  const terminateSession = async (): Promise<void> => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);
      setSessionState('terminating');

      await sessionManager.terminateSession(session.id, 'user_logout');
      
      // Stop security monitoring
      securityMonitor.stopMonitoring(session.id);
      
      setSession(null);
      setSessionState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
      setSessionState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (): Promise<void> => {
    if (!session) return;

    try {
      await sessionManager.updateActivity(session.id);
      // Update local session object
      setSession(prev => prev ? { ...prev, last_activity: new Date() } : null);
    } catch (err) {
      console.error('Failed to update activity:', err);
    }
  };

  const validateSession = async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const isValid = await sessionManager.validateSession(session.id);
      
      if (!isValid) {
        setSession(null);
        setSessionState('expired');
        securityMonitor.stopMonitoring(session.id);
      }
      
      return isValid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate session');
      return false;
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat(); // Clear any existing heartbeat
    
    heartbeatRef.current = setInterval(async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          stopHeartbeat();
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 30000); // Check every 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  return {
    session,
    isLoading,
    error,
    sessionState,
    createSession,
    extendSession,
    terminateSession,
    updateActivity,
    validateSession,
    refresh: loadSession,
  };
}

// Session Security Hook
export function useSessionSecurity(): UseSessionSecurityReturn {
  const [securityEvents, setSecurityEvents] = useState<SessionSecurityEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
    setupSecurityEventListeners();
    
    return () => {
      cleanupSecurityEventListeners();
    };
  }, []);

  const setupSecurityEventListeners = () => {
    securityMonitor.on('security_event', handleSecurityEvent);
    securityMonitor.on('monitoring_started', () => setIsMonitoring(true));
    securityMonitor.on('monitoring_stopped', () => setIsMonitoring(false));
  };

  const cleanupSecurityEventListeners = () => {
    securityMonitor.removeAllListeners();
  };

  const handleSecurityEvent = (alert: any) => {
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    
    if (alert.severity === 'critical' || alert.severity === 'high') {
      // Could trigger notifications here
      console.warn('High severity security event:', alert);
    }
  };

  const getSecurityEvents = async (limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would fetch from the database
      // For now, we'll use the current alerts
      setSecurityEvents(alerts.slice(0, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security events');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskScore = async (sessionId: string): Promise<void> => {
    try {
      // This would calculate current risk score
      // For now, we'll use a mock calculation
      const mockRiskScore = Math.floor(Math.random() * 100);
      setRiskScore(mockRiskScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate risk score');
    }
  };

  const blockSession = async (sessionId: string, reason: string): Promise<void> => {
    try {
      setIsLoading(true);
      await sessionManager.terminateSession(sessionId, reason);
      
      // Add security event
      const event: Partial<SessionSecurityEvent> = {
        session_id: sessionId,
        event_type: 'session_blocked',
        event_category: 'security',
        severity: 'high',
        description: `Session blocked: ${reason}`,
        is_blocked: true,
        resolution_status: 'resolved',
      };
      
      await securityMonitor.handleSecurityEvent(event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block session');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
    setSecurityEvents([]);
  };

  return {
    securityEvents,
    isMonitoring,
    riskScore,
    alerts,
    isLoading,
    error,
    getSecurityEvents,
    calculateRiskScore,
    blockSession,
    clearAlerts,
  };
}

// Session Metrics Hook
export function useSessionMetrics(): UseSessionMetricsReturn {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => stopAutoRefresh();
  }, [autoRefresh]);

  const fetchMetrics = async (timeRange?: { start: Date; end: Date }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock metrics for now
      const mockMetrics: SessionMetrics = {
        totalSessions: Math.floor(Math.random() * 1000),
        activeSessions: Math.floor(Math.random() * 100),
        expiredSessions: Math.floor(Math.random() * 50),
        terminatedSessions: Math.floor(Math.random() * 200),
        averageSessionDuration: Math.floor(Math.random() * 3600),
        securityEvents: Math.floor(Math.random() * 20),
        suspiciousActivities: Math.floor(Math.random() * 5),
        deviceRegistrations: Math.floor(Math.random() * 500),
        concurrentSessionViolations: Math.floor(Math.random() * 10),
        sessionsByDevice: {
          desktop: Math.floor(Math.random() * 300),
          mobile: Math.floor(Math.random() * 400),
          tablet: Math.floor(Math.random() * 100),
        },
        sessionsByLocation: {
          'United States': Math.floor(Math.random() * 400),
          'Canada': Math.floor(Math.random() * 200),
          'United Kingdom': Math.floor(Math.random() * 150),
        },
        peakHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50),
        })),
      };
      
      setMetrics(mockMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportMetrics = async (format: 'json' | 'csv' = 'json'): Promise<string> => {
    if (!metrics) {
      throw new Error('No metrics available to export');
    }

    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    } else {
      // Convert to CSV format
      const csvRows = [
        'Metric,Value',
        `Total Sessions,${metrics.totalSessions}`,
        `Active Sessions,${metrics.activeSessions}`,
        `Expired Sessions,${metrics.expiredSessions}`,
        `Terminated Sessions,${metrics.terminatedSessions}`,
        `Average Session Duration,${metrics.averageSessionDuration}`,
        `Security Events,${metrics.securityEvents}`,
        `Suspicious Activities,${metrics.suspiciousActivities}`,
        `Device Registrations,${metrics.deviceRegistrations}`,
        `Concurrent Session Violations,${metrics.concurrentSessionViolations}`,
      ];
      
      return csvRows.join('\n');
    }
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();
    refreshIntervalRef.current = setInterval(() => {
      fetchMetrics();
    }, 60000); // Refresh every minute
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  return {
    metrics,
    isLoading,
    error,
    autoRefresh,
    fetchMetrics,
    exportMetrics,
    toggleAutoRefresh,
    refresh: () => fetchMetrics(),
  };
}

// Device Management Hook
export function useDeviceManagement() {
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const fetchUserDevices = async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userDevices = await deviceManager.getUserDevices(userId);
      setDevices(userDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setIsLoading(false);
    }
  };

  const blockDevice = async (deviceId: string, reason: string): Promise<void> => {
    try {
      setIsLoading(true);
      await deviceManager.blockDevice(deviceId, reason);
      
      // Update local state
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, is_blocked: true, is_trusted: false }
          : device
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block device');
    } finally {
      setIsLoading(false);
    }
  };

  const unblockDevice = async (deviceId: string, reason: string): Promise<void> => {
    try {
      setIsLoading(true);
      await deviceManager.unblockDevice(deviceId, reason);
      
      // Update local state
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, is_blocked: false }
          : device
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock device');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeviceTrust = async (
    deviceId: string, 
    trustScore: number, 
    reason: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await deviceManager.updateDeviceTrust(deviceId, trustScore, reason);
      
      // Update local state
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { 
              ...device, 
              trust_score: trustScore,
              is_trusted: trustScore >= 60 // Assuming 60 is the threshold
            }
          : device
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device trust');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    devices,
    isLoading,
    error,
    fetchUserDevices,
    blockDevice,
    unblockDevice,
    updateDeviceTrust,
    refresh: (userId: string) => fetchUserDevices(userId),
  };
}

// Session Context Hook (for providing session data throughout the app)
export function useSessionContext() {
  const session = useSession();
  const security = useSessionSecurity();
  const metrics = useSessionMetrics();
  const devices = useDeviceManagement();

  return {
    session,
    security,
    metrics,
    devices,
  };
}
