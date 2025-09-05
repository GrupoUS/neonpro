"use client";

// import { useMFA } from "@neonpro/domain/hooks/auth/use-mfa";
// Mock MfaMethod enum for MVP
enum MfaMethod {
  TOTP = "totp",
  SMS = "sms",
  EMAIL = "email",
  BACKUP_CODES = "backup_codes",
}
import { useState } from "react";

// Mock hook for MVP
const useMFA = () => ({
  getMfaStatus: async () => ({
    enabled: false,
    methods: [],
    backupCodes: 0,
  }),
  disableMfaMethod: async (method: any) => ({ success: true }),
  generateBackupCodes: async () => ({
    success: true,
    codes: ["123456", "789012"],
  }),
  isEnabled: false,
  config: { methods: [], backupCodes: 0 },
  disableMfa: async (method: any) => ({ success: true }),
  regenerateBackupCodes: async () => ({ success: true, codes: [] }),
  isMethodEnabled: (method: any) => false,
  hasBackupCodes: false,
  clearError: () => {},
  isLoading: false,
  error: null,
});

interface MfaStatusProps {
  onSetupMfa?: () => void;
}

export function MfaStatus({ onSetupMfa }: MfaStatusProps) {
  const {
    isEnabled,
    config,
    isLoading,
    error,
    disableMfa,
    regenerateBackupCodes,
    isMethodEnabled,
    hasBackupCodes,
    clearError,
  } = useMFA();

  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[]>(
    [],
  );

  const handleDisableMfa = async () => {
    try {
      const result = await disableMfa();
      if (result.success) {
        setShowDisableConfirm(false);
      }
    } catch {}
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const result = await regenerateBackupCodes();
      if (result.success && result.backupCodes) {
        setGeneratedBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
      }
    } catch {}
  };

  const getMethodDisplayName = (method: MfaMethod) => {
    switch (method) {
      case MfaMethod.TOTP: {
        return "Authenticator App";
      }
      case MfaMethod.SMS: {
        return "SMS";
      }
      case MfaMethod.EMAIL: {
        return "Email";
      }
      case MfaMethod.BACKUP_CODES: {
        return "Backup Codes";
      }
      default: {
        return method;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
        <div
          className={`rounded-full px-2 py-1 text-xs ${
            isEnabled
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isEnabled ? "Enabled" : "Disabled"}
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
          <button
            className="ml-2 text-red-800 hover:text-red-900"
            onClick={clearError}
          >
            ×
          </button>
        </div>
      )}

      {isEnabled && config
        ? (
          <div className="space-y-4">
            <div className="rounded border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    fillRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-medium">MFA is active</div>
                  <div className="text-gray-600 text-sm">
                    Primary method: {getMethodDisplayName(config.method)}
                    {config.phoneNumber && ` (${config.phoneNumber})`}
                    {config.email && ` (${config.email})`}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Active Methods:</h4>
              <div className="space-y-1 text-sm">
                {isMethodEnabled(MfaMethod.TOTP) && (
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Authenticator App</span>
                  </div>
                )}
                {isMethodEnabled(MfaMethod.SMS) && config.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>SMS ({config.phoneNumber})</span>
                  </div>
                )}
                {isMethodEnabled(MfaMethod.EMAIL) && config.email && (
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Email ({config.email})</span>
                  </div>
                )}
                {hasBackupCodes() && (
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>
                      Backup Codes ({config.backupCodesCount} remaining)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
                onClick={handleRegenerateBackupCodes}
              >
                Generate Backup Codes
              </button>
              <button
                className="rounded border border-red-200 px-3 py-1 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
                disabled={isLoading}
                onClick={() => setShowDisableConfirm(true)}
              >
                Disable MFA
              </button>
            </div>

            {showDisableConfirm && (
              <div className="rounded border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-800">
                  Disable Two-Factor Authentication?
                </h4>
                <p className="mt-1 text-red-700 text-sm">
                  This will make your account less secure. Are you sure you want to continue?
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={isLoading}
                    onClick={handleDisableMfa}
                  >
                    Yes, Disable
                  </button>
                  <button
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                    onClick={() => setShowDisableConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )
        : (
          <div className="space-y-4">
            <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    fillRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-medium">MFA is not enabled</div>
                  <div className="text-gray-600 text-sm">
                    Add an extra layer of security to your account
                  </div>
                </div>
              </div>
            </div>

            <button
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={onSetupMfa}
            >
              Setup Two-Factor Authentication
            </button>
          </div>
        )}

      {showBackupCodes && generatedBackupCodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 font-semibold text-lg">
              Backup Codes Generated
            </h3>
            <p className="mb-4 text-gray-600 text-sm">
              Save these codes in a safe place. Each code can only be used once to access your
              account if you lose access to your primary MFA method.
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2 font-mono text-sm">
              {generatedBackupCodes.map((code, index) => (
                <div
                  className="rounded border bg-gray-100 p-2 text-center"
                  key={index}
                >
                  {code}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                className="flex-1 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generatedBackupCodes.join("\n"),
                  );
                }}
              >
                Copy Codes
              </button>
              <button
                className="flex-1 rounded border px-4 py-2 hover:bg-gray-50"
                onClick={() => {
                  setShowBackupCodes(false);
                  setGeneratedBackupCodes([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
