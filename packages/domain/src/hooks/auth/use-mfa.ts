import { useCallback, useEffect, useState } from 'react';

// Mock useUser hook for now - replace with actual auth hook
const useUser = () => ({ id: 'mock-user-id' });

import {
  MfaMethod,
  mfaSetupSchema,
  mfaVerificationSchema,
  setupMfa,
  verifyMfa,
} from '@neonpro/security';

export interface MfaConfig {
  userId: string;
  method: MfaMethod;
  isEnabled: boolean;
  phoneNumber?: string;
  email?: string;
  backupCodesCount?: number;
}

export interface MfaSetupResult {
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  message?: string;
}

export interface MfaVerificationResult {
  success: boolean;
  method: MfaMethod;
  remainingAttempts?: number;
  lockoutUntil?: Date;
  message?: string;
}

export const useMFA = () => {
  const user = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<MfaConfig | null>();
  const [error, setError] = useState<string | null>();

  const loadMfaConfig = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(undefined);

      // In production, fetch from database
      // For now, mock the configuration
      const mockConfig: MfaConfig = {
        userId,
        method: MfaMethod.TOTP,
        isEnabled: false,
        backupCodesCount: 0,
      };

      setConfig(mockConfig);
      setIsEnabled(mockConfig.isEnabled);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load MFA config',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load MFA configuration on mount
  useEffect(() => {
    if (user?.id) {
      loadMfaConfig(user.id);
    }
  }, [user?.id, loadMfaConfig]);

  const setupMfaMethod = useCallback(
    async (
      method: MfaMethod,
      options?: { phoneNumber?: string; email?: string; },
    ): Promise<MfaSetupResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setIsLoading(true);
        setError(undefined);

        const setupRequest = mfaSetupSchema.parse({
          userId: user.id,
          method,
          phoneNumber: options?.phoneNumber,
          email: options?.email,
        });

        const result = await setupMfa(setupRequest);

        if (result.success) {
          // Update local config
          setConfig((prev) =>
            prev
              ? {
                ...prev,
                method,
                isEnabled: false, // Still needs verification
                phoneNumber: options?.phoneNumber,
                email: options?.email,
              }
              : undefined
          );
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup MFA';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  const verifyMfaCode = useCallback(
    async (
      method: MfaMethod,
      code: string,
      sessionId: string,
    ): Promise<MfaVerificationResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setIsLoading(true);
        setError(undefined);

        const verificationRequest = mfaVerificationSchema.parse({
          userId: user.id,
          method,
          code,
          sessionId,
        });

        const result = await verifyMfa(verificationRequest);

        if (result.success) {
          // Update enabled state
          setIsEnabled(true);
          setConfig((prev) => prev ? { ...prev, isEnabled: true } : undefined);
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify MFA';
        setError(errorMessage);
        return {
          success: false,
          method,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  const disableMfa = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // In production, call API to disable MFA
      // For now, mock the operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEnabled(false);
      setConfig((prev) => (prev ? { ...prev, isEnabled: false } : undefined));

      return { success: true, message: 'MFA disabled successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const regenerateBackupCodes = useCallback(async (): Promise<{
    success: boolean;
    backupCodes?: string[];
    message?: string;
  }> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(undefined);

      const result = await setupMfa({
        userId: user.id,
        method: MfaMethod.BACKUP_CODES,
      });

      if (result.success && result.backupCodes) {
        setConfig((prev) =>
          prev
            ? {
              ...prev,
              backupCodesCount: result.backupCodes?.length || 0,
            }
            : undefined
        );
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to regenerate backup codes';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    // State
    isEnabled,
    isLoading,
    config,
    error,

    // Actions
    setupMfaMethod,
    verifyMfaCode,
    disableMfa,
    regenerateBackupCodes,
    clearError: () => setError(undefined),

    // Utilities
    isMethodEnabled: (method: MfaMethod) => config?.method === method && isEnabled,
    hasBackupCodes: () => (config?.backupCodesCount ?? 0) > 0,
  };
};
