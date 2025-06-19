'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { useState } from 'react'

interface TwoFactorVerifyProps {
  onVerify: (code: string) => Promise<boolean>
  onUseRecoveryCode?: () => void
  isLoading?: boolean
}

export function TwoFactorVerify({
  onVerify,
  onUseRecoveryCode,
  isLoading = false
}: TwoFactorVerifyProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setError(null)
    setIsVerifying(true)

    try {
      const success = await onVerify(code)
      if (!success) {
        setError('Invalid verification code')
        setCode('')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify()
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
        </div>

        <p className="text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>

        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setCode(value)
              setError(null)
            }}
            onKeyPress={handleKeyPress}
            className="text-center text-2xl tracking-wider"
            maxLength={6}
            autoFocus
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleVerify}
          disabled={isLoading || isVerifying || code.length !== 6}
          className="w-full"
        >
          {(isLoading || isVerifying) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Verify
        </Button>

        {onUseRecoveryCode && (
          <div className="text-center">
            <button
              type="button"
              onClick={onUseRecoveryCode}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Use a recovery code instead
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
