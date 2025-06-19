'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Check, Copy, Loader2, Shield } from 'lucide-react'
import { useState } from 'react'

interface TwoFactorSetupProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const { toast } = useToast()

  // Step 1: Generate QR code and recovery codes
  const setupTwoFactor = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to setup 2FA')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setRecoveryCodes(data.recoveryCodes)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup two-factor authentication',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify code and enable 2FA
  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch('/api/auth/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Verification failed')
      }

      toast({
        title: 'Success',
        description: 'Two-factor authentication has been enabled',
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // Copy recovery codes to clipboard
  const copyRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)

    toast({
      title: 'Copied',
      description: 'Recovery codes copied to clipboard',
    })
  }

  // Initial setup state
  if (!qrCode) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
          </div>

          <p className="text-muted-foreground">
            Add an extra layer of security to your account by enabling two-factor
            authentication. You'll need an authenticator app like Google Authenticator
            or Authy.
          </p>

          <div className="flex gap-2">
            <Button onClick={setupTwoFactor} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Started
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // QR code and verification state
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Setup Two-Factor Authentication</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            </div>

            {/* Verification */}
            <div>
              <h3 className="font-medium mb-2">Step 2: Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code from your authenticator app
              </p>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-wider"
                  maxLength={6}
                />
                <Button
                  onClick={verifyAndEnable}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify and Enable
                </Button>
              </div>
            </div>
          </div>

          {/* Recovery Codes */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Recovery Codes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save these codes in a safe place. You can use them to access your
                account if you lose your authenticator device.
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Each code can only be used once. Store them securely!
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              {recoveryCodes.map((code, index) => (
                <div key={index}>{code}</div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={copyRecoveryCodes}
              className="w-full"
            >
              {copiedCodes ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Recovery Codes
                </>
              )}
            </Button>
          </div>
        </div>

        {onCancel && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel Setup
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
