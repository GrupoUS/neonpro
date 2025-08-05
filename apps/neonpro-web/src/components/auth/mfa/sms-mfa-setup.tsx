// components/auth/mfa/sms-mfa-setup.tsx
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
import { Loader2, Phone, MessageSquare } from 'lucide-react'
import { SMSMFAService, formatPhoneNumber, validatePhoneNumber } from '@/lib/auth/mfa'
import { toast } from 'sonner'

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must have at least 10 digits')
    .max(15, 'Phone number must have at most 15 digits')
    .refine(validatePhoneNumber, 'Please enter a valid phone number')
})

const verificationSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers')
})

type PhoneFormData = z.infer<typeof phoneSchema>
type VerificationFormData = z.infer<typeof verificationSchema>

interface SMSMFASetupProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function SMSMFASetup({ userId, onSuccess, onCancel }: SMSMFASetupProps) {
  const [step, setStep] = useState<'phone' | 'verification'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: ''
    }
  })

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: ''
    }
  })

  const smsService = SMSMFAService.getInstance()

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const formattedPhone = formatPhoneNumber(data.phoneNumber)
      const result = await smsService.sendSMSCode(formattedPhone, userId)

      if (result.success) {
        setPhoneNumber(formattedPhone)
        setStep('verification')
        toast.success('Verification code sent to your phone')
      } else {
        setError(result.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Failed to send verification code')
      console.error('SMS sending error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const verifyResult = await smsService.verifySMSCode(phoneNumber, data.code, userId)

      if (verifyResult.success) {
        const enableResult = await smsService.enableSMSMFA(userId, phoneNumber)
        
        if (enableResult.success) {
          toast.success('SMS MFA enabled successfully')
          onSuccess()
        } else {
          setError(enableResult.error || 'Failed to enable SMS MFA')
        }
      } else {
        setError(verifyResult.error || 'Invalid verification code')
      }
    } catch (err) {
      setError('Verification failed')
      console.error('SMS verification error:', err)
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
      const result = await smsService.sendSMSCode(phoneNumber, userId)

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
      console.error('SMS resend error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Setup SMS Authentication</CardTitle>
          <CardDescription>
            Enter your phone number to receive verification codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+55 11 99999-9999"
                {...phoneForm.register('phoneNumber')}
                className={phoneForm.formState.errors.phoneNumber ? 'border-red-500' : ''}
              />
              {phoneForm.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {phoneForm.formState.errors.phoneNumber.message}
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
          We sent a 6-digit code to {phoneNumber}
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
              onClick={() => setStep('phone')}
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
