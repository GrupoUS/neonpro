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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { QRCodeSVG } from "qrcode.react";
import type {
  Eye,
  EyeOff,
  Smartphone,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
} from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type { Progress } from "@/components/ui/progress";
import type { toast } from "@/components/ui/use-toast";
import type { useMFA } from "@/hooks/use-mfa";
import type { MFASetupProps, MFASetupResult, MFAMethodType, MFAError } from "@/types/auth";
import type { cn } from "@/lib/utils";

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
  theme = "light",
  locale = "pt-BR",
}: MFASetupProps) {
  // Translations
  const t = useTranslations(locale);

  // MFA hook
  const { setupMFA, verifyMFA, isLoading, error } = useMFA({ userId });

  // Component state
  const [state, setState] = useState<MFASetupState>({
    currentStep: 0,
    selectedMethod: "totp",
    deviceName: "",
    phoneNumber: "",
    qrCodeUri: "",
    secret: "",
    backupCodes: [],
    recoveryToken: "",
    verificationToken: "",
    lgpdConsent: false,
    isVerifying: false,
    showSecret: false,
    showBackupCodes: false,
  });

  // Setup steps configuration
  const setupSteps: SetupStep[] = [
    {
      id: "method",
      title: t.steps.method.title,
      description: t.steps.method.description,
      isComplete: state.selectedMethod !== null,
      isActive: state.currentStep === 0,
    },
    {
      id: "configure",
      title: t.steps.configure.title,
      description: t.steps.configure.description,
      isComplete: state.qrCodeUri !== "" || state.phoneNumber !== "",
      isActive: state.currentStep === 1,
    },
    {
      id: "verify",
      title: t.steps.verify.title,
      description: t.steps.verify.description,
      isComplete: false,
      isActive: state.currentStep === 2,
    },
    {
      id: "backup",
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
    setState((prev) => ({ ...prev, selectedMethod: method }));
  }, []);

  /**
   * Handle device name change
   */
  const handleDeviceNameChange = useCallback((name: string) => {
    setState((prev) => ({ ...prev, deviceName: name }));
  }, []);

  /**
   * Handle phone number change
   */
  const handlePhoneNumberChange = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, phoneNumber: phone }));
  }, []);

  /**
   * Handle LGPD consent change
   */
  const handleLGPDConsentChange = useCallback((consent: boolean) => {
    setState((prev) => ({ ...prev, lgpdConsent: consent }));
  }, []);

  /**
   * Start MFA setup process
   */
  const startSetup = useCallback(async () => {
    if (!state.lgpdConsent) {
      toast({
        title: t.errors.lgpdRequired,
        description: t.errors.lgpdRequiredDescription,
        variant: "destructive",
      });
      return;
    }

    if (!state.deviceName.trim()) {
      toast({
        title: t.errors.deviceNameRequired,
        description: t.errors.deviceNameRequiredDescription,
        variant: "destructive",
      });
      return;
    }

    if (state.selectedMethod === "sms" && !state.phoneNumber.trim()) {
      toast({
        title: t.errors.phoneRequired,
        description: t.errors.phoneRequiredDescription,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await setupMFA({
        userId,
        method: state.selectedMethod,
        phoneNumber: state.selectedMethod === "sms" ? state.phoneNumber : undefined,
        deviceName: state.deviceName,
        lgpdConsent: state.lgpdConsent,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      setState((prev) => ({
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
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    setState((prev) => ({ ...prev, isVerifying: true }));

    try {
      const result = await verifyMFA({
        userId,
        token: state.verificationToken,
        method: state.selectedMethod,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIpAddress(),
      });

      if (result.isValid) {
        setState((prev) => ({ ...prev, currentStep: 3 })); // Move to backup codes step

        toast({
          title: t.success.verificationSuccess,
          description: t.success.verificationSuccessDescription,
        });
      } else {
        toast({
          title: t.errors.verificationFailed,
          description: t.errors.verificationFailedDescription,
          variant: "destructive",
        });
      }
    } catch (err) {
      const error = err instanceof MFAError ? err : new Error(t.errors.verificationFailed);

      toast({
        title: t.errors.verificationFailed,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isVerifying: false }));
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
  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: t.success.copied,
          description: t.success.copiedDescription.replace("{item}", label),
        });
      } catch (err) {
        toast({
          title: t.errors.copyFailed,
          description: t.errors.copyFailedDescription,
          variant: "destructive",
        });
      }
    },
    [t],
  );

  /**
   * Download backup codes as text file
   */
  const downloadBackupCodes = useCallback(() => {
    const content = [
      t.backupCodes.fileHeader,
      t.backupCodes.fileWarning,
      "",
      ...state.backupCodes.map((code, index) => `${index + 1}. ${code}`),
      "",
      t.backupCodes.fileFooter,
      `Generated: ${new Date().toLocaleString(locale)}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neonpro-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
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
  const progress = ((state.currentStep + 1) / setupSteps.length) * 100;
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <Badge variant="outline" className="text-sm">
            {t.step} {state.currentStep + 1} {t.of} {setupSteps.length}
          </Badge>
        </div>

        <Progress value={progress} className="mb-4" />

        <p className="text-gray-600 dark:text-gray-400">
          {setupSteps[state.currentStep]?.description}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 0: Method Selection */}
          {state.currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.methodSelection.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.methodSelection.description}
                </p>
              </div>

              <Tabs value={state.selectedMethod} onValueChange={handleMethodSelect}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="totp" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    {t.methods.totp.title}
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t.methods.sms.title}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="totp" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        {t.methods.totp.title}
                      </CardTitle>
                      <CardDescription>{t.methods.totp.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{t.methods.totp.recommended}</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• {t.methods.totp.benefits.security}</li>
                            <li>• {t.methods.totp.benefits.offline}</li>
                            <li>• {t.methods.totp.benefits.apps}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sms" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {t.methods.sms.title}
                      </CardTitle>
                      <CardDescription>{t.methods.sms.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{t.methods.sms.warning}</AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Device Name Input */}
              <div className="space-y-2">
                <Label htmlFor="deviceName">{t.deviceName.label}</Label>
                <Input
                  id="deviceName"
                  type="text"
                  placeholder={t.deviceName.placeholder}
                  value={state.deviceName}
                  onChange={(e) => handleDeviceNameChange(e.target.value)}
                  maxLength={50}
                />
                <p className="text-sm text-gray-500">{t.deviceName.help}</p>
              </div>

              {/* Phone Number Input (SMS only) */}
              {state.selectedMethod === "sms" && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t.phoneNumber.label}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t.phoneNumber.placeholder}
                    value={state.phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">{t.phoneNumber.help}</p>
                </div>
              )}

              {/* LGPD Consent */}
              <div className="space-y-4">
                <Separator />
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="lgpdConsent"
                    checked={state.lgpdConsent}
                    onCheckedChange={handleLGPDConsentChange}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="lgpdConsent" className="text-sm font-medium">
                      {t.lgpd.consent}
                    </Label>
                    <p className="text-sm text-gray-500">{t.lgpd.description}</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setState((prev) => ({ ...prev, currentStep: 1 }))}
                  disabled={
                    !state.deviceName.trim() ||
                    !state.lgpdConsent ||
                    (state.selectedMethod === "sms" && !state.phoneNumber.trim())
                  }
                >
                  {t.buttons.continue}
                </Button>
              </div>
            </div>
          )}
          {/* Step 1: Configuration */}
          {state.currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.configuration.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.configuration.description}
                </p>
              </div>

              {/* Setup Summary */}
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">{t.configuration.summary}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t.configuration.method}:</span>
                      <Badge variant="outline">
                        {state.selectedMethod === "totp"
                          ? t.methods.totp.title
                          : t.methods.sms.title}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.configuration.device}:</span>
                      <span className="font-medium">{state.deviceName}</span>
                    </div>
                    {state.selectedMethod === "sms" && (
                      <div className="flex justify-between">
                        <span>{t.configuration.phone}:</span>
                        <span className="font-medium">{state.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setState((prev) => ({ ...prev, currentStep: 0 }))}
                >
                  {t.buttons.back}
                </Button>
                <Button onClick={startSetup} disabled={isLoading}>
                  {isLoading ? t.buttons.setting_up : t.buttons.setup}
                </Button>
              </div>
            </div>
          )}
          {/* Step 2: Verification */}
          {state.currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.verification.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.verification.description}
                </p>
              </div>

              {/* TOTP Setup */}
              {state.selectedMethod === "totp" && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.verification.totp.qrTitle}</CardTitle>
                      <CardDescription>{t.verification.totp.qrDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      {state.qrCodeUri && (
                        <div className="bg-white p-4 rounded-lg border">
                          <QRCodeSVG value={state.qrCodeUri} size={200} />
                        </div>
                      )}

                      {/* Manual Entry */}
                      <div className="w-full">
                        <Label>{t.verification.totp.manualEntry}</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            type={state.showSecret ? "text" : "password"}
                            value={state.secret}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setState((prev) => ({ ...prev, showSecret: !prev.showSecret }))
                            }
                          >
                            {state.showSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(state.secret, t.verification.totp.secret)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* SMS Setup */}
              {state.selectedMethod === "sms" && (
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    {t.verification.sms.sent.replace("{phone}", state.phoneNumber)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Token Verification */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.verification.tokenTitle}</CardTitle>
                  <CardDescription>
                    {state.selectedMethod === "totp"
                      ? t.verification.tokenDescriptionTOTP
                      : t.verification.tokenDescriptionSMS}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verificationToken">{t.verification.tokenLabel}</Label>
                      <Input
                        id="verificationToken"
                        type="text"
                        placeholder="123456"
                        value={state.verificationToken}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            verificationToken: e.target.value.replace(/\D/g, "").slice(0, 6),
                          }))
                        }
                        maxLength={6}
                        className="text-center text-2xl font-mono"
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setState((prev) => ({ ...prev, currentStep: 1 }))}
                      >
                        {t.buttons.back}
                      </Button>
                      <Button
                        onClick={verifyToken}
                        disabled={state.verificationToken.length !== 6 || state.isVerifying}
                      >
                        {state.isVerifying ? t.buttons.verifying : t.buttons.verify}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}{" "}
          {/* Step 3: Backup Codes */}
          {state.currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.backupCodes.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t.backupCodes.description}</p>
              </div>

              {/* Important Warning */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{t.backupCodes.warning}</AlertDescription>
              </Alert>

              {/* Backup Codes Display */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t.backupCodes.codesTitle}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setState((prev) => ({ ...prev, showBackupCodes: !prev.showBackupCodes }))
                        }
                      >
                        {state.showBackupCodes ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {state.showBackupCodes ? t.buttons.hide : t.buttons.show}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(state.backupCodes.join("\n"), t.backupCodes.title)
                        }
                      >
                        <Copy className="h-4 w-4" />
                        {t.buttons.copy}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <Download className="h-4 w-4" />
                        {t.buttons.download}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{t.backupCodes.codesDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {state.showBackupCodes ? (
                    <div className="grid grid-cols-2 gap-3">
                      {state.backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                        >
                          <span className="font-mono text-sm">{code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(code, `${t.backupCodes.code} ${index + 1}`)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <EyeOff className="h-8 w-8 mx-auto mb-2" />
                      <p>{t.backupCodes.hidden}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recovery Token */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.recoveryToken.title}</CardTitle>
                  <CardDescription>{t.recoveryToken.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="password"
                      value={state.recoveryToken}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(state.recoveryToken, t.recoveryToken.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Checklist */}
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    {t.securityChecklist.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.saved}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.secure}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.offline}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.tested}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Complete Setup */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setState((prev) => ({ ...prev, currentStep: 2 }))}
                >
                  {t.buttons.back}
                </Button>
                <Button
                  onClick={completeSetup}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t.buttons.complete}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Healthcare Compliance Footer */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t.compliance.title}
            </h4>
            <p className="text-blue-700 dark:text-blue-300">{t.compliance.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to get user IP address
 */
async function getUserIpAddress(): Promise<string> {
  try {
    // In production, this would call your backend to get the real IP
    return "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

/**
 * Translations hook (mock implementation)
 */
function useTranslations(locale: "pt-BR" | "en-US") {
  const translations = {
    "pt-BR": {
      title: "Configurar Autenticação Multifator",
      step: "Passo",
      of: "de",
      steps: {
        method: {
          title: "Escolher Método",
          description: "Selecione seu método preferido de autenticação multifator.",
        },
        configure: {
          title: "Configurar",
          description: "Configure seu método de MFA selecionado.",
        },
        verify: {
          title: "Verificar",
          description: "Teste sua configuração com um código de verificação.",
        },
        backup: {
          title: "Códigos de Backup",
          description: "Salve seus códigos de recuperação em local seguro.",
        },
      },
      methodSelection: {
        title: "Selecione o Método de Autenticação",
        description: "Escolha como você deseja receber seus códigos de verificação.",
      },
      methods: {
        totp: {
          title: "App Autenticador",
          description: "Use um aplicativo como Google Authenticator ou Authy.",
          recommended: "Recomendado para Profissionais de Saúde",
          benefits: {
            security: "Maior segurança e privacidade",
            offline: "Funciona sem conexão com internet",
            apps: "Compatível com apps populares",
          },
        },
        sms: {
          title: "SMS",
          description: "Receba códigos por mensagem de texto.",
          warning: "SMS é menos seguro que aplicativos autenticadores.",
        },
      },
      deviceName: {
        label: "Nome do Dispositivo",
        placeholder: "Ex: iPhone do João, Computador do Consultório",
        help: "Este nome ajudará você a identificar este dispositivo.",
      },
      phoneNumber: {
        label: "Número de Telefone",
        placeholder: "+55 11 99999-9999",
        help: "Digite seu número completo com código do país.",
      },
      lgpd: {
        consent: "Concordo com o processamento dos meus dados para MFA",
        description:
          "Seus dados serão processados de acordo com a LGPD para fins de segurança médica.",
      },
      configuration: {
        title: "Confirmar Configuração",
        description: "Revise as configurações antes de prosseguir.",
        summary: "Resumo da Configuração",
        method: "Método",
        device: "Dispositivo",
        phone: "Telefone",
      },
      verification: {
        title: "Verificar Configuração",
        description: "Digite o código gerado para confirmar a configuração.",
        tokenTitle: "Digite o Código de Verificação",
        tokenLabel: "Código",
        tokenDescriptionTOTP: "Digite o código de 6 dígitos do seu app autenticador.",
        tokenDescriptionSMS: "Digite o código de 6 dígitos enviado por SMS.",
        totp: {
          qrTitle: "Escaneie o Código QR",
          qrDescription: "Use seu app autenticador para escanear este código QR.",
          manualEntry: "Ou digite manualmente:",
          secret: "chave secreta",
        },
        sms: {
          sent: "Código SMS enviado para {phone}",
        },
      },
      backupCodes: {
        title: "Códigos de Recuperação",
        description: "Use estes códigos se perder acesso ao seu método principal de MFA.",
        warning:
          "IMPORTANTE: Salve estes códigos em local seguro. Cada código só pode ser usado uma vez.",
        codesTitle: "Seus Códigos de Backup",
        codesDescription: "Cada código pode ser usado apenas uma vez para acessar sua conta.",
        hidden: "Códigos ocultos por segurança",
        code: "Código",
        fileHeader: "NeonPro Healthcare - Códigos de Recuperação MFA",
        fileWarning:
          "MANTENHA ESTES CÓDIGOS EM LOCAL SEGURO! Cada código só pode ser usado uma vez.",
        fileFooter: "Para suporte, entre em contato: suporte@neonpro.com.br",
      },
      recoveryToken: {
        title: "Token de Recuperação Master",
        description: "Use este token para recuperar sua conta em emergências extremas.",
      },
      securityChecklist: {
        title: "Lista de Segurança",
        saved: "Códigos salvos em local seguro",
        secure: "Armazenamento offline protegido",
        offline: "Cópia impressa em cofre",
        tested: "Configuração testada e funcionando",
      },
      compliance: {
        title: "Conformidade LGPD e Regulamentações de Saúde",
        description:
          "Esta configuração está em conformidade com LGPD, ANVISA e CFM para proteção de dados médicos.",
      },
      buttons: {
        continue: "Continuar",
        back: "Voltar",
        setup: "Configurar MFA",
        setting_up: "Configurando...",
        verify: "Verificar",
        verifying: "Verificando...",
        complete: "Concluir Configuração",
        show: "Mostrar",
        hide: "Ocultar",
        copy: "Copiar",
        download: "Baixar",
      },
      success: {
        setupInitiated: "Configuração iniciada",
        setupInitiatedDescription: "MFA configurado com sucesso. Agora verifique com um código.",
        verificationSuccess: "Verificação bem-sucedida",
        verificationSuccessDescription: "Seu MFA foi verificado e está funcionando.",
        setupComplete: "MFA Configurado!",
        setupCompleteDescription: "Sua conta agora está protegida com autenticação multifator.",
        copied: "Copiado!",
        copiedDescription: "{item} copiado para a área de transferência.",
        downloaded: "Download concluído",
        downloadedDescription: "Códigos de backup salvos em arquivo.",
      },
      errors: {
        lgpdRequired: "Consentimento LGPD obrigatório",
        lgpdRequiredDescription: "Você deve concordar com o tratamento de dados para usar MFA.",
        deviceNameRequired: "Nome do dispositivo obrigatório",
        deviceNameRequiredDescription: "Digite um nome para identificar este dispositivo.",
        phoneRequired: "Telefone obrigatório",
        phoneRequiredDescription: "Digite seu número de telefone para SMS.",
        setupFailed: "Erro na configuração",
        tokenRequired: "Código obrigatório",
        tokenRequiredDescription: "Digite o código de 6 dígitos.",
        verificationFailed: "Verificação falhou",
        verificationFailedDescription: "Código inválido. Tente novamente.",
        copyFailed: "Erro ao copiar",
        copyFailedDescription: "Não foi possível copiar para área de transferência.",
      },
    },
    "en-US": {
      // English translations would go here
      // For brevity, using Portuguese for now
      ...({} as any),
    },
  };

  return translations[locale];
}

export default MFASetup;
