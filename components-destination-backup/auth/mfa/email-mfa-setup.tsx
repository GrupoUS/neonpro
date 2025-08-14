// components/auth/mfa/email-mfa-setup.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, MessageSquare } from 'lucide-react'
import { EmailMFAService, validateEmail } from '@/lib/auth/mfa'
import { toast } from 'sonner'

const emailSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .refine(validateEmail, 'Please enter a valid email address')
})

const verificationSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers')
})

type EmailFormData = z.infer<typeof emailSchema>
type VerificationFormData = z.infer<typeof verificationSchema>

interface EmailMFASetupProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function EmailMFASetup({ userId, onSuccess, onCancel }: EmailMFASetupProps) {
  const [step, setStep] = useState<'email' | 'verification'>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  })

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: ''
    }
  })

  const emailService = EmailMFAService.getInstance()

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await emailService.sendEmailCode(data.email, userId)

      if (result.success) {
        setEmail(data.email)
        setStep('verification')
        toast.success('Verification code sent to your email')
      } else {
        setError(result.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Failed to send verification code')
      console.error('Email sending error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const verifyResult = await emailService.verifyEmailCode(email, data.code, userId)

      if (verifyResult.success) {
        const enableResult = await emailService.enableEmailMFA(userId, email)
        
        if (enableResult.success) {
          toast.success('Email MFA enabled successfully')
          onSuccess()
        } else {
          setError(enableResult.error || 'Failed to enable Email MFA')
        }
      } else {
        setError(verifyResult.error || 'Invalid verification code')
      }
    } catch (err) {
      setError('Verification failed')
      console.error('Email verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend || resendCount >= 3) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await emailService.sendEmailCode(email, userId)

      if (result.success) {
        setResendCount(prev => prev + 1)
        setCanResend(false)
        
        // Allow resend after 60 seconds
        setTimeout(() => setCanResend(true), 60000)
        
        toast.success('New verification code sent')
      } else {
        setError(result.error || 'Failed to resend code')
      }
    } catch (err) {
      setError('Failed to resend code')
      console.error('Email resend error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle>Setup Email Authentication</CardTitle>
          <CardDescription>
            Enter your email address to receive verification codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...emailForm.register('email')}
                className={emailForm.formState.errors.email ? 'border-red-500' : ''}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              maxLength={6}
              className={`text-center text-lg tracking-widest ${
                verificationForm.formState.errors.code ? 'border-red-500' : ''
              }`}
              {...verificationForm.register('code')}
            />
            {verificationForm.formState.errors.code && (
              <p className="text-sm text-red-500">
                {verificationForm.formState.errors.code.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={!canResend || resendCount >= 3 || isLoading}
              className="text-sm"
            >
              {resendCount >= 3 
                ? 'Maximum resend attempts reached' 
                : canResend 
                  ? `Resend code (${3 - resendCount} left)` 
                  : 'Resend available in 60s'
              }
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('email')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}