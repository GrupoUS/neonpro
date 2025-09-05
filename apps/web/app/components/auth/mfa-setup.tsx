"use client";

// import { useMFA } from "@neonpro/domain/hooks/auth/use-mfa";
// Mock MfaMethod enum for MVP
enum MfaMethod {
  TOTP = "totp",
  SMS = "sms",
  EMAIL = "email",
  BACKUP_CODES = "backup_codes",
}
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

// Mock hook for MVP
const useMFA = () => ({
  setupMfaMethod: async (method: any, options?: any) => ({
    success: true,
    secret: "mock-secret",
    qrCode: "mock-qr",
    backupCodes: ["123456", "789012", "345678", "456789", "567890"],
  }),
  verifyMfaCode: async (method: any, code: any, sessionId?: any) => ({ success: true }),
  isLoading: false,
  error: null,
  clearError: () => {},
});

interface MfaSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MfaSetup({ onComplete, onCancel }: MfaSetupProps) {
  const { setupMfaMethod, verifyMfaCode, isLoading, error, clearError } = useMFA();

  const [step, setStep] = useState<"method" | "setup" | "verify">("method");
  const [selectedMethod, setSelectedMethod] = useState<MfaMethod | null>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setupResult, setSetupResult] = useState<
    {
      qrCodeUrl?: string;
      secret?: string;
      backupCodes?: string[];
    } | null
  >(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const handleMethodSelect = (method: MfaMethod) => {
    setSelectedMethod(method);
    clearError();

    if (method === MfaMethod.BACKUP_CODES) {
      handleSetupMethod(method);
    } else {
      setStep("setup");
    }
  };

  const handleSetupMethod = async (method?: MfaMethod) => {
    const mfaMethod = method || selectedMethod;
    if (!mfaMethod) {
      return;
    }

    try {
      const options: Record<string, unknown> = {};
      if (mfaMethod === MfaMethod.SMS) {
        options.phoneNumber = phoneNumber;
      } else if (mfaMethod === MfaMethod.EMAIL) {
        options.email = email;
      }

      const result = await setupMfaMethod(mfaMethod, options);
      setSetupResult(result);

      if (result.success) {
        if (mfaMethod === MfaMethod.BACKUP_CODES) {
          // Backup codes don't need verification, complete immediately
          onComplete?.();
        } else {
          setStep("verify");
        }
      }
    } catch {}
  };

  const handleVerifyCode = async () => {
    if (!selectedMethod) {
      return;
    }

    try {
      const result = await verifyMfaCode(
        selectedMethod,
        verificationCode,
        sessionId,
      );

      if (result.success) {
        onComplete?.();
      }
    } catch {}
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Choose MFA Method</h3>

      <div className="space-y-2">
        <button
          className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
          onClick={() => handleMethodSelect(MfaMethod.TOTP)}
        >
          <div className="font-medium">Authenticator App</div>
          <div className="text-gray-600 text-sm">
            Use Google Authenticator, Authy, or similar app
          </div>
        </button>

        <button
          className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
          onClick={() => handleMethodSelect(MfaMethod.SMS)}
        >
          <div className="font-medium">SMS</div>
          <div className="text-gray-600 text-sm">
            Receive codes via text message
          </div>
        </button>

        <button
          className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
          onClick={() => handleMethodSelect(MfaMethod.EMAIL)}
        >
          <div className="font-medium">Email</div>
          <div className="text-gray-600 text-sm">Receive codes via email</div>
        </button>

        <button
          className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
          onClick={() => handleMethodSelect(MfaMethod.BACKUP_CODES)}
        >
          <div className="font-medium">Backup Codes</div>
          <div className="text-gray-600 text-sm">
            Generate one-time backup codes for recovery
          </div>
        </button>
      </div>
    </div>
  );

  const renderSetup = () => {
    if (!selectedMethod) {
      return;
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Setup MFA</h3>

        {selectedMethod === MfaMethod.TOTP && (
          <div className="space-y-4">
            <p>Scan this QR code with your authenticator app:</p>
            {setupResult?.qrCodeUrl && (
              <div className="flex justify-center">
                <QRCodeSVG size={200} value={setupResult.qrCodeUrl} />
              </div>
            )}
            {setupResult?.secret && (
              <div className="rounded bg-gray-100 p-3 text-sm">
                <strong>Manual entry key:</strong>
                <br />
                <code>{setupResult.secret}</code>
              </div>
            )}
          </div>
        )}

        {selectedMethod === MfaMethod.SMS && (
          <div className="space-y-4">
            <label className="block">
              <span className="font-medium text-sm">Phone Number:</span>
              <input
                className="mt-1 block w-full rounded-md border px-3 py-2"
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                type="tel"
                value={phoneNumber}
              />
            </label>
          </div>
        )}

        {selectedMethod === MfaMethod.EMAIL && (
          <div className="space-y-4">
            <label className="block">
              <span className="font-medium text-sm">Email Address:</span>
              <input
                className="mt-1 block w-full rounded-md border px-3 py-2"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                value={email}
              />
            </label>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => handleSetupMethod()}
          >
            {isLoading ? "Setting up..." : "Continue"}
          </button>
          <button
            className="rounded border px-4 py-2 hover:bg-gray-50"
            onClick={() => setStep("method")}
          >
            Back
          </button>
        </div>
      </div>
    );
  };

  const renderVerification = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Verify MFA Setup</h3>

      <p>Enter the 6-digit code from your {selectedMethod} device:</p>

      <input
        className="block w-full rounded-md border px-3 py-2 text-center text-2xl tracking-widest"
        maxLength={6}
        onChange={(e) => setVerificationCode(e.target.value.replaceAll(/\D/g, "").slice(0, 6))}
        placeholder="123456"
        type="text"
        value={verificationCode}
      />

      {setupResult?.backupCodes && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-medium">Backup Codes</h4>
          <p className="mb-2 text-gray-600 text-sm">
            Save these codes in a safe place. Each can only be used once:
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {setupResult.backupCodes.map((code: string, index: number) => (
              <div className="rounded border bg-white p-2" key={index}>
                {code}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          disabled={isLoading || verificationCode.length !== 6}
          onClick={handleVerifyCode}
        >
          {isLoading ? "Verifying..." : "Verify & Enable"}
        </button>
        <button
          className="rounded border px-4 py-2 hover:bg-gray-50"
          onClick={() => setStep("setup")}
        >
          Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-md rounded-lg border p-6">
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {step === "method" && renderMethodSelection()}
      {step === "setup" && renderSetup()}
      {step === "verify" && renderVerification()}

      <div className="mt-6 border-t pt-4">
        <button
          className="text-gray-600 text-sm hover:text-gray-800"
          onClick={onCancel}
        >
          Cancel Setup
        </button>
      </div>
    </div>
  );
}
