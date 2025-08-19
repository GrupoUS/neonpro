'use client';

import { useState } from 'react';
import { useMFA } from '@/packages/domain/src/hooks/auth/use-mfa';
import { MfaMethod } from '@/packages/security/src/auth/mfa-service';

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
    clearError 
  } = useMFA();
  
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[]>([]);

  const handleDisableMfa = async () => {
    try {
      const result = await disableMfa();
      if (result.success) {
        setShowDisableConfirm(false);
      }
    } catch (err) {
      console.error('Failed to disable MFA:', err);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const result = await regenerateBackupCodes();
      if (result.success && result.backupCodes) {
        setGeneratedBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
      }
    } catch (err) {
      console.error('Failed to regenerate backup codes:', err);
    }
  };

  const getMethodDisplayName = (method: MfaMethod) => {
    switch (method) {
      case MfaMethod.TOTP:
        return 'Authenticator App';
      case MfaMethod.SMS:
        return 'SMS';
      case MfaMethod.EMAIL:
        return 'Email';
      case MfaMethod.BACKUP_CODES:
        return 'Backup Codes';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <div className={`px-2 py-1 text-xs rounded-full ${
          isEnabled 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {isEnabled && config ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium">MFA is active</div>
                <div className="text-sm text-gray-600">
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
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Authenticator App</span>
                </div>
              )}
              {isMethodEnabled(MfaMethod.SMS) && config.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>SMS ({config.phoneNumber})</span>
                </div>
              )}
              {isMethodEnabled(MfaMethod.EMAIL) && config.email && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Email ({config.email})</span>
                </div>
              )}
              {hasBackupCodes() && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Backup Codes ({config.backupCodesCount} remaining)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRegenerateBackupCodes}
              disabled={isLoading}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Generate Backup Codes
            </button>
            <button
              onClick={() => setShowDisableConfirm(true)}
              disabled={isLoading}
              className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
            >
              Disable MFA
            </button>
          </div>

          {showDisableConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-medium text-red-800">Disable Two-Factor Authentication?</h4>
              <p className="text-sm text-red-700 mt-1">
                This will make your account less secure. Are you sure you want to continue?
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleDisableMfa}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Yes, Disable
                </button>
                <button
                  onClick={() => setShowDisableConfirm(false)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium">MFA is not enabled</div>
                <div className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onSetupMfa}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Setup Two-Factor Authentication
          </button>
        </div>
      )}

      {showBackupCodes && generatedBackupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Backup Codes Generated</h3>
            <p className="text-sm text-gray-600 mb-4">
              Save these codes in a safe place. Each code can only be used once to access your account if you lose access to your primary MFA method.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
              {generatedBackupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-gray-100 border rounded text-center">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedBackupCodes.join('\n'));
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Copy Codes
              </button>
              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setGeneratedBackupCodes([]);
                }}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
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