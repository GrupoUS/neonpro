/**
 * Multi-Factor Authentication Setup Component
 * 
 * Comprehensive MFA setup interface for NeonPro Healthcare Platform
 * with TOTP, SMS, backup codes, and healthcare compliance features.
 * 
 * Features:
 * - TOTP setup with QR code display
 * - SMS verification setup
 * - Backup codes generation and display
 * - Healthcare compliance (LGPD consent)
 * - Accessible UI (WCAG 2.1 AA+)
 * - Multi-language support (PT/EN)
 * - Device trust management
 * - Progressive setup flow
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Eye, EyeOff, Smartphone, Shield, AlertTriangle, CheckCircle, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useMFA } from '@/hooks/use-mfa';
import { 
  MFASetupProps, 
  MFASetupResult, 
  MFAMethodType,
  MFAError 
} from '@/types/auth';
import { cn } from '@/lib/utils';

// Setup step configuration
interface SetupStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

// Component state interface
interface MFASetupState {
  currentStep: number;
  selectedMethod: MFAMethodType;
  deviceName: string;
  phoneNumber: string;
  qrCodeUri: string;
  secret: string;
  backupCodes: string[];
  recoveryToken: string;
  verificationToken: string;
  lgpdConsent: boolean;
  isVerifying: boolean;
  showSecret: boolean;
  showBackupCodes: boolean;
}

/**
 * MFA Setup Component with comprehensive healthcare compliance
 */
