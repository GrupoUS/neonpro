/**
 * Custom React Hook for Multi-Factor Authentication
 * 
 * Provides comprehensive MFA functionality with healthcare compliance,
 * real-time updates, and error handling for the NeonPro platform.
 * 
 * Features:
 * - MFA setup and verification
 * - Real-time MFA settings updates
 * - Backup code management
 * - Device trust management
 * - Emergency bypass handling
 * - Comprehensive error handling
 * - Healthcare compliance logging
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getMFAService } from '@/lib/auth/mfa';
import {
  MFAUserSettings,
  MFASetupRequest,
  MFASetupResult,
  MFAVerificationRequest,
  MFAVerificationResult,
  UseMFAOptions,
  UseMFAReturn,
  MFAError,
  MFAEvent,
  MFAEventType,
} from '@/types/auth';

// Hook options with defaults
const DEFAULT_OPTIONS: Required<UseMFAOptions> = {
  userId: '',
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
};

/**
 * Custom hook for comprehensive MFA management
 */
export function useMFA(options: UseMFAOptions): UseMFAReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [mfaSettings, setMfaSettings] = useState<MFAUserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs for cleanup and optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const mfaServiceRef = useRef(getMFAService());

  /**
   * Fetch MFA settings from the server
   */
  const fetchMFASettings = useCallback(async (showLoading = true) => {
    if (!opts.userId) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const settings = await mfaServiceRef.current.getUserMFASettings(opts.userId);
      setMfaSettings(settings);

      // Emit event for analytics/monitoring
      emitMFAEvent('mfa:settings:loaded', {
        userId: opts.userId,
        isEnabled: settings?.isEnabled || false,
        methodCount: settings?.methods.length || 0,
      });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch MFA settings');
      setError(error);
      
      // Emit error event
      emitMFAEvent('mfa:settings:error', {
        userId: opts.userId,
        error: error.message,
      });
      
      console.error('Failed to fetch MFA settings:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [opts.userId]);

  /**
   * Setup MFA for the user
   */
  const setupMFA = useCallback(async (request: MFASetupRequest): Promise<MFASetupResult> => {
    if (!opts.userId) {
      throw new MFAError('User ID is required', 'INVALID_USER_ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Emit setup started event
      emitMFAEvent('mfa:setup:started', {
        userId: opts.userId,
        method: request.method,
      });

      // Get device fingerprint if not provided
      const deviceFingerprint = await getDeviceFingerprint();
      
      // Setup MFA
      const result = await mfaServiceRef.current.setupMFA(
        opts.userId,
        request.method,
        {
          phoneNumber: request.phoneNumber,
          deviceName: request.deviceName,
          lgpdConsent: request.lgpdConsent,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
        }
      );

      // Refresh settings after successful setup
      await fetchMFASettings(false);

      // Emit success event
      emitMFAEvent('mfa:setup:completed', {
        userId: opts.userId,
        method: request.method,
        backupCodesCount: result.backupCodes.length,
      });

      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('MFA setup failed');
      setError(error);
      
      // Emit error event
      emitMFAEvent('mfa:setup:failed', {
        userId: opts.userId,
        error: error.message,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.userId, fetchMFASettings]);

  /**
   * Verify MFA token
   */
  const verifyMFA = useCallback(async (request: MFAVerificationRequest): Promise<MFAVerificationResult> => {
    if (!opts.userId) {
      throw new MFAError('User ID is required', 'INVALID_USER_ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Emit verification started event
      emitMFAEvent('mfa:verify:started', {
        userId: opts.userId,
        method: request.method,
      });

      // Get device fingerprint if not provided
      const deviceFingerprint = request.deviceFingerprint || await getDeviceFingerprint();
      
      // Verify MFA
      const result = await mfaServiceRef.current.verifyMFA(
        opts.userId,
        request.token,
        request.method,
        {
          deviceFingerprint,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
          emergencyBypass: request.emergencyBypass,
          emergencyReason: request.emergencyReason,
        }
      );

      // Refresh settings after verification
      await fetchMFASettings(false);

      // Emit appropriate event based on result
      if (result.isValid) {
        emitMFAEvent('mfa:verify:success', {
          userId: opts.userId,
          method: request.method,
          isEmergencyBypass: result.isEmergencyBypass,
        });
      } else if (result.lockedUntil) {
        emitMFAEvent('mfa:verify:locked', {
          userId: opts.userId,
          lockedUntil: result.lockedUntil,
          remainingAttempts: result.remainingAttempts,
        });
      } else {
        emitMFAEvent('mfa:verify:failed', {
          userId: opts.userId,
          method: request.method,
          remainingAttempts: result.remainingAttempts,
        });
      }

      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('MFA verification failed');
      setError(error);
      
      // Emit error event
      emitMFAEvent('mfa:verify:failed', {
        userId: opts.userId,
        error: error.message,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.userId, fetchMFASettings]);

  /**
   * Disable MFA for the user
   */
  const disableMFA = useCallback(async (reason: string): Promise<void> => {
    if (!opts.userId) {
      throw new MFAError('User ID is required', 'INVALID_USER_ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      await mfaServiceRef.current.disableMFA(opts.userId, {
        reason,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      // Refresh settings after disabling
      await fetchMFASettings(false);

      // Emit disabled event
      emitMFAEvent('mfa:disabled', {
        userId: opts.userId,
        reason,
      });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disable MFA');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.userId, fetchMFASettings]);

  /**
   * Generate new backup codes
   */
  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    if (!opts.userId) {
      throw new MFAError('User ID is required', 'INVALID_USER_ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      const backupCodes = await mfaServiceRef.current.generateNewBackupCodes(opts.userId, {
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      // Refresh settings after generating codes
      await fetchMFASettings(false);

      // Emit backup codes generated event
      emitMFAEvent('mfa:backup_codes:generated', {
        userId: opts.userId,
        codesCount: backupCodes.length,
      });

      return backupCodes;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate backup codes');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.userId, fetchMFASettings]);

  /**
   * Send SMS OTP
   */
  const sendSMSOTP = useCallback(async (): Promise<{ success: boolean; expiresIn: number }> => {
    if (!opts.userId) {
      throw new MFAError('User ID is required', 'INVALID_USER_ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await mfaServiceRef.current.sendSMSOTP(opts.userId, {
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      // Emit SMS sent event
      emitMFAEvent('mfa:sms:sent', {
        userId: opts.userId,
        expiresIn: result.expiresIn,
      });

      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send SMS OTP');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.userId]);

  /**
   * Refresh MFA settings manually
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchMFASettings(true);
  }, [fetchMFASettings]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (opts.autoRefresh && opts.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchMFASettings(false);
      }, opts.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [opts.autoRefresh, opts.refreshInterval, fetchMFASettings]);

  // Initial fetch
  useEffect(() => {
    fetchMFASettings(true);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMFASettings]);

  return {
    mfaSettings,
    isLoading,
    error,
    setupMFA,
    verifyMFA,
    disableMFA,
    generateBackupCodes,
    sendSMSOTP,
    refresh,
  };
}

/**
 * Utility functions
 */

/**
 * Generate device fingerprint for device identification
 */
async function getDeviceFingerprint(): Promise<string> {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
  };

  // Create hash of fingerprint data
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(fingerprint));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Get user's IP address (client-side approximation)
 */
async function getUserIpAddress(): Promise<string> {
  try {
    // In production, this would call your backend to get the real IP
    // For now, return a placeholder
    return '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}

/**
 * Emit MFA events for analytics and monitoring
 */
function emitMFAEvent(type: MFAEventType, data: Record<string, unknown>): void {
  const event: MFAEvent = {
    type,
    userId: data.userId as string,
    timestamp: new Date(),
    data,
  };

  // Emit custom event for application-level handling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mfa-event', { detail: event }));
  }

  // Log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('MFA Event:', event);
  }
}

/**
 * Hook for MFA statistics (admin/monitoring use)
 */
export function useMFAStatistics() {
  const [statistics, setStatistics] = useState<{
    totalUsers: number;
    enabledUsers: number;
    totpUsers: number;
    smsUsers: number;
    emergencyBypassesToday: number;
    failedAttemptsToday: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stats = await getMFAService().getMFAStatistics();
      setStatistics(stats);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch MFA statistics');
      setError(error);
      console.error('Failed to fetch MFA statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refresh: fetchStatistics,
  };
}

export default useMFA;