'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionUtils, SessionStorage } from '@/lib/auth/utils/session-utils';
import { SessionConfig } from '@/lib/auth/config/session-config';
import type { 
  UserSession, 
  UserDevice, 
  SecurityEvent, 
  SessionAnalytics,
  SessionPolicy,
  SuspiciousActivity 
} from '@/types/session';

interface SessionManagementState {
  currentSession: UserSession | null;
  devices: UserDevice[];
  securityEvents: SecurityEvent[];
  analytics: SessionAnalytics | null;
  suspiciousActivities: SuspiciousActivity[];
  isLoading: boolean;
  error: string | null;
}

interface SessionManagementActions {
  // Session operations
  refreshSession: () => Promise<void>;
  extendSession: (minutes: number) => Promise<boolean>;
  terminateSession: (sessionId?: string) => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  
  // Device operations
  registerDevice: (deviceInfo: Partial<UserDevice>) => Promise<boolean>;
  updateDevice: (deviceId: string, updates: Partial<UserDevice>) => Promise<boolean>;
  removeDevice: (deviceId: string) => Promise<boolean>;
  trustDevice: (deviceId: string) => Promise<boolean>;
  untrustDevice: (deviceId: string) => Promise<boolean>;
  
  // Security operations
  getSecurityEvents: (filters?: SecurityEventFilters) => Promise<void>;
  createSecurityEvent: (event: Partial<SecurityEvent>) => Promise<boolean>;
  dismissAlert: (eventId: string) => Promise<boolean>;
  
  // Analytics operations
  getAnalytics: (timeframe?: string) => Promise<void>;
  getSessionStatus: () => Promise<void>;
  
  // Utility operations
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

interface SecurityEventFilters {
  eventType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export function useSessionManagement(): SessionManagementState & SessionManagementActions {
  const supabase = createClientComponentClient();
  const [state, setState] = useState<SessionManagementState>({
    currentSession: null,
    devices: [],
    securityEvents: [],
    analytics: null,
    suspiciousActivities: [],
    isLoading: false,
    error: null
  });

  // Initialize session management
  useEffect(() => {
    initializeSession();
    
    // Set up periodic session validation
    const interval = setInterval(() => {
      validateSession();
    }, SessionConfig.security.sessionValidationInterval);

    return () => clearInterval(interval);
  }, []);

  const initializeSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load session data
        await Promise.all([
          loadCurrentSession(session.user.id),
          loadDevices(session.user.id),
          loadSecurityEvents(session.user.id),
          loadAnalytics(session.user.id)
        ]);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize session'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  const loadCurrentSession = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, currentSession: data.session }));
      }
    } catch (error) {
      console.error('Failed to load current session:', error);
    }
  };

  const loadDevices = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/session/devices', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, devices: data.devices || [] }));
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadSecurityEvents = async (userId: string, filters?: SecurityEventFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(`/api/auth/session/security?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          securityEvents: data.events || [],
          suspiciousActivities: data.suspiciousActivities || []
        }));
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const loadAnalytics = async (userId: string, timeframe = '7d') => {
    try {
      const response = await fetch(`/api/auth/session/analytics?timeframe=${timeframe}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, analytics: data.analytics }));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Session operations
  const refreshSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, currentSession: data.session }));
        
        // Update local storage
        SessionStorage.updateSession(data.session);
      } else {
        throw new Error('Failed to refresh session');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh session'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const extendSession = useCallback(async (minutes: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendMinutes: minutes })
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, currentSession: data.session }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }, []);

  const terminateSession = useCallback(async (sessionId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      if (response.ok) {
        if (!sessionId || sessionId === state.currentSession?.id) {
          setState(prev => ({ ...prev, currentSession: null }));
          SessionStorage.clearSession();
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      return false;
    }
  }, [state.currentSession?.id]);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }, []);

  // Device operations
  const registerDevice = useCallback(async (deviceInfo: Partial<UserDevice>): Promise<boolean> => {
    try {
      const deviceFingerprint = SessionUtils.generateDeviceFingerprint();
      const deviceData = {
        ...deviceInfo,
        fingerprint: deviceFingerprint,
        deviceType: SessionUtils.getDeviceType(),
        deviceName: SessionUtils.getDeviceName(),
        userAgent: navigator.userAgent,
        ipAddress: await SessionUtils.getClientIP()
      };
      
      const response = await fetch('/api/auth/session/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          devices: [...prev.devices, data.device]
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to register device:', error);
      return false;
    }
  }, []);

  const updateDevice = useCallback(async (deviceId: string, updates: Partial<UserDevice>): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, ...updates })
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          devices: prev.devices.map(device => 
            device.id === deviceId ? data.device : device
          )
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update device:', error);
      return false;
    }
  }, []);

  const removeDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });
      
      if (response.ok) {
        setState(prev => ({ 
          ...prev, 
          devices: prev.devices.filter(device => device.id !== deviceId)
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to remove device:', error);
      return false;
    }
  }, []);

  const trustDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    return updateDevice(deviceId, { isTrusted: true });
  }, [updateDevice]);

  const untrustDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    return updateDevice(deviceId, { isTrusted: false });
  }, [updateDevice]);

  // Security operations
  const getSecurityEvents = useCallback(async (filters?: SecurityEventFilters) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadSecurityEvents(user.id, filters);
    }
  }, [supabase]);

  const createSecurityEvent = useCallback(async (event: Partial<SecurityEvent>): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (response.ok) {
        // Refresh security events
        await getSecurityEvents();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to create security event:', error);
      return false;
    }
  }, [getSecurityEvents]);

  const dismissAlert = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setState(prev => ({
        ...prev,
        securityEvents: prev.securityEvents.map(event =>
          event.id === eventId ? { ...event, dismissed: true } : event
        )
      }));
      return true;
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      return false;
    }
  }, []);

  // Analytics operations
  const getAnalytics = useCallback(async (timeframe = '7d') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadAnalytics(user.id, timeframe);
    }
  }, [supabase]);

  const getSessionStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const response = await fetch('/api/auth/session/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, analytics: data.status }));
      }
    } catch (error) {
      console.error('Failed to get session status:', error);
    }
  }, [supabase]);

  // Utility operations
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshAll = useCallback(async () => {
    await initializeSession();
  }, [initializeSession]);

  return {
    // State
    ...state,
    
    // Actions
    refreshSession,
    extendSession,
    terminateSession,
    validateSession,
    registerDevice,
    updateDevice,
    removeDevice,
    trustDevice,
    untrustDevice,
    getSecurityEvents,
    createSecurityEvent,
    dismissAlert,
    getAnalytics,
    getSessionStatus,
    clearError,
    refreshAll
  };
}

export type { SessionManagementState, SessionManagementActions, SecurityEventFilters };