export function MFASetup({
  userId,
  onSetupComplete,
  onSetupError,
  className,
  theme = 'light',
  locale = 'pt-BR',
}: MFASetupProps) {
  // Translations
  const t = useTranslations(locale);
  
  // MFA hook
  const { setupMFA, verifyMFA, isLoading, error } = useMFA({ userId });

  // Component state
  const [state, setState] = useState<MFASetupState>({
    currentStep: 0,
    selectedMethod: 'totp',
    deviceName: '',
    phoneNumber: '',
    qrCodeUri: '',
    secret: '',
    backupCodes: [],
    recoveryToken: '',
    verificationToken: '',
    lgpdConsent: false,
    isVerifying: false,
    showSecret: false,
    showBackupCodes: false,
  });

  // Setup steps configuration
  const setupSteps: SetupStep[] = [
    {
      id: 'method',
      title: t.steps.method.title,
      description: t.steps.method.description,
      isComplete: state.selectedMethod !== null,
      isActive: state.currentStep === 0,
    },
    {
      id: 'configure',
      title: t.steps.configure.title,
      description: t.steps.configure.description,
      isComplete: state.qrCodeUri !== '' || state.phoneNumber !== '',
      isActive: state.currentStep === 1,
    },
    {
      id: 'verify',
      title: t.steps.verify.title,
      description: t.steps.verify.description,
      isComplete: false,
      isActive: state.currentStep === 2,
    },
    {
      id: 'backup',
      title: t.steps.backup.title,
      description: t.steps.backup.description,
      isComplete: state.backupCodes.length > 0,
      isActive: state.currentStep === 3,
    },
  ];

  /**
   * Handle method selection
   */
  const handleMethodSelect = useCallback((method: MFAMethodType) => {
    setState(prev => ({ ...prev, selectedMethod: method }));
  }, []);

  /**
   * Handle device name change
   */
  const handleDeviceNameChange = useCallback((name: string) => {
    setState(prev => ({ ...prev, deviceName: name }));
  }, []);

  /**
   * Handle phone number change
   */
  const handlePhoneNumberChange = useCallback((phone: string) => {
    setState(prev => ({ ...prev, phoneNumber: phone }));
  }, []);

  /**
   * Handle LGPD consent change
   */
  const handleLGPDConsentChange = useCallback((consent: boolean) => {
    setState(prev => ({ ...prev, lgpdConsent: consent }));
  }, []);

  /**
   * Start MFA setup process
   */
  const startSetup = useCallback(async () => {
    if (!state.lgpdConsent) {
      toast({
        title: t.errors.lgpdRequired,
        description: t.errors.lgpdRequiredDescription,
        variant: 'destructive',
      });
      return;
    }

    if (!state.deviceName.trim()) {
      toast({
        title: t.errors.deviceNameRequired,
        description: t.errors.deviceNameRequiredDescription,
        variant: 'destructive',
      });
      return;
    }

    if (state.selectedMethod === 'sms' && !state.phoneNumber.trim()) {
      toast({
        title: t.errors.phoneRequired,
        description: t.errors.phoneRequiredDescription,
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await setupMFA({
        userId,
        method: state.selectedMethod,
        phoneNumber: state.selectedMethod === 'sms' ? state.phoneNumber : undefined,
        deviceName: state.deviceName,
        lgpdConsent: state.lgpdConsent,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      setState(prev => ({
        ...prev,
        qrCodeUri: result.qrCodeUri,
        secret: result.secret,
        backupCodes: result.backupCodes,
        recoveryToken: result.recoveryToken,
        currentStep: 2, // Move to verification step
      }));

      toast({
        title: t.success.setupInitiated,
        description: t.success.setupInitiatedDescription,
      });

    } catch (err) {
      const error = err instanceof MFAError ? err : new Error(t.errors.setupFailed);
      onSetupError(error);
      
      toast({
        title: t.errors.setupFailed,
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [
    state.lgpdConsent,
    state.deviceName,
    state.selectedMethod,
    state.phoneNumber,
    userId,
    setupMFA,
    onSetupError,
    t,
  ]);

  /**
   * Verify MFA token
   */
  const verifyToken = useCallback(async () => {
    if (!state.verificationToken.trim()) {
      toast({
        title: t.errors.tokenRequired,
        description: t.errors.tokenRequiredDescription,
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, isVerifying: true }));

    try {
      const result = await verifyMFA({
        userId,
        token: state.verificationToken,
        method: state.selectedMethod,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      if (result.isValid) {
        setState(prev => ({ ...prev, currentStep: 3 })); // Move to backup codes step
        
        toast({
          title: t.success.verificationSuccess,
          description: t.success.verificationSuccessDescription,
        });
      } else {
        toast({
          title: t.errors.verificationFailed,
          description: t.errors.verificationFailedDescription,
          variant: 'destructive',
        });
      }

    } catch (err) {
      const error = err instanceof MFAError ? err : new Error(t.errors.verificationFailed);
      
      toast({
        title: t.errors.verificationFailed,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, isVerifying: false }));
    }
  }, [state.verificationToken, state.selectedMethod, userId, verifyMFA, t]);

  /**
   * Complete setup process
   */
  const completeSetup = useCallback(() => {
    const result: MFASetupResult = {
      secret: state.secret,
      qrCodeUri: state.qrCodeUri,
      backupCodes: state.backupCodes,
      recoveryToken: state.recoveryToken,
    };

    onSetupComplete(result);

    toast({
      title: t.success.setupComplete,
      description: t.success.setupCompleteDescription,
    });
  }, [state, onSetupComplete, t]);

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t.success.copied,
        description: t.success.copiedDescription.replace('{item}', label),
      });
    } catch (err) {
      toast({
        title: t.errors.copyFailed,
        description: t.errors.copyFailedDescription,
        variant: 'destructive',
      });
    }
  }, [t]);

  /**
   * Download backup codes as text file
   */
  const downloadBackupCodes = useCallback(() => {
    const content = [
      t.backupCodes.fileHeader,
      t.backupCodes.fileWarning,
      '',
      ...state.backupCodes.map((code, index) => `${index + 1}. ${code}`),
      '',
      t.backupCodes.fileFooter,
      `Generated: ${new Date().toLocaleString(locale)}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neonpro-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t.success.downloaded,
      description: t.success.downloadedDescription,
    });
  }, [state.backupCodes, locale, t]);

  // Calculate setup progress
  const progress = (state.currentStep + 1) / setupSteps.length * 100;